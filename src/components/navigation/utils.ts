import React from 'react'
import { BASE_NAV_ITEMS, DASHBOARD_ITEM } from './constants'
import type { NavItem } from './types'

export const ScreenReaderOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  React.createElement('span', { className: 'sr-only' }, children)
)

export const handleDropdownFocus = (dropdownRef: React.RefObject<HTMLDivElement | null>) => {
  const focusableElements = dropdownRef.current?.querySelectorAll(
    'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  if (focusableElements && focusableElements.length > 0) {
    (focusableElements[0] as HTMLElement).focus()
  }
}

export const getNavItems = (isAuthenticated: boolean): NavItem[] => {
  const items = [...BASE_NAV_ITEMS]
  if (isAuthenticated) {
    items.push(DASHBOARD_ITEM)
  }
  return items
}
