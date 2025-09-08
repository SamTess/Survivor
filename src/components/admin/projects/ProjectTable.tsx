import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Eye, Edit, Trash2 } from 'lucide-react'
import { getMaturityColor } from './constants'
import type { Project } from './types'

interface ProjectTableProps {
  projects: Project[]
  onView: (project: Project) => void
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
}

export const ProjectTable: React.FC<ProjectTableProps> = ({
  projects,
  onView,
  onEdit,
  onDelete
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US')
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No projects found
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Sector</TableHead>
          <TableHead>Maturity</TableHead>
          <TableHead>Legal status</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Created on</TableHead>
          <TableHead>Views</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((project) => (
          <TableRow key={project.id}>
            <TableCell className="font-medium">{project.name}</TableCell>
            <TableCell>{project.sector}</TableCell>
            <TableCell>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMaturityColor(project.maturity)}`}>
                {project.maturity}
              </span>
            </TableCell>
            <TableCell>{project.legal_status}</TableCell>
            <TableCell>{project.email}</TableCell>
            <TableCell>{formatDate(project.created_at)}</TableCell>
            <TableCell>{project.viewsCount}</TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(project)}
                >
                  <Eye size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(project)}
                >
                  <Edit size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => onDelete(project)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
