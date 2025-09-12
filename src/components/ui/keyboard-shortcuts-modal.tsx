"use client"

import React, { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { shortcuts, categories } from "@/config/keyboardShortcuts"
import { UniversalModal } from "@/components/modals/UniversalModal"

interface KeyboardShortcutsModalProps {
  children: React.ReactNode
}

export function KeyboardShortcutsModal({ children }: KeyboardShortcutsModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === '?' || e.key === '/')) {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <>
      <div onClick={() => setIsOpen(true)} className="inline-flex">
        {children}
      </div>

      <UniversalModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Keyboard shortcuts"
        description="Useful keyboard shortcuts to navigate the app"
        size="md"
        showCloseButton={true}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => (
            <div key={cat}>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{cat}</Badge>
              </div>
              <ul className="space-y-2">
                {shortcuts
                  .filter((s) => s.category === cat)
                  .map((s) => (
                    <li key={`${cat}-${s.key}`} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {s.icon}
                        <span className="text-sm text-foreground">{s.description}</span>
                      </div>
                      <code className="text-xs text-muted-foreground px-2 py-1 bg-muted/10 rounded">{s.key}</code>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </UniversalModal>
    </>
  )
}

export default KeyboardShortcutsModal

