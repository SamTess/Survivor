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
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const allUsers = await userService.getAllUsers();
    const totalUsers = allUsers.length;

    const allStartups = await startupService.getAllStartups();
    const totalStartups = allStartups.length;

    const allNewsData = await newsService.getAllNews();
    const totalNews = allNewsData.length;

    const upcomingEventsData = await eventService.getUpcomingEvents();
    const upcomingEvents = upcomingEventsData.length;

    const currentMonthUsers = await userRepository.getByDateRange(startOfCurrentMonth, now);
    const currentMonthStartups = await startupRepository.getByDateRange(startOfCurrentMonth, now);
    const currentMonthNews = await newsService.getNewsByDateRange(startOfCurrentMonth, now);
    const currentMonthEvents = await eventService.getEventsByDateRange(startOfCurrentMonth, now);

    const lastMonthUsers = await userRepository.getByDateRange(startOfLastMonth, endOfLastMonth);
    const lastMonthStartups = await startupRepository.getByDateRange(startOfLastMonth, endOfLastMonth);
    const lastMonthNews = await newsService.getNewsByDateRange(startOfLastMonth, endOfLastMonth);
    const lastMonthEvents = await eventService.getEventsByDateRange(startOfLastMonth, endOfLastMonth);

    const calculateTrend = (current: number, previous: number): string => {
      if (previous === 0) return current > 0 ? "+100%" : "0%";
      const percentChange = ((current - previous) / previous) * 100;
      return percentChange >= 0 ? `+${Math.round(percentChange)}%` : `${Math.round(percentChange)}%`;
    };

    const usersTrend = calculateTrend(currentMonthUsers.length, lastMonthUsers.length);
    const startupsTrend = calculateTrend(currentMonthStartups.length, lastMonthStartups.length);
    const newsTrend = calculateTrend(currentMonthNews.length, lastMonthNews.length);
    const eventsTrend = calculateTrend(currentMonthEvents.length, lastMonthEvents.length);

    const stats = {
      totalUsers: {
        value: totalUsers,
        trend: usersTrend,
        description: `${usersTrend} from last month (${lastMonthUsers.length} → ${currentMonthUsers.length})`
      },
      activeProjects: {
        value: totalStartups,
        trend: startupsTrend,
        description: `${startupsTrend} from last month (${lastMonthStartups.length} → ${currentMonthStartups.length})`
      },
      newsArticles: {
        value: totalNews,
        trend: newsTrend,
        description: `${newsTrend} from last month (${lastMonthNews.length} → ${currentMonthNews.length})`
      },
      upcomingEvents: {
        value: upcomingEvents,
        trend: eventsTrend,
        description: `${eventsTrend} from last month (${lastMonthEvents.length} → ${currentMonthEvents.length})`
      }
    };

    return NextResponse.json({ success: true, data: stats });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch admin statistics' },
      { status: 500 }
    );
  }
}
