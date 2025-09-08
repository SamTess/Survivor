"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FormModal, ConfirmModal, AlertModal } from '@/components/modals/ModalVariants'
import { UniversalModal } from '@/components/modals/UniversalModal'
import { Plus, Building2, Loader2 } from 'lucide-react'

// Hooks personnalisés
import { useProjectsData } from './useProjectsData'
import { useProjectFilters } from './useProjectFilters'
import { useProjectModals } from './useProjectModals'

// Composants
import { ProjectForm } from './ProjectForm'
import { ProjectView } from './ProjectView'
import { ProjectFilters } from './ProjectFilters'
import { ProjectTable } from './ProjectTable'

// Types
import type { ProjectFormData, Project } from './types'

export default function ProjectsCrudSection() {
  // États pour le formulaire
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    legal_status: 'LLC' as const,
    sector: 'Technology' as const,
    maturity: 'Idea' as const,
    address: '',
    phone: '',
    email: '',
    description: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Hooks personnalisés
  const { projects, loading, createProject, updateProject, deleteProject } = useProjectsData()
  const { filteredProjects, filters, updateFilter } = useProjectFilters(projects)
  const {
    isCreateModalOpen,
    isEditModalOpen,
    isDeleteModalOpen,
    isViewModalOpen,
    editingProject,
    deletingProject,
    viewingProject,
    alertModal,
    openCreateModal,
    openEditModal,
    openDeleteModal,
    openViewModal,
    closeAllModals,
    showAlert,
    closeAlert
  } = useProjectModals()

  // Gestionnaires d'événements
  const handleCreateProject = () => {
    setFormData({
      name: '',
      legal_status: 'LLC' as const,
      sector: 'Technology' as const,
      maturity: 'Idea' as const,
      address: '',
      phone: '',
      email: '',
      description: ''
    })
    openCreateModal()
  }

  const handleEditProject = (project: Project) => {
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
    openEditModal(project)
  }

  const handleDeleteProject = (project: Project) => {
    openDeleteModal(project)
  }

  const handleViewProject = (project: Project) => {
    openViewModal(project)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = editingProject
        ? await updateProject(editingProject.id, formData)
        : await createProject(formData)

      if (result.success) {
        closeAllModals()
        showAlert('Success', `Project ${editingProject ? 'updated' : 'created'} successfully!`, 'success')
      } else {
        showAlert('Error', result.error || 'An error occurred', 'error')
      }
    } catch (_) { // eslint-disable-line @typescript-eslint/no-unused-vars
      showAlert('Error', 'An unexpected error occurred', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmDelete = async () => {
    if (!deletingProject) return

    try {
      const result = await deleteProject(deletingProject.id)
      if (result.success) {
        closeAllModals()
        showAlert('Success', 'Project deleted successfully!', 'success')
      } else {
        showAlert('Error', result.error || 'Failed to delete project', 'error')
      }
    } catch (_) { // eslint-disable-line @typescript-eslint/no-unused-vars
      showAlert('Error', 'An unexpected error occurred', 'error')
    }
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
          <ProjectFilters filters={filters} onFilterChange={updateFilter} />
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
          <ProjectTable
            projects={filteredProjects}
            onView={handleViewProject}
            onEdit={handleEditProject}
            onDelete={handleDeleteProject}
          />
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <FormModal
        isOpen={isCreateModalOpen || isEditModalOpen}
        onClose={closeAllModals}
        onSubmit={handleSubmit}
        title={editingProject ? 'Edit Project' : 'New Project'}
        loading={isSubmitting}
      >
        <ProjectForm
          formData={formData}
          onChange={setFormData}
        />
      </FormModal>

      {/* View Modal */}
      {viewingProject && (
        <UniversalModal
          isOpen={isViewModalOpen}
          onClose={closeAllModals}
          title="Project Details"
          size="auto"
        >
          <ProjectView project={viewingProject} />
        </UniversalModal>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeAllModals}
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
        onClose={closeAlert}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  )
}
