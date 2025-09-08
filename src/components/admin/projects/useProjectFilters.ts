import { useState, useMemo } from 'react'
import type { Project, FilterState } from './types'

export const useProjectFilters = (projects: Project[]) => {
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    selectedSector: '',
    selectedMaturity: ''
  })

  const filteredProjects = useMemo(() => {
    let filtered = projects

    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchLower) ||
        project.description.toLowerCase().includes(searchLower) ||
        project.email.toLowerCase().includes(searchLower)
      )
    }

    if (filters.selectedSector) {
      filtered = filtered.filter(project => project.sector === filters.selectedSector)
    }

    if (filters.selectedMaturity) {
      filtered = filtered.filter(project => project.maturity === filters.selectedMaturity)
    }

    return filtered
  }, [projects, filters])

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      selectedSector: '',
      selectedMaturity: ''
    })
  }

  return {
    filters,
    filteredProjects,
    updateFilter,
    clearFilters
  }
}
