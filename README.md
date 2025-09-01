
# README

Ce projet utilise Next.js pour le routage et l'affichage côté client, ainsi qu'une architecture en oignon (onion architecture) pour organiser la logique métier et les services.

## Structure des dossiers

- **public/** : Contient les fichiers statiques accessibles publiquement (images, icônes, etc.).
- **src/app/** : Dossier principal pour le routage Next.js côté front. Chaque sous-dossier représente une route ou une page (ex : `/about`, `/admin`, `/profile/[id]`, etc.).
	- **api/** : Contient les routes API Next.js (backend léger, ex : `info.ts`).
- **src/application/services/** : Contient la logique métier et les services (ex : gestion des utilisateurs).
- **src/domain/** : Définit les entités et interfaces du domaine (ex : `User.ts`, `IUserRepository.ts`).
- **src/infrastructure/** : Implémente les repositories et l'accès aux données (ex : `UserRepository.ts`).
- **src/persistence/** : Gère la persistance et les contextes de base de données (ex : `dbContext.ts`).
- **src/ui/** : Contient tous les composants d'interface utilisateur, la mise en page et les éléments partagés.
	- **components/** : Composants réutilisables.
	- **layout/** : Composants de layout.
	- **shared/** : Composants ou utilitaires partagés.

## Principes d'architecture

- **Routing Next.js** : Les pages et API sont organisées selon la convention Next.js pour un routage automatique.
- **Architecture oignon** : Séparation claire entre le domaine, l'application, l'infrastructure et la présentation pour une meilleure maintenabilité et évolutivité.
- **UI centralisée** : Tous les composants visuels sont regroupés dans `src/ui/` pour faciliter la réutilisation et la cohérence de l'interface.

## Démarrage

1. Installer les dépendances : `npm install`
2. Lancer le serveur de développement : `npm run dev`

---

Pour toute question sur la structure ou l'architecture, consultez ce README ou la documentation Next.js.
