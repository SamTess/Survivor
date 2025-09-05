"use client"

import React from 'react'
import { FaUsers, FaProjectDiagram, FaNewspaper, FaCalendarAlt, FaClock, FaExclamationTriangle, FaCheckCircle, FaInfoCircle } from 'react-icons/fa'
import { UniversalModal } from '@/components/modals/UniversalModal'
import { ActivityItem } from '@/hooks/useRecentActivity'

interface ActivityDetailModalProps {
  activity: ActivityItem | null
  isOpen: boolean
  onClose: () => void
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'user':
      return <FaUsers className="text-blue-500" size={24} />
    case 'project':
      return <FaProjectDiagram className="text-emerald-500" size={24} />
    case 'news':
      return <FaNewspaper className="text-violet-500" size={24} />
    case 'event':
      return <FaCalendarAlt className="text-orange-500" size={24} />
    default:
      return <FaInfoCircle className="text-muted-foreground" size={24} />
  }
}

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'high':
      return <FaExclamationTriangle className="text-red-500" size={16} />
    case 'medium':
      return <FaInfoCircle className="text-yellow-500" size={16} />
    case 'low':
      return <FaCheckCircle className="text-green-500" size={16} />
    default:
      return <FaInfoCircle className="text-muted-foreground" size={16} />
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

export default function ActivityDetailModal({ activity, isOpen, onClose }: ActivityDetailModalProps) {
  if (!activity) return null

  const timeAgo = getTimeAgo(activity.timestamp)
  const fullDate = new Date(activity.timestamp).toLocaleString()

  return (
    <UniversalModal
      isOpen={isOpen}
      onClose={onClose}
      title="Activity Details"
      size="md"
      actions={[
        {
          label: "Close",
          onClick: onClose,
          variant: "default"
        }
      ]}
    >
      <div className="space-y-6">
        {/* Activity Header */}
        <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
          {getActivityIcon(activity.type)}
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-lg">{activity.action}</h3>
            <p className="text-sm text-muted-foreground">{activity.description}</p>
          </div>
        </div>

        {/* Activity Details */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-card-foreground block mb-1">Severity</span>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getSeverityBadgeStyle(activity.severity)}`}>
                  {getSeverityIcon(activity.severity)}
                  {activity.severity}
                </span>
              </div>

              <div>
                <span className="text-sm font-medium text-card-foreground block mb-1">Type</span>
                <span className="text-sm text-muted-foreground capitalize bg-muted/50 px-3 py-1 rounded-lg">
                  {activity.type}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-card-foreground block mb-1">User/Entity</span>
                <span className="text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-lg block">
                  {activity.user}
                </span>
              </div>

              <div>
                <span className="text-sm font-medium text-card-foreground block mb-1">Time</span>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground flex items-center gap-2 bg-muted/50 px-3 py-1 rounded-lg">
                    <FaClock size={12} />
                    {timeAgo}
                  </span>
                  <div className="text-xs text-muted-foreground px-3">
                    {fullDate}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="border-t border-border pt-4">
          <div className="text-xs text-muted-foreground space-y-1">
            <div><strong>Activity ID:</strong> {activity.id}</div>
            <div><strong>Category:</strong> Administrative Activity</div>
          </div>
        </div>
      </div>
    </UniversalModal>
  )
}