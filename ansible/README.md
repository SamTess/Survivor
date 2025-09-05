# Survivor Application - Ansible Configuration

This directory contains Ansible playbooks and configuration for deploying the Survivor application to staging and production environments.

## 📁 File Overview

### Core Files

#### `playbook.yml`
Main Ansible playbook with three plays:

1. **Install Docker & Node.js** (`hosts: all`)
   - Installs Docker and Node.js on all target hosts
   - Sets up Docker service and user permissions
   - Tags: `install`, `dependencies`

2. **Deploy Staging Environment** (`hosts: survivor_staging`)
   - Deploys from `development` branch
   - Uses `docker-compose.yml`
   - Runs on port 3000
   - Tags: `deploy`, `staging`

3. **Deploy Production Environment** (`hosts: survivor_prod`)
   - Deploys from `main` branch
   - Uses `docker-compose.prod.yml`
   - Runs on port 8080
   - Tags: `deploy`, `production`

#### `config.conf`
Configuration file containing:
- Repository settings (URL, branches)
- Application settings (Node.js version, directories)
- Docker settings (compose files, ports)
- Environment file locations

#### `ansible.cfg`
Ansible configuration with optimized settings for the deployment.

#### `hosts.ini`
Auto-generated inventory file from Terraform containing target host information.

### Environment Templates

#### `.env.staging.j2`
Jinja2 template for staging environment variables.

#### `.env.production.j2`
Jinja2 template for production environment variables.

### Deployment Script

#### `deploy.sh`
Interactive deployment script that:
- ✅ Checks if `hosts.ini` exists
- 🔍 Detects available environments
- 🎯 Provides menu-driven deployment options
- 🚀 Runs appropriate Ansible commands

## 🚀 Usage

### Prerequisites

1. **Terraform deployed** (generates `hosts.ini`)
2. **Ansible installed** (version 2.9+)
3. **SSH access** to target hosts
4. **Docker compose files** in your repository

### Quick Start

1. **Ensure infrastructure is ready:**
   ```bash
   cd ../terraform && ./deploy.sh
   ```

2. **Deploy application:**
   ```bash
   cd ../ansible && ./deploy.sh
   ```

### Manual Deployment Options

**Deploy to specific environment:**
```bash
# Staging only
ansible-playbook playbook.yml --limit=survivor_staging

# Production only
ansible-playbook playbook.yml --limit=survivor_prod

# Both environments
ansible-playbook playbook.yml
```

**Install dependencies only:**
```bash
ansible-playbook playbook.yml --tags=install
```

**Deploy specific environment:**
```bash
# Staging deployment only
ansible-playbook playbook.yml --tags=staging

# Production deployment only
ansible-playbook playbook.yml --tags=production
```

## 🔧 Configuration

### Repository Settings (`config.conf`)

```ini
[repository]
git_url = "https://github.com/SamTess/Survivor.git"
git_branch_staging = "development"
git_branch_prod = "main"
app_directory = "/opt/survivor"
```

### Application Settings

```ini
[application]
app_name = "survivor"
node_version = "20"
```

### Docker Settings

```ini
[docker]
staging_compose_file = "docker-compose.yml"
prod_compose_file = "docker-compose.prod.yml"
staging_port = "3000"
prod_port = "8080"
```

## 🎯 Deployment Flow

### Staging Deployment
1. Clone/update `development` branch
2. Install npm dependencies
3. Apply staging environment variables
4. Stop existing containers
5. Build and start with `docker-compose.yml`
6. Health check on port 3000

### Production Deployment
1. Clone/update `main` branch
2. Install npm dependencies
3. Apply production environment variables
4. Stop existing containers
5. Build and start with `docker-compose.prod.yml`
6. Health check on port 8080

## 🛡️ Safety Features

- **Environment Detection**: Only runs on available hosts
- **Health Checks**: Verifies application startup
- **Graceful Shutdowns**: Stops containers before restart
- **Error Handling**: Retries and failure recovery
- **Branch Isolation**: Separate branches for staging/prod

## 📋 Troubleshooting

### Common Issues

**"hosts.ini not found":**
```bash
cd ../terraform && terraform apply
```

**"No hosts matched":**
- Check `hosts.ini` contains the correct inventory
- Verify SSH connectivity: `ansible all -m ping`

**Node.js installation fails:**
- Check internet connectivity on target hosts
- Verify Ubuntu version compatibility

**Docker build fails:**
- Ensure `Dockerfile` exists in repository
- Check Docker compose file syntax
- Verify environment variables

**Health check timeouts:**
- Check application logs: `docker logs <container_name>`
- Verify port configuration
- Check firewall settings

### Useful Commands

```bash
# Test connectivity
ansible all -m ping

# Check inventory
ansible-inventory --list

# Run with verbose output
ansible-playbook playbook.yml -vvv

# Dry run (check mode)
ansible-playbook playbook.yml --check

# See what tasks would run
ansible-playbook playbook.yml --list-tasks
```

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
- `PORT=8080`
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
