import React from 'react'
import { getMaturityColor } from './constants'
import type { Project } from './types'

interface ProjectViewProps {
  project: Project
}

export const ProjectView: React.FC<ProjectViewProps> = ({ project }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US')
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">Name</label>
          <p className="text-sm font-medium">{project.name}</p>
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</label>
          <p className="text-sm break-all">{project.email}</p>
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">Sector</label>
          <p className="text-sm">{project.sector}</p>
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">Maturity</label>
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getMaturityColor(project.maturity)}`}>
            {project.maturity}
          </span>
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">Legal Status</label>
          <p className="text-sm">{project.legal_status}</p>
        </div>
        {project.phone && (
          <div className="space-y-1">
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">Phone</label>
            <p className="text-sm">{project.phone}</p>
          </div>
        )}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">Created</label>
          <p className="text-sm">{formatDate(project.created_at)}</p>
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">Views</label>
          <p className="text-sm font-medium text-green-600">{project.viewsCount}</p>
        </div>
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">Address</label>
        <p className="text-sm">{project.address}</p>
      </div>
      {project.description && (
        <div className="space-y-1">
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">Description</label>
          <div className="max-h-40 overflow-y-auto">
            <p className="text-sm leading-relaxed">{project.description}</p>
          </div>
        </div>
      )}
    </div>
  )
}
