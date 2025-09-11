# 🚀 Survivor Application - Complete Deployment Guide

This guide covers the complete local and staging deployment process for the Survivor application, including infrastructure, containerization, and automation.

## 📋 Table of Contents

1. [Prerequisites](#-prerequisites)
2. [Deployment Architecture](#-deployment-architecture)
3. [Local Deployment (Docker)](#-local-deployment-docker)
4. [Staging/Production Deployment](#-stagingproduction-deployment)
5. [Utility Scripts](#-utility-scripts)
6. [Troubleshooting](#-troubleshooting)
7. [Monitoring and Maintenance](#-monitoring-and-maintenance)

---

## 🔧 Prerequisites

### Local Environment
- **Docker** ≥ 20.10
- **Docker Compose** ≥ 2.0
- **Node.js** ≥ 20
- **Git**

### Cloud Deployment (Staging/Production)
- **Terraform** ≥ 1.0
- **Ansible** ≥ 2.9
- **SSH Key Pair**
- **DigitalOcean Account** with API Token

### Prerequisites Check

```bash
# Check installed versions
./scripts/check-prerequisites.sh
```

---

## 🏗️ Deployment Architecture

### Available Environments

| Environment | Git Branch | Port | Docker Compose | Description |
|-------------|------------|------|----------------|-------------|
| **Local**   | `current`  | 3000 | `docker-compose.yml` | Local development |
| **Staging** | `development` | 3000 | `docker-compose.yml` | Testing and validation |
| **Production** | `main`   | 3000 | `docker-compose.prod.yml` | Live application |

### Technology Stack
- **Frontend**: Next.js 14
- **Backend**: Node.js/Express
- **Database**: PostgreSQL 15
- **Infrastructure**: DigitalOcean (Ubuntu 22.04)
- **Orchestration**: Docker Compose
- **Automation**: Ansible
- **Infrastructure as Code**: Terraform

---

## 🐳 Local Deployment (Docker)

### Quick Start

```bash
# 1. Clone the project
git clone https://github.com/SamTess/Survivor.git
cd Survivor

# 2. Start local environment
cd Docker
docker-compose up -d

# 3. Verify deployment
curl http://localhost:3000/api/health
```

### Advanced Configuration

#### Local Environment Variables

Edit `Docker/.env`:
```env
# Database
DB_HOST=db
DB_PORT=5432
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}

# Application
NODE_ENV=${NODE_ENV}
NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}

# External APIs
EXTERNAL_API_BASE_URL=${EXTERNAL_API_BASE_URL}
EXTERNAL_API_KEY=${EXTERNAL_API_KEY}
```

#### Available Services

- **Web Application**: http://localhost:3000
- **Database**: localhost:5432
- **Health Check**: http://localhost:3000/api/health

### Useful Commands

```bash
# View logs in real-time
docker-compose logs -f

# Restart a service
docker-compose restart web

# Access database
docker-compose exec db psql -U ${DB_USER} -d ${DB_NAME}

# Rebuild images
docker-compose build --no-cache

# Stop and cleanup
docker-compose down -v
```

---

## ☁️ Staging/Production Deployment

### Complete Process

#### 1. Infrastructure Deployment (Terraform)

```bash
cd terraform

# Initial configuration
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your credentials

# Interactive deployment
./deploy.sh

# Or direct command for staging only
terraform apply -var='deploy_environments=["staging"]'
```

#### 2. Application Deployment (Ansible)

```bash
cd ansible

# Automated deployment
./deploy.sh

# Or specific commands
ansible-playbook playbook-staging.yml    # Staging only
ansible-playbook playbook-production.yml # Production only
```

### Environment Configuration

#### Staging Environment

**Features**:
- Branch: `development`
- Port: 3000
- Config: `docker-compose.yml`
- Database: PostgreSQL staging

**Variables** (`.env.staging.j2`):
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://${STAGING_DB_USER}:${STAGING_DB_PASSWORD}@${DB_HOST}:5432/${STAGING_DB_NAME}
NEXT_PUBLIC_APP_URL=http://{{ staging_ip }}:3000
```

#### Production Environment

**Features**:
- Branch: `main`
- Port: 8080
- Config: `docker-compose.prod.yml`
- Database: PostgreSQL production

**Variables** (`.env.production.j2`):
```env
NODE_ENV=production
PORT=8080
DATABASE_URL=postgresql://${PROD_DB_USER}:${PROD_DB_PASSWORD}@${DB_HOST}:5432/${PROD_DB_NAME}
NEXT_PUBLIC_APP_URL=https://${PRODUCTION_DOMAIN}
```

---

## 🛠️ Utility Scripts

### Global Scripts

| Script | Description | Usage |
|--------|-------------|-------|
| `scripts/check-prerequisites.sh` | Check dependencies | `./scripts/check-prerequisites.sh` |
| `scripts/full-deploy.sh` | Complete deployment (infra + app) | `./scripts/full-deploy.sh [staging\|prod\|both]` |
| `scripts/health-check.sh` | Service health verification | `./scripts/health-check.sh` |
| `scripts/cleanup.sh` | Complete cleanup | `./scripts/cleanup.sh` |

### Terraform Scripts

| Script | Description |
|--------|-------------|
| `terraform/deploy.sh` | Interactive infrastructure deployment |
| `terraform/destroy.sh` | Infrastructure destruction |

### Ansible Scripts

| Script | Description |
|--------|-------------|
| `ansible/deploy.sh` | Interactive application deployment |

### Docker Scripts

| Script | Description |
|--------|-------------|
| `scripts/start-dev.sh` | Start development environment |
| `scripts/start-prod.sh` | Start local production environment |

---

## 🔍 Troubleshooting

### Common Issues

#### 1. Docker

**Error**: Port 3000 already in use
```bash
# Solution
sudo lsof -ti:3000 | xargs kill -9
docker-compose restart
```

**Error**: Database not accessible
```bash
# Check status
docker-compose ps
docker-compose logs db

# Complete reset
docker-compose down -v
docker-compose up -d
```

#### 2. Terraform

**Error**: Invalid API Token
```bash
# Check DigitalOcean token
curl -X GET \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DO_TOKEN" \
  "https://api.digitalocean.com/v2/account"
```

**Error**: SSH Key not found
```bash
# List available keys
doctl compute ssh-key list
# Update terraform.tfvars with correct ID
```

#### 3. Ansible

**Error**: Missing hosts.ini
```bash
# Generate inventory
cd terraform && terraform apply
cd ../ansible && ls -la hosts.ini
```

**Error**: SSH connection failed
```bash
# Test connection
ansible all -m ping
ssh -i ~/.ssh/your_key root@server_ip
```

#### 4. Application

**Error**: Health check fails
```bash
# Check logs
docker-compose logs web
curl -v http://localhost:3000/api/health

# Check environment variables
docker-compose exec web env | grep NODE_ENV
```

### Logs and Monitoring

#### Local Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f web
docker-compose logs -f db
```

#### Remote Logs
```bash
# Via Ansible
ansible staging -m shell -a "docker logs survivor_web"

# Direct SSH
ssh user@staging_ip "docker logs survivor_web"
```

#### Health Checks
```bash
# Local
curl http://localhost:3000/api/health

# Staging
curl http://<staging_ip>:3000/api/health

# Production
curl http://<prod_ip>:3000/api/health
```

### Diagnostic Commands

```bash
# Container status
docker-compose ps

# Resource usage
docker stats

# Disk space
docker system df

# Terraform state
terraform show

# Ansible state
ansible-inventory --list

# Network connectivity
ansible all -m ping
```

---

## 📊 Monitoring and Maintenance

### Periodic Checks

#### Daily
- [ ] Environment health checks
- [ ] Error log verification
- [ ] Performance monitoring

#### Weekly
- [ ] Dependency updates
- [ ] Data backups
- [ ] Disk space verification

#### Monthly
- [ ] Security updates
- [ ] Docker image optimization
- [ ] Log rotation

### Maintenance Scripts

```bash
# Local Docker cleanup
docker system prune -f

# Update images
docker-compose pull
docker-compose up -d

# Database backup
docker-compose exec ${DB_HOST} pg_dump -U ${DB_USER} ${DB_NAME} > backup.sql
```

### Alerts and Notifications

#### Recommended Setup
- **Uptime monitoring**: UptimeRobot, Pingdom
- **Error tracking**: Sentry
- **Performance**: New Relic, DataDog
- **Centralized logs**: ELK Stack, Grafana

---

## 🔗 Useful Links

- [Docker Documentation](./Docker/README.md)
- [Terraform Documentation](./terraform/README.md)
- [Ansible Documentation](./ansible/README.md)
- [Application Architecture](./docs/UI_SETUP_ARCHITECTURE.md)
- [Style Guide](./docs/STYLE_GUIDE_UNIFIED.md)

---

## 📞 Support

For help:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Review logs with `docker-compose logs`
3. Use provided diagnostic scripts
4. Contact the DevOps team

---

**Last updated**: September 2025
**Version**: 1.0.0

## 🔗 Liens Utiles

- [Documentation Docker](./Docker/README.md)
- [Documentation Terraform](./terraform/README.md)
- [Documentation Ansible](./ansible/README.md)
- [Architecture de l'Application](./docs/UI_SETUP_ARCHITECTURE.md)
- [Guide de Style](./docs/STYLE_GUIDE_UNIFIED.md)

---

## 📞 Support

Pour obtenir de l'aide :

1. Vérifiez la section [Troubleshooting](#-troubleshooting)
2. Consultez les logs avec `docker-compose logs`
3. Utilisez les scripts de diagnostic fournis
4. Contactez l'équipe DevOps

---

**Dernière mise à jour**: September 2025
**Version**: 1.0.0
