import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface Activity {
  id: string
  type: 'user' | 'project' | 'news' | 'event'
  action: string
  description: string
  user: string
  timestamp: string
  severity: 'low' | 'medium' | 'high'
}

type RecentUser = {
  id: number
  name: string
  email: string
  role: string
  created_at: Date
}

type RecentStartup = {
  id: number
  name: string
  sector: string
  created_at: Date
  founders: ({ user: { name: string } | null } & { id: number; startup_id: number; user_id: number | null })[]
}

type RecentNews = {
  id: number
  title: string
  created_at: Date
  startup: { name: string }
}

type RecentEvent = {
  id: number
  name: string
  event_type: string | null
  dates: Date | null
  created_at: Date
}

export async function GET() {
  try {
    const activities: Activity[] = []

    const recentUsers = await prisma.s_USER.findMany({
      take: 3,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true
      }
    })

    recentUsers.forEach((user: RecentUser) => {
      activities.push({
        id: `user-${user.id}`,
        type: 'user',
        action: user.role === 'admin' ? 'Admin Account Created' : 'User Registered',
        description: `New ${user.role.toLowerCase()} account created for ${user.name}`,
        user: user.email,
        timestamp: user.created_at.toISOString(),
        severity: user.role === 'admin' ? 'high' : 'medium'
      })
    })

    const recentStartups = await prisma.s_STARTUP.findMany({
      take: 3,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        name: true,
        sector: true,
        created_at: true,
        founders: {
          include: {
            user: {
              select: { name: true }
            }
          }
        }
      }
    })

    recentStartups.forEach((startup: RecentStartup) => {
      activities.push({
        id: `project-${startup.id}`,
        type: 'project',
        action: 'Startup Registered',
        description: `New ${startup.sector} startup "${startup.name}" registered on platform`,
        user: startup.founders[0]?.user?.name || startup.name,
        timestamp: startup.created_at.toISOString(),
        severity: 'medium'
      })
    })

    const recentNews = await prisma.s_NEWS.findMany({
      take: 3,
      orderBy: { created_at: 'desc' },
      include: {
        startup: {
          select: { name: true }
        }
      }
    })

    recentNews.forEach((news: RecentNews) => {
      activities.push({
        id: `news-${news.id}`,
        type: 'news',
        action: 'Article Published',
        description: `New article "${news.title}" published`,
        user: news.startup.name,
        timestamp: news.created_at.toISOString(),
        severity: 'low'
      })
    })

    const recentEvents = await prisma.s_EVENT.findMany({
      take: 3,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        name: true,
        event_type: true,
        dates: true,
        created_at: true
      }
    })

    recentEvents.forEach((event: RecentEvent) => {
      activities.push({
        id: `event-${event.id}`,
        type: 'event',
        action: 'Event Created',
        description: `New ${event.event_type || 'event'} "${event.name}" scheduled`,
        user: 'Event Manager',
        timestamp: event.created_at.toISOString(),
        severity: 'medium'
      })
    })

    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    const summary = {
      userActions: await prisma.s_USER.count({
        where: {
          created_at: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      projectChanges: await prisma.s_STARTUP.count({
        where: {
          created_at: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      contentUpdates: await prisma.s_NEWS.count({
        where: {
          created_at: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      eventsModified: await prisma.s_EVENT.count({
        where: {
          created_at: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      })
    }

    return NextResponse.json({
      activities: activities.slice(0, 10),
      summary
    })

  } catch (error) {
    console.error('Error fetching recent activities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recent activities' },
      { status: 500 }
    )
  }
}