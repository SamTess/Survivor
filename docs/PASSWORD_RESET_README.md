# Système de Reset de Mot de Passe Automatique

## Vue d'ensemble

Cette fonctionnalité permet d'envoyer automatiquement un email de création/reset de mot de passe lorsqu'un utilisateur tente de se connecter avec un compte qui n'a pas de mot de passe défini en base de données.

## Fonctionnement

### 1. Détection lors du login

Quand un utilisateur tente de se connecter (`/api/auth/login`), le système vérifie si :
- L'utilisateur existe en base de données
- Le champ `password_hash` est vide ou null

Si ces conditions sont remplies, le système :
1. Génère un token de reset sécurisé (32 bytes, hex)
2. Sauvegarde le token en base avec une expiration de 72h
3. Envoie un email avec le lien de création de mot de passe
4. Retourne une réponse d'erreur avec `requiresPasswordReset: true`

### 2. Gestion des tokens

Les tokens de reset sont stockés dans la table `S_PASSWORD_RESET` avec :
- `token` : Token unique généré aléatoirement
- `user_id` : ID de l'utilisateur
- `expires_at` : Date d'expiration (72h après création)
- `used` : Booléen indiquant si le token a été utilisé

### 3. Email de notification

L'email envoyé contient :
- Un lien vers `/auth/reset-password?token=<TOKEN>`
- Instructions claires pour l'utilisateur
- Avertissement sur l'expiration du lien (72h)
- Design responsive et professionnel

### 4. Page de création de mot de passe

La page `/auth/reset-password` :
- Valide le token côté serveur
- Permet à l'utilisateur de créer un nouveau mot de passe
- Applique les règles de sécurité (minimum 8 caractères)
- Redirige vers la page de login après succès

## Configuration

### Variables d'environnement requises

```env
# Configuration Email
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-password
EMAIL_FROM=noreply@jeb-incubator.com
EMAIL_REJECT_UNAUTHORIZED=true

# URL de l'application (pour les liens dans les emails)
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Configuration SMTP recommandée

Pour Gmail :
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password
EMAIL_REJECT_UNAUTHORIZED=true
```

Pour SendGrid :
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
EMAIL_REJECT_UNAUTHORIZED=true
```

### Configuration de sécurité TLS

La variable `EMAIL_REJECT_UNAUTHORIZED` contrôle la validation des certificats TLS lors de la connexion SMTP :

- `EMAIL_REJECT_UNAUTHORIZED=true` (recommandé) : Valide les certificats TLS pour assurer la sécurité des connexions
- `EMAIL_REJECT_UNAUTHORIZED=false` : Désactive la validation TLS (à utiliser uniquement en développement avec des certificats auto-signés)

**⚠️ Attention** : Ne jamais utiliser `EMAIL_REJECT_UNAUTHORIZED=false` en production, car cela rend les connexions vulnérables aux attaques man-in-the-middle.

## API Endpoints

### POST /api/auth/login
Gère l'authentification et déclenche l'envoi d'email si nécessaire.

**Réponse en cas de mot de passe manquant :**
```json
{
  "error": "Aucun mot de passe défini. Un email de création de mot de passe a été envoyé.",
  "requiresPasswordReset": true
}
```

### GET /api/auth/reset-password?token=<TOKEN>
Valide un token de reset.

**Réponse :**
```json
{
  "valid": true
}
```

### POST /api/auth/reset-password
Traite la création/modification du mot de passe.

**Payload :**
```json
{
  "token": "token-de-reset",
  "password": "nouveau-mot-de-passe"
}
```

## Scripts utilitaires

### Nettoyage des tokens expirés
```bash
npm run cleanup-tokens
```

### Test d'envoi d'email
```bash
npm run test-email -- --email=test@example.com --userId=1
```

## Sécurité

### Mesures de sécurité implémentées

1. **Tokens sécurisés** : Génération avec crypto.randomBytes(32)
2. **Expiration** : Tokens valides 72h maximum
3. **Usage unique** : Tokens marqués comme utilisés après emploi
4. **Invalidation** : Anciens tokens invalidés lors de la création d'un nouveau
5. **Validation côté serveur** : Vérification de l'expiration et de l'usage
6. **Rate limiting implicite** : Un seul token actif par utilisateur

### Bonnes pratiques

- Les tokens sont stockés en clair (mais imprévisibles et à usage unique)
- Les emails sont envoyés en HTML + texte pour compatibilité
- Les mots de passe doivent faire minimum 8 caractères
- Redirection automatique après succès

## Gestion des erreurs

### Erreurs possibles

1. **Configuration email manquante** : L'utilisateur voit un message générique
2. **Serveur email indisponible** : Erreur loggée, message d'assistance affiché
3. **Token invalide/expiré** : Page d'erreur avec redirection vers login
4. **Mot de passe trop faible** : Validation côté client et serveur

### Logs

Les erreurs sont loggées dans la console serveur :
- Erreurs de connexion SMTP
- Erreurs d'envoi d'email
- Erreurs de validation de tokens

## Maintenance

### Nettoyage automatique

Il est recommandé de configurer un cron job pour nettoyer les tokens expirés :

```bash
# Tous les jours à 2h du matin
0 2 * * * cd /path/to/app && npm run cleanup-tokens
```

### Monitoring

Surveillez :
- Le taux de succès d'envoi d'emails
- Le nombre de tokens générés vs utilisés
- Les erreurs de configuration SMTP

## Dépannage

### Email non reçu

1. Vérifier la configuration SMTP
2. Vérifier les logs serveur
3. Tester la connexion : `npm run test-email`
4. Vérifier les spams/indésirables

### Token invalide

1. Vérifier que le token n'a pas expiré (72h)
2. Vérifier qu'il n'a pas déjà été utilisé
3. Générer un nouveau token si nécessaire

### Page de reset inaccessible

1. Vérifier que `NEXT_PUBLIC_APP_URL` est correctement configuré
2. Vérifier que la route `/auth/reset-password` est accessible
3. Vérifier les logs de build/déploiement
