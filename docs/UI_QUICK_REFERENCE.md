# Quick Reference - Design System

> Référence rapide pour l'utilisation quotidienne du design system

## 🚀 Usage Rapide

### Couleurs principales

```tsx
// Fond et texte principal
<div className="bg-background text-foreground">

// Cartes
<div className="bg-card text-card-foreground border border-border">

// Bouton principal
<button className="bg-primary text-primary-foreground">

// Texte secondaire
<p className="text-muted-foreground">

// État d'erreur
<div className="bg-destructive/10 text-destructive border border-destructive/20">
```

### Animations

```tsx
<div className="animate-fade-in-up">      <!-- Apparition du bas -->
<div className="animate-fade-down">       <!-- Apparition du haut -->
<div className="animate-card">            <!-- Scale + fade -->
```

## ⚡ Modifier une Couleur

**1 seul fichier à modifier :**

```css
/* src/app/globals.css */
:root {
  --primary: oklch(0.646 0.222 280.116);  /* Mode clair */
}

.dark {
  --primary: oklch(0.985 0 0);            /* Mode sombre */
}
```

**Résultat :** Toutes les classes `bg-primary`, `text-primary`, etc. sont automatiquement mises à jour !

## 🎨 Variables → Classes

| Variable | Classes Générées |
|----------|------------------|
| `--primary` | `bg-primary`, `text-primary`, `border-primary` |
| `--background` | `bg-background`, `text-background` |
| `--foreground` | `bg-foreground`, `text-foreground` |
| `--card` | `bg-card`, `text-card` |
| `--border` | `border-border` |
| `--destructive` | `bg-destructive`, `text-destructive` |

## 🌙 Thème Sombre

Automatique avec classe `dark` sur `<html>` !

## 🧪 Outils de Test

### Vérifier l'usage d'une couleur

```bash
# Chercher où une couleur est utilisée
grep -r "bg-primary" src/
grep -r "text-destructive" src/
```

### Commandes utiles

```bash
# Redémarrer le dev server
npm run dev

# Vérifier les erreurs CSS
npm run build
```

## 📦 Patterns Courants

### Boutons

```tsx
// Principal
<button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg">

// Secondaire
<button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-4 py-2 rounded-lg">

// Outline
<button className="border border-border text-foreground hover:bg-muted px-4 py-2 rounded-lg">
```

### Cartes

```tsx
// Carte simple
<div className="bg-card text-card-foreground border border-border rounded-lg p-4">

// Carte avec hover
<div className="bg-card text-card-foreground border border-border rounded-lg p-4 hover:shadow-md transition-shadow">

// Carte avec backdrop
<div className="bg-card/80 backdrop-blur-md border border-border/20 rounded-lg p-4">
```

### États

```tsx
// Message d'erreur
<div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-3">

// Section discrète
<div className="bg-muted/50 text-muted-foreground rounded-lg p-3">
```

---

**Règle d'or :** Utilise les classes Tailwind générées, évite les couleurs hardcodées !

Pour le guide complet : `docs/UI_DESIGN_SYSTEM.md`

Dernière mise à jour : 4 septembre 2025
