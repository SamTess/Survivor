import { UserService } from './users/UserService';
import { StartupService } from './startups/StartupService';
import { NewsService } from './news/NewsService';
import { EventService } from './events/EventService';
import { FounderService } from './founders/FounderService';
import { UserRepositoryPrisma } from '../../infrastructure/persistence/prisma/UserRepositoryPrisma';
import { StartupRepositoryPrisma } from '../../infrastructure/persistence/prisma/StartupRepositoryPrisma';
import { NewsRepositoryPrisma } from '../../infrastructure/persistence/prisma/NewsRepositoryPrisma';
import { EventRepositoryPrisma } from '../../infrastructure/persistence/prisma/EventRepositoryPrisma';
import { FounderRepositoryPrisma } from '../../infrastructure/persistence/prisma/FounderRepositoryPrisma';
import { prisma } from '../../lib/prisma';

export interface AdminStats {
  totalUsers: {
    value: number;
    trend: string;
    description: string;
  };
  activeProjects: {
    value: number;
    trend: string;
    description: string;
  };
  newsArticles: {
    value: number;
    trend: string;
    description: string;
  };
  upcomingEvents: {
    value: number;
    trend: string;
    description: string;
  };
}

export interface Activity {
  id: string;
  type: 'user' | 'project' | 'news' | 'event';
  action: string;
  description: string;
  user: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
}

export interface ActivitySummary {
  userActions: number;
  projectChanges: number;
  contentUpdates: number;
  eventsModified: number;
}

export interface RecentActivitiesData {
  activities: Activity[];
  summary: ActivitySummary;
}

export interface DetailedUser {
  id: number;
  email: string;
  name: string;
  registrationDate: string;
  lastActivity: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
}

export interface DetailedProject {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'pending' | 'approved' | 'rejected';
  createdDate: string;
  founder: string | null;
  category: string;
  funding: number;
  views: number;
  likes: number;
  bookmarks: number;
}

export interface DetailedNews {
  id: number;
  title: string;
  publishDate: string;
  author: string | null;
  views: number;
  status: 'published' | 'draft' | 'archived';
  category: string;
}

export interface DetailedEvent {
  id: number;
  title: string;
  date: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  participants: number;
  type: string;
  location: string | null;
}

export interface UserGrowthData {
  month: string;
  users: number;
  growth: number;
}

export interface ProjectDistribution {
  status: string;
  count: number;
  percentage: number;
}

export interface NewsPerformance {
  title: string;
  views: number;
  engagement: number;
}

export interface EventStats {
  type: string;
  count: number;
  avgParticipants: number;
  totalViews: number;
  avgViews: number;
  totalEngagement: number;
  avgEngagement: number;
}

export interface DetailedStatsData {
  recentUsers: DetailedUser[];
  recentProjects: DetailedProject[];
  recentNews: DetailedNews[];
  upcomingEvents: DetailedEvent[];
  userGrowthChart: UserGrowthData[];
  projectsDistribution: ProjectDistribution[];
  newsPerformance: NewsPerformance[];
  eventsStats: EventStats[];
  basicStats?: AdminStats;
}

export class AdminStatsService {
  private userService: UserService;
  private startupService: StartupService;
  private newsService: NewsService;
  private eventService: EventService;
  private founderService: FounderService;

  constructor() {
    // Initialize repositories
    const userRepository = new UserRepositoryPrisma();
    const startupRepository = new StartupRepositoryPrisma();
    const newsRepository = new NewsRepositoryPrisma();
    const eventRepository = new EventRepositoryPrisma();
    const founderRepository = new FounderRepositoryPrisma();

    // Initialize services
    this.userService = new UserService(userRepository);
    this.startupService = new StartupService(startupRepository);
    this.newsService = new NewsService(newsRepository);
    this.eventService = new EventService(eventRepository);
    this.founderService = new FounderService(founderRepository);
  }

  private calculateTrend = (current: number, previous: number): string => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';

    const change = ((current - previous) / previous) * 100;
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  async getBasicStats(): Promise<AdminStats> {

    // Calculate date ranges for trends
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get all data in parallel for better performance
    const [
      currentMonthUsers,
      currentMonthStartups,
      currentMonthNews,
      currentMonthEvents,
      lastMonthUsers,
      lastMonthStartups,
      lastMonthNews,
      lastMonthEvents,
      allUsers,
      allStartups,
      allNewsData,
      upcomingEventsData
    ] = await Promise.all([
      this.userService.getByDateRange(currentMonthStart, now),
      this.startupService.getByDateRange(currentMonthStart, now),
      this.newsService.getNewsByDateRange(currentMonthStart, now),
      this.eventService.getEventsByDateRange(currentMonthStart, now),
      this.userService.getByDateRange(lastMonthStart, lastMonthEnd),
      this.startupService.getByDateRange(lastMonthStart, lastMonthEnd),
      this.newsService.getNewsByDateRange(lastMonthStart, lastMonthEnd),
      this.eventService.getEventsByDateRange(lastMonthStart, lastMonthEnd),
      this.userService.getAllUsers(),
      this.startupService.getAllStartups(),
      this.newsService.getAllNews(),
      this.eventService.getUpcomingEvents()
    ]);

    // Calculate totals
    const totalUsers = allUsers.length;
    const totalStartups = allStartups.length;
    const totalNews = allNewsData.length;
    const upcomingEvents = upcomingEventsData.length;

    const stats: AdminStats = {
      totalUsers: {
        value: totalUsers,
        trend: this.calculateTrend(currentMonthUsers.length, lastMonthUsers.length),
        description: `${totalUsers} total registered users`
      },
      activeProjects: {
        value: totalStartups,
        trend: this.calculateTrend(currentMonthStartups.length, lastMonthStartups.length),
        description: `${totalStartups} active startup projects`
      },
      newsArticles: {
        value: totalNews,
        trend: this.calculateTrend(currentMonthNews.length, lastMonthNews.length),
        description: `${totalNews} published articles`
      },
      upcomingEvents: {
        value: upcomingEvents,
        trend: this.calculateTrend(currentMonthEvents.length, lastMonthEvents.length),
        description: `${upcomingEvents} upcoming events`
      }
    };

    return stats;
  }

  async getRecentActivities(): Promise<RecentActivitiesData> {

    const activities: Activity[] = [];

    // Get recent users
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
    });

    recentUsers.forEach((user) => {
      activities.push({
        id: `user-${user.id}`,
        type: 'user',
        action: user.role === 'admin' ? 'Admin Account Created' : 'User Registered',
        description: `New ${user.role.toLowerCase()} account created for ${user.name}`,
        user: user.email,
        timestamp: user.created_at.toISOString(),
        severity: user.role === 'admin' ? 'high' : 'medium'
      });
    });

    // Get recent startups
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
    });

    recentStartups.forEach((startup) => {
      activities.push({
        id: `project-${startup.id}`,
        type: 'project',
        action: 'Startup Registered',
        description: `New ${startup.sector} startup "${startup.name}" registered on platform`,
        user: startup.founders[0]?.user?.name || startup.name,
        timestamp: startup.created_at.toISOString(),
        severity: 'medium'
      });
    });

    // Get recent news
    const recentNews = await prisma.s_NEWS.findMany({
      take: 3,
      orderBy: { created_at: 'desc' },
      include: {
        startup: {
          select: { name: true }
        }
      }
    });

    recentNews.forEach((news) => {
      activities.push({
        id: `news-${news.id}`,
        type: 'news',
        action: 'Article Published',
        description: `New article "${news.title}" published`,
        user: news.startup.name,
        timestamp: news.created_at.toISOString(),
        severity: 'low'
      });
    });

    // Get recent events
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
    });

    recentEvents.forEach((event) => {
      activities.push({
        id: `event-${event.id}`,
        type: 'event',
        action: 'Event Created',
        description: `New ${event.event_type || 'event'} "${event.name}" scheduled`,
        user: 'Event Manager',
        timestamp: event.created_at.toISOString(),
        severity: 'medium'
      });
    });

    // Sort activities by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Calculate summary for the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [userActions, projectChanges, contentUpdates, eventsModified] = await Promise.all([
      prisma.s_USER.count({ where: { created_at: { gte: thirtyDaysAgo } } }),
      prisma.s_STARTUP.count({ where: { created_at: { gte: thirtyDaysAgo } } }),
      prisma.s_NEWS.count({ where: { created_at: { gte: thirtyDaysAgo } } }),
      prisma.s_EVENT.count({ where: { created_at: { gte: thirtyDaysAgo } } })
    ]);

    const summary: ActivitySummary = {
      userActions,
      projectChanges,
      contentUpdates,
      eventsModified
    };

    return {
      activities: activities.slice(0, 10),
      summary
    };
  }

  private async getContentAnalytics(contentType: string, contentIds: number[], period: string = '30') {
    try {
      const startDate = period !== 'all' ? new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000) : null;

      const analytics = await Promise.all(
        contentIds.map(async (contentId) => {
          // Get interaction events for this content
          const interactions = await prisma.s_INTERACTION_EVENT.findMany({
            where: {
              contentType: contentType.toUpperCase() as 'STARTUP' | 'NEWS' | 'EVENT',
              contentId: contentId,
              ...(startDate && { occurredAt: { gte: startDate } })
            },
            select: {
              eventType: true,
              occurredAt: true
            }
          });

          const views = interactions.filter(i => i.eventType === 'VIEW').length;
          const likes = interactions.filter(i => i.eventType === 'LIKE').length;
          const bookmarks = interactions.filter(i => i.eventType === 'BOOKMARK').length;

          return {
            contentId,
            views,
            likes,
            bookmarks,
            engagement: likes + bookmarks
          };
        })
      );

      return analytics;
    } catch (error) {
      console.warn('Failed to fetch analytics data:', error);
      return contentIds.map(contentId => ({
        contentId,
        views: 0,
        likes: 0,
        bookmarks: 0,
        engagement: 0
      }));
    }
  }

  async getDetailedStats(): Promise<DetailedStatsData> {

    // Get basic stats first
    const basicStats = await this.getBasicStats();

    // Get recent data (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch recent users
    const recentUsersData = await this.userService.getByDateRange(thirtyDaysAgo, new Date());
    const recentUsers: DetailedUser[] = recentUsersData.slice(0, 10).map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      registrationDate: user.created_at.toISOString(),
      lastActivity: user.updated_at.toISOString(),
      role: user.role,
      status: 'active' as const
    }));

    // Fetch recent projects with founder information
    const recentProjectsData = await this.startupService.getByDateRange(thirtyDaysAgo, new Date());

    // Get founder information for these projects
    const projectIds = recentProjectsData.map(p => p.id);
    const foundersData = await Promise.all(
      projectIds.map(async (projectId) => {
        try {
          const founders = await this.founderService.getFoundersByStartupId(projectId);
          return { projectId, founders };
        } catch (error) {
          console.warn(`Failed to fetch founders for project ${projectId}:`, error);
          return { projectId, founders: [] };
        }
      })
    );

    const foundersMap = new Map(foundersData.map(item => [item.projectId, item.founders]));

    // Get analytics for recent projects
    const recentProjectAnalytics = await this.getContentAnalytics('STARTUP', projectIds, '30');
    const recentProjectAnalyticsMap = new Map(
      recentProjectAnalytics.map(analytics => [analytics.contentId, analytics])
    );

    const recentProjects: DetailedProject[] = recentProjectsData.slice(0, 10).map(project => {
      const founders = foundersMap.get(project.id) || [];
      const founderName = founders.length > 0 ? founders[0].name : null;
      const analytics = recentProjectAnalyticsMap.get(project.id);

      return {
        id: project.id,
        name: project.name,
        description: project.description,
        status: 'active' as const,
        createdDate: project.created_at?.toISOString() || new Date().toISOString(),
        founder: founderName,
        category: project.sector,
        funding: 0,
        views: analytics?.views || 0,
        likes: analytics?.likes || 0,
        bookmarks: analytics?.bookmarks || 0
      };
    });

    // Fetch recent news with author information
    const recentNewsData = await this.newsService.getNewsByDateRange(thirtyDaysAgo, new Date());

    // Get author information for these news items
    const recentNewsIds = recentNewsData.slice(0, 10).map(news => news.id);
    const recentNewsAnalytics = await this.getContentAnalytics('NEWS', recentNewsIds, '30');
    const recentNewsAnalyticsMap = new Map(
      recentNewsAnalytics.map(analytics => [analytics.contentId, analytics])
    );

    const newsWithAuthors = await Promise.all(
      recentNewsData.slice(0, 10).map(async (news) => {
        let authorName: string | null = null;

        try {
          // If news has a startup_id, try to get the founder
          if (news.startup_id) {
            const founders = await this.founderService.getFoundersByStartupId(news.startup_id);
            if (founders.length > 0) {
              authorName = founders[0].name;
            }
          }
        } catch (error) {
          console.warn(`Failed to fetch author for news ${news.id}:`, error);
        }

        const analytics = recentNewsAnalyticsMap.get(news.id);

        return {
          id: news.id,
          title: news.title,
          publishDate: news.created_at?.toISOString() || new Date().toISOString(),
          author: authorName,
          views: analytics?.views || 0,
          status: 'published' as const,
          category: news.category || 'General'
        };
      })
    );

    const recentNews = newsWithAuthors;

    // Fetch upcoming events with participant counts
    const upcomingEventsData = await this.eventService.getUpcomingEvents();

    // Get participant counts for these events
    const eventsWithParticipants = await Promise.all(
      (upcomingEventsData || []).slice(0, 10).map(async (event) => {
        let participantCount = 0;

        try {
          // Try to get participant count from database
          // This assumes there's a way to count participants for events
          // For now, we'll keep it as 0 but with proper error handling
          participantCount = 0; // TODO: Implement actual participant counting
        } catch (error) {
          console.warn(`Failed to fetch participants for event ${event.id}:`, error);
        }

        return {
          id: event.id,
          title: event.name,
          date: event.dates || new Date().toISOString(),
          status: 'upcoming' as const,
          participants: participantCount,
          type: event.event_type || 'Conference',
          location: event.location || null
        };
      })
    );

    const upcomingEvents = eventsWithParticipants;

    // Generate user growth chart data (last 12 months) - Optimized single query
    const thirteenMonthsAgo = new Date();
    thirteenMonthsAgo.setMonth(thirteenMonthsAgo.getMonth() - 13);

    // Single query to get all users from the last 13 months
    const allUsersInPeriod = await this.userService.getByDateRange(thirteenMonthsAgo, new Date());

    // Group users by month
    const usersByMonth = allUsersInPeriod.reduce((acc, user) => {
      const monthKey = user.created_at.toISOString().slice(0, 7); // YYYY-MM format
      if (!acc[monthKey]) {
        acc[monthKey] = [];
      }
      acc[monthKey].push(user);
      return acc;
    }, {} as Record<string, typeof allUsersInPeriod>);

    // Generate chart data
    const userGrowthChart: UserGrowthData[] = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7);
      const prevDate = new Date(date);
      prevDate.setMonth(prevDate.getMonth() - 1);
      const prevMonthKey = prevDate.toISOString().slice(0, 7);

      const monthUsers = usersByMonth[monthKey] || [];
      const prevMonthUsers = usersByMonth[prevMonthKey] || [];

      const growth = prevMonthUsers.length > 0
        ? ((monthUsers.length - prevMonthUsers.length) / prevMonthUsers.length) * 100
        : 0;

      userGrowthChart.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        users: monthUsers.length,
        growth: Math.round(growth * 10) / 10
      });
    }

    // Get projects distribution
    const allProjects = await this.startupService.getAllStartups();
    const statusCounts = allProjects.reduce((acc) => {
      const status = 'active'; // Default status since Startup entity doesn't have status
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalProjects = allProjects.length;
    const projectsDistribution: ProjectDistribution[] = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: Math.round((count / totalProjects) * 100 * 10) / 10
    }));

    // Get news performance data with real analytics
    const allNews = await this.newsService.getAllNews();
    const newsIds = allNews.map(news => news.id);
    const newsAnalytics = await this.getContentAnalytics('NEWS', newsIds, '30');

    const newsAnalyticsMap = new Map(
      newsAnalytics.map(analytics => [analytics.contentId, analytics])
    );

    const newsPerformance: NewsPerformance[] = allNews.slice(0, 10).map(news => {
      const analytics = newsAnalyticsMap.get(news.id);
      return {
        title: news.title,
        views: analytics?.views || 0,
        engagement: analytics?.engagement || 0
      };
    });

    // Get events stats with real analytics
    const allEvents = await this.eventService.getAllEvents();
    const eventIds = allEvents.map(event => event.id);
    const eventAnalytics = await this.getContentAnalytics('EVENT', eventIds, '30');

    const eventAnalyticsMap = new Map(
      eventAnalytics.map(analytics => [analytics.contentId, analytics])
    );

    const eventTypes = allEvents.reduce((acc, event) => {
      const type = event.event_type || 'Other';
      if (!acc[type]) {
        acc[type] = { count: 0, totalParticipants: 0, totalViews: 0, totalEngagement: 0 };
      }
      acc[type].count += 1;

      const analytics = eventAnalyticsMap.get(event.id);
      acc[type].totalViews += analytics?.views || 0;
      acc[type].totalEngagement += analytics?.engagement || 0;

      return acc;
    }, {} as Record<string, { count: number; totalParticipants: number; totalViews: number; totalEngagement: number }>);

    const eventsStats: EventStats[] = Object.entries(eventTypes).map(([type, data]) => ({
      type,
      count: data.count,
      avgParticipants: Math.round(data.totalParticipants / data.count) || 0,
      totalViews: data.totalViews,
      avgViews: Math.round(data.totalViews / data.count) || 0,
      totalEngagement: data.totalEngagement,
      avgEngagement: Math.round(data.totalEngagement / data.count) || 0
    }));

    return {
      recentUsers,
      recentProjects,
      recentNews,
      upcomingEvents,
      userGrowthChart,
      projectsDistribution,
      newsPerformance,
      eventsStats,
      basicStats
    };
  }
}
