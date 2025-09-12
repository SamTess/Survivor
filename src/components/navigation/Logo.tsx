"use client"

import Link from "next/link"
import { Sparkles } from "lucide-react"

export default function Logo() {
  return (
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
      <span className="text-muted-foreground font-medium">JEB</span>
    </Link>
  )
}
