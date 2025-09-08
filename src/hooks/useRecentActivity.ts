"use client"

import { useState, useEffect, useMemo } from 'react'

export interface ActivityItem {
  id: string
  type: 'user' | 'project' | 'news' | 'event'
  action: string
  description: string
  user: string
  timestamp: string
  severity: 'low' | 'medium' | 'high'
}

export interface ActivitySummary {
  userActions: number
  projectChanges: number
  contentUpdates: number
  eventsModified: number
}

export interface ActivityData {
  activities: ActivityItem[]
  summary: ActivitySummary
}

export interface ActivityFilters {
  type: 'all' | 'user' | 'project' | 'news' | 'event'
  severity: 'all' | 'low' | 'medium' | 'high'
  search: string
  sortBy: 'timestamp' | 'type' | 'severity'
  sortOrder: 'asc' | 'desc'
}

export function useRecentActivity() {
  const [rawData, setRawData] = useState<ActivityData | null>(null)
  const [filters, setFilters] = useState<ActivityFilters>({
    type: 'all',
    severity: 'all',
    search: '',
    sortBy: 'timestamp',
    sortOrder: 'desc'
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch from real API endpoint
        const response = await fetch('/api/admin/recent-activities')

        if (!response.ok) {
          throw new Error('Failed to fetch recent activities')
        }

        const data: ActivityData = await response.json()
        setRawData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load activity data')
      } finally {
        setLoading(false)
      }
    }

    fetchActivityData()
  }, [])

  // Filter and sort activities based on current filters
  const filteredData = useMemo(() => {
    if (!rawData) return null

    let filteredActivities = rawData.activities

    // Apply type filter
    if (filters.type !== 'all') {
      filteredActivities = filteredActivities.filter(activity => activity.type === filters.type)
    }

    // Apply severity filter
    if (filters.severity !== 'all') {
      filteredActivities = filteredActivities.filter(activity => activity.severity === filters.severity)
    }

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filteredActivities = filteredActivities.filter(activity =>
        activity.action.toLowerCase().includes(searchLower) ||
        activity.description.toLowerCase().includes(searchLower) ||
        activity.user.toLowerCase().includes(searchLower)
      )
    }

    // Apply sorting
    filteredActivities.sort((a, b) => {
      let comparison = 0

      switch (filters.sortBy) {
        case 'timestamp':
          comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          break
        case 'type':
          comparison = a.type.localeCompare(b.type)
          break
        case 'severity':
          const severityOrder = { low: 1, medium: 2, high: 3 }
          comparison = severityOrder[a.severity] - severityOrder[b.severity]
          break
      }

      return filters.sortOrder === 'desc' ? -comparison : comparison
    })

    return {
      ...rawData,
      activities: filteredActivities
    }
  }, [rawData, filters])

  return {
    data: filteredData,
    loading,
    error,
    filters,
    setFilters,
    updateFilter: (key: keyof ActivityFilters, value: string | boolean) => {
      setFilters(prev => ({ ...prev, [key]: value }))
    }
  }
}