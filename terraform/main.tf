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

resource "digitalocean_project" "survivor" {
  name        = "Survivor"
  description = "3rd Year Web pool"
  purpose     = "Web Application"
  environment = "Development"
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
