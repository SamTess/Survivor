"use client"

import React, { useState, useEffect } from 'react'
import { useAdminStats } from '@/hooks/useAdminStats'
import { useRecentActivity } from '@/hooks/useRecentActivity'
import DashboardControls, { DashboardSettings } from './DashboardControls'
import KPISection from './KPIComponent'
import AdminRecentActivitySection from './AdminRecentActivitySection'

export default function AdminDashboardSection() {
  const { stats, loading: statsLoading } = useAdminStats()
  const { data: activityData, loading: activityLoading } = useRecentActivity()

  const [settings, setSettings] = useState<DashboardSettings>({
    showKPIs: true,
    showRecentActivity: true
  })

  const [timeOfDay, setTimeOfDay] = useState('')

  useEffect(() => {
    const updateTimeOfDay = () => {
      const hour = new Date().getHours()
      if (hour < 12) setTimeOfDay('Good morning')
      else if (hour < 17) setTimeOfDay('Good afternoon')
      else setTimeOfDay('Good evening')
    }
    updateTimeOfDay()
    const interval = setInterval(updateTimeOfDay, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleExport = () => {
    const reportData = {
      generated: new Date().toISOString(),
      stats,
      systemHealth: { uptime: '99.9%', responseTime: '42ms', dbSize: '2.1GB' },
      recentActivities: activityData?.activities?.slice(0, 10)
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dashboard-report-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (statsLoading || activityLoading) {
    return (
      <div className="space-y-6" role="status" aria-label="Loading dashboard">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-2"></div>
          <div className="h-4 bg-muted rounded w-96"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-32 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
        <span className="sr-only">Loading dashboard content...</span>
      </div>
    )
  }

  return (
    <main className="space-y-6" role="main" aria-labelledby="dashboard-title">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 id="dashboard-title" className="text-3xl font-bold text-foreground mb-2">
            {timeOfDay}, Admin! 👋
          </h1>
          <p className="text-muted-foreground" id="dashboard-subtitle">
            Executive dashboard with customizable views and accessibility features
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <div className="flex items-center space-x-2 px-3 py-2 bg-muted rounded-lg">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" aria-hidden="true"></div>
            <span className="text-sm font-medium">System Online</span>
          </div>
        </div>
      </header>

      <DashboardControls
        settings={settings}
        onSettingsChange={setSettings}
        onExport={handleExport}
      />

      {settings.showKPIs && (
        <KPISection />
      )}

      {settings.showRecentActivity && (
        <AdminRecentActivitySection />
      )}

    </main>
  )
}
