"use client"

import { useState, useEffect } from 'react'

export interface UserDetail {
  id: number
  email: string
  name: string
  registrationDate: string
  lastActivity: string
  role: string
  status: 'active' | 'inactive' | 'pending'
}

export interface ProjectDetail {
  id: number
  name: string
  description: string
  status: 'active' | 'pending' | 'approved' | 'rejected'
  createdDate: string
  founder: string
  category: string
  funding: number
}

export interface NewsDetail {
  id: number
  title: string
  publishDate: string
  author: string
  views: number
  status: 'published' | 'draft' | 'archived'
  category: string
}

export interface EventDetail {
  id: number
  title: string
  date: string
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  participants: number
  type: string
  location: string
}

export interface StatsDetailData {
  recentUsers: UserDetail[]
  recentProjects: ProjectDetail[]
  recentNews: NewsDetail[]
  upcomingEvents: EventDetail[]
  userGrowthChart: { month: string; users: number; growth: number }[]
  projectsDistribution: { status: string; count: number; percentage: number }[]
  newsPerformance: { title: string; views: number; engagement: number }[]
  eventsStats: { type: string; count: number; avgParticipants: number }[]
}

export function useStatsDetails() {
  const [data, setData] = useState<StatsDetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStatsDetails = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/admin/stats-details')
        if (!response.ok) {
          throw new Error('Failed to fetch statistics details')
        }

        const data = await response.json()
        setData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load activity data')
      } finally {
        setLoading(false)
      }
    }

    fetchStatsDetails()
  }, [])

  return { data, loading, error }
}
