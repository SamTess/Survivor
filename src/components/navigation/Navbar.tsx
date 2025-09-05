"use client"

import React, { useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Search, Menu, X, Sparkles, User, LogOut } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/utils/utils"
import { useAuth } from "@/context"
import DarkModeToggle from "../layout/DarkModeToggle"

type NavItem = {
  href: string
  label: string
}

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const pathname = usePathname()
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const profileDropdownRef = useRef<HTMLDivElement>(null)

  const navItems: NavItem[] = [
    { href: '/', label: 'Home' },
    { href: '/projects', label: 'Projects' },
    { href: '/news', label: 'News' },
    { href: '/events', label: 'Events' },
  ]
  if (isAuthenticated)
    navItems.push({ href: '/dashboard', label: 'Dashboard' })

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = async () => {
    setIsProfileDropdownOpen(false)
    await logout()
  }

  return (
    <nav className="fixed w-full top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center gap-2 text-2xl font-bold text-foreground transition-all duration-300"
          >
            <div className="relative group">
              <div className="border-none w-8 h-8 bg-accent rounded-lg flex items-center justify-center hover:bg-transparent hover:scale-105 transition-all duration-300">
                <Sparkles className="border-none w-4 h-4 text-white group-hover:text-primary transition-colors" />
              </div>
            </div>
            <span className="text-muted-foreground font-medium">
              JEB
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 group",
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-primary hover:bg-muted/50",
                  )}
                >
                  {item.label}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full" />
                  )}
                </Link>
              )
            })}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Button
              size="sm"
              className="group rounded-full w-10 h-10 p-0 bg-muted/20 hover:bg-muted/40 border-0 transition-all duration-200 hover:scale-105"
            >
              <Search className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </Button>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <Button
                size="sm"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="group rounded-full w-10 h-10 p-0 bg-muted/20 hover:bg-muted/40 border-0 transition-all duration-200 hover:scale-105"
              >
                <User className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </Button>

              {isProfileDropdownOpen && isAuthenticated && (
                <div className="absolute right-0 top-12 w-48 bg-background/95 backdrop-blur-md border border-border/20 rounded-2xl shadow-lg py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                  <Link
                    href={`/profile/${user?.id}`}
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-all duration-200"
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 w-full text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}

              {isProfileDropdownOpen && !isAuthenticated && (
                <div className="absolute right-0 top-12 w-48 bg-background/95 backdrop-blur-md border border-border/20 rounded-2xl shadow-lg py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                  <Link
                    href="/login?callback=%2Fprofile"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-all duration-200"
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    Login
                  </Link>
                </div>
              )}
            </div>

            <DarkModeToggle className="text-muted-foreground hover:text-primary" />
            {isAdmin &&
              <Button
                asChild
                size="sm"
                className="group rounded-full px-4 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 transition-all duration-200 hover:scale-105"
              >
                <Link href="/admin">
                  <span className="text-sm font-medium text-primary group-hover:text-primary transition-colors">Admin</span>
                </Link>
              </Button>
            }
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden rounded-full w-10 h-10 p-0 hover:bg-muted/40"
          >
            {isMenuOpen ?
              <X className="h-5 w-5 text-foreground" /> :
              <Menu className="h-5 w-5 text-foreground" />
            }
          </Button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/20 animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "border-none px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                      isActive
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-primary hover:bg-muted/50",
                    )}
                  >
                    {item.label}
                  </Link>
                )
              })}
              <div className="px-4 pt-2">
                <div className="flex justify-center gap-2 mb-4">
                  <DarkModeToggle />
                </div>
                <div className="flex gap-2 mb-2">
                  <Button asChild className="flex-1 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Link href={isAuthenticated && user ? `/profile/${user.id}` : '/login'}>
                      {isAuthenticated ? 'Profile' : 'Login'}
                    </Link>
                  </Button>
                  {isAuthenticated ? (
                    <Button
                      onClick={handleLogout}
                      className="flex-1 rounded-full bg-red-600 hover:bg-red-700 text-white"
                    >
                      Logout
                    </Button>
                  ) : (
                    <Button asChild className="flex-1 rounded-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                      <Link href="/admin">Admin</Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
