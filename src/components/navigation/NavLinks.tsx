"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/utils/utils'
import { getNavItems } from './utils'

interface Props {
  isAuthenticated: boolean
}

export default function NavLinks({ isAuthenticated }: Props) {
  const pathname = usePathname()
  const navItems = getNavItems(isAuthenticated)

  return (
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
            aria-current={isActive ? 'page' : undefined}
          >
            {item.label}
            {isActive && <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full" aria-hidden="true" />}
          </Link>
        )
      })}
    </div>
  )
}
