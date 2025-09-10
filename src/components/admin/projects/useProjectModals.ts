import { useState } from 'react'
import type { Project, AlertState } from './types'

export const useProjectModals = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [deletingProject, setDeletingProject] = useState<Project | null>(null)
  const [viewingProject, setViewingProject] = useState<Project | null>(null)

  const [alertModal, setAlertModal] = useState<AlertState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  })

  const openCreateModal = () => {
    setEditingProject(null)
    setIsCreateModalOpen(true)
  }

  const openEditModal = (project: Project) => {
    setEditingProject(project)
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (project: Project) => {
    setDeletingProject(project)
    setIsDeleteModalOpen(true)
  }

  const openViewModal = (project: Project) => {
    setViewingProject(project)
    setIsViewModalOpen(true)
  }

  const closeAllModals = () => {
    setIsCreateModalOpen(false)
    setIsEditModalOpen(false)
    setIsDeleteModalOpen(false)
    setIsViewModalOpen(false)
    setEditingProject(null)
    setDeletingProject(null)
    setViewingProject(null)
  }

  const showAlert = (title: string, message: string, type: AlertState['type'] = 'info') => {
    setAlertModal({ isOpen: true, title, message, type })
  }

  const closeAlert = () => {
    setAlertModal(prev => ({ ...prev, isOpen: false }))
  }

  return {
    // Modal states
    isCreateModalOpen,
    isEditModalOpen,
    isDeleteModalOpen,
    isViewModalOpen,

    // Current items
    editingProject,
    deletingProject,
    viewingProject,

    // Alert state
    alertModal,

    // Actions
    openCreateModal,
    openEditModal,
    openDeleteModal,
    openViewModal,
    closeAllModals,
    showAlert,
    closeAlert
  }
}