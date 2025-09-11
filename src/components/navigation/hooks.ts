import { useState, useRef, useEffect, useCallback } from 'react'
import type { NavbarState, NavbarRefs } from './types'
import { handleDropdownFocus } from './utils'

export const useNavbarState = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const state: NavbarState = {
    isMenuOpen,
    isProfileDropdownOpen,
    isSearchOpen
  }

  const setters = {
    setIsMenuOpen,
    setIsProfileDropdownOpen,
    setIsSearchOpen
  }

  return { state, setters }
}

export const useNavbarRefs = (): NavbarRefs => {
  const profileDropdownRef = useRef<HTMLDivElement>(null)
  const searchDropdownRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const profileButtonRef = useRef<HTMLButtonElement>(null)
  const searchButtonRef = useRef<HTMLButtonElement>(null)

  return {
    profileDropdownRef,
    searchDropdownRef,
    menuButtonRef,
    profileButtonRef,
    searchButtonRef
  }
}

export const useDropdownKeyboard = (
  setters: ReturnType<typeof useNavbarState>['setters'],
  refs: NavbarRefs
) => {
  const handleEscape = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setters.setIsProfileDropdownOpen(false)
      setters.setIsSearchOpen(false)
      setters.setIsMenuOpen(false)
    }
  }, [setters])

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (refs.profileDropdownRef.current && !refs.profileDropdownRef.current.contains(event.target as Node)) {
      setters.setIsProfileDropdownOpen(false)
    }
    if (refs.searchDropdownRef.current && !refs.searchDropdownRef.current.contains(event.target as Node)) {
      setters.setIsSearchOpen(false)
    }
  }, [setters, refs])

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [handleClickOutside, handleEscape])
}

export const useDropdownActions = (
  state: NavbarState,
  setters: ReturnType<typeof useNavbarState>['setters'],
  refs: NavbarRefs
) => {
  const toggleMenu = useCallback(() => {
    setters.setIsMenuOpen(!state.isMenuOpen)
    if (!state.isMenuOpen) {
      setTimeout(() => {
        const firstMenuItem = document.querySelector('[data-menu-item="0"]') as HTMLElement
        firstMenuItem?.focus()
      }, 100)
    }
  }, [state.isMenuOpen, setters])

  const toggleProfileDropdown = useCallback(() => {
    setters.setIsProfileDropdownOpen(!state.isProfileDropdownOpen)
    if (!state.isProfileDropdownOpen) {
      setTimeout(() => handleDropdownFocus(refs.profileDropdownRef), 100)
    }
  }, [state.isProfileDropdownOpen, setters, refs])

  const toggleSearchDropdown = useCallback(() => {
    setters.setIsSearchOpen(!state.isSearchOpen)
    if (!state.isSearchOpen) {
      setTimeout(() => handleDropdownFocus(refs.searchDropdownRef), 100)
    }
  }, [state.isSearchOpen, setters, refs])

  return {
    toggleMenu,
    toggleProfileDropdown,
    toggleSearchDropdown
  }
}
