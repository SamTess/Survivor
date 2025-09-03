# Configuration de sécurité pour EmailService

## Résumé des modifications

La vulnérabilité de sécurité liée à `rejectUnauthorized: false` a été corrigée en rendant ce paramètre configurable via la variable d'environnement `EMAIL_REJECT_UNAUTHORIZED`.

### Changements apportés

1. **Interface EmailConfig mise à jour** : Ajout de la propriété optionnelle `rejectUnauthorized`
2. **Logique de sécurité améliorée** : La validation TLS est activée par défaut
3. **Configuration via environnement** : Nouvelle variable `EMAIL_REJECT_UNAUTHORIZED`
4. **Documentation mise à jour** : Guide de configuration sécurisée

### Configuration recommandée

**Production (sécurisé) :**
```env
EMAIL_REJECT_UNAUTHORIZED=true  # ou simplement omettre cette ligne
```

**Développement local avec certificats auto-signés :**
```env
EMAIL_REJECT_UNAUTHORIZED=false  # uniquement si nécessaire
```

### Comportement

- **Si non défini ou `true`** : Validation TLS activée (sécurisé)
- **Si `false`** : Validation TLS désactivée (vulnérable, pour dev uniquement)

### Sécurité

⚠️ **Important** : Ne jamais utiliser `EMAIL_REJECT_UNAUTHORIZED=false` en production car cela expose l'application aux attaques man-in-the-middle et à l'interception des communications email.

La nouvelle implémentation suit les meilleures pratiques de sécurité en activant la validation TLS par défaut.
