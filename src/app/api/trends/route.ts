import { NextResponse } from 'next/server';
import { AdminStatsService } from '../../../application/services/AdminStatsService';

export interface TrendData {
  totalUsers: string;
  activeProjects: string;
  NewsArticle: string;
  UpcommingEvents: string;
}

/**
 * @openapi
 * /trends:
 *   get:
 *     summary: Get Trends Data
 *     description: Retrieve trend information for key metrics (users, projects, news, events)
 *     tags:
 *       - Analytics
 *     responses:
 *       200:
 *         description: Trends data retrieved successfully
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
 *                     totalUsers:
 *                       type: string
 *                       description: Trend for total users
 *                       example: "+5.2%"
 *                     activeProjects:
 *                       type: string
 *                       description: Trend for active projects
 *                       example: "+12.1%"
 *                     NewsArticle:
 *                       type: string
 *                       description: Trend for news articles
 *                       example: "-2.3%"
 *                     UpcommingEvents:
 *                       type: string
 *                       description: Trend for upcoming events
 *                       example: "+8.7%"
 *                 generatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: Timestamp when the data was generated
 *                   example: "2025-09-09T12:00:00.000Z"
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
 *                   example: "Failed to calculate trends"
 */

const adminStatsService = new AdminStatsService();

export async function GET() {
  try {
    const stats = await adminStatsService.getBasicStats();

    const trends: TrendData = {
      totalUsers: stats.totalUsers.trend,
      activeProjects: stats.activeProjects.trend,
      NewsArticle: stats.newsArticles.trend,
      UpcommingEvents: stats.upcomingEvents.trend
    };

    return NextResponse.json({
      success: true,
      data: trends,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching trends:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to calculate trends'
      },
      { status: 500 }
    );
  }
}
