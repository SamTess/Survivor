"use client"

import React, { useEffect, useState } from 'react'
import AdminNavigationTabs from '@/components/admin/AdminNavigationTabs'
import { useAuth } from '@/context'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const {isAdmin} = useAuth()
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  if (!isAdmin) {
    router.push(`/login`)
    return null
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-background">
      {/* Container with scroll */}
      <div className="flex-1 overflow-y-auto pt-20 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <AdminNavigationTabs />
          {/* Final space */}
          <div className="h-8"></div>
        </div>
      </div>
    </div>
  )
}