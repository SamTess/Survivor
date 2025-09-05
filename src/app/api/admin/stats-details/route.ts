import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type UserGrowthRawData = {
  created_at: Date
  _count: { id: number }
}

type ProjectsDistributionRawData = {
  maturity: string
  _count: { id: number }
}

type UserData = {
  id: number
  name: string
  email: string
  role: string
  created_at: Date
  updated_at: Date
  followersCount: number
}

type NewsData = {
  title: string
  viewsCount: number
  likesCount: number
  bookmarksCount: number
}

type EventsStatsData = {
  event_type: string | null
  _count: { id: number }
  _avg: { attendeesCount: number | null }
}

export async function GET() {
  try {
    const recentUsers = await prisma.s_USER.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
        updated_at: true,
        followersCount: true
      }
    })

    const recentProjects = await prisma.s_STARTUP.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      include: {
        founders: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    const recentNews = await prisma.s_NEWS.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      include: {
        startup: {
          select: {
            name: true
          }
        }
      }
    })

    const upcomingEvents = await prisma.s_EVENT.findMany({
      take: 5,
      where: {
        dates: {
          gte: new Date()
        }
      },
      orderBy: { dates: 'asc' }
    })

    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const userGrowthData = await prisma.s_USER.groupBy({
      by: ['created_at'],
      where: {
        created_at: {
          gte: sixMonthsAgo
        }
      },
      _count: {
        id: true
      }
    })

    const projectsDistribution = await prisma.s_STARTUP.groupBy({
      by: ['maturity'],
      _count: {
        id: true
      }
    })

    const newsPerformance = await prisma.s_NEWS.findMany({
      take: 3,
      orderBy: { viewsCount: 'desc' },
      select: {
        title: true,
        viewsCount: true,
        likesCount: true,
        bookmarksCount: true
      }
    })

    const eventsStats = await prisma.s_EVENT.groupBy({
      by: ['event_type'],
      _count: {
        id: true
      },
      _avg: {
        attendeesCount: true
      }
    })

    const processedUserGrowth = processUserGrowthData(userGrowthData)
    const processedProjectsDistribution = processProjectsDistribution(projectsDistribution)
    const processedNewsPerformance = newsPerformance.map((news: NewsData) => ({
      title: news.title,
      views: news.viewsCount,
      engagement: Math.round(((news.likesCount + news.bookmarksCount) / Math.max(news.viewsCount, 1)) * 100)
    }))
    const processedEventsStats = eventsStats.map((stat: EventsStatsData) => ({
      type: stat.event_type || 'Unknown',
      count: stat._count.id,
      avgParticipants: Math.round(stat._avg.attendeesCount || 0)
    }))

    const formattedData = {
      recentUsers: recentUsers.map((user: UserData) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        registrationDate: user.created_at.toISOString(),
        lastActivity: user.updated_at.toISOString(),
        role: user.role,
        status: getUserStatus(user)
      })),
      recentProjects: recentProjects.map((project: any) => ({
        id: project.id,
        name: project.name,
        description: project.description,
        status: mapMaturityToStatus(project.maturity),
        createdDate: project.created_at.toISOString(),
        founder: project.founders[0]?.user?.name || 'Unknown',
        category: project.sector,
        funding: project.funding_amount || 0
      })),
      recentNews: recentNews.map((news: any) => ({
        id: news.id,
        title: news.title,
        publishDate: news.created_at.toISOString(),
        author: news.startup.name,
        views: news.viewsCount,
        status: 'published' as const,
        category: news.category || 'General'
      })),
      upcomingEvents: upcomingEvents.map((event: any) => ({
        id: event.id,
        title: event.name,
        date: event.dates?.toISOString() || new Date().toISOString(),
        status: 'upcoming' as const,
        participants: event.attendeesCount,
        type: event.event_type || 'General',
        location: event.location || 'TBD'
      })),
      userGrowthChart: processedUserGrowth,
      projectsDistribution: processedProjectsDistribution,
      newsPerformance: processedNewsPerformance,
      eventsStats: processedEventsStats
    }

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error('Error fetching stats details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics details' },
      { status: 500 }
    )
  }
}

function processUserGrowthData(rawData: UserGrowthRawData[]) {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthlyData: { [key: string]: number } = {}

  rawData.forEach(item => {
    const date = new Date(item.created_at)
    const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`
    monthlyData[monthKey] = (monthlyData[monthKey] || 0) + item._count.id
  })

  let cumulativeUsers = 0
  return Object.entries(monthlyData).map(([month, count], index) => {
    cumulativeUsers += count
    const previousMonth = index > 0 ? Object.values(monthlyData)[index - 1] : 0
    const growth = previousMonth > 0 ? ((count - previousMonth) / previousMonth) * 100 : 0

    return {
      month: month.split(' ')[0],
      users: cumulativeUsers,
      growth: Math.round(growth * 10) / 10
    }
  }).slice(-6)
}

function processProjectsDistribution(rawData: ProjectsDistributionRawData[]) {
  const total = rawData.reduce((sum, item) => sum + item._count.id, 0)

  return rawData.map(item => ({
    status: item.maturity || 'Unknown',
    count: item._count.id,
    percentage: Math.round((item._count.id / total) * 100 * 10) / 10
  }))
}

function mapMaturityToStatus(maturity: string): 'active' | 'pending' | 'approved' | 'rejected' {
  const maturityMap: { [key: string]: 'active' | 'pending' | 'approved' | 'rejected' } = {
    'early': 'pending',
    'growth': 'active',
    'mature': 'approved',
    'exit': 'approved'
  }
  return maturityMap[maturity.toLowerCase()] || 'pending'
}

function getUserStatus(user: UserData): 'active' | 'inactive' | 'pending' {
  const now = new Date()
  const lastActivity = new Date(user.updated_at)
  const daysSinceLastActivity = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))

  const daysSinceCreation = Math.floor((now.getTime() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))
  if (daysSinceCreation < 7 && daysSinceLastActivity > 5) {
    return 'pending'
  }

  if (daysSinceLastActivity <= 30) {
    return 'active'
  }

  return 'inactive'
}
