"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FormModal, ConfirmModal, AlertModal } from '@/components/modals/ModalVariants'
import { UniversalModal } from '@/components/modals/UniversalModal'
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Building2,
  Loader2
} from 'lucide-react'

interface Project {
  id: number
  name: string
  legal_status: string
  sector: string
  maturity: string
  address: string
  phone: string
  email: string
  description: string
  created_at: string
  viewsCount: number
  likesCount: number
  bookmarksCount: number
  followersCount: number
}

interface ProjectFormData {
  name: string
  legal_status: string
  sector: string
  maturity: string
  address: string
  phone: string
  email: string
  description: string
}

const LEGAL_STATUSES = [
  'LLC', 'SAS', 'SA', 'Partnership', 'Civil Company', 'Sole Proprietorship', 'Association', 'Other'
]

const SECTORS = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce', 'Gaming',
  'Food & Agriculture', 'Energy', 'Transportation', 'Real Estate', 'Media', 'Other'
]

const MATURITIES = [
  'Idea', 'Prototype', 'MVP', 'Early Stage', 'Growth', 'Mature', 'Scale-up'
]

export default function ProjectsCrudSection() {
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSector, setSelectedSector] = useState<string>('')
  const [selectedMaturity, setSelectedMaturity] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [deletingProject, setDeletingProject] = useState<Project | null>(null)
  const [viewingProject, setViewingProject] = useState<Project | null>(null)
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    type: 'info' | 'success' | 'warning' | 'error'
  }>({ isOpen: false, title: '', message: '', type: 'info' })
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    legal_status: '',
    sector: '',
    maturity: '',
    address: '',
    phone: '',
    email: '',
    description: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    let filtered = projects

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedSector) {
      filtered = filtered.filter(project => project.sector === selectedSector)
    }

    if (selectedMaturity) {
      filtered = filtered.filter(project => project.maturity === selectedMaturity)
    }

    setFilteredProjects(filtered)
  }, [projects, searchTerm, selectedSector, selectedMaturity])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/startups')
      const data = await response.json()

      if (data.success) {
        setProjects(data.data)
      } else {
        console.error('Error fetching projects:', data.error)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = () => {
    setEditingProject(null)
    setFormData({
      name: '',
      legal_status: '',
      sector: '',
      maturity: '',
      address: '',
      phone: '',
      email: '',
      description: ''
    })
    setIsModalOpen(true)
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setFormData({
      name: project.name,
      legal_status: project.legal_status,
      sector: project.sector,
      maturity: project.maturity,
      address: project.address,
      phone: project.phone,
      email: project.email,
      description: project.description
    })
    setIsModalOpen(true)
  }

  const handleDeleteProject = async (project: Project) => {
    setDeletingProject(project)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingProject) return

    try {
      const response = await fetch(`/api/startups/${deletingProject.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setProjects(projects.filter(p => p.id !== deletingProject.id))
        setIsDeleteModalOpen(false)
        setDeletingProject(null)
        setAlertModal({
          isOpen: true,
          title: 'Success',
          message: 'Project deleted successfully!',
          type: 'success'
        })
      } else {
        setAlertModal({
          isOpen: true,
          title: 'Error',
          message: 'Error during deletion',
          type: 'error'
        })
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      setAlertModal({
        isOpen: true,
        title: 'Error',
        message: 'Error during deletion',
        type: 'error'
      })
    }
  }

  const handleViewProject = (project: Project) => {
    setViewingProject(project)
    setIsViewModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = editingProject ? `/api/startups/${editingProject.id}` : '/api/startups'
      const method = editingProject ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        await fetchProjects() // Reload list
        setIsModalOpen(false)
        setAlertModal({
          isOpen: true,
          title: 'Success',
          message: `Project ${editingProject ? 'updated' : 'created'} successfully!`,
          type: 'success'
        })
      } else {
        setAlertModal({
          isOpen: true,
          title: 'Error',
          message: `Error: ${data.error}`,
          type: 'error'
        })
      }
    } catch (error) {
      console.error('Error saving project:', error)
      setAlertModal({
        isOpen: true,
        title: 'Error',
        message: 'Error during save',
        type: 'error'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US')
  }

  const getMaturityColor = (maturity: string) => {
    const colors = {
      'Idea': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
      'Prototype': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'MVP': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Early Stage': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'Growth': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Mature': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Scale-up': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
    }
    return colors[maturity as keyof typeof colors] || colors['Idea']
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading projects...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Project Management</h2>
          <p className="text-muted-foreground">Manage startups and projects on your platform</p>
        </div>
        <Button onClick={handleCreateProject} className="flex items-center gap-2">
          <Plus size={16} />
            New Project
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                type="text"
                placeholder="Search by name, description, or email..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={selectedSector}
              onValueChange={setSelectedSector}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All sectors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All sectors</SelectItem>
                {SECTORS.map(sector => (
                  <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedMaturity}
              onValueChange={setSelectedMaturity}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All maturities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All maturities</SelectItem>
                {MATURITIES.map(maturity => (
                  <SelectItem key={maturity} value={maturity}>{maturity}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 size={20} />
            Projects ({filteredProjects.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProjects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No projects found
            </div>
          ) : (
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
                {filteredProjects.map((project) => (
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
                          onClick={() => handleViewProject(project)}
                        >
                          <Eye size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditProject(project)}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteProject(project)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        title={editingProject ? 'Edit Project' : 'New Project'}
        loading={isSubmitting}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <Input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <Input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Legal status *</label>
              <Select
                value={formData.legal_status}
                onValueChange={(value) => setFormData({ ...formData, legal_status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select legal status" />
                </SelectTrigger>
                <SelectContent>
                  {LEGAL_STATUSES.map(status => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Sector *</label>
              <Select
                value={formData.sector}
                onValueChange={(value) => setFormData({ ...formData, sector: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sector" />
                </SelectTrigger>
                <SelectContent>
                  {SECTORS.map(sector => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Maturity *</label>
              <Select
                value={formData.maturity}
                onValueChange={(value) => setFormData({ ...formData, maturity: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select maturity" />
                </SelectTrigger>
                <SelectContent>
                  {MATURITIES.map(maturity => (
                    <SelectItem key={maturity} value={maturity}>
                      {maturity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Address *</label>
            <Input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description *</label>
            <textarea
              required
              rows={4}
              className="w-full px-3 py-2 border border-input bg-background rounded-md resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>
      </FormModal>

      {/* View Modal */}
      {viewingProject && (
        <UniversalModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Project Details"
          size="auto"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">Name</label>
                <p className="text-sm font-medium">{viewingProject.name}</p>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</label>
                <p className="text-sm break-all">{viewingProject.email}</p>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">Sector</label>
                <p className="text-sm">{viewingProject.sector}</p>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">Maturity</label>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getMaturityColor(viewingProject.maturity)}`}>
                  {viewingProject.maturity}
                </span>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">Legal Status</label>
                <p className="text-sm">{viewingProject.legal_status}</p>
              </div>
              {viewingProject.phone && (
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">Phone</label>
                  <p className="text-sm">{viewingProject.phone}</p>
                </div>
              )}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">Created</label>
                <p className="text-sm">{formatDate(viewingProject.created_at)}</p>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">Views</label>
                <p className="text-sm font-medium text-green-600">{viewingProject.viewsCount}</p>
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">Address</label>
              <p className="text-sm">{viewingProject.address}</p>
            </div>
            {viewingProject.description && (
              <div className="space-y-1">
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">Description</label>
                <div className="max-h-40 overflow-y-auto">
                  <p className="text-sm leading-relaxed">{viewingProject.description}</p>
                </div>
              </div>
            )}
          </div>
        </UniversalModal>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${deletingProject?.name}"? This action cannot be undone.`}
        variant="destructive"
        loading={isSubmitting}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  )
}
