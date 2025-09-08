"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FaUsers, FaProjectDiagram, FaNewspaper, FaCalendarAlt, FaClock, FaExclamationTriangle, FaCheckCircle, FaInfoCircle, FaSearch } from 'react-icons/fa'
import { useRecentActivity, ActivityItem } from '@/hooks/useRecentActivity'
import ActivityDetailModal from './ActivityDetailModal'

// Simple time ago function
const getTimeAgo = (timestamp: string) => {
  const now = new Date()
  const time = new Date(timestamp)
  const diffInMs = now.getTime() - time.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInMinutes < 1) return 'just now'
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
  return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'user':
      return <FaUsers className="text-blue-700 dark:text-blue-300" size={16} />
    case 'project':
      return <FaProjectDiagram className="text-emerald-700 dark:text-emerald-300" size={16} />
    case 'news':
      return <FaNewspaper className="text-violet-700 dark:text-violet-300" size={16} />
    case 'event':
      return <FaCalendarAlt className="text-orange-700 dark:text-orange-300" size={16} />
    default:
      return <FaInfoCircle className="text-slate-600 dark:text-slate-300" size={16} />
  }
}

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'high':
      return <FaExclamationTriangle className="text-red-700 dark:text-red-300" size={12} />
    case 'medium':
      return <FaInfoCircle className="text-yellow-700 dark:text-yellow-300" size={12} />
    case 'low':
      return <FaCheckCircle className="text-green-700 dark:text-green-300" size={12} />
    default:
      return <FaInfoCircle className="text-slate-600 dark:text-slate-300" size={12} />
  }
}

const getSeverityBadgeStyle = (severity: string) => {
  switch (severity) {
    case 'high':
      return 'bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100 border-red-300 dark:border-red-700'
    case 'medium':
      return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100 border-yellow-300 dark:border-yellow-700'
    case 'low':
      return 'bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100 border-green-300 dark:border-green-700'
    default:
      return 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600'
  }
}

interface ActivityItemProps {
  activity: ActivityItem
  onClick: () => void
}

function ActivityItemComponent({ activity, onClick }: ActivityItemProps) {
  const timeAgo = getTimeAgo(activity.timestamp)

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick()
    }
  }

  return (
    <div
      className="flex items-start gap-2 py-2 px-2 -mx-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Activity: ${activity.action} by ${activity.user}, ${timeAgo}. Severity: ${activity.severity}. ${activity.description}`}
    >
      <div className="flex-shrink-0 mt-0.5" aria-hidden="true">
        {getActivityIcon(activity.type)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <h4 className="text-sm font-medium text-foreground truncate">{activity.action}</h4>
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityBadgeStyle(activity.severity)}`} aria-label={`Severity: ${activity.severity}`}>
                {getSeverityIcon(activity.severity)}
                {activity.severity}
              </span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1 mb-0.5">{activity.description}</p>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300">{activity.user}</p>
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0" aria-label={`Time: ${timeAgo}`}>
            <FaClock size={10} aria-hidden="true" />
            {timeAgo}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminRecentActivitySection() {
  const { data, loading, error, filters, updateFilter } = useRecentActivity()
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleActivityClick = (activity: ActivityItem) => {
    setSelectedActivity(activity)
    setIsModalOpen(true)
  }

  const handleSummaryCardClick = (type: 'user' | 'project' | 'news' | 'event') => {
    if (filters.type === type) {
      // If already filtered by this type, show all
      updateFilter('type', 'all')
    } else {
      // Filter by this type
      updateFilter('type', type)
    }
  }

  const handleSummaryCardKeyDown = (event: React.KeyboardEvent, type: 'user' | 'project' | 'news' | 'event') => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleSummaryCardClick(type)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Recent Administrative Activity</h2>
          <p className="text-muted-foreground">Latest actions and changes in the system</p>
        </div>

        <Card className="admin-loading-card">
          <CardHeader>
            <div className="h-4 admin-loading-skeleton w-32"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((index) => (
                <div key={index} className="flex items-center gap-3 py-2">
                  <div className="h-4 w-4 admin-loading-skeleton rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 admin-loading-skeleton w-3/4"></div>
                    <div className="h-3 admin-loading-skeleton w-1/2"></div>
                  </div>
                  <div className="h-3 admin-loading-skeleton w-16"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((index) => (
            <Card key={index} className="admin-loading-card p-4 text-center">
              <div className="h-6 admin-loading-skeleton w-8 mx-auto mb-2"></div>
              <div className="h-4 admin-loading-skeleton w-20 mx-auto"></div>
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
          <h2 className="text-2xl font-bold text-foreground mb-2">Recent Administrative Activity</h2>
          <p className="text-muted-foreground">Latest actions and changes in the system</p>
        </div>
        <Card className="admin-error-card">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 admin-error-text">
              <FaExclamationTriangle />
              <span className="font-medium">Error loading activity data:</span>
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Recent Administrative Activity</h2>
          <p className="text-muted-foreground">Latest actions and changes in the system</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">No activity data available</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Compact header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Recent Activity</h2>
          <p className="text-sm text-muted-foreground">Latest system actions</p>
        </div>
        <div className="text-xs text-muted-foreground">
          {data?.activities.length || 0} activities
        </div>
      </div>

      {/* Compact activity summary - smaller cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2" role="group" aria-labelledby="activity-summary-heading">
        <h3 id="activity-summary-heading" className="sr-only">Activity Summary by Type</h3>
        <Card
          className={`admin-stat-card admin-stat-card--blue p-3 text-center cursor-pointer hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${filters.type === 'user' ? 'admin-stat-card--active' : ''}`}
          onClick={() => handleSummaryCardClick('user')}
          onKeyDown={(e) => handleSummaryCardKeyDown(e, 'user')}
          role="button"
          tabIndex={0}
          aria-label={`Filter by users: ${data?.summary.userActions || 0} user actions${filters.type === 'user' ? ' (currently active filter)' : ''}`}
          aria-pressed={filters.type === 'user'}
        >
          <div className="flex items-center justify-center gap-1 mb-1">
            <FaUsers className="text-blue-700 dark:text-blue-300" size={14} aria-hidden="true" />
            <div className="text-sm font-bold text-blue-700 dark:text-blue-300">{data?.summary.userActions || 0}</div>
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-300">Users</div>
        </Card>
        <Card
          className={`admin-stat-card admin-stat-card--emerald p-3 text-center cursor-pointer hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${filters.type === 'project' ? 'admin-stat-card--active' : ''}`}
          onClick={() => handleSummaryCardClick('project')}
          onKeyDown={(e) => handleSummaryCardKeyDown(e, 'project')}
          role="button"
          tabIndex={0}
          aria-label={`Filter by projects: ${data?.summary.projectChanges || 0} project changes${filters.type === 'project' ? ' (currently active filter)' : ''}`}
          aria-pressed={filters.type === 'project'}
        >
          <div className="flex items-center justify-center gap-1 mb-1">
            <FaProjectDiagram className="text-emerald-700 dark:text-emerald-300" size={14} aria-hidden="true" />
            <div className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{data?.summary.projectChanges || 0}</div>
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-300">Projects</div>
        </Card>
        <Card
          className={`admin-stat-card admin-stat-card--violet p-3 text-center cursor-pointer hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${filters.type === 'news' ? 'admin-stat-card--active' : ''}`}
          onClick={() => handleSummaryCardClick('news')}
          onKeyDown={(e) => handleSummaryCardKeyDown(e, 'news')}
          role="button"
          tabIndex={0}
          aria-label={`Filter by news: ${data?.summary.contentUpdates || 0} content updates${filters.type === 'news' ? ' (currently active filter)' : ''}`}
          aria-pressed={filters.type === 'news'}
        >
          <div className="flex items-center justify-center gap-1 mb-1">
            <FaNewspaper className="text-violet-700 dark:text-violet-300" size={14} aria-hidden="true" />
            <div className="text-sm font-bold text-violet-700 dark:text-violet-300">{data?.summary.contentUpdates || 0}</div>
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-300">News</div>
        </Card>
        <Card
          className={`admin-stat-card admin-stat-card--orange p-3 text-center cursor-pointer hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${filters.type === 'event' ? 'admin-stat-card--active' : ''}`}
          onClick={() => handleSummaryCardClick('event')}
          onKeyDown={(e) => handleSummaryCardKeyDown(e, 'event')}
          role="button"
          tabIndex={0}
          aria-label={`Filter by events: ${data?.summary.eventsModified || 0} events modified${filters.type === 'event' ? ' (currently active filter)' : ''}`}
          aria-pressed={filters.type === 'event'}
        >
          <div className="flex items-center justify-center gap-1 mb-1">
            <FaCalendarAlt className="text-orange-700 dark:text-orange-300" size={14} aria-hidden="true" />
            <div className="text-sm font-bold text-orange-700 dark:text-orange-300">{data?.summary.eventsModified || 0}</div>
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-300">Events</div>
        </Card>
      </div>

      {/* Compact filters and activities with scroll */}
      <Card className="h-80 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FaClock className="text-slate-600 dark:text-slate-300" size={16} />
              Activities
              {filters.type !== 'all' && (
                <span className="text-xs font-normal text-muted-foreground">
                  ({filters.type})
                </span>
              )}
            </CardTitle>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto" role="group" aria-labelledby="activity-filters-heading">
              <h4 id="activity-filters-heading" className="sr-only">Activity Filters</h4>
              {/* Compact search */}
              <div className="relative">
                <label htmlFor="activity-search" className="sr-only">Search activities</label>
                <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={12} aria-hidden="true" />
                <input
                  id="activity-search"
                  type="text"
                  placeholder="Search..."
                  className="pl-6 pr-2 py-1.5 text-xs border border-border rounded bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring w-full sm:w-48"
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  aria-describedby="search-help"
                />
                <div id="search-help" className="sr-only">Search through activity descriptions and user names</div>
              </div>

              {/* Compact filters */}
              <div>
                <label htmlFor="sort-select" className="sr-only">Sort activities</label>
                <select
                  id="sort-select"
                  className="px-2 py-1.5 text-xs border border-border rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-') as [string, 'asc' | 'desc']
                    updateFilter('sortBy', sortBy)
                    updateFilter('sortOrder', sortOrder)
                  }}
                  aria-describedby="sort-help"
                >
                  <option value="timestamp-desc">Latest</option>
                  <option value="timestamp-asc">Oldest</option>
                  <option value="severity-desc">High Priority</option>
                </select>
                <div id="sort-help" className="sr-only">Sort activities by time or priority</div>
              </div>

              <div>
                <label htmlFor="severity-select" className="sr-only">Filter by severity</label>
                <select
                  id="severity-select"
                  className="px-2 py-1.5 text-xs border border-border rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  value={filters.severity}
                  onChange={(e) => updateFilter('severity', e.target.value)}
                  aria-describedby="severity-help"
                >
                  <option value="all">All</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <div id="severity-help" className="sr-only">Filter activities by severity level</div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0">
          {data?.activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FaInfoCircle className="mx-auto mb-2" size={20} />
              <p className="text-sm">No activities found</p>
            </div>
          ) : (
            <div className="h-72 overflow-y-auto px-4 pb-4">
              <div className="space-y-1">
                {data?.activities.map((activity) => (
                  <ActivityItemComponent
                    key={activity.id}
                    activity={activity}
                    onClick={() => handleActivityClick(activity)}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Detail Modal */}
      <ActivityDetailModal
        activity={selectedActivity}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
