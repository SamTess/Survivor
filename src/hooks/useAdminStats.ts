"use client"

import { useState, useEffect } from 'react'

interface AdminStats {
  totalUsers: {
    value: number
    trend: string
    description: string
  }
  activeProjects: {
    value: number
    trend: string
    description: string
  }
  newsArticles: {
    value: number
    trend: string
    description: string
  }
  upcomingEvents: {
    value: number
    trend: string
    description: string
  }
}

interface UseAdminStatsReturn {
  stats: AdminStats | null
  loading: boolean
  error: string | null
  refreshStats: () => Promise<void>
}

export function useAdminStats(): UseAdminStatsReturn {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/admin/stats')
      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch admin statistics')
      }

      setStats(result.data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('Error fetching admin stats:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return {
    stats,
    loading,
    error,
    refreshStats: fetchStats
  }
}
