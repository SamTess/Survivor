"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Search, Menu, X, Sparkles, CircleUser, LogOut, Upload } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/utils/utils"
import { useAuth } from "@/context"
import DarkModeToggle from "../layout/DarkModeToggle"
import { SearchUser } from "@/components/ui/SearchUser"

import { useNavbarState, useNavbarRefs, useDropdownKeyboard, useDropdownActions } from './hooks'
import { getNavItems, ScreenReaderOnly } from './utils'

export function Navbar() {
  const pathname = usePathname()
  const { isAuthenticated, isAdmin, user, logout } = useAuth()

  const { state, setters } = useNavbarState()
  const refs = useNavbarRefs()
  const { toggleMenu, toggleProfileDropdown, toggleSearchDropdown } = useDropdownActions(state, setters, refs)

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

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg transition-all duration-200"
      >
        Skip to main content
      </a>

      <nav
        role="navigation"
        aria-label="Main navigation"
        className="fixed w-full top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/20"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="flex items-center gap-2 text-2xl font-bold text-foreground transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg p-1"
              aria-label="JEB Home"
            >
              <div className="relative group">
                <div className="border-none w-8 h-8 bg-accent rounded-lg flex items-center justify-center hover:bg-transparent hover:scale-105 transition-all duration-300">
                  <Sparkles className="border-none w-4 h-4 text-white group-hover:text-primary transition-colors" aria-hidden="true" />
                </div>
              </div>
              <span className="text-muted-foreground font-medium">
                JEB
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1" role="menubar">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    role="menuitem"
                    tabIndex={0}
                    className={cn(
                      "relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                      isActive
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-primary hover:bg-muted/50",
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {item.label}
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full" aria-hidden="true" />
                    )}
                  </Link>
                )
              })}
            </div>

            <div className="hidden md:flex items-center gap-3">
              {/* Search Dropdown */}
              <div className="relative" ref={refs.searchDropdownRef}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      ref={refs.searchButtonRef}
                      size="sm"
                      onClick={toggleSearchDropdown}
                      aria-expanded={state.isSearchOpen}
                      aria-haspopup="dialog"
                      aria-controls="search-dropdown"
                      aria-label="Open user search"
                      className="group rounded-full w-10 h-10 p-0 bg-muted/20 hover:bg-muted/40 border-0 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                      <Search className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" aria-hidden="true" />
                      <ScreenReaderOnly>Search for users</ScreenReaderOnly>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Search for users</p>
                  </TooltipContent>
                </Tooltip>

                {state.isSearchOpen && (
                  <div
                    id="search-dropdown"
                    role="dialog"
                    aria-label="User search"
                    className="absolute overflow-visible right-0 top-12 w-96 bg-background/80 backdrop-blur-md border border-border/20 rounded-2xl shadow-lg px-4 pt-3 pb-5 z-50 animate-in slide-in-from-top-2 duration-200"
                  >
                    <SearchUser
                      onUserSelect={handleUserSelect}
                      placeholder="Search for users..."
                      showRoleFilter={false}
                      maxResults={10}
                      cardSize="sm"
                    />
                  </div>
                )}
              </div>

              <DarkModeToggle
                className="text-muted-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full"
                aria-label="Toggle dark mode"
              />

              {/* Profile Dropdown */}
              <div className="relative" ref={refs.profileDropdownRef}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      ref={refs.profileButtonRef}
                      size="sm"
                      onClick={toggleProfileDropdown}
                      aria-expanded={state.isProfileDropdownOpen}
                      aria-haspopup="menu"
                      aria-controls="profile-menu"
                      aria-label={isAuthenticated ? "Open user menu" : "Login"}
                      className="group rounded-full w-10 h-10 p-0 bg-muted/20 hover:bg-muted/40 border-0 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                      <div className="w-10 h-10 rounded-full flex items-center justify-center">
                        <CircleUser className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" aria-hidden="true" />
                      </div>
                      <ScreenReaderOnly>{isAuthenticated ? "User menu" : "Login"}</ScreenReaderOnly>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isAuthenticated ? "User menu" : "Sign in"}</p>
                  </TooltipContent>
                </Tooltip>

                {state.isProfileDropdownOpen && isAuthenticated && (
                  <div
                    id="profile-menu"
                    role="menu"
                    aria-label="User menu"
                    className="absolute right-0 top-12 w-48 bg-background/95 backdrop-blur-md border border-border/20 rounded-2xl shadow-lg z-50 animate-in slide-in-from-top-2 duration-200"
                  >
                    <Link
                      href={`/profile/${user?.id}`}
                      onClick={() => setters.setIsProfileDropdownOpen(false)}
                      role="menuitem"
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-all duration-200 rounded-t-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
                    >
                      <CircleUser className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      Profile
                    </Link>
                    {user?.role === 'founder' && (
                      <Link
                        href="/media"
                        onClick={() => setters.setIsProfileDropdownOpen(false)}
                        role="menuitem"
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
                      >
                        <Upload className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        Media Storage
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      role="menuitem"
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 w-full text-left rounded-b-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-inset"
                    >
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      Logout
                    </button>
                  </div>
                )}

                {state.isProfileDropdownOpen && !isAuthenticated && (
                  <div
                    id="profile-menu"
                    role="menu"
                    aria-label="Authentication menu"
                    className="absolute right-0 top-12 w-48 bg-background/95 backdrop-blur-md border border-border/20 rounded-2xl shadow-lg py-2 z-50 animate-in slide-in-from-top-2 duration-200"
                  >
                    <Link
                      href="/login?callback=%2Fprofile"
                      onClick={() => setters.setIsProfileDropdownOpen(false)}
                      role="menuitem"
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
                    >
                      <CircleUser className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      Login
                    </Link>
                  </div>
                )}
              </div>

              {isAdmin &&
                <Button
                  asChild
                  size="sm"
                  className="group rounded-full px-4 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  <Link href="/admin" aria-label="Admin panel">
                    <span className="text-sm font-medium text-primary group-hover:text-primary transition-colors">Admin</span>
                  </Link>
                </Button>
              }
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  ref={refs.menuButtonRef}
                  variant="ghost"
                  size="sm"
                  onClick={toggleMenu}
                  aria-expanded={state.isMenuOpen}
                  aria-controls="mobile-menu"
                  aria-label={state.isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                  className="md:hidden rounded-full w-10 h-10 p-0 hover:bg-muted/40 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  {state.isMenuOpen ?
                    <X className="h-5 w-5 text-foreground" aria-hidden="true" /> :
                    <Menu className="h-5 w-5 text-foreground" aria-hidden="true" />
                  }
                  <ScreenReaderOnly>{state.isMenuOpen ? "Close menu" : "Open menu"}</ScreenReaderOnly>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{state.isMenuOpen ? "Close menu" : "Open menu"}</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {state.isMenuOpen && (
            <div
              id="mobile-menu"
              role="menu"
              aria-label="Mobile navigation menu"
              className="md:hidden py-4 border-t border-border/20 animate-in slide-in-from-top-2 duration-200"
            >
              <div className="flex flex-col gap-2">
                {navItems.map((item, index) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setters.setIsMenuOpen(false)}
                      role="menuitem"
                      data-menu-item={index}
                      tabIndex={0}
                      className={cn(
                        "border-none px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset",
                        isActive
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-primary hover:bg-muted/50",
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  )
                })}
                {/* Mobile-only Messages entry */}
                <Link
                  href="/message"
                  onClick={() => setters.setIsMenuOpen(false)}
                  role="menuitem"
                  data-menu-item={navItems.length}
                  tabIndex={0}
                  className={cn(
                    "border-none px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset",
                    pathname?.startsWith('/message')
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-primary hover:bg-muted/50",
                  )}
                  aria-current={pathname?.startsWith('/message') ? "page" : undefined}
                >
                  Messages
                </Link>

                <div className="px-4 pt-2">
                  {/* Mobile Search, Dark Mode, Profile, and Logout on same line */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    {/* Search Button */}
                    <div className="relative" ref={refs.searchDropdownRef}>
                      <Button
                        size="sm"
                        onClick={toggleSearchDropdown}
                        aria-expanded={state.isSearchOpen}
                        aria-haspopup="dialog"
                        aria-controls="mobile-search-dropdown"
                        aria-label="Open user search"
                        className="group rounded-full w-10 h-10 p-0 bg-muted/20 hover:bg-muted/40 border-0 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      >
                        <Search className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" aria-hidden="true" />
                        <ScreenReaderOnly>Search for users</ScreenReaderOnly>
                      </Button>

                      {state.isSearchOpen && (
                        <div
                          id="mobile-search-dropdown"
                          role="dialog"
                          aria-label="User search"
                          className="absolute overflow-visible left-0 top-12 w-80 bg-background/80 backdrop-blur-md border border-border/20 rounded-2xl shadow-lg px-4 pt-3 pb-5 z-50 animate-in slide-in-from-top-2 duration-200"
                        >
                          <SearchUser
                            onUserSelect={handleUserSelect}
                            placeholder="Search for users..."
                            showRoleFilter={false}
                            maxResults={10}
                            cardSize="sm"
                          />
                        </div>
                      )}
                    </div>

                    {/* Dark Mode Toggle */}
                    <DarkModeToggle
                      className="text-muted-foreground hover:text-primary w-5 h-5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full"
                      aria-label="Toggle dark mode"
                    />

                    {/* Profile Button - Mobile: Direct redirect to profile */}
                    <Link href={`/profile/${user?.id}`} onClick={() => setters.setIsMenuOpen(false)} aria-label="Go to profile">
                      <Button
                        size="sm"
                        className="group rounded-full w-10 h-10 p-0 bg-muted/20 hover:bg-muted/40 border-0 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      >
                        <div className="w-10 h-10 rounded-full flex items-center justify-center">
                          <CircleUser className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" aria-hidden="true" />
                        </div>
                        <ScreenReaderOnly>Profile</ScreenReaderOnly>
                      </Button>
                    </Link>

                    {/* Logout Button (visible when authenticated) */}
                    {isAuthenticated && (
                      <Button
                        onClick={() => {
                          handleLogout()
                          setters.setIsMenuOpen(false)
                        }}
                        aria-label="Logout"
                        size="sm"
                        className="rounded-full w-10 h-10 p-0 bg-red-600/20 hover:bg-red-600/30 border-0 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      >
                        <LogOut className="h-5 w-5 text-red-600" aria-hidden="true" />
                        <ScreenReaderOnly>Logout</ScreenReaderOnly>
                      </Button>
                    )}
                  </div>

                  {isAdmin && (
                    <Button asChild className="w-full rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset">
                      <Link href="/admin" onClick={() => setters.setIsMenuOpen(false)} aria-label="Admin panel">
                        <span className="text-sm font-medium text-primary">Admin</span>
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  )
}
