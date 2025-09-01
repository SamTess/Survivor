# Docker Environment for Survivor Project

This directory contains Docker configuration files for the Survivor Next.js application.

## Structure

- `Dockerfile.dev` - Development Dockerfile for Next.js app with hot reloading
- `Dockerfile.web` - Production Dockerfile for Next.js app
- `docker-compose.yml` - Development environment with hot reloading
- `docker-compose.prod.yml` - Production environment
- `../Database/` - PostgreSQL initialization scripts (mounted from project root)

## Quick Start

### Development Environment

```bash
# Navigate to Docker directory
cd Docker

# Start development environment
docker-compose up -d

# View logs
docker-compose logs -f
```

### Production Environment

```bash
# Navigate to Docker directory
cd Docker

# Start production environment
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

## Services

### Web Application (Next.js)
- **Port**: 3000
- **Environment**: Development/Production
- **Hot Reloading**: Enabled in development mode

### Database (PostgreSQL)
- **Port**: 5432
- **Database**: survivor_db
- **User**: survivor_user
- **Password**: survivor_password
- **Schema**: Automatically initialized from `../Database/DbInitSchema.sql`

## Environment Variables

The following environment variables are available in the web container:

- `NODE_ENV` - Environment mode (development/production)
- `DATABASE_URL` - PostgreSQL connection string

## Database Connection

Your Next.js app can connect to PostgreSQL using:

```
postgresql://survivor_user:survivor_password@db:5432/survivor_db
```

## Useful Commands

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
docker-compose exec db psql -U survivor_user -d survivor_db
```

## Development Notes

- In development mode, your source code is mounted as volumes for hot reloading
- Database data is persisted in a Docker volume
- The containers can communicate with each other using service names (web, db)
- Both development and production use Node.js 20 Alpine for consistency
- Database schema is automatically initialized from the `Database/DbInitSchema.sql` file

## Database Management

To manage your PostgreSQL database, you can:

1. **Use psql directly**:
   ```bash
   docker-compose exec db psql -U survivor_user -d survivor_db
   ```

2. **Connect with your favorite database client** (like DBeaver, TablePlus, etc.):
   - Host: localhost
   - Port: 5432
   - Database: survivor_db
   - Username: survivor_user
   - Password: survivor_password
