"use client"

import { useEffect } from 'react'

export type ShortcutHandler = {
  key: string
  ctrl?: boolean
  alt?: boolean
  shift?: boolean
  action: (event?: KeyboardEvent) => void
  description?: string
}

function normalizeKey(k: string) {
  return k.length === 1 ? k.toLowerCase() : k
}

export function useRegisterShortcuts(shortcuts: ShortcutHandler[], options: { ignoreInputs?: boolean } = {}) {
  const { ignoreInputs = true } = options

  useEffect(() => {
    if (!shortcuts || shortcuts.length === 0) return

    const handler = (e: KeyboardEvent) => {
      if (ignoreInputs) {
        const target = e.target as HTMLElement
        if (!target) return
        const tag = target.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable) return
      }

      for (const s of shortcuts) {
        const keyMatch = normalizeKey(e.key) === normalizeKey(s.key)
        const ctrlMatch = !!s.ctrl === !!e.ctrlKey
        const altMatch = !!s.alt === !!e.altKey
        const shiftMatch = !!s.shift === !!e.shiftKey

        if (keyMatch && ctrlMatch && altMatch && shiftMatch) {
          try {
            e.preventDefault()
          } catch {}
          s.action(e)
          break
        }
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [shortcuts.map(s => `${s.key}-${s.ctrl}-${s.alt}-${s.shift}`).join('|'), ignoreInputs])
}

export default useRegisterShortcuts
