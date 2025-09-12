"use client"

import React from 'react'
import { Search, Sun, MessageCircle, User } from 'lucide-react'

export interface KeyboardShortcut {
  key: string
  description: string
  category: string
  icon?: React.ReactNode
}

export const shortcuts: KeyboardShortcut[] = [
  // Navigation
  { key: 'Tab', description: 'Navigate to next focusable element', category: 'Navigation' },
  { key: 'Shift + Tab', description: 'Navigate to previous focusable element', category: 'Navigation' },
  { key: 'Enter', description: 'Activate focused control or follow link', category: 'Navigation' },
  { key: 'Space', description: 'Activate button or scroll', category: 'Navigation' },
  { key: 'Escape', description: 'Close modals or menus', category: 'Navigation' },

  // Global Shortcuts (match Navbar handlers)
  { key: 'Ctrl + K', description: 'Open user search', category: 'Global', icon: <Search className="w-4 h-4" /> },
  { key: 'Ctrl + M', description: 'Toggle mobile menu', category: 'Global', icon: <Search className="w-4 h-4" /> },
  { key: 'Ctrl + D', description: 'Toggle dark mode', category: 'Global', icon: <Sun className="w-4 h-4" /> },
  { key: 'Ctrl + Shift + M', description: 'Open messages', category: 'Global', icon: <MessageCircle className="w-4 h-4" /> },

  // User Actions
  { key: 'Ctrl + U', description: 'Go to profile', category: 'User', icon: <User className="w-4 h-4" /> },
  { key: 'Ctrl + L', description: 'Logout', category: 'User' },

  // Accessibility (Alt + ...)
  { key: 'Alt + H', description: 'Go to home', category: 'Accessibility' },
  { key: 'Alt + A', description: 'Go to about', category: 'Accessibility' },
  { key: 'Alt + E', description: 'Go to events', category: 'Accessibility' },
  { key: 'Alt + M', description: 'Go to media', category: 'Accessibility' },
]

export const categories = ["Navigation", "Global", "User", "Accessibility"]
