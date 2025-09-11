# 🤖 Ansible Configuration - Survivor Application

Automated configuration management and deployment for the Survivor application across staging and production environments.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Configuration Files](#configuration-files)
- [Deployment Process](#deployment-process)
- [Environment Management](#environment-management)
- [Troubleshooting](#troubleshooting)
- [Advanced Usage](#advanced-usage)

## 🌟 Overview

This Ansible configuration provides:
- **Automated server setup** with Docker and Node.js
- **Multi-environment deployment** (staging and production)
- **Zero-downtime deployments** with health checks
- **Environment-specific configurations** via templates
- **Git-based deployment** from different branches
- **Docker Compose orchestration** for application stack

### Deployment Architecture
```
┌─────────────────┐    ┌─────────────────┐
│   Local Ansible │    │   Remote Servers │
│   Playbooks     ├───►│   Docker Stack   │
│   Configuration │    │   Application    │
└─────────────────┘    └─────────────────┘
```

### File Structure

| File | Description | Purpose |
|------|-------------|---------|
| `playbook.yml` | Main Ansible playbook | Orchestrates all deployment tasks |
| `playbook-staging.yml` | Staging-specific playbook | Staging-only deployment |
| `playbook-production.yml` | Production-specific playbook | Production-only deployment |
| `config.yml` | Configuration variables | Centralized settings |
| `ansible.cfg` | Ansible configuration | Tool settings and optimizations |
| `hosts.ini` | Inventory file (auto-generated) | Target servers from Terraform |
| `.env.staging.j2` | Staging environment template | Environment variables |
| `.env.production.j2` | Production environment template | Environment variables |
| `deploy.sh` | Interactive deployment script | User-friendly deployment |
| `requirements.yml` | Ansible dependencies | Required collections and roles |

## 📋 Prerequisites

### Required Tools
- **Ansible** ≥ 2.9
- **Python** ≥ 3.6
- **SSH client** for remote access
- **Git** (for repository cloning)

### Required Infrastructure
- **Terraform-deployed** servers (generates `hosts.ini`)
- **SSH access** to target hosts with key-based authentication
- **Internet connectivity** for package installation

### Target Server Requirements
- **Ubuntu 22.04** LTS (recommended)
- **Root access** or sudo privileges
- **Open ports**: 22 (SSH), 3000 (staging), 3000 (production)
- **Minimum 2GB RAM** and 20GB disk space

## 🚀 Quick Start

### 1. Install Dependencies
```bash
# Install Ansible (if not already installed)
sudo apt update
sudo apt install ansible

# Install required Ansible collections
ansible-galaxy install -r requirements.yml
```

### 2. Verify Infrastructure
```bash
# Ensure Terraform has been deployed
cd ../terraform
terraform output

# Verify hosts.ini exists
cd ../ansible
cat hosts.ini
```

### 3. Test Connectivity
```bash
# Test SSH connectivity to all hosts
ansible all -m ping

# Check available hosts
ansible-inventory --list
```

### 4. Deploy Application
```bash
# Interactive deployment (recommended)
./deploy.sh

# Or deploy to all environments
ansible-playbook playbook.yml
```

### 5. Verify Deployment
```bash
# Check staging
curl http://$(terraform output -raw droplet_staging_ip):3000/health

# Check production
curl http://$(terraform output -raw droplet_prod_ip):8080/health
```

## ⚙️ Configuration Files

### Main Playbook (`playbook.yml`)

The main playbook consists of three plays:

#### 1. System Setup (All Hosts)
```yaml
- name: Install Docker & Node.js
  hosts: all
  tasks:
    - Install Docker Engine
    - Configure Docker service
    - Install Node.js 20
    - Setup user permissions
  tags: [install, dependencies]
```

#### 2. Staging Deployment
```yaml
- name: Deploy Staging Environment
  hosts: survivor_staging
  tasks:
    - Clone development branch
    - Configure staging environment
    - Deploy with docker-compose.yml
    - Health check on port 3000
  tags: [deploy, staging]
```

#### 3. Production Deployment
```yaml
- name: Deploy Production Environment
  hosts: survivor_prod
  tasks:
    - Clone main branch
    - Configure production environment
    - Deploy with docker-compose.prod.yml
    - Health check on port 8080
  tags: [deploy, production]
```

### Configuration Variables (`config.yml`)

#### Repository Settings
```yaml
repository:
  git_url: "${GIT_REPOSITORY_URL}"
  app_directory: "/opt/survivor"
```

#### Application Settings
```yaml
application:
  app_name: "survivor"
  node_version: "20"
  health_check_path: "/health"
  startup_timeout: 60
```

#### Docker Settings
```yaml
docker:
  staging_compose_file: "docker-compose.yml"
  prod_compose_file: "docker-compose.prod.yml"
  staging_port: 3000
  prod_port: 3000
  restart_policy: "unless-stopped"
```

### Ansible Configuration (`ansible.cfg`)

Optimized settings for deployment:
```ini
[defaults]
inventory = hosts.ini
remote_user = root
host_key_checking = False
retry_files_enabled = False
stdout_callback = yaml
pipelining = True

[ssh_connection]
ssh_args = -o ControlMaster=auto -o ControlPersist=60s
control_path = /tmp/ansible-ssh-%%h-%%p-%%r
```

## 🚀 Deployment Process

### Interactive Deployment Script

The `deploy.sh` script provides a user-friendly interface:

**Features:**
- ✅ Checks if `hosts.ini` exists (from Terraform)
- 🔍 Detects available environments automatically
- 🎯 Provides menu-driven deployment options
- 🚀 Runs appropriate Ansible commands with proper tags
- 📊 Shows deployment progress and results

**Usage:**
```bash
./deploy.sh
```

**Menu Options:**
1. Deploy to staging environment only
2. Deploy to production environment only
3. Deploy to both environments
4. Install dependencies only (Docker, Node.js)
5. Exit

### Manual Deployment Commands

#### Target-Specific Deployment
```bash
# Deploy only to staging
ansible-playbook playbook-staging.yml

# Deploy only to production
ansible-playbook playbook-production.yml

# Deploy to both environments
ansible-playbook playbook.yml
```

#### Tag-Based Deployment
```bash
# Install dependencies only
ansible-playbook playbook.yml --tags=install

# Deploy application only (skip dependencies)
ansible-playbook playbook.yml --tags=deploy

# Staging deployment tasks only
ansible-playbook playbook.yml --tags=staging

# Production deployment tasks only
ansible-playbook playbook.yml --tags=production
```

#### Host-Specific Deployment
```bash
# Limit to specific hosts
ansible-playbook playbook.yml --limit=survivor_staging
ansible-playbook playbook.yml --limit=survivor_prod

# Deploy to specific IP
ansible-playbook playbook.yml --limit=192.168.1.100
```

### Deployment Flow

#### Staging Environment Deployment
1. **System Setup** (if needed)
   - Install Docker Engine and Docker Compose
   - Install Node.js 20 and npm
   - Configure Docker service and user permissions

2. **Code Deployment**
   - Clone/update `development` branch to `/opt/survivor`
   - Install npm dependencies
   - Generate `.env` file from staging template

3. **Container Management**
   - Stop existing containers gracefully
   - Build new Docker images
   - Start containers with `docker-compose.yml`

4. **Health Verification**
   - Wait for application startup (max 60 seconds)
   - Verify health endpoint at `http://server_ip:3000/api/health`
   - Confirm all services are running

#### Production Environment Deployment
1. **System Setup** (if needed)
   - Same as staging but with production optimizations

2. **Code Deployment**
   - Clone/update `main` branch to `/opt/survivor`
   - Install npm dependencies with `--production` flag
   - Generate `.env` file from production template

3. **Container Management**
   - Graceful shutdown of existing containers
   - Build optimized Docker images
   - Start containers with `docker-compose.prod.yml`

4. **Health Verification**
   - Wait for application startup
   - Verify health endpoint at `http://server_ip:3000/api/health`
   - Confirm production readiness

## 🌍 Environment Management

### Environment Variables

#### Staging Environment (`.env.staging.j2`)
```env
# Application Settings
NODE_ENV=development
PORT=3000
NEXT_PUBLIC_APP_URL=http://{{ inventory_hostname }}:3000

# Database Configuration
DATABASE_URL=postgresql://${STAGING_DB_USER}:${STAGING_DB_PASSWORD}@{{db_host}}:5432/${STAGING_DB_NAME}

# External APIs
EXTERNAL_API_BASE_URL=${EXTERNAL_API_BASE_URL}
EXTERNAL_API_KEY={{ staging_api_key }}

# Feature Flags
ENABLE_DEBUG_LOGS=true
ENABLE_ANALYTICS=true
```

#### Production Environment (`.env.production.j2`)
```env
# Application Settings
NODE_ENV=production
PORT=8080
NEXT_PUBLIC_APP_URL=https://{{ production_domain }}

# Database Configuration
DATABASE_URL=postgresql://${PROD_DB_USER}:{{ prod_password }}@{{db_host}}:5432/${PROD_DB_NAME}

# External APIs
EXTERNAL_API_BASE_URL=${EXTERNAL_API_BASE_URL}
EXTERNAL_API_KEY={{ production_api_key }}

# Feature Flags
ENABLE_DEBUG_LOGS=false
ENABLE_ANALYTICS=true

# Security
JWT_SECRET={{ jwt_secret }}
ENCRYPTION_KEY={{ encryption_key }}
```

### Branch Strategy

| Environment | Git Branch | Docker Compose | Port | Purpose |
|-------------|------------|----------------|------|---------|
| **Staging** | `development` | `docker-compose.yml` | 3000 | Feature testing |
| **Production** | `main` | `docker-compose.prod.yml` | 3000 | Live application |

### Inventory Management

The `hosts.ini` file is auto-generated by Terraform:
```ini
[survivor_staging]
staging_ip ansible_user=root ansible_ssh_private_key_file=${SSH_PRIVATE_KEY_PATH}

[survivor_prod]
production_ip ansible_user=root ansible_ssh_private_key_file=${SSH_PRIVATE_KEY_PATH}

[all:vars]
ansible_python_interpreter=/usr/bin/python3
```

## � Troubleshooting

### Common Issues

#### Infrastructure Issues

**"hosts.ini not found"**
```bash
# Solution: Deploy infrastructure first
cd ../terraform
terraform apply
terraform output  # Verify IPs are generated

# Check if hosts.ini was created
cd ../ansible
cat hosts.ini
```

**"No hosts matched"**
```bash
# Check inventory contents
ansible-inventory --list

# Test connectivity
ansible all -m ping

# Verify SSH access manually
ssh root@<server_ip>
```

#### Connectivity Issues

**SSH connection failures**
```bash
# Test SSH manually
ssh -i ~/.ssh/id_rsa root@<server_ip>

# Check SSH key permissions
chmod 600 ~/.ssh/id_rsa

# Verify SSH key is added to DigitalOcean
doctl compute ssh-key list
```

**Permission denied errors**
```bash
# Ensure correct user in inventory
ansible all -m setup --limit=survivor_staging

# Try with different user
ansible-playbook playbook.yml -u ubuntu --become
```

#### Application Issues

**Docker installation fails**
```bash
# Check internet connectivity on target
ansible all -m ping

# Verify Ubuntu version
ansible all -m shell -a "lsb_release -a"

# Install Docker manually for debugging
ssh root@<server_ip>
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

**Node.js installation fails**
```bash
# Check available Node.js versions
ansible all -m shell -a "apt list --available nodejs*"

# Try alternative installation method
ansible all -m shell -a "curl -fsSL https://deb.nodesource.com/setup_20.x | bash -"
```

**Docker build fails**
```bash
# Check logs on target server
ssh root@<server_ip>
cd /opt/survivor
docker-compose logs

# Verify Dockerfile exists
ls -la Dockerfile*

# Check available disk space
df -h
```

**Health check timeouts**
```bash
# Check application logs
ssh root@<server_ip>
docker logs survivor_web

# Verify port is listening
ss -tlnp | grep :3000

# Test health endpoint manually
curl -v http://localhost:3000/health
```

#### Environment Variable Issues

**Missing environment variables**
```bash
# Check generated .env file
ssh root@<server_ip>
cat /opt/survivor/.env

# Verify template variables are defined
ansible-playbook playbook.yml --check --diff
```

### Debugging Commands

#### Ansible Debugging
```bash
# Run with maximum verbosity
ansible-playbook playbook.yml -vvv

# Check what would be changed
ansible-playbook playbook.yml --check --diff

# List all tasks that would run
ansible-playbook playbook.yml --list-tasks

# Run specific task by tag
ansible-playbook playbook.yml --tags=docker

# Skip specific tasks
ansible-playbook playbook.yml --skip-tags=install
```

#### Host Information
```bash
# Gather facts about hosts
ansible all -m setup

# Check disk space
ansible all -m shell -a "df -h"

# Check memory usage
ansible all -m shell -a "free -h"

# Check running processes
ansible all -m shell -a "ps aux | head"

# Check Docker status
ansible all -m shell -a "systemctl status docker"
```

#### Application Debugging
```bash
# Check container status
ansible all -m shell -a "docker ps"

# View container logs
ansible all -m shell -a "docker logs survivor_web"

# Check application files
ansible all -m shell -a "ls -la /opt/survivor"

# Test internal connectivity
ansible all -m shell -a "curl -I http://localhost:3000/health"
```

## 🔧 Advanced Usage

### Custom Playbook Execution

#### Environment-Specific Playbooks
```bash
# Use dedicated playbooks for single environments
ansible-playbook playbook-staging.yml
ansible-playbook playbook-production.yml
```

#### Custom Variable Overrides
```bash
# Override variables at runtime
ansible-playbook playbook.yml -e "node_version=18"
ansible-playbook playbook.yml -e "git_branch_staging=feature/new-deployment"

# Use external variable files
ansible-playbook playbook.yml -e @custom-vars.yml
```

#### Selective Task Execution
```bash
# Run only specific tasks
ansible-playbook playbook.yml --start-at-task="Clone repository"

# Step through playbook interactively
ansible-playbook playbook.yml --step

# Run tasks one by one
ansible-playbook playbook.yml --serial=1
```

### Performance Optimization

#### Parallel Execution
```bash
# Increase parallelism
ansible-playbook playbook.yml --forks=10

# Run on all hosts simultaneously
ansible-playbook playbook.yml --serial=0
```

#### SSH Optimization
```bash
# Use SSH multiplexing (already configured in ansible.cfg)
# Control connections are reused for 60 seconds

# Enable pipelining for faster execution
# Already enabled in ansible.cfg
```

### Integration with CI/CD

#### GitHub Actions Example
```yaml
name: Deploy Application
on:
  push:
    branches: [main, development]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Ansible
        run: |
          sudo apt update
          sudo apt install ansible

      - name: Deploy to Staging
        if: github.ref == 'refs/heads/development'
        run: |
          cd ansible
          ansible-playbook playbook-staging.yml

      - name: Deploy to Production
        if: github.ref == 'refs/heads/main'
        run: |
          cd ansible
          ansible-playbook playbook-production.yml
```

### Custom Environment Templates

#### Creating Custom Templates
```bash
# Copy existing template
cp .env.staging.j2 .env.custom.j2

# Edit template with custom variables
nano .env.custom.j2

# Use custom template in playbook
ansible-playbook playbook.yml -e "env_template=.env.custom.j2"
```

#### Template Variables
Use Ansible facts and variables in templates:
```jinja2
# Use inventory hostname
NEXT_PUBLIC_APP_URL=http://{{ inventory_hostname }}:3000

# Use custom variables
DATABASE_URL=postgresql://{{ db_user }}:{{ db_password }}@{{ db_host }}:5432/{{ db_name }}

# Use environment-specific settings
{% if env_name == "staging" %}
DEBUG=true
{% else %}
DEBUG=false
{% endif %}
```

## 🛡️ Safety Features

### Pre-deployment Checks
- **Infrastructure verification**: Confirms Terraform deployment
- **Connectivity testing**: Validates SSH access before deployment
- **Dependency verification**: Checks for required tools and packages
- **Health monitoring**: Continuous health checks during deployment

### Error Handling
- **Graceful failures**: Stops deployment on critical errors
- **Rollback capabilities**: Can revert to previous version
- **Retry mechanisms**: Automatic retries for transient failures
- **Status reporting**: Clear error messages and logs

### Security Measures
- **SSH key authentication**: No password-based access
- **Minimal privileges**: Uses least-privilege principle
- **Secure variable handling**: Sensitive data via Ansible Vault
- **Network isolation**: Firewall rules restrict access

---

## 🆘 Support

For Ansible-specific issues:

1. Check this documentation
2. Verify `hosts.ini` exists and contains correct servers
3. Test SSH connectivity manually: `ssh root@<server_ip>`
4. Run with verbose output: `ansible-playbook playbook.yml -vvv`
5. Check target server logs and resources
6. Review [main deployment guide](../DEPLOYMENT.md)

---

**Last updated**: September 2025
**Version**: 1.0.0

## 🔄 Integration Workflow

1. **Infrastructure**: Deploy with Terraform
2. **Dependencies**: Install Docker/Node.js
3. **Application**: Deploy code and containers
4. **Verification**: Health checks and monitoring

### Example Full Deployment

```bash
# 1. Deploy infrastructure
cd terraform && ./deploy.sh

# 2. Deploy application
cd ../ansible && ./deploy.sh

# 3. Verify deployment
curl http://<staging_ip>:3000/health
curl http://<prod_ip>:3000/health
```

## 📝 Environment Variables

Customize your environment files:

**Staging** (`.env.staging.j2`):
- `NODE_ENV=development`
- `PORT=3000`
- Development database URLs
- Debug settings enabled

**Production** (`.env.production.j2`):
- `NODE_ENV=production`
- `PORT=3000`
- Production database URLs
- Optimized settings

## 🏗️ Expected Repository Structure

Your repository should contain:
```
Dockerfile
docker-compose.yml
docker-compose.prod.yml
package.json
src/
  app.js (or main application file)
  health/ (health check endpoint)
```

The playbook expects a health endpoint at `/health` for verification.
