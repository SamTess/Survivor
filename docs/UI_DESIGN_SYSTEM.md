# Design System - Guide Complet

> Documentation complète du design system Survivor pour l'équipe de développement

## 🎯 Vue d'Ensemble

Notre design system utilise **Tailwind CSS v4** avec des variables CSS pour une gestion centralisée des couleurs et du thème sombre automatique.

### Architecture

```text
src/
├── app/globals.css        ← Source unique des couleurs
└── tailwind.config.ts     ← Configuration radius
```

## 🎨 Système de Couleurs

### Comment ça fonctionne

1. **Variables CSS brutes**

   ```css
   /* src/app/globals.css */
   :root {
     --primary: oklch(0.646 0.222 280.116);     /* Couleur brute */
   }

   .dark {
     --primary: oklch(0.985 0 0);               /* Version sombre */
   }
   ```

2. **Exposition à Tailwind**

   ```css
   /* src/app/globals.css */
   @theme inline {
     --color-primary: var(--primary);          /* Tailwind lit cette ligne */
   }
   ```

3. **Classes générées automatiquement**

   Tailwind génère automatiquement :
   - `bg-primary` → `background-color: var(--color-primary)`
   - `text-primary` → `color: var(--color-primary)`
   - `border-primary` → `border-color: var(--color-primary)`

### Couleurs disponibles

| Variable CSS | Classes Générées | Usage |
|-------------|------------------|-------|
| `--background` | `bg-background` | Fond principal |
| `--foreground` | `text-foreground` | Texte principal |
| `--primary` | `bg-primary`, `text-primary` | Actions principales, CTA |
| `--secondary` | `bg-secondary`, `text-secondary` | Actions secondaires |
| `--card` | `bg-card` | Arrière-plan des cartes |
| `--card-foreground` | `text-card-foreground` | Texte sur cartes |
| `--muted` | `bg-muted` | Éléments discrets |
| `--muted-foreground` | `text-muted-foreground` | Texte secondaire |
| `--accent` | `bg-accent` | Éléments d'accentuation |
| `--destructive` | `bg-destructive` | Actions destructives, erreurs |
| `--border` | `border-border` | Bordures par défaut |
| `--input` | `bg-input` | Fond des champs |
| `--ring` | `ring-ring` | Indicateur de focus |

## 💻 Utilisation dans le Code

### ✅ Utilisation correcte

```tsx
// Bouton principal
<button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg">
  Action Principale
</button>

// Carte
<div className="bg-card text-card-foreground border border-border rounded-lg p-4">
  <h3 className="text-foreground">Titre</h3>
  <p className="text-muted-foreground">Description</p>
</div>

// État destructif
<div className="bg-destructive/10 text-destructive border border-destructive/20 p-3">
  Message d'erreur
</div>
```

### ❌ À éviter

```tsx
// Couleurs hardcodées
<div className="bg-blue-500 text-white">

// Couleurs en inline style  
<div style={{backgroundColor: '#646cff'}}>

// Variables CSS directes (sauf cas très spécifiques)
<div style={{backgroundColor: 'var(--primary)'}}>
```

## 🌙 Thème Sombre

### Activation

Le thème sombre s'active automatiquement avec la classe `dark` sur `<html>` ou `<body>`.

```tsx
// Dans layout.tsx ou un composant parent
<html className={isDark ? 'dark' : ''}>
```

### Fonctionnement

1. **Mode clair** → Variables de `:root`
2. **Mode sombre** → Variables de `.dark` (remplacent automatiquement)
3. **Aucun code supplémentaire** dans les composants !

## 🔧 Modifier une Couleur

### Workflow simple

1. **Modifier `src/app/globals.css` UNIQUEMENT**

   ```css
   :root {
     --primary: oklch(0.700 0.200 250);  /* Nouvelle couleur claire */
   }

   .dark {
     --primary: oklch(0.800 0.150 250);  /* Nouvelle couleur sombre */
   }
   ```

2. **C'est tout !**
   - Toutes les classes `bg-primary`, `text-primary` etc. sont mises à jour automatiquement
   - Le thème sombre fonctionne automatiquement
   - Aucun autre fichier à modifier

## 🎯 Cas d'Usage Fréquents

### Boutons

```tsx
// Bouton principal
<button className="bg-primary text-primary-foreground hover:bg-primary/90">

// Bouton secondaire  
<button className="bg-secondary text-secondary-foreground hover:bg-secondary/90">

// Bouton destructif
<button className="bg-destructive text-destructive-foreground hover:bg-destructive/90">

// Bouton outline
<button className="border border-border text-foreground hover:bg-muted">
```

### Cartes et Conteneurs

```tsx
// Carte standard
<div className="bg-card text-card-foreground border border-border rounded-lg p-6">

// Conteneur avec backdrop
<div className="bg-card/80 backdrop-blur-md border border-border/20">

// Section muted
<div className="bg-muted/50 text-muted-foreground">
```

### États et Feedback

```tsx
// Erreur
<div className="bg-destructive/10 text-destructive border border-destructive/20">

// Success (à définir si besoin)
<div className="bg-green-50 text-green-800 border border-green-200">

// Warning (à définir si besoin)
<div className="bg-yellow-50 text-yellow-800 border border-yellow-200">
```

## 🎨 Animations Disponibles

### Classes d'animation

```tsx
// Apparition depuis le bas
<div className="animate-fade-in-up">

// Apparition depuis le haut
<div className="animate-fade-down">

// Apparition avec scale
<div className="animate-card">

// Pour graphiques SVG
<path className="animate-draw">

// Pour barres de graphique
<div className="animate-bar">
```

## 🔧 Utilitaires CSS

### Masquer la Scrollbar

```tsx
<div className="scrollbar-none overflow-auto">
  Contenu avec scroll invisible
</div>
```

## 🚨 Dépannage

### Couleur qui ne s'affiche pas ?

1. **Vérifier** que la variable existe dans `:root` et `.dark`
2. **Vérifier** que la variable est exposée dans `@theme inline`
3. **Redémarrer** le serveur de dev (`npm run dev`)

### Classes qui ne fonctionnent pas ?

1. **Vérifier** que le nom correspond exactement à `@theme inline`
2. **Utiliser** l'inspecteur du navigateur pour voir si la classe est générée

### Thème sombre ne fonctionne pas ?

1. **Vérifier** que la classe `dark` est bien appliquée sur `<html>`
2. **Vérifier** que les variables sont définies dans `.dark {}`

## 📝 Checklist pour Nouveaux Composants

- [ ] Utiliser `bg-background` et `text-foreground` comme base
- [ ] Utiliser `bg-card` et `text-card-foreground` pour les cartes
- [ ] Utiliser `border-border` pour les bordures
- [ ] Tester en mode clair ET sombre
- [ ] Éviter les couleurs hardcodées
- [ ] Utiliser les animations appropriées (`animate-*`)

## 🔗 Liens Utiles

- [OKLCH Color Picker](https://oklch.com/) - Pour créer de nouvelles couleurs
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) - Vérifier l'accessibilité

---

**Principe fondamental** : Une couleur = une variable CSS = multiples classes Tailwind générées automatiquement !

Dernière mise à jour : 4 septembre 2025
