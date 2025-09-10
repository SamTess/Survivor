import { NextResponse } from 'next/server';
import { AdminStatsService } from '../../../../application/services/AdminStatsService';

/**
 * @openapi
 * /admin/recent-activities:
 *   get:
 *     summary: Get Recent Activities
 *     description: Retrieve recent activities and their summary for admin dashboard
 *     tags:
 *       - Admin
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Recent activities retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 activities:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Activity ID
 *                         example: "act_123"
 *                       type:
 *                         type: string
 *                         enum: [user, project, news, event]
 *                         description: Type of activity
 *                         example: "user"
 *                       action:
 *                         type: string
 *                         description: Action performed
 *                         example: "created"
 *                       description:
 *                         type: string
 *                         description: Detailed description
 *                         example: "New user registered"
 *                       user:
 *                         type: string
 *                         description: User who performed the action
 *                         example: "john.doe@example.com"
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                         description: When the activity occurred
 *                         example: "2025-09-09T10:30:00.000Z"
 *                       severity:
 *                         type: string
 *                         enum: [low, medium, high]
 *                         description: Severity level
 *                         example: "medium"
 *                 summary:
 *                   type: object
 *                   properties:
 *                     userActions:
 *                       type: integer
 *                       description: Number of user-related actions
 *                       example: 15
 *                     projectChanges:
 *                       type: integer
 *                       description: Number of project changes
 *                       example: 8
 *                     contentUpdates:
 *                       type: integer
 *                       description: Number of content updates
 *                       example: 12
 *                     eventsModified:
 *                       type: integer
 *                       description: Number of event modifications
 *                       example: 3
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to fetch recent activities"
 */

const adminStatsService = new AdminStatsService();

export async function GET() {
  try {
    const data = await adminStatsService.getRecentActivities();

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent activities' },
      { status: 500 }
    );
  }
}