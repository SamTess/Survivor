# 🐳 Docker Configuration - Survivor Application

Complete Docker setup for local development and production deployment of the Survivor application.

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Environment Configuration](#environment-configuration)
- [Available Environments](#available-environments)
- [Services](#services)
- [Development Workflow](#development-workflow)
- [Production Setup](#production-setup)
- [Troubleshooting](#troubleshooting)
- [Performance Optimization](#performance-optimization)

## 🌟 Overview

This Docker configuration provides:
- **Multi-stage builds** for optimized production images
- **Development and production** environment support
- **PostgreSQL database** with persistent storage
- **Hot reload** for development
- **Health checks** for all services
- **Environment-specific** configurations

### File Structure

| File | Description | Usage |
|------|-------------|-------|
| `Dockerfile.dev.web` | Development Docker image with hot reload | Local development |
| `Dockerfile.web` | Optimized production Docker image | Production/Staging |
| `docker-compose.yml` | Development orchestration | `docker-compose up` |
| `docker-compose.prod.yml` | Production orchestration | Staging/prod deployment |
| `docker-compose.ci.yml` | CI/CD configuration | Automated testing |
| `.env` | Local environment variables | Local configuration |
| `../db/` | PostgreSQL initialization scripts | Database setup |

### Architecture
```
┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │◄──►│   PostgreSQL    │
│   (Port 3000)   │    │   (Port 5432)   │
└─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- **Docker** ≥ 20.10
- **Docker Compose** ≥ 2.0
- **Git** (to clone the project)
- 4GB RAM available
- Ports 3000, 5432 available

### Development Environment

```bash
# 1. Navigate to Docker directory
cd Docker

# 2. Check configuration
cat .env

# 3. Start development environment
docker-compose up -d

# 4. Verify services are running
docker-compose ps

# 5. View real-time logs
docker-compose logs -f web
```

### Local Production Environment

```bash
# 1. Navigate to Docker directory
cd Docker

# 2. Start production environment
docker-compose -f docker-compose.prod.yml up -d

# 3. Verify deployment
curl http://localhost:8080/health
```

### Utility Scripts

```bash
# Quick development start
../scripts/start-dev.sh

# Quick production start
../scripts/start-prod.sh
```

### Verification
```bash
# Check service status
docker-compose ps

# Run health check
curl http://localhost:3000/health

# Check database connection
docker-compose exec db psql -U ${DB_USER} -d ${DB_NAME} -c "SELECT version();"
```

## ⚙️ Environment Configuration

### Environment Variables

The `.env` file contains local configuration:

```env
# PostgreSQL Database
DB_HOST=db                    # Docker service name
DB_PORT=5432                  # Standard PostgreSQL port
DB_NAME=${DB_NAME}            # Database name
DB_USER=${DB_USER}            # PostgreSQL user
DB_PASSWORD=${DB_PASSWORD}    # PostgreSQL password

# Complete connection URL
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}

# Application configuration
NODE_ENV=${NODE_ENV}          # Node.js environment
NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}  # Public app URL

# External APIs
EXTERNAL_API_BASE_URL=${EXTERNAL_API_BASE_URL}
EXTERNAL_API_KEY=${EXTERNAL_API_KEY}

# Synchronization configuration
SYNC_DEBUG=${SYNC_DEBUG}                  # Debug sync (0/1)
SYNC_INTERVAL_MS=${SYNC_INTERVAL_MS}     # Interval in milliseconds
SYNC_AUTO=${SYNC_AUTO}                   # Automatic sync (0/1)
```

### Docker Compose Configurations

#### docker-compose.yml (Development)
- **Web Port**: 3000
- **DB Port**: 5432
- **Hot Reload**: Enabled
- **Volumes**: Source code mounted
- **Database**: Persistence via volume

#### docker-compose.prod.yml (Production)
- **Web Port**: 3000
- **Optimizations**: Multi-stage build
- **Security**: Secure environment variables
- **Performance**: Optimized cache

## 🛠️ Services

### Web Application (Next.js)
- **Port**: 3000 (development) / 3000 (production)
- **Environment**: Development/Production
- **Hot Reloading**: Enabled in development mode
- **Health Check**: http://localhost:3000/health

### Database (PostgreSQL)
- **Port**: 5432
- **Database**: ${DB_NAME}
- **User**: ${DB_USER}
- **Password**: ${DB_PASSWORD}
- **Schema**: Automatically initialized from `../db/DbInitSchema.sql`

## 💻 Development Workflow

### Daily Development
```bash
# Start environment
docker-compose up -d

# Watch logs
docker-compose logs -f web

# Execute commands in container
docker-compose exec web npm run build
docker-compose exec web npm run test

# Database operations
docker-compose exec db psql -U ${DB_USER} -d ${DB_NAME}

# Stop environment
docker-compose down
```

### Database Management
```bash
# Access database shell
docker-compose exec db psql -U ${DB_USER} -d ${DB_NAME}

# Run migrations
docker-compose exec web npx prisma migrate dev

# Reset database
docker-compose exec web npx prisma migrate reset

# Backup database
docker-compose exec db pg_dump -U ${DB_USER} ${DB_NAME} > backup.sql

# Restore database
docker-compose exec -T db psql -U ${DB_USER} -d ${DB_NAME} < backup.sql
```

## 🔍 Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Check what's using port 3000
sudo lsof -i :3000

# Kill conflicting process
sudo kill -9 <PID>

# Or use different port
docker-compose up -d --scale web=0
docker run -p 3001:3000 survivor_web
```

#### Database Connection Issues
```bash
# Check database status
docker-compose ps db

# Check database logs
docker-compose logs db

# Reset database
docker-compose down -v
docker-compose up -d db
```

#### Build Failures
```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache

# Check disk space
docker system df
```

### Useful Commands

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (careful: this deletes database data)
docker-compose down -v

# Rebuild containers
docker-compose build

# View running containers
docker-compose ps

# Execute commands in running containers
docker-compose exec web sh
docker-compose exec db psql -U ${DB_USER} -d ${DB_NAME}

# Real-time stats
docker stats

# Export logs
docker-compose logs > logs.txt
```

## 🔗 Database Connection

Your Next.js app can connect to PostgreSQL using:

```
postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}
```

### External Database Clients

Connect with your favorite database client (DBeaver, TablePlus, etc.):
- **Host**: localhost
- **Port**: 5432
- **Database**: ${DB_NAME}
- **Username**: ${DB_USER}
- **Password**: ${DB_PASSWORD}

## 📝 Development Notes

- In development mode, your source code is mounted as volumes for hot reloading
- Database data is persisted in a Docker volume
- The containers can communicate with each other using service names (web, db)
- Both development and production use Node.js 20 Alpine for consistency
- Database schema is automatically initialized from the `db/DbInitSchema.sql` file
- Health checks are configured for both web and database services

---

## 🆘 Support

For Docker-specific issues:

1. Check this documentation
2. Run `docker-compose logs` to see error messages
3. Verify `.env` file configuration
4. Check port availability with `sudo lsof -i :3000`
5. Review [main deployment guide](../DEPLOYMENT.md)

---

**Last updated**: September 2025
**Version**: 1.0.0
