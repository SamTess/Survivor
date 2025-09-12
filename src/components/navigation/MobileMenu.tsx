"use client"

import Link from 'next/link'
import { cn } from '@/utils/utils'
import { SearchUser } from '@/components/ui/SearchUser'
import type { NavbarState, NavbarRefs, NavItem } from './types'

interface Props {
  state: NavbarState
  setters: ReturnType<typeof import('./hooks').useNavbarState>['setters']
  refs: NavbarRefs
  navItems: NavItem[]
  pathname?: string | null
  isAdmin?: boolean
  handleUserSelect?: () => void
}

export default function MobileMenu({ state, setters, refs, navItems, pathname, isAdmin, handleUserSelect }: Props) {
  return (
    <>
      {state.isMenuOpen && (
        <div id="mobile-menu" role="menu" aria-label="Mobile navigation menu" className="md:hidden py-4 border-t border-border/20 animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-2">
            {navItems.map((item, index) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href} onClick={() => setters.setIsMenuOpen(false)} role="menuitem" data-menu-item={index} tabIndex={0} className={cn(
                  "border-none px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset",
                  isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary hover:bg-muted/50",
                )} aria-current={isActive ? 'page' : undefined}>
                  {item.label}
                </Link>
              )
            })}

            <Link href="/message" onClick={() => setters.setIsMenuOpen(false)} role="menuitem" data-menu-item={navItems.length} tabIndex={0} className={cn(
              "border-none px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset",
              pathname?.startsWith('/message') ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary hover:bg-muted/50",
            )} aria-current={pathname?.startsWith('/message') ? 'page' : undefined}>
              Messages
            </Link>

            <div className="px-4 pt-2">
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="relative" ref={refs.searchDropdownRef}>
                  <button onClick={() => setters.setIsSearchOpen(prev => !prev)} aria-expanded={state.isSearchOpen} aria-haspopup="dialog" aria-controls="mobile-search-dropdown" aria-label="Open user search" className="group rounded-full w-10 h-10 p-0 bg-muted/20 hover:bg-muted/40 border-0 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                    <span className="sr-only">Search for users</span>
                    🔍
                  </button>

                  {state.isSearchOpen && (
                    <div id="mobile-search-dropdown" role="dialog" aria-label="User search" className="absolute overflow-visible left-0 top-12 w-80 bg-background/80 backdrop-blur-md border border-border/20 rounded-2xl shadow-lg px-4 pt-3 pb-5 z-50 animate-in slide-in-from-top-2 duration-200">
                      <SearchUser onUserSelect={handleUserSelect} placeholder="Search for users..." showRoleFilter={false} maxResults={10} cardSize="sm" />
                    </div>
                  )}
                </div>

                {/* Dark mode and profile buttons left in Navbar for desktop—simplified here */}
                <div className="flex gap-2">
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setters.setIsMenuOpen(false)} aria-label="Admin panel" className="px-3 py-2 rounded bg-primary/10">Admin</Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
