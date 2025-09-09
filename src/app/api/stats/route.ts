import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/infrastructure/security/auth';
import { StatisticsService } from '../../../application/services/statistics/StatisticsService';
import { StatisticsRepositoryPrisma } from '../../../infrastructure/repositories/statistics/StatisticsRepositoryPrisma';
import { StatisticsFilters } from '../../../domain/interfaces/Statistics';

/**
 * @openapi
 * /api/stats:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Get platform statistics
 *     description: |
 *       Retrieve comprehensive statistics and analytics data for the platform.
 *
 *       This endpoint provides comprehensive analytics using Clean Architecture principles:
 *       - Domain layer: Defines statistics entities and repository interfaces
 *       - Application layer: Contains business logic in StatisticsService
 *       - Infrastructure layer: Implements data access with StatisticsRepositoryPrisma
 *       - Presentation layer: This API route handles HTTP concerns
 *
 *       Features include:
 *       - Content performance metrics (views, likes, bookmarks, follows)
 *       - Time-series data for charts and trends
 *       - Top performing content rankings
 *       - Platform-wide statistics (admin only)
 *       - User-specific metrics filtered by ownership
 *
 *       The scope parameter determines data access:
 *       - "user": Only content owned by the authenticated user
 *       - "admin": Platform-wide data (requires admin role)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           default: "30"
 *         description: Time period in days (or "all" for all time)
 *       - in: query
 *         name: scope
 *         schema:
 *           type: string
 *           enum: [user, admin]
 *           default: "user"
 *         description: Statistics scope ("user" for user-owned content, "admin" for platform-wide)
 *       - in: query
 *         name: contentType
 *         schema:
 *           type: string
 *           enum: [all, startup, news, event]
 *           default: "all"
 *         description: Content type filter
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     overview:
 *                       type: object
 *                       properties:
 *                         totalViews:
 *                           type: integer
 *                           example: 15420
 *                         totalLikes:
 *                           type: integer
 *                           example: 892
 *                         totalBookmarks:
 *                           type: integer
 *                           example: 234
 *                         totalFollows:
 *                           type: integer
 *                           example: 156
 *                         totalActiveUsers:
 *                           type: integer
 *                           example: 3
 *                         conversionRate:
 *                           type: number
 *                           format: float
 *                           example: 0.073
 *                         totalSessions:
 *                           type: integer
 *                           example: 0
 *                         viewsThisMonth:
 *                           type: integer
 *                           example: 15420
 *                         lastUpdated:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-01-15T16:00:00.000Z"
 *                     platform:
 *                       type: object
 *                       description: Platform-wide metrics (admin only)
 *                       properties:
 *                         totalStartups:
 *                           type: integer
 *                           example: 25
 *                         totalEvents:
 *                           type: integer
 *                           example: 12
 *                         totalNews:
 *                           type: integer
 *                           example: 45
 *                         totalUsers:
 *                           type: integer
 *                           example: 150
 *                     charts:
 *                       type: object
 *                       properties:
 *                         monthlyViews:
 *                           type: array
 *                           items:
 *                             type: integer
 *                           example: [120, 145, 200, 180, 220]
 *                         activeUsers:
 *                           type: array
 *                           items:
 *                             type: integer
 *                           example: [45, 52, 38, 67, 71]
 *                     topContent:
 *                       type: object
 *                       properties:
 *                         startups:
 *                           type: array
 *                           description: Top 5 startups by views
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                               name:
 *                                 type: string
 *                               viewsCount:
 *                                 type: integer
 *                               likesCount:
 *                                 type: integer
 *                               bookmarksCount:
 *                                 type: integer
 *                               followersCount:
 *                                 type: integer
 *                         events:
 *                           type: array
 *                           description: Top 5 events by views
 *                           items:
 *                             type: object
 *                         news:
 *                           type: array
 *                           description: Top 5 news articles by views
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                               title:
 *                                 type: string
 *                               viewsCount:
 *                                 type: integer
 *                               likesCount:
 *                                 type: integer
 *                               bookmarksCount:
 *                                 type: integer
 *                               startup_id:
 *                                 type: integer
 *                 period:
 *                   type: string
 *                   example: "30"
 *                 contentType:
 *                   type: string
 *                   example: "all"
 *                 scope:
 *                   type: string
 *                   example: "user"
 *                 startupIds:
 *                   type: array
 *                   items:
 *                     type: integer
 *                   description: User's startup IDs (user scope only)
 *                   example: [1, 3, 5]
 *                 generatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T16:00:00.000Z"
 *             example:
 *               success: true
 *               data:
 *                 overview:
 *                   totalViews: 15420
 *                   totalLikes: 892
 *                   totalBookmarks: 234
 *                   totalFollows: 156
 *                   totalActiveUsers: 3
 *                   conversionRate: 0.073
 *                   totalSessions: 0
 *                   viewsThisMonth: 15420
 *                   lastUpdated: "2024-01-15T16:00:00.000Z"
 *                 platform:
 *                   totalStartups: 25
 *                   totalEvents: 12
 *                   totalNews: 45
 *                   totalUsers: 150
 *                 charts:
 *                   monthlyViews: [120, 145, 200, 180, 220]
 *                   activeUsers: [45, 52, 38, 67, 71]
 *                 topContent:
 *                   startups:
 *                     - id: 1
 *                       name: "TechVenture AI"
 *                       viewsCount: 2340
 *                       likesCount: 87
 *                       bookmarksCount: 23
 *                       followersCount: 45
 *                   events: []
 *                   news:
 *                     - id: 1
 *                       title: "Tech Startup Raises $10M"
 *                       viewsCount: 1250
 *                       likesCount: 67
 *                       bookmarksCount: 18
 *                       startup_id: 1
 *               period: "30"
 *               contentType: "all"
 *               scope: "user"
 *               startupIds: [1, 3, 5]
 *               generatedAt: "2024-01-15T16:00:00.000Z"
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *       403:
 *         description: Admin access required (for admin scope)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Admin access required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Failed to fetch statistics"
 */

const statisticsRepository = new StatisticsRepositoryPrisma();
const statisticsService = new StatisticsService(statisticsRepository);

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

    const filters: StatisticsFilters = {
      period,
      scope,
      contentType,
      userId: payload.userId,
      startDate: startDate || undefined
    };

    const statisticsData = await statisticsService.getStatistics(filters);

    let startupIds: number[] | undefined;
    if (scope === 'user') {
      startupIds = await statisticsRepository.getStartupIds(payload.userId, false);
    }

    return NextResponse.json({
      success: true,
      data: statisticsData,
      period: period,
      contentType: contentType,
      scope,
      startupIds: scope === 'admin' ? undefined : startupIds,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching statistics:', error);

    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch statistics'
      },
      { status: 500 }
    );
  }
}
