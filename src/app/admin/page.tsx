"use client"

import React, { useEffect, useState } from 'react'
import AdminNavigationTabs from '@/components/admin/AdminNavigationTabs'

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simuler le chargement des données
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-background">
      {/* Conteneur avec défilement */}
      <div className="flex-1 overflow-y-auto pt-20 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <AdminNavigationTabs />
          {/* Espacement final pour s'assurer que tout est visible */}
          <div className="h-8"></div>
        </div>
      </div>
    </div>
  )
}