"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Search, Keyboard } from 'lucide-react'
import DarkModeToggle from '../layout/DarkModeToggle'
import { SearchUser } from '@/components/ui/SearchUser'
import { UniversalModal } from '@/components/modals/UniversalModal'
import { ScreenReaderOnly } from './utils'

import type { NavbarState, NavbarRefs } from './types'

interface Props {
  refs: NavbarRefs
  state: NavbarState
  toggleSearchDropdown: () => void
  handleUserSelect: () => void
}

export default function RightActions({ refs, state, toggleSearchDropdown, handleUserSelect }: Props) {
  const [isShortcutsOpen, setIsShortcutsOpen] = React.useState(false)

  return (
    <div className="hidden md:flex items-center gap-3">
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
          <div id="search-dropdown" role="dialog" aria-label="User search" className="absolute overflow-visible right-0 top-12 w-96 bg-background/80 backdrop-blur-md border border-border/20 rounded-2xl shadow-lg px-4 pt-3 pb-5 z-50 animate-in slide-in-from-top-2 duration-200">
            <SearchUser onUserSelect={handleUserSelect} placeholder="Search for users..." showRoleFilter={false} maxResults={10} cardSize="sm" />
          </div>
        )}
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="sm" aria-label="Keyboard shortcuts" onClick={() => setIsShortcutsOpen(true)} className="group rounded-full w-10 h-10 p-0 bg-muted/20 hover:bg-muted/40 border-0 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
            <Keyboard className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" aria-hidden="true" />
            <ScreenReaderOnly>Keyboard shortcuts</ScreenReaderOnly>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Keyboard shortcuts (Ctrl + ?)</p>
        </TooltipContent>
      </Tooltip>

      <UniversalModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} title="Keyboard shortcuts" description="Useful keyboard shortcuts to navigate the app" size="md" showCloseButton={true}>
        {/* ... keep same modal content as before or import KeyboardShortcutsModal */}
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold mb-2">Navigation</h4>
            <ul className="space-y-1">
              <li className="flex justify-between"><span>Tab</span><code>Next element</code></li>
              <li className="flex justify-between"><span>Shift + Tab</span><code>Previous element</code></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-2">Global</h4>
            <ul className="space-y-1">
              <li className="flex justify-between"><span>Ctrl + K</span><code>Open search</code></li>
            </ul>
          </div>
        </div>
      </UniversalModal>

      <DarkModeToggle className="text-muted-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full" aria-label="Toggle dark mode" />

      {/* Profile Dropdown - left as existing logic in Navbar for now, to avoid duplicating complex refs/state wiring */}
    </div>
  )
}
