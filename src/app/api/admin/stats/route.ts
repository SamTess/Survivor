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
    console.log('Admin stats endpoint called');

    // Calculate date ranges for trends
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get data for current month
    const [currentMonthUsers, currentMonthStartups, currentMonthNews, currentMonthEvents] = await Promise.all([
      userService.getByDateRange(currentMonthStart, now),
      startupService.getByDateRange(currentMonthStart, now),
      newsService.getNewsByDateRange(currentMonthStart, now),
      eventService.getEventsByDateRange(currentMonthStart, now)
    ]);

    // Get data for last month
    const [lastMonthUsers, lastMonthStartups, lastMonthNews, lastMonthEvents] = await Promise.all([
      userService.getByDateRange(lastMonthStart, lastMonthEnd),
      startupService.getByDateRange(lastMonthStart, lastMonthEnd),
      newsService.getNewsByDateRange(lastMonthStart, lastMonthEnd),
      eventService.getEventsByDateRange(lastMonthStart, lastMonthEnd)
    ]);

    // Get total counts
    const allUsers = await userService.getAllUsers();
    const allStartups = await startupService.getAllStartups();
    const allNewsData = await newsService.getAllNews();
    const upcomingEventsData = await eventService.getUpcomingEvents();

    const totalUsers = allUsers.length;
    const totalStartups = allStartups.length;
    const totalNews = allNewsData.length;
    const upcomingEvents = upcomingEventsData.length;

    // Calculate trends based on month-over-month comparison
    const calculateTrend = (current: number, previous: number): string => {
      if (previous === 0) return current > 0 ? '+100%' : '0%';
      
      const change = ((current - previous) / previous) * 100;
      const sign = change >= 0 ? '+' : '';
      return `${sign}${change.toFixed(1)}%`;
    };

    const stats = {
      totalUsers: {
        value: totalUsers,
        trend: calculateTrend(currentMonthUsers.length, lastMonthUsers.length),
        description: `${totalUsers} total registered users`
      },
      activeProjects: {
        value: totalStartups,
        trend: calculateTrend(currentMonthStartups.length, lastMonthStartups.length),
        description: `${totalStartups} active startup projects`
      },
      newsArticles: {
        value: totalNews,
        trend: calculateTrend(currentMonthNews.length, lastMonthNews.length),
        description: `${totalNews} published articles`
      },
      upcomingEvents: {
        value: upcomingEvents,
        trend: calculateTrend(currentMonthEvents.length, lastMonthEvents.length),
        description: `${upcomingEvents} upcoming events`
      }
    };

    console.log('Stats calculated:', stats);

    return NextResponse.json({ success: true, data: stats });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch admin statistics' },
      { status: 500 }
    );
  }
}