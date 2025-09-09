import { NextResponse } from 'next/server';
import { UserService } from '../../../../application/services/users/UserService';
import { StartupService } from '../../../../application/services/startups/StartupService';
import { NewsService } from '../../../../application/services/news/NewsService';
import { EventService } from '../../../../application/services/events/EventService';
import { UserRepositoryPrisma } from '../../../../infrastructure/persistence/prisma/UserRepositoryPrisma';
import { StartupRepositoryPrisma } from '../../../../infrastructure/persistence/prisma/StartupRepositoryPrisma';
import { NewsRepositoryPrisma } from '../../../../infrastructure/persistence/prisma/NewsRepositoryPrisma';
import { EventRepositoryPrisma } from '../../../../infrastructure/persistence/prisma/EventRepositoryPrisma';

const userRepository = new UserRepositoryPrisma();
const startupRepository = new StartupRepositoryPrisma();
const newsRepository = new NewsRepositoryPrisma();
const eventRepository = new EventRepositoryPrisma();

const userService = new UserService(userRepository);
const startupService = new StartupService(startupRepository);
const newsService = new NewsService(newsRepository);
const eventService = new EventService(eventRepository);

export async function GET() {
  try {
    console.log('Admin stats-details endpoint called');

    // Get recent data (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch recent users
    const recentUsersData = await userService.getByDateRange(thirtyDaysAgo, new Date());
    const recentUsers = recentUsersData.slice(0, 10).map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      registrationDate: user.created_at.toISOString(),
      lastActivity: user.updated_at.toISOString(),
      role: user.role,
      status: 'active' as const
    }));

    // Fetch recent projects
    const recentProjectsData = await startupService.getByDateRange(thirtyDaysAgo, new Date());
    const recentProjects = recentProjectsData.slice(0, 10).map(project => ({
      id: project.id,
      name: project.name,
      description: project.description,
      status: 'active' as const,
      createdDate: project.created_at?.toISOString() || new Date().toISOString(),
      founder: 'Unknown', // Will need to be populated from founders table
      category: project.sector,
      funding: 0
    }));

    // Fetch recent news
    const recentNewsData = await newsService.getNewsByDateRange(thirtyDaysAgo, new Date());
    const recentNews = recentNewsData.slice(0, 10).map(news => ({
      id: news.id,
      title: news.title,
      publishDate: news.created_at?.toISOString() || new Date().toISOString(),
      author: 'Unknown', // Will need to be populated from startup/founder data
      views: 0,
      status: 'published' as const,
      category: news.category || 'General'
    }));

    // Fetch upcoming events
    const upcomingEventsData = await eventService.getUpcomingEvents();
    const upcomingEvents = upcomingEventsData.slice(0, 10).map(event => ({
      id: event.id,
      title: event.name,
      date: event.dates || new Date().toISOString(),
      status: 'upcoming' as const,
      participants: 0,
      type: event.event_type || 'Conference',
      location: event.location || 'TBD'
    }));

    // Generate user growth chart data (last 12 months) - Optimized single query
    const thirteenMonthsAgo = new Date();
    thirteenMonthsAgo.setMonth(thirteenMonthsAgo.getMonth() - 13);

    // Single query to get all users from the last 13 months
    const allUsersInPeriod = await userService.getByDateRange(thirteenMonthsAgo, new Date());

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
    const userGrowthChart = [];
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
    const allProjects = await startupService.getAllStartups();
    const statusCounts = allProjects.reduce((acc) => {
      const status = 'active'; // Default status since Startup entity doesn't have status
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalProjects = allProjects.length;
    const projectsDistribution = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: Math.round((count / totalProjects) * 100 * 10) / 10
    }));

    // Get news performance data
    const allNews = await newsService.getAllNews();
    const newsPerformance = allNews.slice(0, 10).map(news => ({
      title: news.title,
      views: 0, // Will need analytics data
      engagement: 0 // Will need analytics data
    }));

    // Get events stats
    const allEvents = await eventService.getAllEvents();
    const eventTypes = allEvents.reduce((acc, event) => {
      const type = event.event_type || 'Other';
      if (!acc[type]) {
        acc[type] = { count: 0, totalParticipants: 0 };
      }
      acc[type].count += 1;
      acc[type].totalParticipants += 0; // Will need participants data
      return acc;
    }, {} as Record<string, { count: number; totalParticipants: number }>);

    const eventsStats = Object.entries(eventTypes).map(([type, data]) => ({
      type,
      count: data.count,
      avgParticipants: Math.round(data.totalParticipants / data.count) || 0
    }));

    const statsDetails = {
      recentUsers,
      recentProjects,
      recentNews,
      upcomingEvents,
      userGrowthChart,
      projectsDistribution,
      newsPerformance,
      eventsStats
    };

    console.log('Stats details calculated');

    return NextResponse.json({
      success: true,
      data: statsDetails,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching admin stats details:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch admin statistics details',
        generatedAt: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
