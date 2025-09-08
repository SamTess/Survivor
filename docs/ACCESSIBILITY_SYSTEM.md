# Système d'Accessibilité Modulaire

Ce document décrit le système d'accessibilité modulaire implémenté pour améliorer la navigation au clavier et l'accessibilité dans l'application Survivor.

## Vue d'ensemble

Le système d'accessibilité modulaire fournit des hooks réutilisables pour gérer :

- Navigation au clavier
- Gestion du focus
- Raccourcis clavier personnalisés
- Annonces pour les lecteurs d'écran
- Navigation dans les listes et menus

## Hooks Disponibles

### `useKeyboardNavigation`

Hook principal pour la navigation au clavier générale.

```typescript
const ref = useKeyboardNavigation(shortcuts, options)
```

**Paramètres :**

- `shortcuts`: Array de `KeyboardShortcut[]`
- `options`: Configuration optionnelle
  - `trapFocus`: boolean - Piège le focus dans le conteneur
  - `containerRef`: RefObject - Référence au conteneur personnalisé
  - `autoFocus`: boolean - Focus automatique sur le premier élément

**Retour :** RefObject à attacher au conteneur

### `useModalKeyboard`

Hook spécialisé pour les modales avec gestion automatique d'Escape et focus trapping.

```typescript
const ref = useModalKeyboard(isOpen, onClose, options)
```

**Paramètres :**

- `isOpen`: boolean - État d'ouverture de la modale
- `onClose`: () => void - Fonction de fermeture
- `options`: Configuration optionnelle
  - `closeOnEscape`: boolean - Fermeture avec Échap (défaut: true)
  - `trapFocus`: boolean - Piège le focus (défaut: true)
  - `additionalShortcuts`: KeyboardShortcut[] - Raccourcis supplémentaires

### `useListNavigation`

Hook pour la navigation dans les listes (menus, dropdowns, etc.).

```typescript
const { focusedIndex, listRef } = useListNavigation(items, onSelect, options)
```

**Paramètres :**

- `items`: T[] - Array des éléments
- `onSelect`: (item: T, index: number) => void - Callback de sélection
- `options`: Configuration optionnelle
  - `loop`: boolean - Navigation circulaire (défaut: true)
  - `autoFocus`: boolean - Focus automatique (défaut: true)
  - `onEscape`: () => void - Callback pour Échap

**Retour :**

- `focusedIndex`: number - Index de l'élément focused
- `listRef`: RefObject - Référence à attacher à la liste

### `useScreenReaderAnnouncement`

Hook pour annoncer des messages aux lecteurs d'écran.

```typescript
const announce = useScreenReaderAnnouncement()
announce("Message à annoncer")
```

### `useFocusRestoration`

Hook pour sauvegarder et restaurer le focus automatiquement (utile pour les modales).

```typescript
const { saveFocus, restoreFocus } = useFocusRestoration()

// Sauvegarder le focus actuel
saveFocus()

// Restaurer le focus plus tard
restoreFocus()
```

**Utilisation dans les modales :**

```typescript
useEffect(() => {
  if (isOpen) {
    saveFocus() // Sauvegarder avant ouverture
  } else {
    restoreFocus() // Restaurer après fermeture
  }
}, [isOpen])
```

## Types

### `KeyboardShortcut`

```typescript
interface KeyboardShortcut {
  key: string              // Touche principale (ex: 'Enter', 'a', 'ArrowUp')
  altKey?: boolean         // Modificateur Alt
  ctrlKey?: boolean        // Modificateur Ctrl
  shiftKey?: boolean       // Modificateur Shift
  action: () => void       // Fonction à exécuter
  description: string      // Description pour l'aide
}
```

## Utilisation dans les Composants

### Exemple avec une Modale

```typescript
import { useModalKeyboard } from '@/hooks/useAccessibility'

function MyModal({ isOpen, onClose }) {
  const modalRef = useModalKeyboard(isOpen, onClose, {
    additionalShortcuts: [
      {
        key: 's',
        altKey: true,
        action: () => console.log('Search'),
        description: 'Open search'
      }
    ]
  })

  return (
    <div ref={modalRef} role="dialog" aria-modal="true">
      {/* Contenu de la modale */}
    </div>
  )
}
```

### Exemple avec une Liste

```typescript
import { useListNavigation } from '@/hooks/useAccessibility'

function MyList({ items, onSelect }) {
  const { focusedIndex, listRef } = useListNavigation(
    items,
    onSelect,
    { loop: true }
  )

  return (
    <ul ref={listRef} role="listbox">
      {items.map((item, index) => (
        <li key={item.id}>
          <button
            role="option"
            aria-selected={focusedIndex === index}
            className={focusedIndex === index ? 'focused' : ''}
          >
            {item.name}
          </button>
        </li>
      ))}
    </ul>
  )
}
```

## Raccourcis Clavier Prédéfinis

Le système fournit des constantes pour les raccourcis courants :

```typescript
import { KEYBOARD_SHORTCUTS } from '@/hooks/useAccessibility'

// Utilisation
const shortcuts = [
  KEYBOARD_SHORTCUTS.NAVIGATION_UP,    // Flèche haut
  KEYBOARD_SHORTCUTS.NAVIGATION_DOWN,  // Flèche bas
  KEYBOARD_SHORTCUTS.SELECT,           // Entrée
  KEYBOARD_SHORTCUTS.CLOSE             // Échap
]
```

## Bonnes Pratiques

### 1. Accessibilité ARIA

Toujours utiliser les attributs ARIA appropriés :

```typescript
// Pour les modales
<div role="dialog" aria-modal="true" aria-labelledby="title-id">

// Pour les listes
<ul role="listbox" aria-label="Choose an option">
  <li role="option" aria-selected={selected}>
```

### 2. Gestion du Focus

- Le système gère automatiquement le focus
- Utiliser `autoFocus` pour contrôler le comportement initial
- Le focus est restauré automatiquement lors de la fermeture

### 3. Annonces pour Lecteurs d'Écran

```typescript
const announce = useScreenReaderAnnouncement()

// Annoncer les changements d'état
announce('Item sélectionné')
announce('Action effectuée avec succès')
```

### 4. Raccourcis Clavier

- Documenter les raccourcis disponibles
- Éviter les conflits avec les raccourcis système
- Utiliser des modificateurs (Alt, Ctrl) pour les actions personnalisées

## Composants Refactorisés

Les composants suivants ont été refactorisés pour utiliser le système modulaire :

- `UniversalModal` - Utilise `useModalKeyboard` et `useFocusRestoration`
- `NewsModal` - Utilise `useModalKeyboard`

## Bonnes Pratiques

### 1. Restauration du Focus

**Toujours restaurer le focus** après la fermeture d'une modale :

```typescript
// ✅ BON
useEffect(() => {
  if (isOpen) {
    saveFocus()
  } else {
    restoreFocus()
  }
}, [isOpen])

// ❌ MAUVAIS - Focus perdu
useEffect(() => {
  if (isOpen) {
    // Pas de sauvegarde
  }
}, [isOpen])
```

**Pourquoi c'est important :**
- Les utilisateurs de clavier évitent de perdre leur position
- Améliore l'expérience utilisateur
- Respecte les standards d'accessibilité WCAG

### 2. Gestion du Focus dans les Modales

- Le focus doit être piégé dans la modale quand elle est ouverte
- Le premier élément focusable doit recevoir le focus automatiquement
- La modale doit avoir un titre et une description accessibles
- Utiliser `aria-modal="true"` pour indiquer une modale

### 3. Annonces pour Lecteurs d'Écran

```typescript
const announce = useScreenReaderAnnouncement()

// Annoncer les changements d'état
announce('Modale ouverte')
announce('Action effectuée avec succès')
```

### 4. Raccourcis Clavier

- Documenter les raccourcis disponibles
- Éviter les conflits avec les raccourcis système
- Utiliser des modificateurs (Alt, Ctrl) pour les actions personnalisées

## Avantages du Système Modulaire

1. **Réutilisabilité** : Hooks réutilisables dans tous les composants
2. **Maintenabilité** : Logique centralisée et cohérente
3. **Extensibilité** : Facile d'ajouter de nouveaux hooks
4. **Testabilité** : Hooks isolés faciles à tester
5. **Performance** : Optimisations intégrées (MutationObserver, etc.)

## Tests

Le système inclut des utilitaires pour tester l'accessibilité :

```typescript
// Tests des raccourcis clavier
// Tests de la navigation au focus
// Tests des annonces pour lecteurs d'écran
```

## Migration depuis l'Implémentation Inline

### Étapes de Migration

1. **Identifier les composants existants** nécessitant une amélioration d'accessibilité
2. **Importer les hooks d'accessibilité** depuis `useAccessibility.tsx`
3. **Remplacer l'implémentation inline** par les hooks modulaires
4. **Tester la conformité** avec les standards d'accessibilité

### Exemple de Migration

```typescript
// Avant (implémentation inline)
const Modal = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return <div>{/* contenu */}</div>;
};

// Après (utilisation des hooks)
const Modal = ({ isOpen, onClose }) => {
  useModalKeyboard({ isOpen, onClose });
  useFocusRestoration({ isOpen });

  return <div>{/* contenu */}</div>;
};
```

## Formulaires Accessibles

### Composant AccessibleFormModal

Le système inclut un composant de formulaire accessible complet qui respecte les standards WCAG 2.1 et RGAA :

#### Fonctionnalités Principales

- **Validation en temps réel** avec messages d'erreur contextuels
- **Indicateurs visuels** pour les champs requis
- **Associations ARIA** complètes (aria-describedby, aria-invalid)
- **Navigation clavier** optimisée
- **Annonces pour lecteurs d'écran** lors des erreurs
- **Types d'entrée HTML5** appropriés
- **Attributs autocomplete** pour faciliter la saisie

#### Structure du Composant

```typescript
interface AccessibleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fields: FormField[];
  onSubmit: (data: Record<string, any>) => Promise<void>;
  submitButtonText?: string;
  loading?: boolean;
}

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'tel' | 'url';
  required?: boolean;
  placeholder?: string;
  validation?: ValidationRule[];
  autocomplete?: string;
}

interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'custom';
  value?: any;
  message: string;
}
```

#### Exemple d'Utilisation

```typescript
const contactFormFields: FormField[] = [
  {
    name: 'name',
    label: 'Nom complet',
    type: 'text',
    required: true,
    autocomplete: 'name',
    validation: [
      { type: 'required', message: 'Le nom est obligatoire' },
      { type: 'minLength', value: 2, message: 'Le nom doit contenir au moins 2 caractères' }
    ]
  },
  {
    name: 'email',
    label: 'Adresse email',
    type: 'email',
    required: true,
    autocomplete: 'email',
    validation: [
      { type: 'required', message: 'L\'email est obligatoire' },
      { type: 'email', message: 'Veuillez saisir une adresse email valide' }
    ]
  },
  {
    name: 'phone',
    label: 'Téléphone',
    type: 'tel',
    autocomplete: 'tel',
    validation: [
      { type: 'pattern', value: /^[\+]?[0-9\s\-\(\)]+$/, message: 'Format de téléphone invalide' }
    ]
  }
];

<AccessibleFormModal
  isOpen={isContactModalOpen}
  onClose={() => setIsContactModalOpen(false)}
  title="Contactez-nous"
  fields={contactFormFields}
  onSubmit={handleContactSubmit}
  submitButtonText="Envoyer"
/>
```

#### Règles de Validation

Le système supporte plusieurs types de validation :

- **required**: Champ obligatoire
- **minLength/maxLength**: Longueur minimale/maximale
- **pattern**: Expression régulière personnalisée
- **email**: Validation d'adresse email
- **custom**: Fonction de validation personnalisée

#### Gestion des Erreurs

Les erreurs sont affichées de manière accessible :

- Messages d'erreur associés aux champs via `aria-describedby`
- Indicateur visuel `aria-invalid` sur les champs invalides
- Annonces automatiques pour les lecteurs d'écran
- Focus automatique sur le premier champ en erreur

#### Conformité aux Standards

Le composant respecte :

- **WCAG 2.1** critères 1.3.1, 2.1.1, 2.4.6, 3.3.1, 3.3.2, 3.3.3, 4.1.2
- **RGAA 4.1** critères 11.1 à 11.13
- **Opquast** règles 67 à 93

#### Intégration avec le Système d'Accessibilité

Le composant utilise les hooks existants :

```typescript
// Navigation clavier et focus
useModalKeyboard({ isOpen, onClose });
useFocusRestoration({ isOpen });

// Annonces pour lecteurs d'écran
useScreenReaderAnnouncement(errorMessage, 'error');

// Gestion des erreurs de formulaire
useFormValidation(fields, formData);
```

#### Personnalisation Avancée

Le composant peut être étendu pour supporter :

- Champs personnalisés (select, checkbox, radio)
- Validation asynchrone
- Messages d'aide contextuels
- Thèmes d'accessibilité personnalisés
- Intégration avec des bibliothèques de validation externes

#### Tests d'Accessibilité

Le système inclut des utilitaires de test :

```typescript
// Tests des formulaires accessibles
describe('AccessibleFormModal', () => {
  it('should announce form errors to screen readers', () => {
    // Test des annonces d'erreur
  });

  it('should associate labels with inputs', () => {
    // Test des associations ARIA
  });

  it('should handle keyboard navigation', () => {
    // Test de la navigation clavier
  });
});
```

#### Bonnes Pratiques pour les Formulaires

1. **Utilisez des labels descriptifs** pour tous les champs
2. **Indiquez clairement les champs requis** avec des indicateurs visuels et textuels
3. **Fournissez des messages d'erreur contextuels** et utiles
4. **Utilisez les types d'entrée appropriés** pour une meilleure UX
5. **Testez avec de vrais lecteurs d'écran** (NVDA, JAWS, VoiceOver)
6. **Validez la conformité** avec des outils automatisés (axe-core, lighthouse)

#### Migration des Formulaires Existants

Pour migrer un formulaire existant :

1. **Identifiez les champs** et leurs règles de validation
2. **Créez la configuration FormField** correspondante
3. **Remplacez le formulaire** par `AccessibleFormModal`
4. **Testez l'accessibilité** avec des outils spécialisés
5. **Ajustez les styles** si nécessaire pour maintenir la cohérence visuelle

Cette approche modulaire garantit une accessibilité cohérente et maintenable dans toute l'application.
