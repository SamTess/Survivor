"use client"

import * as React from 'react'
import { useEffect, useRef, useCallback } from 'react'

// Types for accessibility
export interface KeyboardShortcut {
  key: string
  altKey?: boolean
  ctrlKey?: boolean
  shiftKey?: boolean
  action: () => void
  description: string
}

export interface FocusableElement {
  element: HTMLElement
  priority?: number
}

// Hook for general keyboard navigation
export function useKeyboardNavigation(
  shortcuts: KeyboardShortcut[] = [],
  options: {
    trapFocus?: boolean
    containerRef?: React.RefObject<HTMLElement>
    autoFocus?: boolean
  } = {}
) {
  const { trapFocus = false, containerRef, autoFocus = true } = options
  const internalRef = useRef<HTMLElement>(null)
  const ref = containerRef || internalRef

  useEffect(() => {
    if (!ref.current) return

    const container = ref.current
    let focusableElements: NodeListOf<HTMLElement> = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    const updateFocusableElements = () => {
      focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    }

    const getFirstElement = () => focusableElements[0]
    const getLastElement = () => focusableElements[focusableElements.length - 1]

    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle custom shortcuts
      for (const shortcut of shortcuts) {
        if (
          e.key.toLowerCase() === shortcut.key.toLowerCase() &&
          !!e.altKey === !!shortcut.altKey &&
          !!e.ctrlKey === !!shortcut.ctrlKey &&
          !!e.shiftKey === !!shortcut.shiftKey
        ) {
          e.preventDefault()
          shortcut.action()
          return
        }
      }

      // Handle focus trap
      if (trapFocus && focusableElements.length > 0) {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === getFirstElement()) {
              e.preventDefault()
              getLastElement()?.focus()
            }
          } else {
            if (document.activeElement === getLastElement()) {
              e.preventDefault()
              getFirstElement()?.focus()
            }
          }
        }
      }
    }

    // Auto-focus with a small delay to ensure DOM is ready
    if (autoFocus && focusableElements.length > 0) {
      setTimeout(() => {
        updateFocusableElements()
        if (focusableElements.length > 0) {
          getFirstElement()?.focus()
        }
      }, 100)
    }

    document.addEventListener('keydown', handleKeyDown)

    // Observer to update focusable elements dynamically
    const observer = new MutationObserver(updateFocusableElements)
    observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['tabindex', 'disabled']
    })

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      observer.disconnect()
    }
  }, [shortcuts, trapFocus, autoFocus])

  return ref
}

// Specialized hook for modals
export function useModalKeyboard(
  isOpen: boolean,
  onClose: () => void,
  options: {
    closeOnEscape?: boolean
    trapFocus?: boolean
    additionalShortcuts?: KeyboardShortcut[]
  } = {}
) {
  const { closeOnEscape = true, trapFocus = true, additionalShortcuts = [] } = options

  const shortcuts: KeyboardShortcut[] = [
    ...(closeOnEscape ? [{
      key: 'Escape',
      action: onClose,
      description: 'Close modal'
    }] : []),
    ...additionalShortcuts
  ]

  return useKeyboardNavigation(shortcuts, {
    trapFocus: trapFocus && isOpen,
    autoFocus: isOpen
  })
}

// Hook for navigation in lists (menus, dropdowns, etc.)
export function useListNavigation<T>(
  items: T[],
  onSelect: (item: T, index: number) => void,
  options: {
    loop?: boolean
    autoFocus?: boolean
    onEscape?: () => void
  } = {}
) {
  const { loop = true, autoFocus = true, onEscape } = options
  const [focusedIndex, setFocusedIndex] = React.useState(-1)
  const listRef = useRef<HTMLElement>(null)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!items.length) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex(prev =>
          loop ? (prev + 1) % items.length : Math.min(prev + 1, items.length - 1)
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex(prev =>
          loop ? (prev - 1 + items.length) % items.length : Math.max(prev - 1, 0)
        )
        break
      case 'Home':
        e.preventDefault()
        setFocusedIndex(0)
        break
      case 'End':
        e.preventDefault()
        setFocusedIndex(items.length - 1)
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (focusedIndex >= 0) {
          onSelect(items[focusedIndex], focusedIndex)
        }
        break
      case 'Escape':
        if (onEscape) {
          e.preventDefault()
          onEscape()
        }
        break
    }
  }, [items, focusedIndex, loop, onSelect, onEscape])

  useEffect(() => {
    if (autoFocus && items.length > 0 && focusedIndex === -1) {
      setFocusedIndex(0)
    }
  }, [items, autoFocus, focusedIndex])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return {
    focusedIndex,
    setFocusedIndex,
    listRef
  }
}

export const ariaUtils = {
  // Generate unique IDs for ARIA relationships
  generateIds: (prefix: string, count: number = 1) => {
    const ids = []
    for (let i = 0; i < count; i++) {
      ids.push(`${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
    }
    return count === 1 ? ids[0] : ids
  },

  // Attributes for buttons with states
  buttonState: (isPressed: boolean, label: string) => ({
    'aria-pressed': isPressed,
    'aria-label': isPressed ? `${label} (activated)` : label
  }),

  // Attributes for expandable elements
  expandable: (isExpanded: boolean, label: string) => ({
    'aria-expanded': isExpanded,
    'aria-label': isExpanded ? `${label} (expanded)` : `${label} (collapsed)`
  }),

  // Attributes for elements with descriptions
  describedBy: (description: string, id?: string) => ({
    'aria-describedby': id || ariaUtils.generateIds('desc'),
    'title': description
  })
}

export const KEYBOARD_SHORTCUTS = {
  MODAL_CLOSE: { key: 'Escape', description: 'Close modal' },
  NAVIGATION_UP: { key: 'ArrowUp', description: 'Navigate up' },
  NAVIGATION_DOWN: { key: 'ArrowDown', description: 'Navigate down' },
  NAVIGATION_LEFT: { key: 'ArrowLeft', description: 'Navigate left' },
  NAVIGATION_RIGHT: { key: 'ArrowRight', description: 'Navigate right' },
  SELECT: { key: 'Enter', description: 'Select item' },
  ACTIVATE: { key: ' ', description: 'Activate' },
  FIRST_ITEM: { key: 'Home', description: 'First item' },
  LAST_ITEM: { key: 'End', description: 'Last item' },
  SEARCH: { key: 's', altKey: true, description: 'Search' },
  MENU: { key: 'm', altKey: true, description: 'Toggle menu' },
  HOME: { key: 'h', altKey: true, description: 'Go to home' },
  PROFILE: { key: 'l', altKey: true, description: 'Go to profile' }
} as const

// Hook to announce changes to screen readers
export function useScreenReaderAnnouncement() {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.style.position = 'absolute'
    announcement.style.left = '-10000px'
    announcement.style.width = '1px'
    announcement.style.height = '1px'
    announcement.style.overflow = 'hidden'

    document.body.appendChild(announcement)
    announcement.textContent = message

    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }, [])

  return announce
}

// Hook to manage focus restoration
export function useFocusRestoration() {
  const previousFocusRef = useRef<HTMLElement | null>(null)

  const saveFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement
  }, [])

  const restoreFocus = useCallback(() => {
    if (previousFocusRef.current && document.contains(previousFocusRef.current)) {
      previousFocusRef.current.focus()
    }
  }, [])

  return { saveFocus, restoreFocus }
}

// Global hook for enhanced keyboard accessibility
export function useGlobalKeyboardAccessibility() {
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement

      // Handle radio buttons with arrow keys
      if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'radio') {
        const inputTarget = target as HTMLInputElement
        const radioGroup = document.querySelectorAll(`input[name="${inputTarget.name}"]`)
        const currentIndex = Array.from(radioGroup).indexOf(inputTarget)

        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
          event.preventDefault()
          const nextIndex = (currentIndex + 1) % radioGroup.length
          ;(radioGroup[nextIndex] as HTMLInputElement).focus()
          ;(radioGroup[nextIndex] as HTMLInputElement).checked = true
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
          event.preventDefault()
          const prevIndex = currentIndex === 0 ? radioGroup.length - 1 : currentIndex - 1
          ;(radioGroup[prevIndex] as HTMLInputElement).focus()
          ;(radioGroup[prevIndex] as HTMLInputElement).checked = true
        }
      }

      // Handle checkboxes with spacebar
      if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'checkbox' && event.key === ' ') {
        event.preventDefault()
        target.click()
      }

      // Handle links and buttons with Enter
      if ((target.tagName === 'A' || target.tagName === 'BUTTON') && event.key === 'Enter') {
        event.preventDefault()
        target.click()
        // Keep focus on element after action
        setTimeout(() => target.focus(), 0)
        return
      }

      // Handle form submission with Enter
      if (target.tagName === 'INPUT' && (target as HTMLInputElement).type !== 'button' && (target as HTMLInputElement).type !== 'submit') {
        if (event.key === 'Enter') {
          const form = target.closest('form')
          if (form) {
            event.preventDefault()
            const submitButton = form.querySelector('button[type="submit"], input[type="submit"]') as HTMLElement
            if (submitButton) {
              submitButton.click()
              // Keep focus on current field after submission
              setTimeout(() => target.focus(), 0)
            } else {
              form.requestSubmit()
            }
          }
        }
      }

      // Handle scrolling with arrow keys in content areas
      if (target.tagName === 'DIV' || target.tagName === 'SECTION' || target.tagName === 'ARTICLE') {
        const isScrollable = target.scrollHeight > target.clientHeight || target.scrollWidth > target.clientWidth

        if (isScrollable) {
          const scrollAmount = 50

          switch (event.key) {
            case 'ArrowDown':
              if (!event.shiftKey && !event.ctrlKey && !event.altKey) {
                event.preventDefault()
                target.scrollBy(0, scrollAmount)
              }
              break
            case 'ArrowUp':
              if (!event.shiftKey && !event.ctrlKey && !event.altKey) {
                event.preventDefault()
                target.scrollBy(0, -scrollAmount)
              }
              break
            case 'ArrowRight':
              if (!event.shiftKey && !event.ctrlKey && !event.altKey) {
                event.preventDefault()
                target.scrollBy(scrollAmount, 0)
              }
              break
            case 'ArrowLeft':
              if (!event.shiftKey && !event.ctrlKey && !event.altKey) {
                event.preventDefault()
                target.scrollBy(-scrollAmount, 0)
              }
              break
          }
        }
      }

      // Enhanced select dropdown handling
      if (target.tagName === 'SELECT') {
        const selectElement = target as HTMLSelectElement

        // Navigation with arrow keys (let native behavior work)
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          return
        }

        // Open/close dropdown with space
        if (event.key === ' ') {
          event.preventDefault()
          selectElement.focus()
          // Simulate click to open dropdown
          const clickEvent = new MouseEvent('mousedown', { bubbles: true })
          selectElement.dispatchEvent(clickEvent)
          return
        }

        // Selection with Enter
        if (event.key === 'Enter') {
          event.preventDefault()
          // Small delay to let browser close dropdown
          setTimeout(() => {
            if (document.contains(selectElement)) {
              selectElement.focus()
            }
          }, 10)
          return
        }
      }

      // Handle dropdown menus with Escape
      if (target.getAttribute('role') === 'menu' || target.getAttribute('role') === 'listbox') {
        if (event.key === 'Escape') {
          event.preventDefault()
          // Close menu
          const menuButton = document.querySelector(`[aria-controls="${target.id}"]`) as HTMLElement
          if (menuButton) {
            menuButton.focus()
            menuButton.setAttribute('aria-expanded', 'false')
          }
          target.setAttribute('aria-hidden', 'true')
        }
      }
    }

    document.addEventListener('keydown', handleGlobalKeyDown)
    return () => document.removeEventListener('keydown', handleGlobalKeyDown)
  }, [])
}

// Hook for enhanced form accessibility
export function useFormAccessibility() {
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    const form = formRef.current
    if (!form) return

    const handleFormKeyDown = (event: KeyboardEvent) => {
      // Handle form submission with Ctrl+Enter
      if (event.ctrlKey && event.key === 'Enter') {
        event.preventDefault()
        form.requestSubmit()
      }
    }

    form.addEventListener('keydown', handleFormKeyDown)
    return () => form.removeEventListener('keydown', handleFormKeyDown)
  }, [])

  return formRef
}
