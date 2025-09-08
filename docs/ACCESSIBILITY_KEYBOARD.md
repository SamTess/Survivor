# Accessibilité Clavier - Documentation

Ce document décrit les raccourcis clavier d'accessibilité implémentés dans l'application Survivor.

## Raccourcis Clavier Disponibles

### Navigation Générale

- **TAB** : Avancer le focus vers l'élément suivant
- **Shift + TAB** : Reculer le focus vers l'élément précédent

### Actions

- **Entrée** : Actionner un lien, un bouton ou soumettre un formulaire
- **Espace** : (Dé)cocher une case à cocher ou actionner un bouton

### Navigation dans les Contenus

- **Flèches (← ↑ → ↓)** :
  - Dans les groupes de boutons radio : changer de sélection
  - Dans les zones défilables : faire défiler le contenu
  - Dans les menus : naviguer entre les éléments

### Actions Spéciales

- **Échap** : Fermer une modale, un menu ou annuler une action
- **Ctrl + Entrée** : Soumettre un formulaire depuis n'importe quel champ

## Intégration dans les Modales

### UniversalModal (Déjà Configuré)

Votre `UniversalModal` utilise déjà les hooks d'accessibilité de base :

```tsx
// Dans UniversalModal.tsx - déjà présent
import { useModalKeyboard, useFocusRestoration } from '@/hooks/useAccessibility'

const keyboardRef = useModalKeyboard(isOpen, onClose, {
  closeOnEscape: closeOnOverlayClick,
  trapFocus: true
})
```

### Ajouter les Raccourcis Avancés

Pour bénéficier de tous les raccourcis clavier dans vos modales, ajoutez le hook global :

```tsx
// Dans UniversalModal.tsx - à ajouter
import { useGlobalKeyboardAccessibility } from '@/hooks/useAccessibility'

// Dans le composant UniversalModal
useGlobalKeyboardAccessibility() // Active tous les raccourcis avancés
```

### Exemple d'Utilisation dans une Modale Personnalisée

```tsx
import { useGlobalKeyboardAccessibility, useFormAccessibility } from '@/hooks/useAccessibility'

function MyCustomModal({ isOpen, onClose }) {
  // Active tous les raccourcis clavier
  useGlobalKeyboardAccessibility()

  // Pour les formulaires dans la modale
  const formRef = useFormAccessibility()

  return (
    <div role="dialog" aria-modal="true">
      {/* Contenu de la modale */}
      <form ref={formRef}>
        {/* Vos champs de formulaire */}
        <input type="text" placeholder="Ctrl+Entrée pour soumettre" />
      </form>

      {/* Zone défilable */}
      <div
        tabIndex={0}
        role="region"
        aria-label="Contenu défilable"
        className="max-h-60 overflow-auto"
      >
        Contenu qui peut défiler avec les flèches
      </div>

      {/* Boutons radio avec navigation par flèches */}
      <fieldset>
        <legend>Options (← → pour naviguer)</legend>
        <label><input type="radio" name="option" value="1" /> Option 1</label>
        <label><input type="radio" name="option" value="2" /> Option 2</label>
      </fieldset>

      {/* Case à cocher avec Espace */}
      <label>
        <input type="checkbox" />
        Accepter (Espace pour cocher/décocher)
      </label>
    </div>
  )
}
```

### Problèmes Courants et Solutions

#### 1. **Sélection dans les listes déroulantes avec Espace**

```tsx
// Problème : L'espace n'ouvre pas la liste déroulante
// Solution : Utiliser useGlobalKeyboardAccessibility()

import { useGlobalKeyboardAccessibility } from '@/hooks/useAccessibility'

function MyForm() {
  useGlobalKeyboardAccessibility()

  return (
    <select>
      <option>Option 1</option>
      <option>Option 2</option>
    </select>
  )
}
```

#### 2. **Focus qui retourne sur la croix après Entrée**

```tsx
// Problème : Après Entrée, le focus va sur la croix
// Solution : Le hook gère automatiquement la restauration du focus

function MyModal() {
  useGlobalKeyboardAccessibility() // Résout automatiquement le problème

  return (
    <FormModal>
      <input type="text" />
      <button type="submit">Valider</button>
    </FormModal>
  )
}
```

#### 3. **Navigation dans les selects avec les flèches**

```tsx
// Les flèches ↑ ↓ fonctionnent nativement dans les <select>
// Pas besoin d'implémentation supplémentaire
<select>
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

### Hook Spécialisé pour les Modales

```tsx
import { useModalFormAccessibility } from '@/hooks/useAccessibility'

function MyModalForm() {
  const { handleFocus, handleKeyDown } = useModalFormAccessibility()

  return (
    <div onFocus={handleFocus} onKeyDown={handleKeyDown}>
      <select onKeyDown={handleKeyDown}>
        <option>Option 1</option>
        <option>Option 2</option>
      </select>
      <button onKeyDown={handleKeyDown}>Action</button>
    </div>
  )
}
```

## Exemple Complet

Voir le fichier `src/components/examples/AccessibilityExample.tsx` pour un exemple complet d'utilisation de tous les hooks.

## Attributs ARIA Recommandés

Pour une accessibilité optimale, utilisez ces attributs ARIA :

```tsx
// Pour les zones défilables
<div
  tabIndex={0}
  role="region"
  aria-label="Zone défilable - utilisez les flèches pour défiler"
>
  Contenu défilable
</div>

// Pour les groupes de boutons radio
<fieldset>
  <legend>Choisissez une option</legend>
  <label>
    <input type="radio" name="option" value="1" />
    Option 1
  </label>
  <label>
    <input type="radio" name="option" value="2" />
    Option 2
  </label>
</fieldset>

// Pour les cases à cocher
<label>
  <input type="checkbox" />
  Accepter les conditions
</label>
```

## Bonnes Pratiques

1. **Ordre logique** : Assurez-vous que l'ordre des éléments dans le DOM correspond à l'ordre de navigation au clavier
2. **Focus visible** : Ne masquez jamais l'indicateur de focus par défaut
3. **Rôles ARIA** : Utilisez les rôles ARIA appropriés pour les composants personnalisés
4. **Labels** : Tous les éléments interactifs doivent avoir des labels descriptifs
5. **États** : Indiquez clairement les états des éléments (coché, désactivé, etc.)

## Tests d'Accessibilité

Pour tester l'accessibilité au clavier :

1. Naviguez uniquement avec la touche TAB
2. Utilisez les raccourcis documentés ci-dessus
3. Vérifiez que tous les éléments interactifs sont accessibles
4. Testez avec un lecteur d'écran (NVDA, JAWS, VoiceOver)

## Conformité

Ces implémentations respectent les guidelines d'accessibilité WCAG 2.1, notamment :

- **1.1.1 Contenu non textuel** : Alternatives textuelles appropriées
- **2.1.1 Clavier** : Toutes les fonctionnalités accessibles au clavier
- **2.1.2 Pas de piège au clavier** : Possibilité de quitter tout élément
- **2.4.3 Ordre de focus** : Ordre de focus logique et intuitif
- **2.4.6 En-têtes et étiquettes** : En-têtes et étiquettes descriptives
