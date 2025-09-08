"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FaUsers, FaProjectDiagram, FaNewspaper, FaCalendarAlt } from 'react-icons/fa'
import { useAdminStats } from '@/hooks/useAdminStats'
import StatsDetailModal from './StatsDetailModal'

interface StatCard {
  title: string
  value: string | number
  description: string
  icon: React.ReactNode
  colorClasses: string
  trend?: string
}

export default function KPISection() {
  const { stats, loading, error } = useAdminStats()
  const [modalType, setModalType] = useState<'users' | 'projects' | 'news' | 'events' | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

    const handleCardClick = (type: 'users' | 'projects' | 'news' | 'events') => {
    setModalType(type)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setModalType(null)
  }

  const handleKeyDown = (event: React.KeyboardEvent, type: 'users' | 'projects' | 'news' | 'events') => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleCardClick(type)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Platform Statistics</h2>
          <p className="text-muted-foreground">Overview of key metrics and performance indicators</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((index) => (
            <Card key={index} className="admin-loading-card">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div className="h-4 admin-loading-skeleton w-20"></div>
                  <div className="h-8 w-8 admin-loading-skeleton rounded-lg"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-8 admin-loading-skeleton w-16 mb-2"></div>
                <div className="h-3 admin-loading-skeleton w-32 mb-2"></div>
                <div className="h-5 admin-loading-skeleton w-12"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Platform Statistics</h2>
          <p className="text-muted-foreground">Overview of key metrics and performance indicators</p>
        </div>
        <Card className="admin-error-card">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 admin-error-text">
              <span className="font-medium">Error loading statistics:</span>
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Platform Statistics</h2>
          <p className="text-muted-foreground">Overview of key metrics and performance indicators</p>
        </div>
        <Card className="admin-stat-card">
          <CardContent className="pt-6">
            <p className="admin-stat-description">No statistics available</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statsCards: (StatCard & { type: 'users' | 'projects' | 'news' | 'events' })[] = [
    {
      title: "Total Users",
      value: stats.totalUsers.value,
      description: stats.totalUsers.description,
      icon: <FaUsers className="text-blue-700 dark:text-blue-300" size={20} />,
      colorClasses: "admin-stat-card admin-stat-card--blue cursor-pointer hover:scale-105 transition-transform",
      trend: stats.totalUsers.trend,
      type: 'users'
    },
    {
      title: "Active Projects",
      value: stats.activeProjects.value,
      description: stats.activeProjects.description,
      icon: <FaProjectDiagram className="text-emerald-700 dark:text-emerald-300" size={20} />,
      colorClasses: "admin-stat-card admin-stat-card--emerald cursor-pointer hover:scale-105 transition-transform",
      trend: stats.activeProjects.trend,
      type: 'projects'
    },
    {
      title: "News Articles",
      value: stats.newsArticles.value,
      description: stats.newsArticles.description,
      icon: <FaNewspaper className="text-violet-700 dark:text-violet-300" size={20} />,
      colorClasses: "admin-stat-card admin-stat-card--violet cursor-pointer hover:scale-105 transition-transform",
      trend: stats.newsArticles.trend,
      type: 'news'
    },
    {
      title: "Upcoming Events",
      value: stats.upcomingEvents.value,
      description: stats.upcomingEvents.description,
      icon: <FaCalendarAlt className="text-orange-700 dark:text-orange-300" size={20} />,
      colorClasses: "admin-stat-card admin-stat-card--orange cursor-pointer hover:scale-105 transition-transform",
      trend: stats.upcomingEvents.trend,
      type: 'events'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Platform Statistics</h2>
        <p className="text-muted-foreground">Overview of key metrics and performance indicators</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" role="grid" aria-labelledby="stats-grid-heading">
        <h3 id="stats-grid-heading" className="sr-only">Statistics Overview</h3>
        {statsCards.map((stat, index) => (
          <Card
            key={index}
            className={stat.colorClasses}
            onClick={() => handleCardClick(stat.type)}
            onKeyDown={(e) => handleKeyDown(e, stat.type)}
            role="button"
            tabIndex={0}
            aria-label={`View details for ${stat.title}: ${stat.value} ${stat.description}${stat.trend ? `. Trend: ${stat.trend}` : ''}`}
            aria-describedby={`stat-description-${index}`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="admin-stat-title text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className="admin-stat-icon-container" aria-hidden="true">
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="admin-stat-value mb-1 text-2xl font-bold" aria-label={`Value: ${stat.value}`}>
                {stat.value}
              </div>
              <p id={`stat-description-${index}`} className="admin-stat-description mb-2 text-xs">
                {stat.description}
              </p>
              {stat.trend && (
                <div className="flex items-center">
                  <span className={`admin-trend-badge ${
                    stat.trend.startsWith('+')
                      ? 'admin-trend-badge--positive'
                      : stat.trend.startsWith('-')
                      ? 'admin-trend-badge--negative'
                      : 'admin-trend-badge--neutral'
                  }`} aria-label={`Trend: ${stat.trend}`}>
                    {stat.trend}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats Detail Modal */}
      <StatsDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        type={modalType}
      />
    </div>
  )
}