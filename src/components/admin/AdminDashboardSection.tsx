"use client"

import React, { useState, useEffect } from 'react'
import { useAdminStats } from '@/hooks/useAdminStats'
import { useRecentActivity } from '@/hooks/useRecentActivity'
import DashboardControls, { DashboardSettings } from './DashboardControls'
import KPISection from './KPIComponent'
import AdminRecentActivitySection from './AdminRecentActivitySection'
import jsPDF from 'jspdf'

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
    const doc = new jsPDF()

    doc.setFontSize(20)
    doc.text('Dashboard Report', 20, 30)

    doc.setFontSize(12)
    doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 20, 45)

    let yPosition = 65

    if (stats) {
      doc.setFontSize(16)
      doc.text('Statistics', 20, yPosition)
      yPosition += 15

      doc.setFontSize(12)
      const statsText = [
        `Total Users: ${stats.totalUsers?.value || 0}`,
        `Active Projects: ${stats.activeProjects?.value || 0}`,
        `News Articles: ${stats.newsArticles?.value || 0}`,
        `Upcoming Events: ${stats.upcomingEvents?.value || 0}`
      ]

      statsText.forEach(stat => {
        doc.text(stat, 20, yPosition)
        yPosition += 10
      })

      yPosition += 10
    }

    if (activityData?.activities && activityData.activities.length > 0) {
      doc.setFontSize(16)
      doc.text('Recent Activities', 20, yPosition)
      yPosition += 15

      doc.setFontSize(10)
      activityData.activities.slice(0, 10).forEach((activity, index) => {
        const activityText = `${index + 1}. ${activity.description} - ${new Date(activity.timestamp).toLocaleDateString()}`
        // Split long text into multiple lines
        const lines = doc.splitTextToSize(activityText, 170)
        lines.forEach((line: string) => {
          if (yPosition > 270) {
            doc.addPage()
            yPosition = 30
          }
          doc.text(line, 20, yPosition)
          yPosition += 8
        })
      })
    }

    doc.save(`dashboard-report-${new Date().toISOString().split('T')[0]}.pdf`)
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