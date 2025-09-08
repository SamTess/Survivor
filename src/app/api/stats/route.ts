import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/infrastructure/persistence/prisma/client';
import { verifyJwt } from '@/infrastructure/security/auth';

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

    const periodDays = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    const userId = payload.userId;

    let isAdmin = false;
    if (scope === 'admin') {
      const user = await prisma.s_USER.findUnique({
        where: { id: userId },
        include: { roles: true }
      });

      const mainRoleIsAdmin = user?.role?.toLowerCase() === 'admin';
      const hasAdminRole = user?.roles?.some((role: any) => ['admin', 'super_admin'].includes(role.role?.toLowerCase()));

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
      startupIds = allStartups.map(s => s.id);
    } else {
      const userStartups = await prisma.s_FOUNDER.findMany({
        where: { user_id: userId },
        select: { startup_id: true }
      });
      startupIds = userStartups.map(f => f.startup_id);

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
          period: periodDays,
          scope,
          generatedAt: new Date().toISOString()
        });
      }
    }

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
        where: {
          createdAt: { gte: startDate },
          contentType: 'STARTUP',
          contentId: { in: startupIds }
        }
      }),

      prisma.s_BOOKMARK.count({
        where: {
          createdAt: { gte: startDate },
          contentType: 'STARTUP',
          contentId: { in: startupIds }
        }
      }),

      prisma.s_FOLLOW.count({
        where: {
          createdAt: { gte: startDate },
          targetType: 'STARTUP',
          targetId: { in: startupIds }
        }
      }),

      prisma.s_STARTUP.findMany({
        where: { id: { in: startupIds } },
        select: {
          id: true,
          name: true,
          viewsCount: true,
          likesCount: true,
          bookmarksCount: true,
          followersCount: true
        }
      }),

      prisma.s_NEWS.findMany({
        where: { startup_id: { in: startupIds } },
        select: {
          id: true,
          title: true,
          viewsCount: true,
          likesCount: true,
          bookmarksCount: true,
          startup_id: true
        }
      }),

      scope === 'admin' ? prisma.s_EVENT.findMany({
        select: {
          id: true,
          name: true,
          viewsCount: true,
          likesCount: true,
          bookmarksCount: true
        }
      }) : Promise.resolve([]),

      prisma.s_INTERACTION_EVENT.findMany({
        where: {
          occurredAt: { gte: startDate },
          contentType: 'STARTUP',
          contentId: { in: startupIds }
        },
        select: {
          occurredAt: true,
          eventType: true
        },
        orderBy: { occurredAt: 'desc' }
      })
    ]);

    const totalViews = startupStats.reduce((sum, s) => sum + s.viewsCount, 0);
    const totalInteractions = totalLikes + totalBookmarks;
    const conversionRate = totalViews > 0 ? totalInteractions / totalViews : 0;

    const dailyEventCounts = new Map<string, { views: number; interactions: number }>();

    for (let i = 0; i < periodDays; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      dailyEventCounts.set(dateKey, { views: 0, interactions: 0 });
    }

    dailyInteractionEvents.forEach(event => {
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
        startups: startupStats.sort((a, b) => b.viewsCount - a.viewsCount).slice(0, 5),
        events: eventStats.sort((a, b) => b.viewsCount - a.viewsCount).slice(0, 5),
        news: newsStats.sort((a, b) => b.viewsCount - a.viewsCount).slice(0, 5)
      }
    };

    return NextResponse.json({
      success: true,
      data: stats,
      period: periodDays,
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
