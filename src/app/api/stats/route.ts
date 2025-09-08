import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/infrastructure/persistence/prisma/client';
import { verifyJwt } from '@/infrastructure/security/auth';

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

interface InteractionEvent {
  occurredAt: Date;
  eventType: string;
}

interface StartupStats {
  id: number;
  name: string;
  viewsCount: number;
  likesCount: number;
  bookmarksCount: number;
  followersCount: number;
}

interface NewsStats {
  id: number;
  title: string;
  viewsCount: number;
  likesCount: number;
  bookmarksCount: number;
  startup_id: number;
}

interface EventStats {
  id: number;
  name: string;
  viewsCount: number;
  likesCount: number;
  bookmarksCount: number;
}

interface FilterCondition {
  gte?: Date;
  in?: number[];
}

interface BaseFilter {
  createdAt?: FilterCondition;
  occurredAt?: FilterCondition;
  contentType?: string;
  contentId?: FilterCondition;
  targetType?: string;
  targetId?: FilterCondition;
  OR?: Array<{
    contentType: string;
    contentId: FilterCondition;
  }>;
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth')?.value;
    const secret = process.env.AUTH_SECRET || 'dev-secret';
    const payload = verifyJwt(token, secret);

    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30';
    const scope = searchParams.get('scope') || 'user';
    const contentType = searchParams.get('contentType') || 'all';

    let startDate: Date | null = null;
    if (period !== 'all') {
      const periodDays = parseInt(period);
      startDate = new Date();
      startDate.setDate(startDate.getDate() - periodDays);
    }

    const userId = payload.userId;

    let isAdmin = false;
    if (scope === 'admin') {
      const user = await prisma.s_USER.findUnique({
        where: { id: userId },
        include: { roles: true }
      });

      const mainRoleIsAdmin = user?.role?.toLowerCase() === 'admin';
      const hasAdminRole = user?.roles?.some((role: UserRole) => {
        const roleString = role.role?.toLowerCase();
        return roleString ? ['admin', 'super_admin'].includes(roleString) : false;
      }) ?? false;

      isAdmin = mainRoleIsAdmin || hasAdminRole;

      if (!isAdmin) {
        return NextResponse.json(
          { success: false, error: 'Admin access required' },
          { status: 403 }
        );
      }
    }

    let startupIds: number[] = [];

    if (scope === 'admin' && isAdmin) {
      const allStartups = await prisma.s_STARTUP.findMany({
        select: { id: true }
      });
      startupIds = allStartups.map((s: StartupRecord) => s.id);
    } else {
      const userStartups = await prisma.s_FOUNDER.findMany({
        where: { user_id: userId },
        select: { startup_id: true }
      });
      startupIds = userStartups.map((f: FounderRecord) => f.startup_id);

      if (startupIds.length === 0) {
        return NextResponse.json({
          success: true,
          data: {
            overview: {
              totalViews: 0,
              totalLikes: 0,
              totalBookmarks: 0,
              totalFollows: 0,
              totalActiveUsers: 0,
              conversionRate: 0,
              totalSessions: 0,
              viewsThisMonth: 0,
              lastUpdated: new Date().toISOString()
            },
            charts: {
              monthlyViews: [0],
              activeUsers: [0]
            },
            topContent: {
              startups: [],
              events: [],
              news: []
            }
          },
          period: period,
          scope,
          generatedAt: new Date().toISOString()
        });
      }
    }

    let newsIds: number[] = [];
    let eventIds: number[] = [];

    if (contentType === 'all' || contentType === 'news') {
      const newsData = await prisma.s_NEWS.findMany({
        where: startupIds.length > 0 ? { startup_id: { in: startupIds } } : {},
        select: { id: true }
      });
      newsIds = newsData.map((n: NewsRecord) => n.id);
    }

    if (contentType === 'all' || contentType === 'event') {
      const eventData = await prisma.s_EVENT.findMany({
        select: { id: true }
      });
      eventIds = eventData.map((e: EventRecord) => e.id);
    }

    const buildLikeFilter = (baseFilter: Record<string, unknown> = {}): Record<string, unknown> => {
      if (contentType === 'startup') {
        return { ...baseFilter, contentType: 'STARTUP', contentId: { in: startupIds } };
      } else if (contentType === 'news') {
        return { ...baseFilter, contentType: 'NEWS', contentId: { in: newsIds } };
      } else if (contentType === 'event') {
        return { ...baseFilter, contentType: 'EVENT', contentId: { in: eventIds } };
      } else {
        const orConditions: Array<{ contentType: string; contentId: { in: number[] } }> = [];
        if (startupIds.length > 0) {
          orConditions.push({ contentType: 'STARTUP', contentId: { in: startupIds } });
        }
        if (newsIds.length > 0) {
          orConditions.push({ contentType: 'NEWS', contentId: { in: newsIds } });
        }
        if (scope === 'admin' && eventIds.length > 0) {
          orConditions.push({ contentType: 'EVENT', contentId: { in: eventIds } });
        }
        return orConditions.length > 0 ? { ...baseFilter, OR: orConditions } : baseFilter;
      }
    };

    const buildBookmarkFilter = (baseFilter: Record<string, unknown> = {}): Record<string, unknown> => {
      if (contentType === 'startup') {
        return { ...baseFilter, contentType: 'STARTUP', contentId: { in: startupIds } };
      } else if (contentType === 'news') {
        return { ...baseFilter, contentType: 'NEWS', contentId: { in: newsIds } };
      } else if (contentType === 'event') {
        return { ...baseFilter, contentType: 'EVENT', contentId: { in: eventIds } };
      } else {
        const orConditions: Array<{ contentType: string; contentId: { in: number[] } }> = [];
        if (startupIds.length > 0) {
          orConditions.push({ contentType: 'STARTUP', contentId: { in: startupIds } });
        }
        if (newsIds.length > 0) {
          orConditions.push({ contentType: 'NEWS', contentId: { in: newsIds } });
        }
        if (scope === 'admin' && eventIds.length > 0) {
          orConditions.push({ contentType: 'EVENT', contentId: { in: eventIds } });
        }
        return orConditions.length > 0 ? { ...baseFilter, OR: orConditions } : baseFilter;
      }
    };

    const buildInteractionFilter = (baseFilter: Record<string, unknown> = {}): Record<string, unknown> => {
      if (contentType === 'startup') {
        return { ...baseFilter, contentType: 'STARTUP', contentId: { in: startupIds } };
      } else if (contentType === 'news') {
        return { ...baseFilter, contentType: 'NEWS', contentId: { in: newsIds } };
      } else if (contentType === 'event') {
        return { ...baseFilter, contentType: 'EVENT', contentId: { in: eventIds } };
      } else {
        const orConditions: Array<{ contentType: string; contentId: { in: number[] } }> = [];
        if (startupIds.length > 0) {
          orConditions.push({ contentType: 'STARTUP', contentId: { in: startupIds } });
        }
        if (newsIds.length > 0) {
          orConditions.push({ contentType: 'NEWS', contentId: { in: newsIds } });
        }
        if (scope === 'admin' && eventIds.length > 0) {
          orConditions.push({ contentType: 'EVENT', contentId: { in: eventIds } });
        }
        return orConditions.length > 0 ? { ...baseFilter, OR: orConditions } : baseFilter;
      }
    };

    const [
      totalLikes,
      totalBookmarks,
      totalFollows,
      startupStats,
      newsStats,
      eventStats,
      dailyInteractionEvents
    ] = await Promise.all([
      prisma.s_LIKE.count({
        where: buildLikeFilter(startDate ? { createdAt: { gte: startDate } } : {})
      }),

      prisma.s_BOOKMARK.count({
        where: buildBookmarkFilter(startDate ? { createdAt: { gte: startDate } } : {})
      }),

      prisma.s_FOLLOW.count({
        where: {
          ...(startDate && { createdAt: { gte: startDate } }),
          targetType: 'STARTUP',
          targetId: { in: startupIds }
        }
      }),

      (contentType === 'all' || contentType === 'startup') ? prisma.s_STARTUP.findMany({
        where: { id: { in: startupIds } },
        select: {
          id: true,
          name: true,
          viewsCount: true,
          likesCount: true,
          bookmarksCount: true,
          followersCount: true
        }
      }) : Promise.resolve([]),

      (contentType === 'all' || contentType === 'news') && newsIds.length > 0 ? prisma.s_NEWS.findMany({
        where: { id: { in: newsIds } },
        select: {
          id: true,
          title: true,
          viewsCount: true,
          likesCount: true,
          bookmarksCount: true,
          startup_id: true
        }
      }) : Promise.resolve([]),

      (contentType === 'all' || contentType === 'event') && scope === 'admin' ? prisma.s_EVENT.findMany({
        where: { id: { in: eventIds } },
        select: {
          id: true,
          name: true,
          viewsCount: true,
          likesCount: true,
          bookmarksCount: true
        }
      }) : Promise.resolve([]),

      prisma.s_INTERACTION_EVENT.findMany({
        where: buildInteractionFilter(startDate ? { occurredAt: { gte: startDate } } : {}),
        select: {
          occurredAt: true,
          eventType: true
        },
        orderBy: { occurredAt: 'desc' }
      })
    ]);

    let totalViews = 0;
    if (contentType === 'startup' || contentType === 'all') {
      totalViews += startupStats.reduce((sum: number, s: StartupStats) => sum + s.viewsCount, 0);
    }
    if (contentType === 'news' || contentType === 'all') {
      totalViews += newsStats.reduce((sum: number, n: NewsStats) => sum + n.viewsCount, 0);
    }
    if (contentType === 'event' || contentType === 'all') {
      totalViews += eventStats.reduce((sum: number, e: EventStats) => sum + e.viewsCount, 0);
    }
    const totalInteractions = totalLikes + totalBookmarks;
    const conversionRate = totalViews > 0 ? totalInteractions / totalViews : 0;

    const dailyEventCounts = new Map<string, { views: number; interactions: number }>();

    for (let i = 0; i < (startDate ? Math.ceil((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) : 30); i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      dailyEventCounts.set(dateKey, { views: 0, interactions: 0 });
    }

    dailyInteractionEvents.forEach((event: InteractionEvent) => {
      const dateKey = event.occurredAt.toISOString().split('T')[0];
      const current = dailyEventCounts.get(dateKey) || { views: 0, interactions: 0 };

      if (event.eventType === 'VIEW') {
        current.views++;
      } else if (['LIKE', 'BOOKMARK', 'FOLLOW'].includes(event.eventType)) {
        current.interactions++;
      }

      dailyEventCounts.set(dateKey, current);
    });

    const sortedDates = Array.from(dailyEventCounts.keys()).sort();
    const monthlyViews = sortedDates.map(date => dailyEventCounts.get(date)?.views || 0);
    const monthlyInteractions = sortedDates.map(date => dailyEventCounts.get(date)?.interactions || 0);

    let platformMetrics = {};
    if (scope === 'admin' && isAdmin) {
      const [totalStartups, totalEvents, totalNews, totalUsers] = await Promise.all([
        prisma.s_STARTUP.count(),
        prisma.s_EVENT.count(),
        prisma.s_NEWS.count(),
        prisma.s_USER.count()
      ]);

      platformMetrics = {
        totalStartups,
        totalEvents,
        totalNews,
        totalUsers
      };
    } else {
      platformMetrics = {
        totalStartups: startupIds.length,
        totalEvents: 0,
        totalNews: newsStats.length,
        totalUsers: 1
      };
    }

    const stats = {
      overview: {
        totalViews,
        totalLikes,
        totalBookmarks,
        totalFollows,
        totalActiveUsers: startupStats.length,
        conversionRate,
        totalSessions: 0,
        viewsThisMonth: totalViews,
        lastUpdated: new Date().toISOString()
      },
      platform: platformMetrics,
      charts: {
        monthlyViews: monthlyViews.length > 0 ? monthlyViews : [0],
        activeUsers: monthlyInteractions.length > 0 ? monthlyInteractions : [0]
      },
      topContent: {
        startups: startupStats.sort((a: StartupStats, b: StartupStats) => b.viewsCount - a.viewsCount).slice(0, 5),
        events: eventStats.sort((a: EventStats, b: EventStats) => b.viewsCount - a.viewsCount).slice(0, 5),
        news: newsStats.sort((a: NewsStats, b: NewsStats) => b.viewsCount - a.viewsCount).slice(0, 5)
      }
    };

    return NextResponse.json({
      success: true,
      data: stats,
      period: period,
      contentType: contentType,
      scope,
      startupIds: scope === 'admin' ? undefined : startupIds,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch statistics'
      },
      { status: 500 }
    );
  }
}
