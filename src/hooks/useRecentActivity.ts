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

        // Simulate API call - replace with actual API endpoint when available
        await new Promise(resolve => setTimeout(resolve, 800))

        // Mock data - replace with actual API call
        const mockData: ActivityData = {
          activities: [
            {
              id: '1',
              type: 'project',
              action: 'Startup Registered',
              description: 'New startup company registered on the platform',
              user: 'TechStart Inc.',
              timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
              severity: 'medium'
            },
            {
              id: '2',
              type: 'user',
              action: 'Role Updated',
              description: 'User role updated to Administrator',
              user: 'john.doe@example.com',
              timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
              severity: 'high'
            },
            {
              id: '3',
              type: 'news',
              action: 'Article Published',
              description: 'New article published in startup news section',
              user: 'Editor Team',
              timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
              severity: 'low'
            },
            {
              id: '4',
              type: 'event',
              action: 'Event Created',
              description: 'New event scheduled: Startup Pitch Day',
              user: 'Event Manager',
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              severity: 'medium'
            },
            {
              id: '5',
              type: 'project',
              action: 'Profile Approved',
              description: 'Startup profile reviewed and approved',
              user: 'GreenTech Solutions',
              timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
              severity: 'medium'
            },
            {
              id: '6',
              type: 'user',
              action: 'Account Suspended',
              description: 'User account suspended for policy violation',
              user: 'spam.user@example.com',
              timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
              severity: 'high'
            },
            {
              id: '7',
              type: 'news',
              action: 'Article Edited',
              description: 'Existing article content updated and republished',
              user: 'Content Team',
              timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
              severity: 'low'
            },
            {
              id: '8',
              type: 'event',
              action: 'Event Cancelled',
              description: 'Workshop event cancelled due to low registration',
              user: 'Event Manager',
              timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
              severity: 'medium'
            }
          ],
          summary: {
            userActions: 24,
            projectChanges: 18,
            contentUpdates: 12,
            eventsModified: 8
          }
        }

        setRawData(mockData)
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
