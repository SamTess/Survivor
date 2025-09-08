import { useState, useEffect } from 'react'
import type { Project } from './types.ts'

export const useProjectsData = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/startups')
      const data = await response.json()

      if (data.success) {
        setProjects(data.data)
      } else {
        setError(data.error || 'Failed to fetch projects')
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Error fetching projects:', err)
    } finally {
      setLoading(false)
    }
  }

  const createProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'viewsCount' | 'likesCount' | 'bookmarksCount' | 'followersCount'>) => {
    const response = await fetch('/api/startups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData)
    })
    const data = await response.json()

    if (data.success) {
      await fetchProjects() // Refresh the list
      return { success: true }
    }
    return { success: false, error: data.error }
  }

  const updateProject = async (id: number, projectData: Partial<Project>) => {
    const response = await fetch(`/api/startups/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData)
    })
    const data = await response.json()

    if (data.success) {
      await fetchProjects() // Refresh the list
      return { success: true }
    }
    return { success: false, error: data.error }
  }

  const deleteProject = async (id: number) => {
    const response = await fetch(`/api/startups/${id}`, {
      method: 'DELETE'
    })

    if (response.ok) {
      setProjects(prev => prev.filter(p => p.id !== id))
      return { success: true }
    }
    return { success: false, error: 'Failed to delete project' }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  return {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject
  }
}
