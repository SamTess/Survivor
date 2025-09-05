"use client"

import React from 'react'
import { UniversalModal } from '@/components/modals/UniversalModal'
import { FaUsers, FaProjectDiagram, FaNewspaper, FaCalendarAlt, FaClock, FaEye, FaMapMarkerAlt, FaArrowUp, FaCrown } from 'react-icons/fa'
import { useStatsDetails, UserDetail, ProjectDetail, NewsDetail, EventDetail } from '@/hooks/useStatsDetails'

interface StatsDetailModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'users' | 'projects' | 'news' | 'events' | null
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

const getStatusBadge = (status: string, type: string) => {
  const baseClasses = "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"

  if (type === 'user') {
    switch (status) {
      case 'active':
        return `${baseClasses} bg-green-100 dark:bg-green-800/60 text-green-800 dark:text-green-200`
      case 'inactive':
        return `${baseClasses} bg-gray-100 dark:bg-gray-800/60 text-gray-800 dark:text-gray-200`
      case 'pending':
        return `${baseClasses} bg-yellow-100 dark:bg-yellow-800/60 text-yellow-800 dark:text-yellow-200`
    }
  }

  if (type === 'project') {
    switch (status) {
      case 'active':
        return `${baseClasses} bg-blue-100 dark:bg-blue-800/60 text-blue-800 dark:text-blue-200`
      case 'pending':
        return `${baseClasses} bg-yellow-100 dark:bg-yellow-800/60 text-yellow-800 dark:text-yellow-200`
      case 'approved':
        return `${baseClasses} bg-green-100 dark:bg-green-800/60 text-green-800 dark:text-green-200`
      case 'rejected':
        return `${baseClasses} bg-red-100 dark:bg-red-800/60 text-red-800 dark:text-red-200`
    }
  }

  return `${baseClasses} bg-gray-100 dark:bg-gray-800/60 text-gray-800 dark:text-gray-200`
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'Entrepreneur':
      return <FaProjectDiagram className="text-blue-500" size={14} />
    case 'Investor':
      return <FaCrown className="text-yellow-500" size={14} />
    case 'Mentor':
      return <FaUsers className="text-green-500" size={14} />
    default:
      return <FaUsers className="text-gray-500" size={14} />
  }
}

function UsersContent({ users }: { users: UserDetail[] }) {
  return (
    <div className="space-y-4">
      <div className="bg-muted/30 p-4 rounded-lg">
        <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
          <FaArrowUp className="text-green-500" />
          Recent Registrations
        </h4>
        <p className="text-sm text-muted-foreground">Latest users who joined the platform</p>
      </div>

      <div className="space-y-3">
        {users.map((user) => (
          <div key={user.id} className="border border-border rounded-lg p-4 hover:bg-muted/20 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {getRoleIcon(user.role)}
                  <span className="font-medium text-foreground">{user.name}</span>
                </div>
                <span className={getStatusBadge(user.status, 'user')}>
                  {user.status}
                </span>
              </div>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <FaClock size={10} />
                {getTimeAgo(user.registrationDate)}
              </span>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>{user.email}</div>
              <div className="flex items-center gap-3">
                <span>Role: {user.role}</span>
                <span>Last active: {getTimeAgo(user.lastActivity)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProjectsContent({ projects }: { projects: ProjectDetail[] }) {
  return (
    <div className="space-y-4">
      <div className="bg-muted/30 p-4 rounded-lg">
        <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
          <FaProjectDiagram className="text-emerald-500" />
          Active Projects
        </h4>
        <p className="text-sm text-muted-foreground">Latest startup projects on the platform</p>
      </div>

      <div className="space-y-3">
        {projects.map((project) => (
          <div key={project.id} className="border border-border rounded-lg p-4 hover:bg-muted/20 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-foreground">{project.name}</span>
                  <span className={getStatusBadge(project.status, 'project')}>
                    {project.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <div className="flex items-center gap-4">
                <span>Founder: {project.founder}</span>
                <span>Category: {project.category}</span>
              </div>
              <div className="flex items-center gap-4">
                <span>Created: {getTimeAgo(project.createdDate)}</span>
                {project.funding > 0 && (
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    Funding: ${project.funding.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function NewsContent({ news }: { news: NewsDetail[] }) {
  return (
    <div className="space-y-4">
      <div className="bg-muted/30 p-4 rounded-lg">
        <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
          <FaNewspaper className="text-violet-500" />
          Recent Articles
        </h4>
        <p className="text-sm text-muted-foreground">Latest news and content performance</p>
      </div>

      <div className="space-y-3">
        {news.map((article) => (
          <div key={article.id} className="border border-border rounded-lg p-4 hover:bg-muted/20 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h5 className="font-medium text-foreground mb-1">{article.title}</h5>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>By {article.author}</span>
                  <span>Category: {article.category}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Published: {getTimeAgo(article.publishDate)}</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <FaEye size={12} />
                  {article.views.toLocaleString()} views
                </span>
                <span className={getStatusBadge(article.status, 'news')}>
                  {article.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function EventsContent({ events }: { events: EventDetail[] }) {
  return (
    <div className="space-y-4">
      <div className="bg-muted/30 p-4 rounded-lg">
        <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
          <FaCalendarAlt className="text-orange-500" />
          Upcoming Events
        </h4>
        <p className="text-sm text-muted-foreground">Events scheduled and participant tracking</p>
      </div>

      <div className="space-y-3">
        {events.map((event) => (
          <div key={event.id} className="border border-border rounded-lg p-4 hover:bg-muted/20 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h5 className="font-medium text-foreground">{event.title}</h5>
                  <span className={getStatusBadge(event.status, 'event')}>
                    {event.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FaMapMarkerAlt size={12} />
                    {event.location}
                  </span>
                  <span>Type: {event.type}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Date: {new Date(event.date).toLocaleDateString()}</span>
              <div className="flex items-center gap-1">
                <FaUsers size={12} />
                <span>{event.participants} participants</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function StatsDetailModal({ isOpen, onClose, type }: StatsDetailModalProps) {
  const { data, loading, error } = useStatsDetails()

  const getModalConfig = () => {
    switch (type) {
      case 'users':
        return {
          title: 'User Statistics',
          icon: <FaUsers className="text-blue-500" />,
          content: data ? <UsersContent users={data.recentUsers} /> : null
        }
      case 'projects':
        return {
          title: 'Project Statistics',
          icon: <FaProjectDiagram className="text-emerald-500" />,
          content: data ? <ProjectsContent projects={data.recentProjects} /> : null
        }
      case 'news':
        return {
          title: 'Content Statistics',
          icon: <FaNewspaper className="text-violet-500" />,
          content: data ? <NewsContent news={data.recentNews} /> : null
        }
      case 'events':
        return {
          title: 'Events Statistics',
          icon: <FaCalendarAlt className="text-orange-500" />,
          content: data ? <EventsContent events={data.upcomingEvents} /> : null
        }
      default:
        return { title: 'Statistics', icon: null, content: null }
    }
  }

  const config = getModalConfig()

  if (loading) {
    return (
      <UniversalModal
        isOpen={isOpen}
        onClose={onClose}
        title="Loading Statistics..."
        size="lg"
      >
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </UniversalModal>
    )
  }

  if (error) {
    return (
      <UniversalModal
        isOpen={isOpen}
        onClose={onClose}
        title="Error"
        size="md"
        actions={[{ label: "Close", onClick: onClose }]}
      >
        <div className="text-center py-4 text-destructive">
          Error loading statistics: {error}
        </div>
      </UniversalModal>
    )
  }

  return (
    <UniversalModal
      isOpen={isOpen}
      onClose={onClose}
      title={config.title}
      size="xl"
      actions={[
        { label: "Close", onClick: onClose, variant: "secondary" }
      ]}
    >
      {config.content}
    </UniversalModal>
  )
}
