"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FaUsers, FaProjectDiagram, FaNewspaper, FaCalendarAlt, FaClock, FaExclamationTriangle, FaCheckCircle, FaInfoCircle, FaSearch, FaSort, FaFilter } from 'react-icons/fa'
import { useRecentActivity, ActivityItem, ActivityFilters } from '@/hooks/useRecentActivity'
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
      return <FaUsers className="text-blue-500" size={16} />
    case 'project':
      return <FaProjectDiagram className="text-emerald-500" size={16} />
    case 'news':
      return <FaNewspaper className="text-violet-500" size={16} />
    case 'event':
      return <FaCalendarAlt className="text-orange-500" size={16} />
    default:
      return <FaInfoCircle className="text-muted-foreground" size={16} />
  }
}

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'high':
      return <FaExclamationTriangle className="text-red-500" size={12} />
    case 'medium':
      return <FaInfoCircle className="text-yellow-500" size={12} />
    case 'low':
      return <FaCheckCircle className="text-green-500" size={12} />
    default:
      return <FaInfoCircle className="text-muted-foreground" size={12} />
  }
}

const getSeverityBadgeStyle = (severity: string) => {
  switch (severity) {
    case 'high':
      return 'bg-red-100 dark:bg-red-800/60 text-red-800 dark:text-red-200 border-red-300 dark:border-red-600'
    case 'medium':
      return 'bg-yellow-100 dark:bg-yellow-800/60 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-600'
    case 'low':
      return 'bg-green-100 dark:bg-green-800/60 text-green-800 dark:text-green-200 border-green-300 dark:border-green-600'
    default:
      return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-500'
  }
}

interface ActivityItemProps {
  activity: ActivityItem
  onClick: () => void
}

function ActivityItemComponent({ activity, onClick }: ActivityItemProps) {
  const timeAgo = getTimeAgo(activity.timestamp)

  return (
    <div
      className="flex items-start gap-3 py-3 border-b border-border last:border-b-0 hover:bg-muted/30 cursor-pointer transition-colors rounded-lg px-2 -mx-2"
      onClick={onClick}
    >
      <div className="flex-shrink-0 mt-0.5">
        {getActivityIcon(activity.type)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-medium text-foreground">{activity.action}</h4>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getSeverityBadgeStyle(activity.severity)}`}>
                {getSeverityIcon(activity.severity)}
                {activity.severity}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-1 line-clamp-2">{activity.description}</p>
            <p className="text-xs font-medium text-card-foreground">{activity.user}</p>
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
            <FaClock size={10} />
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Recent Administrative Activity</h2>
        <p className="text-muted-foreground">Latest actions and changes in the system</p>
      </div>

      {/* Activity summary - Moved to top */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card
          className={`admin-stat-card admin-stat-card--blue p-4 text-center ${filters.type === 'user' ? 'admin-stat-card--active' : ''}`}
          onClick={() => handleSummaryCardClick('user')}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <FaUsers className="text-blue-500" />
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{data?.summary.userActions || 0}</div>
          </div>
          <div className="text-sm text-muted-foreground">User Actions</div>
        </Card>
        <Card
          className={`admin-stat-card admin-stat-card--emerald p-4 text-center ${filters.type === 'project' ? 'admin-stat-card--active' : ''}`}
          onClick={() => handleSummaryCardClick('project')}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <FaProjectDiagram className="text-emerald-500" />
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{data?.summary.projectChanges || 0}</div>
          </div>
          <div className="text-sm text-muted-foreground">Project Changes</div>
        </Card>
        <Card
          className={`admin-stat-card admin-stat-card--violet p-4 text-center ${filters.type === 'news' ? 'admin-stat-card--active' : ''}`}
          onClick={() => handleSummaryCardClick('news')}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <FaNewspaper className="text-violet-500" />
            <div className="text-lg font-bold text-violet-600 dark:text-violet-400">{data?.summary.contentUpdates || 0}</div>
          </div>
          <div className="text-sm text-muted-foreground">Content Updates</div>
        </Card>
        <Card
          className={`admin-stat-card admin-stat-card--orange p-4 text-center ${filters.type === 'event' ? 'admin-stat-card--active' : ''}`}
          onClick={() => handleSummaryCardClick('event')}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <FaCalendarAlt className="text-orange-500" />
            <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{data?.summary.eventsModified || 0}</div>
          </div>
          <div className="text-sm text-muted-foreground">Events Modified</div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <FaClock className="text-primary" />
              Recent Activities
              {filters.type !== 'all' && (
                <span className="text-sm font-normal text-muted-foreground">
                  (filtered by {filters.type})
                </span>
              )}
            </CardTitle>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {/* Search */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={14} />
                <input
                  type="text"
                  placeholder="Search activities..."
                  className="pl-8 pr-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring w-full sm:w-64"
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                />
              </div>

              {/* Sort */}
              <select
                className="px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-') as [string, 'asc' | 'desc']
                  updateFilter('sortBy', sortBy)
                  updateFilter('sortOrder', sortOrder)
                }}
              >
                <option value="timestamp-desc">Latest First</option>
                <option value="timestamp-asc">Oldest First</option>
                <option value="type-asc">Type A-Z</option>
                <option value="type-desc">Type Z-A</option>
                <option value="severity-desc">High Severity First</option>
                <option value="severity-asc">Low Severity First</option>
              </select>

              {/* Severity Filter */}
              <select
                className="px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                value={filters.severity}
                onChange={(e) => updateFilter('severity', e.target.value)}
              >
                <option value="all">All Severities</option>
                <option value="high">High Only</option>
                <option value="medium">Medium Only</option>
                <option value="low">Low Only</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {data?.activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FaInfoCircle className="mx-auto mb-2" size={24} />
              <p>No activities found matching your filters.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data?.activities.map((activity) => (
                <ActivityItemComponent
                  key={activity.id}
                  activity={activity}
                  onClick={() => handleActivityClick(activity)}
                />
              ))}
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
