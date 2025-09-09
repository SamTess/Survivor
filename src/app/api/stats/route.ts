import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/infrastructure/security/auth';
import { StatisticsService } from '../../../application/services/statistics/StatisticsService';
import { StatisticsRepositoryPrisma } from '../../../infrastructure/repositories/statistics/StatisticsRepositoryPrisma';
import { StatisticsFilters } from '../../../domain/interfaces/Statistics';

/**
 * @api {get} /stats Get Platform Statistics
 * @apiName GetStats
 * @apiGroup Analytics
 * @apiVersion 0.1.0
 * @apiDescription Retrieve comprehensive statistics and analytics data for the platform
 *
 * @apiHeader {String} Cookie Authentication cookie with JWT token
 *
 * @apiQuery {String} [period=30] Time period in days (or "all" for all time)
 * @apiQuery {String} [scope=user] Statistics scope ("user" for user-owned content, "admin" for platform-wide)
 * @apiQuery {String} [contentType=all] Content type filter ("all", "startup", "news", "event")
 *
 * @apiSuccess {Boolean} success Operation success status
 * @apiSuccess {Object} data Statistics data object
 * @apiSuccess {Object} data.overview Overview metrics
 * @apiSuccess {Number} data.overview.totalViews Total content views
 * @apiSuccess {Number} data.overview.totalLikes Total likes
 * @apiSuccess {Number} data.overview.totalBookmarks Total bookmarks
 * @apiSuccess {Number} data.overview.totalFollows Total follows
 * @apiSuccess {Number} data.overview.totalActiveUsers Number of active users
 * @apiSuccess {Number} data.overview.conversionRate Engagement conversion rate
 * @apiSuccess {Number} data.overview.totalSessions Total user sessions
 * @apiSuccess {Number} data.overview.viewsThisMonth Views in current month
 * @apiSuccess {String} data.overview.lastUpdated Last update timestamp
 * @apiSuccess {Object} data.platform Platform-wide metrics (admin only)
 * @apiSuccess {Number} data.platform.totalStartups Total number of startups
 * @apiSuccess {Number} data.platform.totalEvents Total number of events
 * @apiSuccess {Number} data.platform.totalNews Total number of news articles
 * @apiSuccess {Number} data.platform.totalUsers Total number of users
 * @apiSuccess {Object} data.charts Chart data
 * @apiSuccess {Number[]} data.charts.monthlyViews Daily view counts
 * @apiSuccess {Number[]} data.charts.activeUsers Daily interaction counts
 * @apiSuccess {Object} data.topContent Top performing content
 * @apiSuccess {Object[]} data.topContent.startups Top 5 startups by views
 * @apiSuccess {Object[]} data.topContent.events Top 5 events by views
 * @apiSuccess {Object[]} data.topContent.news Top 5 news articles by views
 * @apiSuccess {String} period Time period used
 * @apiSuccess {String} contentType Content type filter used
 * @apiSuccess {String} scope Statistics scope used
 * @apiSuccess {Number[]} [startupIds] User's startup IDs (user scope only)
 * @apiSuccess {String} generatedAt Statistics generation timestamp
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "data": {
 *         "overview": {
 *           "totalViews": 15420,
 *           "totalLikes": 892,
 *           "totalBookmarks": 234,
 *           "totalFollows": 156,
 *           "totalActiveUsers": 3,
 *           "conversionRate": 0.073,
 *           "totalSessions": 0,
 *           "viewsThisMonth": 15420,
 *           "lastUpdated": "2024-01-15T16:00:00.000Z"
 *         },
 *         "platform": {
 *           "totalStartups": 25,
 *           "totalEvents": 12,
 *           "totalNews": 45,
 *           "totalUsers": 150
 *         },
 *         "charts": {
 *           "monthlyViews": [120, 145, 200, 180, 220],
 *           "activeUsers": [45, 52, 38, 67, 71]
 *         },
 *         "topContent": {
 *           "startups": [
 *             {
 *               "id": 1,
 *               "name": "TechVenture AI",
 *               "viewsCount": 2340,
 *               "likesCount": 87,
 *               "bookmarksCount": 23,
 *               "followersCount": 45
 *             }
 *           ],
 *           "events": [],
 *           "news": [
 *             {
 *               "id": 1,
 *               "title": "Tech Startup Raises $10M",
 *               "viewsCount": 1250,
 *               "likesCount": 67,
 *               "bookmarksCount": 18,
 *               "startup_id": 1
 *             }
 *           ]
 *         }
 *       },
 *       "period": "30",
 *       "contentType": "all",
 *       "scope": "user",
 *       "startupIds": [1, 3, 5],
 *       "generatedAt": "2024-01-15T16:00:00.000Z"
 *     }
 *
 * @apiError (Error 401) {Boolean} success False
 * @apiError (Error 401) {String} error Unauthorized - authentication required
 * @apiError (Error 403) {Boolean} success False
 * @apiError (Error 403) {String} error Admin access required (for admin scope)
 * @apiError (Error 500) {Boolean} success False
 * @apiError (Error 500) {String} error Internal server error
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 403 Forbidden
 *     {
 *       "success": false,
 *       "error": "Admin access required"
 *     }
 *
 * @apiDescription This endpoint provides comprehensive analytics using Clean Architecture principles:
 * - Domain layer: Defines statistics entities and repository interfaces
 * - Application layer: Contains business logic in StatisticsService
 * - Infrastructure layer: Implements data access with StatisticsRepositoryPrisma
 * - Presentation layer: This API route handles HTTP concerns
 *
 * Features include:
 * - Content performance metrics (views, likes, bookmarks, follows)
 * - Time-series data for charts and trends
 * - Top performing content rankings
 * - Platform-wide statistics (admin only)
 * - User-specific metrics filtered by ownership
 *
 * The scope parameter determines data access:
 * - "user": Only content owned by the authenticated user
 * - "admin": Platform-wide data (requires admin role)
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
