import prisma from '../../persistence/prisma/client';
import { StatisticsRepository } from '../../../domain/repositories/StatisticsRepository';
import {
  StatisticsFilters,
  ContentStats,
  PlatformMetrics
} from '../../../domain/interfaces/Statistics';

interface UserRole {
  role?: string;
}

interface StartupRecord {
  id: number;
}

interface FounderRecord {
  startup_id: number;
}

interface NewsRecord {
  id: number;
}

interface EventRecord {
  id: number;
}

export class StatisticsRepositoryPrisma implements StatisticsRepository {

  async getStartupIds(userId: number, isAdmin: boolean): Promise<number[]> {
    if (isAdmin) {
      const allStartups = await prisma.s_STARTUP.findMany({
        select: { id: true }
      });
      return allStartups.map((s: StartupRecord) => s.id);
    } else {
      const userStartups = await prisma.s_FOUNDER.findMany({
        where: { user_id: userId },
        select: { startup_id: true }
      });
      return userStartups.map((f: FounderRecord) => f.startup_id);
    }
  }

  async getNewsIds(startupIds: number[]): Promise<number[]> {
    const newsData = await prisma.s_NEWS.findMany({
      where: startupIds.length > 0 ? { startup_id: { in: startupIds } } : {},
      select: { id: true }
    });
    return newsData.map((n: NewsRecord) => n.id);
  }

  async getEventIds(): Promise<number[]> {
    const eventData = await prisma.s_EVENT.findMany({
      select: { id: true }
    });
    return eventData.map((e: EventRecord) => e.id);
  }

  async isUserAdmin(userId: number): Promise<boolean> {
    const user = await prisma.s_USER.findUnique({
      where: { id: userId },
      include: { roles: true }
    });

    const mainRoleIsAdmin = user?.role?.toLowerCase() === 'admin';
    const hasAdminRole = user?.roles?.some((role: UserRole) => {
      const roleString = role.role?.toLowerCase();
      return roleString ? ['admin', 'super_admin'].includes(roleString) : false;
    }) ?? false;

    return mainRoleIsAdmin || hasAdminRole;
  }

  async getTotalLikes(filters: StatisticsFilters, targetIds: number[]): Promise<number> {
    const likeFilter = this.buildLikeFilter(filters, targetIds);
    return await prisma.s_LIKE.count({ where: likeFilter });
  }

  async getTotalBookmarks(filters: StatisticsFilters, targetIds: number[]): Promise<number> {
    const bookmarkFilter = this.buildBookmarkFilter(filters, targetIds);
    return await prisma.s_BOOKMARK.count({ where: bookmarkFilter });
  }

  async getTotalFollows(filters: StatisticsFilters, startupIds: number[]): Promise<number> {
    return await prisma.s_FOLLOW.count({
      where: {
        ...(filters.startDate && { createdAt: { gte: filters.startDate } }),
        targetType: 'STARTUP',
        targetId: { in: startupIds }
      }
    });
  }

  async getStartupStats(startupIds: number[]): Promise<ContentStats[]> {
    return await prisma.s_STARTUP.findMany({
      where: { id: { in: startupIds } },
      select: {
        id: true,
        name: true,
        viewsCount: true,
        likesCount: true,
        bookmarksCount: true,
        followersCount: true
      }
    });
  }

  async getNewsStats(newsIds: number[]): Promise<ContentStats[]> {
    if (newsIds.length === 0) return [];

    return await prisma.s_NEWS.findMany({
      where: { id: { in: newsIds } },
      select: {
        id: true,
        title: true,
        viewsCount: true,
        likesCount: true,
        bookmarksCount: true,
        startup_id: true
      }
    });
  }

  async getEventStats(eventIds: number[]): Promise<ContentStats[]> {
    if (eventIds.length === 0) return [];

    return await prisma.s_EVENT.findMany({
      where: { id: { in: eventIds } },
      select: {
        id: true,
        name: true,
        viewsCount: true,
        likesCount: true,
        bookmarksCount: true
      }
    });
  }

  async getInteractionEvents(filters: StatisticsFilters, targetIds: number[]): Promise<{
    occurredAt: Date;
    eventType: string;
  }[]> {
    const interactionFilter = this.buildInteractionFilter(filters, targetIds);

    return await prisma.s_INTERACTION_EVENT.findMany({
      where: interactionFilter,
      select: {
        occurredAt: true,
        eventType: true
      },
      orderBy: { occurredAt: 'desc' }
    });
  }

  async getPlatformMetrics(): Promise<PlatformMetrics> {
    const [totalStartups, totalEvents, totalNews, totalUsers] = await Promise.all([
      prisma.s_STARTUP.count(),
      prisma.s_EVENT.count(),
      prisma.s_NEWS.count(),
      prisma.s_USER.count()
    ]);

    return {
      totalStartups,
      totalEvents,
      totalNews,
      totalUsers
    };
  }

  async getUserPlatformMetrics(startupIds: number[], newsCount: number): Promise<PlatformMetrics> {
    return {
      totalStartups: startupIds.length,
      totalEvents: 0,
      totalNews: newsCount,
      totalUsers: 1
    };
  }

  private buildLikeFilter(filters: StatisticsFilters, targetIds: number[]): Record<string, unknown> {
    const baseFilter = filters.startDate ? { createdAt: { gte: filters.startDate } } : {};

    if (filters.contentType === 'startup') {
      return { ...baseFilter, contentType: 'STARTUP', contentId: { in: targetIds } };
    } else if (filters.contentType === 'news') {
      return { ...baseFilter, contentType: 'NEWS', contentId: { in: targetIds } };
    } else if (filters.contentType === 'event') {
      return { ...baseFilter, contentType: 'EVENT', contentId: { in: targetIds } };
    } else {
      return baseFilter;
    }
  }

  private buildBookmarkFilter(filters: StatisticsFilters, targetIds: number[]): Record<string, unknown> {
    const baseFilter = filters.startDate ? { createdAt: { gte: filters.startDate } } : {};

    if (filters.contentType === 'startup') {
      return { ...baseFilter, contentType: 'STARTUP', contentId: { in: targetIds } };
    } else if (filters.contentType === 'news') {
      return { ...baseFilter, contentType: 'NEWS', contentId: { in: targetIds } };
    } else if (filters.contentType === 'event') {
      return { ...baseFilter, contentType: 'EVENT', contentId: { in: targetIds } };
    } else {
      return baseFilter;
    }
  }

  private buildInteractionFilter(filters: StatisticsFilters, targetIds: number[]): Record<string, unknown> {
    const baseFilter = filters.startDate ? { occurredAt: { gte: filters.startDate } } : {};

    if (filters.contentType === 'startup') {
      return { ...baseFilter, contentType: 'STARTUP', contentId: { in: targetIds } };
    } else if (filters.contentType === 'news') {
      return { ...baseFilter, contentType: 'NEWS', contentId: { in: targetIds } };
    } else if (filters.contentType === 'event') {
      return { ...baseFilter, contentType: 'EVENT', contentId: { in: targetIds } };
    } else {
      return baseFilter;
    }
  }
}
