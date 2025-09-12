# 🏗️ Terraform Infrastructure - Survivor Application

Infrastructure as Code setup for deploying Survivor application to DigitalOcean cloud platform.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Infrastructure Components](#infrastructure-components)
- [Environment Configuration](#environment-configuration)
- [Deployment Process](#deployment-process)
- [State Management](#state-management)
- [Troubleshooting](#troubleshooting)
- [Cost Management](#cost-management)

## 🌟 Overview

This Terraform configuration provides:
- **Multi-environment** support (staging and production)
- **DigitalOcean droplets** with Ubuntu 22.04
- **Automated provisioning** with cloud-init
- **SSH key management** for secure access
- **Firewall configuration** for security
- **DNS records** management (optional)
- **State file** tracking for infrastructure changes

### Architecture Overview
```
┌─────────────────────┐    ┌─────────────────────┐
│   Staging Server    │    │  Production Server  │
│   Ubuntu 22.04      │    │   Ubuntu 22.04      │
│   4GB RAM / 2 vCPU  │    │   4GB RAM / 2 vCPU  │
│   Port 3000         │    │   Port 3000         │
└─────────────────────┘    └─────────────────────┘
```

### File Structure

#### Core Terraform Files

| File | Description | Purpose |
|------|-------------|---------|
| `main.tf` | Main Terraform configuration | Defines all infrastructure resources |
| `variables.tf` | Input variable definitions | Configurable parameters |
| `terraform.tfvars` | Variable values (not in git) | Your specific configuration |
| `deploy.sh` | Interactive deployment script | User-friendly deployment |
| `destroy.sh` | Interactive cleanup script | Safe infrastructure removal |

## 📋 Prerequisites

### Required Tools
- **Terraform** ≥ 1.0
- **DigitalOcean CLI** (doctl) - Optional but recommended
- **SSH Key Pair** for server access

### Required Accounts & Credentials
- **DigitalOcean Account** with API access
- **DigitalOcean API Token** with read/write permissions
- **Domain Name** (optional, for production DNS)

### System Requirements
- **Internet connection** for provider downloads
- **Local storage** for state files
- **SSH client** for server access

## 🚀 Quick Start

### 1. Initial Setup
```bash
# Navigate to terraform directory
cd terraform

# Initialize Terraform
terraform init

# Verify configuration
terraform validate
```

### 2. Configure Variables
```bash
# Copy example variables
cp terraform.tfvars.example terraform.tfvars

# Edit with your values
nano terraform.tfvars
```

Example `terraform.tfvars`:
```hcl
do_token         = "${DO_TOKEN}"
ssh_key_id       = "${SSH_KEY_ID}"
private_key_path = "${SSH_PRIVATE_KEY_PATH}"
deploy_environments = ["staging", "prod"]  # Optional: defaults to both
```

### 3. Plan and Deploy
```bash
# Plan infrastructure changes
terraform plan

# Deploy infrastructure
terraform apply

# Or use the deployment script
./deploy.sh
```

### 4. Verify Deployment
```bash
# Show infrastructure outputs
terraform output

# Test SSH connection
ssh root@$(terraform output -raw droplet_staging_ip)
```

## 🏗️ Infrastructure Components

### Created Resources

#### DigitalOcean Project
- **Name**: "Survivor"
- **Purpose**: Organizes all resources
- **Environment**: Development/Production

#### Droplets (Virtual Machines)

| Environment | Specifications | Configuration |
|-------------|---------------|---------------|
| **Staging** | 2 vCPU, 4GB RAM | Ubuntu 22.04 LTS |
| **Production** | 2 vCPU, 4GB RAM | Ubuntu 22.04 LTS |
| **Region** | Frankfurt (fra1) | DigitalOcean |

#### Firewall Security Group
Configured ports and access:

| Port | Protocol | Purpose | Source |
|------|----------|---------|--------|
| 22   | TCP      | SSH access | All |
| 80   | TCP      | HTTP | All |
| 443  | TCP      | HTTPS | All |
| 3000 | TCP      | Development app | All |
| 5432 | TCP      | PostgreSQL | All |
| 8080 | TCP      | Production app | All |

#### Ansible Integration
- **Auto-generated** `../ansible/hosts.ini` inventory
- **SSH key configuration** for Ansible access
- **Host verification** setup

### Network Configuration
- **Public IPv4** addresses for each droplet
- **Standard networking** with DigitalOcean
- **Automatic DNS** resolution
- **SSH key** authentication only

## ⚙️ Environment Configuration

### Variable Configuration

The `variables.tf` file defines configurable parameters:

| Variable | Type | Description | Required |
|----------|------|-------------|----------|
| `do_token` | string | DigitalOcean API token | Yes |
| `ssh_key_id` | string | SSH key ID in DigitalOcean | Yes |
| `private_key_path` | string | Path to SSH private key | Yes |
| `deploy_environments` | set(string) | Environments to deploy | No |

### Environment-Specific Settings

#### Staging Environment
```hcl
# In terraform.tfvars
deploy_environments = ["staging"]

# Droplet configuration
size = "s-2vcpu-4gb"
region = "fra1"
image = "ubuntu-22-04-x64"
```

#### Production Environment
```hcl
# In terraform.tfvars
deploy_environments = ["prod"]

# Droplet configuration (same as staging)
size = "s-2vcpu-4gb"
region = "fra1"
image = "ubuntu-22-04-x64"
```

#### Both Environments
```hcl
# Deploy both staging and production
deploy_environments = ["staging", "prod"]
```

## 🚀 Deployment Process

### Interactive Deployment Script

The `deploy.sh` script provides a user-friendly interface:

**Features:**
- 🎯 Menu-driven environment selection
- 📋 Runs `terraform plan` before applying
- ✅ User confirmation before deployment
- 🎨 Color-coded output for better UX
- 🛡️ Error handling and validation

**Usage:**
```bash
./deploy.sh
```

**Menu Options:**
1. Deploy staging environment only
2. Deploy production environment only
3. Deploy both environments
4. Exit

### Manual Deployment Commands

#### Deploy Specific Environments
```bash
# Staging only
terraform apply -var='deploy_environments=["staging"]'

# For production only
terraform apply -var='deploy_environments=["prod"]'

# Both environments
terraform apply -var='deploy_environments=["staging", "prod"]'
```

#### Deployment Workflow
```bash
# 1. Plan changes
terraform plan

# 2. Review planned changes
# Ensure all changes are expected

# 3. Apply changes
terraform apply

# 4. Verify outputs
terraform output
```

### Post-Deployment Verification

#### Check Outputs
```bash
# View all outputs
terraform output

# Get specific IPs
terraform output droplet_staging_ip
terraform output droplet_prod_ip
```

#### Test SSH Access
```bash
# Connect to staging
ssh root@$(terraform output -raw droplet_staging_ip)

# Connect to production
ssh root@$(terraform output -raw droplet_prod_ip)
```

#### Verify Ansible Integration
```bash
# Check generated inventory
cat ../ansible/hosts.ini

# Test Ansible connectivity
cd ../ansible
ansible all -m ping
```

## 🛡️ Security Notes

- **SSH Key Security**: Use strong SSH keys and protect your private keys
- **Firewall Configuration**: Configure UFW or iptables on your servers
- **SSH Hardening**: Consider disabling password authentication and root login
- **Network Security**: Use private networks if available
- **Regular Updates**: Keep your servers updated with security patches

## 🔄 Workflow Examples

### Setup Workflow
1. Provision private servers with Ubuntu 22.04
2. Configure SSH key access
3. Set up firewall rules
4. Update `terraform.tfvars` with server IPs
5. Run `terraform apply` to generate Ansible inventory
6. Deploy with Ansible: `cd ../ansible && ./deploy.sh`

### Update Workflow
1. Make changes to server configuration
2. Update IPs in `terraform.tfvars` if needed
3. Run `terraform apply` to update inventory
4. Redeploy with Ansible if necessary

## 📋 Troubleshooting

### Common Issues

**SSH connection fails:**
- Verify SSH key is in `~/.ssh/authorized_keys` on servers
- Check SSH service is running: `sudo systemctl status ssh`
- Test manual connection: `ssh -i <private_key> <user>@<server_ip>`

**Server not accessible:**
- Check firewall rules: `sudo ufw status`
- Verify server IP addresses are correct
- Ensure servers are running and network is configured

**Ansible inventory not generated:**
- Check `terraform.tfvars` has correct server IPs
- Run `terraform apply` to regenerate inventory
- Verify `deploy_environments` variable is set correctly

**Permission denied:**
- Check SSH private key permissions: `chmod 600 ~/.ssh/id_ed25519`
- Verify SSH user has sudo privileges
- Check SSH public key is correctly added to server

### Useful Commands

```bash
# Test SSH connection to servers
ssh -i /path/to/private/key user@server_ip

# Check firewall status
sudo ufw status

# View generated inventory
cat ../ansible/hosts.ini

# Test Ansible connectivity
cd ../ansible && ansible all -m ping

# Check Terraform state
terraform state list

# Show current outputs
terraform output
```

## 🗃️ State Management

### Local State Storage
- **State file**: `terraform.tfstate`
- **Backup file**: `terraform.tfstate.backup`
- **Lock file**: `.terraform.lock.hcl`

### State Management Best Practices

#### Backup Strategy
```bash
# Backup state before major changes
cp terraform.tfstate terraform.tfstate.backup.$(date +%Y%m%d_%H%M%S)

# Restore from backup if needed
cp terraform.tfstate.backup terraform.tfstate
```

#### State Operations
```bash
# List resources in state
terraform state list

# Show specific resource
terraform state show digitalocean_droplet.staging

# Remove resource from state (careful!)
terraform state rm digitalocean_droplet.staging

# Import existing resource
terraform import digitalocean_droplet.staging <droplet_id>
```

## 💰 Cost Management

### Cost Optimization

#### Resource Sizing
```hcl
# Adjust droplet sizes for cost savings
variable "staging_server_size" {
  default = "s-1vcpu-1gb"  # Smaller for development
}

variable "production_server_size" {
  default = "s-2vcpu-4gb"  # Appropriate for production
}
```

#### Environment-Specific Deployment
```bash
# Deploy only what you need
./deploy.sh  # Choose staging only during development
./deploy.sh  # Choose production only for releases
```

### Infrastructure Cleanup

#### Destroy Infrastructure Script
```bash
./destroy.sh
# Menu-driven destruction with safety prompts
```

#### Manual Cleanup
```bash
# Destroy specific environment
terraform destroy -var='deploy_environments=["staging"]'

# Destroy all infrastructure
terraform destroy
```

## 🛡️ Security Best Practices

### Credential Management
- **Never commit `terraform.tfvars`** to version control
- Use environment variables for sensitive data
- Regularly rotate API tokens
- Monitor DigitalOcean billing for unexpected charges

### Network Security
- SSH keys are automatically added to `~/.ssh/known_hosts`
- Firewall rules restrict access to necessary ports only
- Consider VPN access for production environments

## 🔗 Integration with Other Components

### Ansible Integration
Auto-generated inventory file format:
```ini
[survivor_staging]
<staging_ip> ansible_user=root ansible_ssh_private_key_file=${SSH_PRIVATE_KEY_PATH}

[survivor_prod]
<prod_ip> ansible_user=root ansible_ssh_private_key_file=${SSH_PRIVATE_KEY_PATH}
```

### CI/CD Integration
```yaml
# Example GitHub Actions workflow
- name: Deploy Infrastructure
  run: |
    cd terraform
    terraform init
    terraform apply -auto-approve
```

---

## 🆘 Support

For Terraform-specific issues:

1. Check this documentation
2. Verify DigitalOcean API token and permissions
3. Ensure SSH key is properly configured
4. Review Terraform logs with `TF_LOG=DEBUG`
5. Check [DigitalOcean status page](https://status.digitalocean.com/)
6. Review [main deployment guide](../DEPLOYMENT.md)

---

**Last updated**: September 2025
**Version**: 1.0.0
