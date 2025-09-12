"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuth } from "@/context"
import { useRegisterShortcuts } from '@/hooks/useShortcuts'

import { useNavbarState, useNavbarRefs, useDropdownKeyboard, useDropdownActions } from './hooks'
import { getNavItems, ScreenReaderOnly } from './utils'
import Logo from './Logo'
import NavLinks from './NavLinks'
import RightActions from './RightActions'
import MobileMenu from './MobileMenu'

export function Navbar() {
  const pathname = usePathname()
  const { isAuthenticated, isAdmin, user, logout } = useAuth()

  const { state, setters } = useNavbarState()
  const refs = useNavbarRefs()
  const { toggleMenu, toggleSearchDropdown } = useDropdownActions(state, setters, refs)

  const navItems = getNavItems(isAuthenticated)

  const handleLogout = async () => {
    setters.setIsProfileDropdownOpen(false)
    await logout()
    setTimeout(() => refs.profileButtonRef.current?.focus(), 100)
  }

  const handleUserSelect = () => {
    setters.setIsSearchOpen(false)
    setTimeout(() => refs.searchButtonRef.current?.focus(), 100)
  }

  useDropdownKeyboard(setters, refs)

  // Register keyboard shortcuts centrally
  useRegisterShortcuts([
    { key: 'k', ctrl: true, action: () => toggleSearchDropdown(), description: 'Open search' },
    { key: 'm', ctrl: true, action: () => toggleMenu(), description: 'Toggle mobile menu' },
    { key: 'd', ctrl: true, action: () => {
      const darkModeToggle = document.querySelector('[aria-label="Toggle dark mode"]') as HTMLButtonElement
      darkModeToggle?.click()
    }, description: 'Toggle dark mode' },
    { key: 'm', ctrl: true, shift: true, action: () => {
      const chatLauncher = document.querySelector('[aria-label*="messages"]') as HTMLButtonElement
      chatLauncher?.click()
    }, description: 'Open messages' },
    { key: 'u', ctrl: true, action: () => { if (isAuthenticated && user?.id) window.location.href = `/profile/${user.id}` }, description: 'Go to profile' },
    { key: 'l', ctrl: true, action: () => { if (isAuthenticated) handleLogout() }, description: 'Logout' },
    { key: 'h', alt: true, action: () => { window.location.href = '/' }, description: 'Go to home' },
    { key: 'a', alt: true, action: () => { window.location.href = '/about' }, description: 'Go to about' },
    { key: 'e', alt: true, action: () => { window.location.href = '/events' }, description: 'Go to events' },
    { key: 'm', alt: true, action: () => { window.location.href = '/media' }, description: 'Go to media' },
  ])

  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg transition-all duration-200">Skip to main content</a>

      <nav role="navigation" aria-label="Main navigation" className="fixed w-full top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Logo />

            <NavLinks isAuthenticated={isAuthenticated} />

            <RightActions refs={refs} state={state} toggleSearchDropdown={toggleSearchDropdown} handleUserSelect={handleUserSelect} />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button ref={refs.menuButtonRef} variant="ghost" size="sm" onClick={toggleMenu} aria-expanded={state.isMenuOpen} aria-controls="mobile-menu" aria-label={state.isMenuOpen ? "Close navigation menu" : "Open navigation menu"} className="md:hidden rounded-full w-10 h-10 p-0 hover:bg-muted/40 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                  {state.isMenuOpen ? <X className="h-5 w-5 text-foreground" aria-hidden="true" /> : <Menu className="h-5 w-5 text-foreground" aria-hidden="true" />}
                  <ScreenReaderOnly>{state.isMenuOpen ? 'Close menu' : 'Open menu'}</ScreenReaderOnly>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{state.isMenuOpen ? 'Close menu' : 'Open menu'}</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <MobileMenu state={state} setters={setters} refs={refs} navItems={navItems} pathname={pathname} isAdmin={isAdmin} handleUserSelect={handleUserSelect} />
        </div>
      </nav>
    </>
  )
}
