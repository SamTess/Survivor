# Design System - Complete Guide

> Complete documentation of the Survivor design system for the development team

## 🎯 Overview

Our design system uses **Tailwind CSS v4** with CSS variables for centralized color management and automatic dark theme.

### Architecture

```text
src/
├── app/globals.css        ← Single source of colors
└── tailwind.config.ts     ← Radius configuration
```

## 🎨 Color System

### How it works

1. **Raw CSS variables**

   ```css
   /* src/app/globals.css */
   :root {
     --primary: oklch(0.646 0.222 280.116);     /* Raw color */
   }

   .dark {
     --primary: oklch(0.985 0 0);               /* Dark version */
   }
   ```

2. **Exposure to Tailwind**

   ```css
   /* src/app/globals.css */
   @theme inline {
     --color-primary: var(--primary);          /* Tailwind reads this line */
   }
   ```

3. **Automatically generated classes**

   Tailwind automatically generates:
   - `bg-primary` → `background-color: var(--color-primary)`
   - `text-primary` → `color: var(--color-primary)`
   - `border-primary` → `border-color: var(--color-primary)`

### Available colors

| Variable CSS | Classes Générées | Usage |
|-------------|------------------|-------|
| `--background` | `bg-background` | Fond principal |
| `--foreground` | `text-foreground` | Texte principal |
| `--primary` | `bg-primary`, `text-primary` | Actions principales, CTA |
| `--secondary` | `bg-secondary`, `text-secondary` | Actions secondaires |
| `--card` | `bg-card` | Arrière-plan des cartes |
| `--card-foreground` | `text-card-foreground` | Texte sur cartes |
| `--muted` | `bg-muted` | Discrete elements |
| `--muted-foreground` | `text-muted-foreground` | Secondary text |
| `--accent` | `bg-accent` | Accent elements |
| `--destructive` | `bg-destructive` | Destructive actions, errors |
| `--border` | `border-border` | Default borders |
| `--input` | `bg-input` | Input backgrounds |
| `--ring` | `ring-ring` | Focus indicator |

## 💻 Code Usage

### ✅ Correct usage

```tsx
// Primary button
<button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg">
  Primary Action
</button>

// Card
<div className="bg-card text-card-foreground border border-border rounded-lg p-4">
  <h3 className="text-foreground">Title</h3>
  <p className="text-muted-foreground">Description</p>
</div>

// Destructive state
<div className="bg-destructive/10 text-destructive border border-destructive/20 p-3">
  Error message
</div>
```

### ❌ To avoid

```tsx
// Couleurs hardcodées
<div className="bg-blue-500 text-white">

// Couleurs en inline style  
<div style={{backgroundColor: '#646cff'}}>

// Variables CSS directes (sauf cas très spécifiques)
<div style={{backgroundColor: 'var(--primary)'}}>
```

## 🌙 Dark Theme

### Activation

Dark theme is automatically activated with the `dark` class on `<html>` or `<body>`.

```tsx
// In layout.tsx or a parent component
<html className={isDark ? 'dark' : ''}>
```

### How it works

1. **Light mode** → `:root` variables
2. **Dark mode** → `.dark` variables (automatically replace)
3. **No additional code** in components!

## 🔧 Modifying a Color

### Simple workflow

1. **Modify `src/app/globals.css` ONLY**

   ```css
   :root {
     --primary: oklch(0.700 0.200 250);  /* New light color */
   }

   .dark {
     --primary: oklch(0.800 0.150 250);  /* New dark color */
   }
   ```

2. **That's it!**
   - All `bg-primary`, `text-primary` etc. classes are automatically updated
   - Dark theme works automatically
   - No other files to modify

## 🎯 Common Use Cases

### Buttons

```tsx
// Primary button
<button className="bg-primary text-primary-foreground hover:bg-primary/90">

// Secondary button  
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

### States and Feedback

```tsx
// Error
<div className="bg-destructive/10 text-destructive border border-destructive/20">

// Success (to define if needed)
<div className="bg-green-50 text-green-800 border border-green-200">

// Warning (to define if needed)
<div className="bg-yellow-50 text-yellow-800 border border-yellow-200">
```

## 🎨 Available Animations

### Animation classes

```tsx
// Fade in from bottom
<div className="animate-fade-in-up">

// Fade in from top
<div className="animate-fade-down">

// Fade in with scale
<div className="animate-card">

// For SVG graphics
<path className="animate-draw">

// For chart bars
<div className="animate-bar">
```

## 🔧 CSS Utilities

### Hide Scrollbar

```tsx
<div className="scrollbar-none overflow-auto">
  Content with invisible scroll
</div>
```

## 🚨 Troubleshooting

### Color not displaying?

1. **Check** that the variable exists in `:root` and `.dark`
2. **Vérifier** que la variable est exposée dans `@theme inline`
3. **Redémarrer** le serveur de dev (`npm run dev`)

### Classes qui ne fonctionnent pas ?

1. **Vérifier** que le nom correspond exactement à `@theme inline`
2. **Utiliser** l'inspecteur du navigateur pour voir si la classe est générée

### Thème sombre ne fonctionne pas ?

1. **Check** that the `dark` class is properly applied on `<html>`
2. **Check** that variables are defined in `.dark {}`

## 📝 Checklist for New Components

- [ ] Use `bg-background` and `text-foreground` as base
- [ ] Use `bg-card` and `text-card-foreground` for cards
- [ ] Use `border-border` for borders
- [ ] Test in light AND dark mode
- [ ] Avoid hardcoded colors
- [ ] Use appropriate animations (`animate-*`)

## 🔗 Useful Links

- [OKLCH Color Picker](https://oklch.com/) - To create new colors
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) - Check accessibility

---

**Core principle**: One color = one CSS variable = multiple automatically generated Tailwind classes!

Last updated: September 4, 2025
