# CRUD Operations Implementation - Architecture Oignon

Ce document décrit l'implémentation complète des opérations CRUD pour toutes les entités du domaine, en respectant strictement l'architecture oignon.

## Architecture

L'implémentation suit les principes de l'architecture oignon avec une séparation claire des responsabilités :

### 1. Domain Layer (`src/domain/`)

#### Entités
- `entities/User.ts` - Entité utilisateur simple
- `entities/Startup.ts` - Entité startup
- `entities/News.ts` - Entité news avec relation startup

#### Interfaces métier
- `interfaces/User.ts` - Interface utilisateur complète avec rôles
- `interfaces/Event.ts` - Interface événement
- `interfaces/Founder.ts` - Interface fondateur
- `interfaces/Investor.ts` - Interface investisseur
- `interfaces/Partner.ts` - Interface partenaire
- `interfaces/News.ts` - Interface news avec détails

#### Interfaces Repository
- `repositories/UserRepository.ts` - Contrat pour les opérations utilisateur
- `repositories/StartupRepository.ts` - Contrat pour les opérations startup
- `repositories/NewsRepository.ts` - Contrat pour les opérations news
- `repositories/EventRepository.ts` - Contrat pour les opérations événement
- `repositories/FounderRepository.ts` - Contrat pour les opérations fondateur
- `repositories/InvestorRepository.ts` - Contrat pour les opérations investisseur
- `repositories/PartnerRepository.ts` - Contrat pour les opérations partenaire

### 2. Application Layer (`src/application/services/`)

#### Services métier
- `users/UserService.ts` - Logique métier utilisateur
- `startups/StartupService.ts` - Logique métier startup
- `news/NewsService.ts` - Logique métier news
- `events/EventService.ts` - Logique métier événement
- `founders/FounderService.ts` - Logique métier fondateur
- `investors/InvestorService.ts` - Logique métier investisseur
- `partners/PartnerService.ts` - Logique métier partenaire

### 3. Infrastructure Layer (`src/infrastructure/persistence/prisma/`)

#### Implémentations Repository
- `UserRepositoryPrisma.ts` - Implémentation Prisma pour les utilisateurs
- `StartupRepositoryPrisma.ts` - Implémentation Prisma pour les startups
- `NewsRepositoryPrisma.ts` - Implémentation Prisma pour les news
- `EventRepositoryPrisma.ts` - Implémentation Prisma pour les événements
- `FounderRepositoryPrisma.ts` - Implémentation Prisma pour les fondateurs
- `InvestorRepositoryPrisma.ts` - Implémentation Prisma pour les investisseurs
- `PartnerRepositoryPrisma.ts` - Implémentation Prisma pour les partenaires

### 4. Presentation Layer (`src/app/api/`)

#### Routes API REST complètes
- `users/` - CRUD utilisateurs
- `startups/` - CRUD startups
- `news/` - CRUD news
- `events/` - CRUD événements
- `founders/` - CRUD fondateurs
- `investors/` - CRUD investisseurs
- `partners/` - CRUD partenaires

## Opérations CRUD Disponibles

### Utilisateurs (`/api/users`)
- `GET /api/users` - Liste tous les utilisateurs (avec filtres et pagination)
- `POST /api/users` - Crée un nouvel utilisateur
- `GET /api/users/{id}` - Récupère un utilisateur par ID
- `PUT /api/users/{id}` - Met à jour un utilisateur
- `DELETE /api/users/{id}` - Supprime un utilisateur

**Filtres disponibles :**
- `?role=founder` - Filtre par rôle
- `?search=query` - Recherche textuelle
- `?founders=true` - Uniquement les fondateurs
- `?investors=true` - Uniquement les investisseurs
- `?page=1&limit=10` - Pagination

### Startups (`/api/startups`)
- `GET /api/startups` - Liste toutes les startups
- `POST /api/startups` - Crée une nouvelle startup
- `GET /api/startups/{id}` - Récupère une startup par ID
- `PUT /api/startups/{id}` - Met à jour une startup
- `DELETE /api/startups/{id}` - Supprime une startup

**Filtres disponibles :**
- `?sector=tech` - Filtre par secteur
- `?maturity=seed` - Filtre par maturité
- `?search=query` - Recherche textuelle
- `?page=1&limit=10` - Pagination

### News (`/api/news`)
- `GET /api/news` - Liste toutes les news
- `POST /api/news` - Crée une nouvelle news
- `GET /api/news/{id}` - Récupère une news par ID
- `PUT /api/news/{id}` - Met à jour une news
- `DELETE /api/news/{id}` - Supprime une news

**Filtres disponibles :**
- `?startupId=1` - Filtre par startup
- `?category=announcement` - Filtre par catégorie
- `?startDate=2024-01-01&endDate=2024-12-31` - Filtre par période
- `?search=query` - Recherche textuelle
- `?page=1&limit=10` - Pagination

### Événements (`/api/events`)
- `GET /api/events` - Liste tous les événements
- `POST /api/events` - Crée un nouvel événement
- `GET /api/events/{id}` - Récupère un événement par ID
- `PUT /api/events/{id}` - Met à jour un événement
- `DELETE /api/events/{id}` - Supprime un événement

**Filtres disponibles :**
- `?eventType=conference` - Filtre par type d'événement
- `?targetAudience=investors` - Filtre par audience cible
- `?location=Paris` - Filtre par lieu
- `?upcoming=true` - Événements à venir uniquement
- `?startDate=2024-01-01&endDate=2024-12-31` - Filtre par période
- `?search=query` - Recherche textuelle
- `?page=1&limit=10` - Pagination

### Fondateurs (`/api/founders`)
- `GET /api/founders` - Liste tous les fondateurs
- `POST /api/founders` - Crée un nouveau fondateur
- `GET /api/founders/{id}` - Récupère un fondateur par ID
- `PUT /api/founders/{id}` - Met à jour un fondateur
- `DELETE /api/founders/{id}` - Supprime un fondateur

**Filtres disponibles :**
- `?startupId=1` - Filtre par startup
- `?userId=1` - Filtre par utilisateur

### Investisseurs (`/api/investors`)
- `GET /api/investors` - Liste tous les investisseurs
- `POST /api/investors` - Crée un nouvel investisseur
- `GET /api/investors/{id}` - Récupère un investisseur par ID
- `PUT /api/investors/{id}` - Met à jour un investisseur
- `DELETE /api/investors/{id}` - Supprime un investisseur

**Filtres disponibles :**
- `?investorType=vc` - Filtre par type d'investisseur
- `?investmentFocus=tech` - Filtre par focus d'investissement
- `?search=query` - Recherche textuelle
- `?page=1&limit=10` - Pagination

### Partenaires (`/api/partners`)
- `GET /api/partners` - Liste tous les partenaires
- `POST /api/partners` - Crée un nouveau partenaire
- `GET /api/partners/{id}` - Récupère un partenaire par ID
- `PUT /api/partners/{id}` - Met à jour un partenaire
- `DELETE /api/partners/{id}` - Supprime un partenaire

**Filtres disponibles :**
- `?partnershipType=strategic` - Filtre par type de partenariat
- `?search=query` - Recherche textuelle
- `?page=1&limit=10` - Pagination

## Format des Réponses API

Toutes les API retournent un format de réponse standardisé :

### Succès
```json
{
  "success": true,
  "data": {...},
  "message": "Optional success message",
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Erreur
```json
{
  "success": false,
  "error": "Error message"
}
```

## Validation et Gestion d'Erreurs

- Validation des données d'entrée dans les services
- Gestion des erreurs avec des messages appropriés
- Validation des formats d'email
- Validation des IDs numériques
- Contrôle de l'unicité des emails
- Validation des dates
- Contrôle des limites de pagination

## Exemples d'Utilisation

### Créer une startup
```bash
curl -X POST http://localhost:3000/api/startups \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TechCorp",
    "email": "contact@techcorp.com",
    "legal_status": "SAS",
    "address": "123 Tech Street, Paris",
    "phone": "+33123456789",
    "sector": "Technology",
    "maturity": "Seed",
    "description": "An innovative tech startup"
  }'
```

### Rechercher des startups
```bash
curl "http://localhost:3000/api/startups?search=tech&sector=Technology&page=1&limit=5"
```

### Mettre à jour une startup
```bash
curl -X PUT http://localhost:3000/api/startups/1 \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated description"
  }'
```

## Respect de l'Architecture Oignon

1. **Inversion de Dépendance** : Les services dépendent des interfaces de repository, pas des implémentations
2. **Séparation des Responsabilités** : Chaque couche a sa responsabilité claire
3. **Abstraction** : Les détails techniques (Prisma) sont isolés dans la couche infrastructure
4. **Testabilité** : Chaque service peut être testé unitairement en mockant les repositories
5. **Flexibilité** : Possibilité de changer d'ORM ou de base de données sans impacter les couches supérieures

Cette implémentation respecte strictement l'architecture oignon et fournit une base solide pour les opérations CRUD de toutes les entités du domaine.
