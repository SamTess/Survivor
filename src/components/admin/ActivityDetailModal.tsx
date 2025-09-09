"use client"

import React from 'react'
import { UniversalModal } from '@/components/modals/UniversalModal'
import { FaUsers, FaProjectDiagram, FaNewspaper, FaCalendarAlt, FaExclamationTriangle, FaCheckCircle, FaInfoCircle } from 'react-icons/fa'
import { ActivityItem } from '@/hooks/useRecentActivity'

interface ActivityDetailModalProps {
  activity: ActivityItem | null
  isOpen: boolean
  onClose: () => void
}

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
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  return new Date(timestamp).toLocaleDateString()
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'user':
      return <FaUsers className="text-blue-700 dark:text-blue-300" size={20} />
    case 'project':
      return <FaProjectDiagram className="text-emerald-700 dark:text-emerald-300" size={20} />
    case 'news':
      return <FaNewspaper className="text-violet-700 dark:text-violet-300" size={20} />
    case 'event':
      return <FaCalendarAlt className="text-orange-700 dark:text-orange-300" size={20} />
    default:
      return <FaInfoCircle className="text-slate-600 dark:text-slate-300" size={20} />
  }
}

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'high':
      return <FaExclamationTriangle className="text-red-700 dark:text-red-300" size={16} />
    case 'medium':
      return <FaInfoCircle className="text-yellow-700 dark:text-yellow-300" size={16} />
    case 'low':
      return <FaCheckCircle className="text-green-700 dark:text-green-300" size={16} />
    default:
      return <FaInfoCircle className="text-slate-600 dark:text-slate-300" size={16} />
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

export default function ActivityDetailModal({ activity, isOpen, onClose }: ActivityDetailModalProps) {
  if (!activity) return null

  const timeAgo = getTimeAgo(activity.timestamp)
  const fullDateTime = new Date(activity.timestamp).toLocaleString()

  return (
    <UniversalModal
      isOpen={isOpen}
      onClose={onClose}
      title="Activity Details"
      size="md"
      actions={[
        { label: "Close", onClick: onClose, variant: "secondary" }
      ]}
    >
      <div className="space-y-6">
        {/* Activity Header */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-1">
            {getActivityIcon(activity.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-foreground">{activity.action}</h3>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getSeverityBadgeStyle(activity.severity)}`}>
                {getSeverityIcon(activity.severity)}
                {activity.severity}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{activity.description}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FaUsers size={12} />
              <span>Performed by: <span className="font-medium text-foreground">{activity.user}</span></span>
            </div>
          </div>
        </div>

        {/* Activity Details */}
        <div className="border-t border-border pt-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Type</span>
              <div className="flex items-center gap-2">
                {getActivityIcon(activity.type)}
                <span className="text-sm text-foreground capitalize">{activity.type}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Severity</span>
              <div className="flex items-center gap-2">
                {getSeverityIcon(activity.severity)}
                <span className="text-sm text-foreground capitalize">{activity.severity}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Time</span>
              <div className="text-right">
                <div className="text-sm text-foreground">{timeAgo}</div>
                <div className="text-xs text-muted-foreground">{fullDateTime}</div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Activity ID</span>
              <span className="text-sm text-foreground font-mono">{activity.id}</span>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-muted/30 p-4 rounded-lg">
          <h4 className="font-semibold text-foreground mb-2">Activity Summary</h4>
          <p className="text-sm text-muted-foreground">
            This activity was recorded on {new Date(activity.timestamp).toLocaleDateString()} at {new Date(activity.timestamp).toLocaleTimeString()}.
            It involves a {activity.type} action with {activity.severity} severity level.
          </p>
        </div>
      </div>
    </UniversalModal>
  )
}
