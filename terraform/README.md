# Survivor Infrastructure - Terraform Configuration

This directory contains the Terraform configuration for deploying the Survivor application infrastructure on DigitalOcean. The setup supports flexible deployment of staging and/or production environments.

## 📁 File Overview

### Core Terraform Files

#### `main.tf`
The main Terraform configuration file that defines:

- **Provider Configuration**: DigitalOcean and local providers
- **Project**: DigitalOcean project named "Survivor"
- **Droplets**: Conditional creation of staging and production VMs
  - Ubuntu 22.04 LTS
  - 1 vCPU, 1GB RAM (s-1vcpu-1gb)
  - Frankfurt region (fra1)
- **Firewall Rules**: Security groups allowing HTTP(80), HTTPS(443), SSH(22), and custom ports (3000, 5432, 8080, 19999)
- **Ansible Integration**: Auto-generates `../ansible/hosts.ini` inventory file
- **SSH Setup**: Automatically adds droplet IPs to known_hosts
- **Outputs**: Public IP addresses of created droplets

#### `variables.tf`
Defines input variables for the configuration:

- `do_token`: DigitalOcean API token (sensitive)
- `ssh_key_id`: DigitalOcean SSH key ID
- `private_key_path`: Path to SSH private key file
- `deploy_environments`: Set of environments to deploy (`["staging"]`, `["prod"]`, or `["staging", "prod"]`)

#### `terraform.tfvars`
Contains actual values for variables (⚠️ **Never commit sensitive data**):

```hcl
do_token         = "your_digitalocean_api_token"
ssh_key_id       = "your_ssh_key_id"
private_key_path = "/path/to/your/private/key"
deploy_environments = ["staging", "prod"]  # Optional: defaults to both
```

### Deployment Scripts

#### `deploy.sh`
Interactive deployment script with colored output:

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

#### `destroy.sh`
Interactive destruction script for cleanup:

**Features:**
- 🔥 Menu-driven environment selection for destruction
- ⚠️ Strong confirmation prompts (requires typing "YES")
- 🎨 Color-coded warnings
- 🛡️ Safety measures to prevent accidental destruction

**Usage:**
```bash
./destroy.sh
```

## 🚀 Getting Started

### Prerequisites

1. **Terraform installed** (version 1.0+)
2. **DigitalOcean account** with API token
3. **SSH key pair** uploaded to DigitalOcean

### Setup Steps

1. **Clone and navigate:**
   ```bash
   cd terraform/
   ```

2. **Copy and configure variables:**
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your actual values
   ```

3. **Initialize Terraform:**
   ```bash
   terraform init
   ```

4. **Deploy infrastructure:**
   ```bash
   ./deploy.sh
   ```

## 💡 Usage Examples

### Deploy Specific Environments

**Option 1: Interactive Script (Recommended)**
```bash
./deploy.sh
# Follow the menu prompts
```

**Option 2: Direct Terraform Commands**
```bash
# Staging only
terraform apply -var='deploy_environments=["staging"]'

# Production only
terraform apply -var='deploy_environments=["prod"]'

# Both environments
terraform apply -var='deploy_environments=["staging", "prod"]'
```

**Option 3: Set in terraform.tfvars**
```hcl
deploy_environments = ["staging"]  # Add this line
```

### Destroy Infrastructure

**Interactive cleanup:**
```bash
./destroy.sh
# Follow the prompts and type "YES" to confirm
```

**Direct destruction:**
```bash
terraform destroy -var='deploy_environments=["staging"]'
```

## 🔧 Infrastructure Details

### Created Resources

- **Droplets**: Ubuntu 22.04 VMs in Frankfurt region
- **Firewall**: Security group with HTTP/HTTPS/SSH access
- **Project**: DigitalOcean project organization
- **Ansible Inventory**: Auto-generated `../ansible/hosts.ini`

### Networking

| Port | Protocol | Purpose |
|------|----------|---------|
| 22   | TCP      | SSH access |
| 80   | TCP      | HTTP |
| 443  | TCP      | HTTPS |
| 3000 | TCP      | Application (development) |
| 5432 | TCP      | PostgreSQL |
| 8080 | TCP      | Application (production) |

### Outputs

After successful deployment:
- `droplet_staging_ip`: Public IP of staging server (if deployed)
- `droplet_prod_ip`: Public IP of production server (if deployed)

## 🛡️ Security Notes

- **Never commit `terraform.tfvars`** to version control
- SSH keys are automatically added to `~/.ssh/known_hosts`
- Firewall rules restrict access to necessary ports only
- API tokens should be kept secure and rotated regularly

## 🔄 Workflow Examples

### Development Workflow
1. Deploy staging: `./deploy.sh` → Option 1
2. Test application on staging
3. Deploy production: `./deploy.sh` → Option 2

### Cost-Optimized Workflow
1. Work on staging only during development
2. Deploy production only for releases
3. Use destroy script to clean up unused environments

### Full Environment Refresh
1. Destroy both: `./destroy.sh` → Option 3
2. Deploy both: `./deploy.sh` → Option 3

## 📋 Troubleshooting

### Common Issues

**Terraform init fails:**
- Check internet connection
- Verify Terraform version compatibility

**API authentication errors:**
- Verify `do_token` in `terraform.tfvars`
- Check DigitalOcean API token permissions

**SSH connection issues:**
- Ensure SSH key is uploaded to DigitalOcean
- Verify `ssh_key_id` matches the key ID (not fingerprint)
- Check `private_key_path` points to correct file

**Resource conflicts:**
- Use `terraform state list` to see current resources
- Consider renaming resources if conflicts occur

### Useful Commands

```bash
# Check current state
terraform state list

# View detailed plan
terraform plan -detailed-exitcode

# Format configuration files
terraform fmt

# Validate configuration
terraform validate

# Show current outputs
terraform output
```

## 🤝 Integration

This Terraform configuration integrates with:
- **Ansible**: Auto-generates inventory file at `../ansible/hosts.ini`
- **Docker**: VMs are prepared for Docker deployment
- **CI/CD**: Can be integrated with automated pipelines

The generated Ansible inventory format:
```ini
[survivor_staging]
<staging_ip> ansible_user=root ansible_ssh_private_key_file=<private_key_path>

[survivor_prod]
<prod_ip> ansible_user=root ansible_ssh_private_key_file=<private_key_path>
```
