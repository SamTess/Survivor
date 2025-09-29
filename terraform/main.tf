terraform {
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
    local = {
      source  = "hashicorp/local"
      version = "~> 2.0"
    }
  }
}

provider "digitalocean" {
  token = var.do_token
}

resource "digitalocean_domain" "survivor" {
  name = var.domain_name
}

resource "digitalocean_record" "staging_a" {
  count  = contains(var.deploy_environments, "staging") ? 1 : 0
  domain = digitalocean_domain.survivor.name
  type   = "A"
  name   = "staging"
  value  = digitalocean_droplet.survivor_staging[0].ipv4_address
  ttl    = 60
}

resource "digitalocean_record" "prod_a" {
  count  = contains(var.deploy_environments, "prod") ? 1 : 0
  domain = digitalocean_domain.survivor.name
  type   = "A"
  name   = "@"
  value  = digitalocean_droplet.survivor_prod[0].ipv4_address
  ttl    = 60
}

resource "digitalocean_record" "caa_letsencrypt" {
  domain = digitalocean_domain.survivor.name
  type   = "CAA"
  name   = "@"
  flags  = 0
  tag    = "issue"
  value  = "letsencrypt.org."
  ttl    = 3600
}

resource "digitalocean_record" "caa_wildcard_letsencrypt" {
  domain = digitalocean_domain.survivor.name
  type   = "CAA"
  name   = "*"
  flags  = 0
  tag    = "issue"
  value  = "letsencrypt.org."
  ttl    = 3600
}

resource "digitalocean_droplet" "survivor_staging" {
  count    = contains(var.deploy_environments, "staging") ? 1 : 0
  name     = "survivor-staging-vm"
  region   = "fra1"
  size     = "s-2vcpu-4gb"
  image    = "ubuntu-22-04-x64"
  ssh_keys = [var.ssh_key_id]
  tags     = ["survivor", "staging"]
}

resource "digitalocean_droplet" "survivor_prod" {
  count    = contains(var.deploy_environments, "prod") ? 1 : 0
  name     = "survivor-prod-vm"
  region   = "fra1"
  size     = "s-2vcpu-4gb"
  image    = "ubuntu-22-04-x64"
  ssh_keys = [var.ssh_key_id]
  tags     = ["survivor", "prod"]
}

resource "digitalocean_firewall" "survivor_fw" {
  name = "survivor-fw"

  droplet_ids = concat(
    contains(var.deploy_environments, "staging") ? digitalocean_droplet.survivor_staging[*].id : [],
    contains(var.deploy_environments, "prod") ? digitalocean_droplet.survivor_prod[*].id : []
  )

  inbound_rule {
    protocol         = "tcp"
    port_range       = "22"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  inbound_rule {
    protocol         = "tcp"
    port_range       = "80"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  inbound_rule {
    protocol         = "tcp"
    port_range       = "443"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  outbound_rule {
    protocol              = "tcp"
    port_range            = "all"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }

  outbound_rule {
    protocol              = "udp"
    port_range            = "all"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }

  inbound_rule {
    protocol         = "tcp"
    port_range       = "8080"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  outbound_rule {
    protocol              = "tcp"
    port_range            = "8080"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }

  inbound_rule {
    protocol         = "tcp"
    port_range       = "3000"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  inbound_rule {
    protocol         = "tcp"
    port_range       = "5432"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

}

resource "digitalocean_project" "survivor" {
  name        = "survivor"
  description = "Survivor application infrastructure"
  purpose     = "Web Application"
  environment = "Production"
}

resource "digitalocean_project_resources" "assign_vm" {
  project = digitalocean_project.survivor.id
  resources = concat(
    contains(var.deploy_environments, "staging") ? digitalocean_droplet.survivor_staging[*].urn : [],
    contains(var.deploy_environments, "prod") ? digitalocean_droplet.survivor_prod[*].urn : []
  )
}

output "droplet_staging_ip" {
  value       = contains(var.deploy_environments, "staging") && length(digitalocean_droplet.survivor_staging) > 0 ? digitalocean_droplet.survivor_staging[0].ipv4_address : null
  description = "Public IP of the survivor staging VM"
}

output "droplet_prod_ip" {
  value       = contains(var.deploy_environments, "prod") && length(digitalocean_droplet.survivor_prod) > 0 ? digitalocean_droplet.survivor_prod[0].ipv4_address : null
  description = "Public IP of the survivor production VM"
}

resource "local_file" "ansible_inventory" {
  filename = "${path.module}/../ansible/hosts.ini"
  content  = <<-EOT
%{if contains(var.deploy_environments, "staging") && length(digitalocean_droplet.survivor_staging) > 0~}
[survivor_staging]
${digitalocean_droplet.survivor_staging[0].ipv4_address} ansible_user=root ansible_ssh_private_key_file=${var.private_key_path}
%{endif~}

%{if contains(var.deploy_environments, "prod") && length(digitalocean_droplet.survivor_prod) > 0~}
[survivor_prod]
${digitalocean_droplet.survivor_prod[0].ipv4_address} ansible_user=root ansible_ssh_private_key_file=${var.private_key_path}
%{endif~}
EOT
}

resource "null_resource" "add_known_host_staging" {
  count      = contains(var.deploy_environments, "staging") ? 1 : 0
  depends_on = [digitalocean_droplet.survivor_staging]

  provisioner "local-exec" {
    command = <<EOT
ls -l ~/.ssh/known_hosts
for i in $(seq 1 30); do
  ssh-keyscan -H ${digitalocean_droplet.survivor_staging[0].ipv4_address} >> ~/.ssh/known_hosts 2>/dev/null && exit 0
  sleep 5
done
echo "ssh-keyscan failed after multiple attempts" >&2
exit 1
EOT
  }
}

resource "null_resource" "add_known_host_prod" {
  count      = contains(var.deploy_environments, "prod") ? 1 : 0
  depends_on = [digitalocean_droplet.survivor_prod]

  provisioner "local-exec" {
    command = <<EOT
ls -l ~/.ssh/known_hosts
for i in $(seq 1 30); do
  ssh-keyscan -H ${digitalocean_droplet.survivor_prod[0].ipv4_address} >> ~/.ssh/known_hosts 2>/dev/null && exit 0
  sleep 5
done
echo "ssh-keyscan failed after multiple attempts" >&2
exit 1
EOT
  }
}
