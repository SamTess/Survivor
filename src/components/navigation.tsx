"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search, Menu, X } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

type NavItem = {
  href: string
  label: string
  primary?: boolean
}

const navItems: NavItem[] = [
  { href: "/", label: "Home", primary: true },
  { href: "/projects", label: "Projects" },
  { href: "/news", label: "News" },
  { href: "/events", label: "Events" },
]

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const renderDesktopLinks = () => (
    <div className="hidden md:block">
      <div className="ml-10 flex items-baseline space-x-8">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "transition-colors hover:text-primary",
              item.primary ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  )

  const renderMobileLinks = () => (
    <div className="md:hidden">
      <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-card border-t border-border">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "block px-3 py-2 hover:text-primary",
              item.primary ? "text-foreground" : "text-muted-foreground"
            )}
            onClick={() => setIsMenuOpen(false)}
          >
            {item.label}
          </Link>
        ))}
        <div className="px-3 py-2">
          <Button asChild className="w-full">
            <Link href="/admin">Admin</Link>
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-primary">
              JEB
            </Link>
          </div>

          {/* Desktop Navigation */}
          {renderDesktopLinks()}

            {/* Search and CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm" aria-label="Search">
              <Search className="h-4 w-4" />
            </Button>
            <Button asChild>
              <Link href="/admin">Admin</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(o => !o)}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-nav"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div id="mobile-nav">
            {renderMobileLinks()}
          </div>
        )}
      </div>
    </nav>
  )
}
