"use client"

import React, { useState, useEffect } from 'react'
import { useAdminStats } from '@/hooks/useAdminStats'
import { useRecentActivity } from '@/hooks/useRecentActivity'
import DashboardControls, { DashboardSettings } from './DashboardControls'
import KPISection from './KPIComponent'
import AdminRecentActivitySection from './AdminRecentActivitySection'
import { generateDashboardPDF } from '@/utils/pdfGenerator'

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

  const handleExport = async () => {
    try {
      const trendsResponse = await fetch('/api/trends')
      const trendsResult = await trendsResponse.json()

      const pdfStats = stats ? {
        totalUsers: stats.totalUsers?.value || 0,
        activeProjects: stats.activeProjects?.value || 0,
        NewsArticle: stats.newsArticles?.value || 0,
        UpcommingEvents: stats.upcomingEvents?.value || 0
      } : null

      const pdfActivity = activityData?.activities?.map(activity => ({
        id: activity.id || '',
        type: activity.type || 'activity',
        description: activity.description || '',
        timestamp: activity.timestamp || new Date().toISOString(),
        user: activity.user || undefined
      })) || null

      const trends = trendsResult.success ? {
        totalUsers: trendsResult.data.totalUsers,
        activeProjects: trendsResult.data.activeProjects,
        NewsArticle: trendsResult.data.NewsArticle,
        UpcommingEvents: trendsResult.data.UpcommingEvents
      } : undefined

      await generateDashboardPDF(pdfStats, pdfActivity, null, trends)
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error)
    }
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