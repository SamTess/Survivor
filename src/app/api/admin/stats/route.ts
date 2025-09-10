import { NextResponse } from 'next/server';
import { AdminStatsService } from '../../../../application/services/AdminStatsService';

/**
 * @openapi
 * /admin/stats:
 *   get:
 *     summary: Get Admin Statistics
 *     description: Retrieve basic statistics for the admin dashboard
 *     tags:
 *       - Admin
 *     security:
 *       - cookieAuth: []
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
 *                     totalUsers:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: integer
 *                           description: Total number of users
 *                           example: 1250
 *                         trend:
 *                           type: string
 *                           description: Trend percentage
 *                           example: "+5.2%"
 *                         description:
 *                           type: string
 *                           description: Description of the metric
 *                           example: "Total registered users"
 *                     activeProjects:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: integer
 *                           description: Number of active projects
 *                           example: 89
 *                         trend:
 *                           type: string
 *                           description: Trend percentage
 *                           example: "+12.1%"
 *                         description:
 *                           type: string
 *                           description: Description of the metric
 *                           example: "Active startup projects"
 *                     newsArticles:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: integer
 *                           description: Number of news articles
 *                           example: 156
 *                         trend:
 *                           type: string
 *                           description: Trend percentage
 *                           example: "-2.3%"
 *                         description:
 *                           type: string
 *                           description: Description of the metric
 *                           example: "Published news articles"
 *                     upcomingEvents:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: integer
 *                           description: Number of upcoming events
 *                           example: 23
 *                         trend:
 *                           type: string
 *                           description: Trend percentage
 *                           example: "+8.7%"
 *                         description:
 *                           type: string
 *                           description: Description of the metric
 *                           example: "Upcoming events"
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
 *                   example: "Failed to fetch admin statistics"
 *                 generatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: Timestamp when the error occurred
 *                   example: "2025-09-09T12:00:00.000Z"
 */

const adminStatsService = new AdminStatsService();

export async function GET() {
  try {
    const stats = await adminStatsService.getBasicStats();

    return NextResponse.json({
      success: true,
      data: stats,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch admin statistics',
        generatedAt: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}