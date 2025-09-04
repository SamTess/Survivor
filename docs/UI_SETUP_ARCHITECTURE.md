# Design System - Setup & Architecture

> Architecture technique et configuration du design system

## 🏗️ Architecture Technique

### Structure des fichiers

```text
src/
├── app/
│   └── globals.css          ← Variables CSS + @theme inline
├── components/
│   └── ui/
│       └── button.tsx        ← Composant exemple
└── tailwind.config.ts       ← Configuration Tailwind
```

### Flow de génération CSS

```text
Variables CSS (:root + .dark)
    ↓
@theme inline (exposition à Tailwind)
    ↓
Classes Tailwind générées automatiquement
    ↓
Utilisation dans composants
```

## ⚙️ Configuration Tailwind

### tailwind.config.ts

```typescript
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        sm: "0.25rem",
        md: "0.375rem", 
        lg: "0.5rem",
        xl: "0.75rem",
      },
    },
  },
  plugins: [],
}

export default config;
```

### globals.css structure

```css
@import "tailwindcss";

/* 1. Variables CSS brutes */
:root {
  --primary: oklch(0.646 0.222 280.116);
  --background: oklch(1 0 0);
  /* ... autres variables */
}

.dark {
  --primary: oklch(0.985 0 0);
  --background: oklch(0.145 0 0);
  /* ... versions sombres */
}

/* 2. Exposition à Tailwind */
@theme inline {
  --color-primary: var(--primary);
  --color-background: var(--background);
  /* ... mappings */
}

/* 3. Styles de base */
@layer base {
  * {
    @apply border-border outline-ring/50;
  }
}

/* 4. Animations custom */
@keyframes fade-in-up { /* ... */ }
.animate-fade-in-up { /* ... */ }
```

## 🎨 Variables CSS Complètes

### Variables de couleur (:root)

```css
:root {
  /* Couleurs principales */
  --background: oklch(1 0 0);
  --foreground: oklch(0.205 0 0);
  --card: oklch(0.985 0 0);
  --card-foreground: oklch(0.205 0 0);
  --primary: oklch(0.646 0.222 280.116);
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(0.556 0 0);
  --secondary-foreground: oklch(1 0 0);
  --muted: oklch(0.985 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.646 0.222 280.116);
  --accent-foreground: oklch(1 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(1 0 0);
  
  /* Couleurs système */
  --border: oklch(0.922 0 0);
  --input: oklch(0.985 0 0);
  --ring: oklch(0.646 0.222 280.116 / 0.5);
  
  /* Dimensions */
  --radius: 0.5rem;
}
```

### Variables mode sombre (.dark)

```css
.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.145 0 0);
  --card-foreground: oklch(0.985 0 0);
  --primary: oklch(0.985 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.396 0.141 25.723);
  --destructive-foreground: oklch(0.637 0.237 25.331);
  --border: oklch(0.269 0 0);
  --input: oklch(0.269 0 0);
  --ring: oklch(0.439 0 0);
}
```

## 🎬 Animations Disponibles

### Keyframes définies

```css
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fade-down {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes card-in {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes draw-line {
  from { stroke-dasharray: 500; stroke-dashoffset: 500; }
  to { stroke-dasharray: 500; stroke-dashoffset: 0; }
}

@keyframes bar-raise {
  from { transform: scaleY(0); }
  to { transform: scaleY(1); }
}
```

### Classes d'animation

```css
.animate-fade-in-up { animation: fade-in-up .5s ease-out both; }
.animate-fade-down { animation: fade-down .4s ease-out both; }
.animate-card { animation: card-in .35s ease-out both; }
.animate-draw { 
  stroke-dasharray: 500; 
  stroke-dashoffset: 500; 
  animation: draw-line 1s ease-out forwards; 
}
.animate-bar { 
  transform-origin: bottom; 
  animation: bar-raise 1s ease-out both; 
}
```

## 🔧 Utilitaires CSS

### Scrollbar masquée

```css
.scrollbar-none {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
.scrollbar-none::-webkit-scrollbar {
  display: none; /* Chrome, Safari */
}
```

### Styles globaux

```css
html {
  height: 100%;
  overflow-x: hidden;
  overscroll-behavior: none;
}

body {
  height: 100%;
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
  overflow-x: hidden;
  overscroll-behavior-y: none;
}
```

## 🔍 Debug et Outils

### Vérifications utiles

```bash
# Vérifier que les variables CSS sont bien définies
grep -n "primary" src/app/globals.css

# Vérifier l'usage des classes dans le code
grep -r "bg-primary" src/

# Vérifier la compilation Tailwind
npm run build
```

### Inspecteur navigateur

1. **Elements** → Rechercher la classe (ex: `bg-primary`)
2. **Computed** → Vérifier la valeur finale CSS
3. **Sources** → Vérifier que la variable CSS existe

## 🚀 Ajout de Nouvelles Couleurs

### Process complet

1. **Ajouter variable dans `:root` et `.dark`**

   ```css
   :root {
     --success: oklch(0.74 0.14 154);
     --success-foreground: oklch(0.205 0 0);
   }
   
   .dark {
     --success: oklch(0.62 0.15 154);
     --success-foreground: oklch(0.985 0 0);
   }
   ```

2. **Exposer dans `@theme inline`**

   ```css
   @theme inline {
     --color-success: var(--success);
     --color-success-foreground: var(--success-foreground);
   }
   ```

3. **Utiliser dans composants**

   ```tsx
   <div className="bg-success text-success-foreground">
     Message de succès
   </div>
   ```

---

Cette documentation technique couvre tous les aspects de configuration et d'architecture du design system.

Dernière mise à jour : 4 septembre 2025
