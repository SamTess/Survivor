"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-8xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Page non trouvée</h2>
          <p className="text-muted-foreground">La page que vous recherchez n'existe pas.</p>
        </div>

        <Button asChild size="lg">
          <Link href="/" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Retour à l'accueil
          </Link>
        </Button>
      </div>
    </div>
  )
}
