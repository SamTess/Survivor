"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Search, Menu, X, Sparkles, User } from "lucide-react"
import { useState } from "react"
import { cn } from "@/utils/utils"
import { useAuth } from "@/context"
import DarkModeToggle from "../layout/DarkModeToggle"

type NavItem = {
  href: string
  label: string
}

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const { isAuthenticated, user } = useAuth()

  const navItems: NavItem[] = [
    { href: '/', label: 'Home' },
    { href: '/projects', label: 'Projects' },
    { href: '/news', label: 'News' },
    { href: '/events', label: 'Events' },
  ]
  if (isAuthenticated)
    navItems.push({ href: '/dashboard', label: 'Dashboard' })

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
            <Button
              asChild
              size="sm"
              className="group rounded-full w-10 h-10 p-0 bg-muted/20 hover:bg-muted/40 border-0 transition-all duration-200 hover:scale-105"
            >
              <Link href={isAuthenticated && user ? `/profile/${user.id}` : '/login?callback=%2Fprofile'}>
                <User className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            </Button>
            <DarkModeToggle className="text-muted-foreground hover:text-primary" />
            {isAuthenticated && user?.role === 'admin' &&
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
                  <Button asChild className="flex-1 rounded-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                    <Link href="/admin">Admin</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
