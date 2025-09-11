````markdown
# 🐳 Docker Environment for Survivor Project

Ce répertoire contient la configuration Docker pour l'application Next.js Survivor, permettant un déploiement local simplifié et cohérent.

## 📁 Structure des Fichiers

| Fichier | Description | Usage |
|---------|-------------|-------|
| `Dockerfile.dev.web` | Image Docker développement avec hot reload | Développement local |
| `Dockerfile.web` | Image Docker production optimisée | Production/Staging |
| `docker-compose.yml` | Orchestration développement | `docker-compose up` |
| `docker-compose.prod.yml` | Orchestration production | Déploiement staging/prod |
| `docker-compose.ci.yml` | Configuration CI/CD | Tests automatisés |
| `.env` | Variables d'environnement locales | Configuration locale |
| `../db/` | Scripts d'initialisation PostgreSQL | Base de données |

## 🚀 Démarrage Rapide

### Prérequis
- **Docker** ≥ 20.10
- **Docker Compose** ≥ 2.0
- **Git** (pour cloner le projet)

### Environnement de Développement

```bash
# 1. Naviguer vers le répertoire Docker
cd Docker

# 2. Vérifier la configuration
cat .env

# 3. Démarrer l'environnement de développement
docker-compose up -d

# 4. Vérifier que les services sont actifs
docker-compose ps

# 5. Voir les logs en temps réel
docker-compose logs -f web
```

### Environnement de Production Local

```bash
# 1. Naviguer vers le répertoire Docker
cd Docker

# 2. Démarrer l'environnement de production
docker-compose -f docker-compose.prod.yml up -d

# 3. Vérifier le déploiement
curl http://localhost:8080/health
```

### Scripts Utilitaires

```bash
# Démarrage rapide développement
./start-dev.sh

# Démarrage rapide production
./start-prod.sh

# Affichage des logs
./logs.sh
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

## 🔧 Configuration Détaillée

### Variables d'Environnement

Le fichier `.env` contient la configuration locale :

```env
# Base de données PostgreSQL
DB_HOST=db                    # Nom du service Docker
DB_PORT=5432                  # Port PostgreSQL standard
DB_NAME=survivor_db           # Nom de la base de données
DB_USER=survivor_user         # Utilisateur PostgreSQL
DB_PASSWORD=survivor_password # Mot de passe PostgreSQL

# URL de connexion complète
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}

# Configuration application
NODE_ENV=development          # Environnement Node.js
NEXT_PUBLIC_APP_URL=http://localhost:3000  # URL publique de l'app

# APIs externes
EXTERNAL_API_BASE_URL=https://api.jeb-incubator.com/
EXTERNAL_API_KEY=your_api_key_here

# Configuration synchronisation
SYNC_DEBUG=0                  # Debug sync (0/1)
SYNC_INTERVAL_MS=3600000     # Intervalle en millisecondes
SYNC_AUTO=0                   # Sync automatique (0/1)
```

### Configurations Docker Compose

#### docker-compose.yml (Développement)
- **Port Web**: 3000
- **Port DB**: 5432
- **Hot Reload**: Activé
- **Volumes**: Code source monté
- **Base de données**: Persistance via volume

#### docker-compose.prod.yml (Production)
- **Port Web**: 8080
- **Optimisations**: Build multi-stage
- **Sécurité**: Variables d'environnement sécurisées
- **Performance**: Cache optimisé

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

````
