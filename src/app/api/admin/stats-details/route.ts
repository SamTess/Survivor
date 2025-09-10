import { NextResponse } from 'next/server';
import { AdminStatsService } from '../../../../application/services/AdminStatsService';

/**
 * @openapi
 * /admin/stats-details:
 *   get:
 *     summary: Get Detailed Admin Statistics
 *     description: Retrieve comprehensive detailed statistics for admin analysis
 *     tags:
 *       - Admin
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Detailed statistics retrieved successfully
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
 *                     recentUsers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: User ID
 *                             example: 123
 *                           email:
 *                             type: string
 *                             format: email
 *                             description: User email
 *                             example: "user@example.com"
 *                           name:
 *                             type: string
 *                             description: User name
 *                             example: "John Doe"
 *                           registrationDate:
 *                             type: string
 *                             format: date
 *                             description: Registration date
 *                             example: "2025-08-15"
 *                           lastActivity:
 *                             type: string
 *                             format: date
 *                             description: Last activity date
 *                             example: "2025-09-08"
 *                           role:
 *                             type: string
 *                             description: User role
 *                             example: "USER"
 *                           status:
 *                             type: string
 *                             enum: [active, inactive, pending]
 *                             description: User status
 *                             example: "active"
 *                     recentProjects:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: Project ID
 *                             example: 456
 *                           name:
 *                             type: string
 *                             description: Project name
 *                             example: "Tech Startup"
 *                           description:
 *                             type: string
 *                             description: Project description
 *                             example: "Innovative tech solution"
 *                           status:
 *                             type: string
 *                             enum: [active, pending, approved, rejected]
 *                             description: Project status
 *                             example: "active"
 *                           createdDate:
 *                             type: string
 *                             format: date
 *                             description: Creation date
 *                             example: "2025-07-20"
 *                           founder:
 *                             type: string
 *                             nullable: true
 *                             description: Founder name
 *                             example: "Jane Smith"
 *                           category:
 *                             type: string
 *                             description: Project category
 *                             example: "Technology"
 *                           funding:
 *                             type: number
 *                             description: Funding amount
 *                             example: 50000
 *                           views:
 *                             type: integer
 *                             description: Number of views
 *                             example: 1250
 *                           likes:
 *                             type: integer
 *                             description: Number of likes
 *                             example: 89
 *                           bookmarks:
 *                             type: integer
 *                             description: Number of bookmarks
 *                             example: 34
 *                     recentNews:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: News ID
 *                             example: 789
 *                           title:
 *                             type: string
 *                             description: News title
 *                             example: "New Funding Round"
 *                           publishDate:
 *                             type: string
 *                             format: date
 *                             description: Publication date
 *                             example: "2025-09-01"
 *                           author:
 *                             type: string
 *                             nullable: true
 *                             description: Author name
 *                             example: "Editor Team"
 *                           views:
 *                             type: integer
 *                             description: Number of views
 *                             example: 2340
 *                           status:
 *                             type: string
 *                             enum: [published, draft, archived]
 *                             description: News status
 *                             example: "published"
 *                           category:
 *                             type: string
 *                             description: News category
 *                             example: "Funding"
 *                     upcomingEvents:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: Event ID
 *                             example: 101
 *                           title:
 *                             type: string
 *                             description: Event title
 *                             example: "Startup Pitch Night"
 *                           date:
 *                             type: string
 *                             format: date
 *                             description: Event date
 *                             example: "2025-09-15"
 *                           status:
 *                             type: string
 *                             enum: [upcoming, ongoing, completed, cancelled]
 *                             description: Event status
 *                             example: "upcoming"
 *                           participants:
 *                             type: integer
 *                             description: Number of participants
 *                             example: 150
 *                           type:
 *                             type: string
 *                             description: Event type
 *                             example: "Networking"
 *                           location:
 *                             type: string
 *                             nullable: true
 *                             description: Event location
 *                             example: "Tech Hub, Downtown"
 *                     userGrowthChart:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: string
 *                             description: Month label
 *                             example: "Sep 2025"
 *                           users:
 *                             type: integer
 *                             description: Number of users
 *                             example: 1200
 *                           growth:
 *                             type: number
 *                             description: Growth percentage
 *                             example: 5.2
 *                     projectsDistribution:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           status:
 *                             type: string
 *                             description: Project status
 *                             example: "active"
 *                           count:
 *                             type: integer
 *                             description: Number of projects
 *                             example: 45
 *                           percentage:
 *                             type: number
 *                             description: Percentage
 *                             example: 50.6
 *                     newsPerformance:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           title:
 *                             type: string
 *                             description: News title
 *                             example: "Market Trends 2025"
 *                           views:
 *                             type: integer
 *                             description: Number of views
 *                             example: 1850
 *                           engagement:
 *                             type: number
 *                             description: Engagement rate
 *                             example: 12.5
 *                     eventsStats:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             description: Event type
 *                             example: "Workshop"
 *                           count:
 *                             type: integer
 *                             description: Number of events
 *                             example: 8
 *                           avgParticipants:
 *                             type: number
 *                             description: Average participants
 *                             example: 75.5
 *                           totalViews:
 *                             type: integer
 *                             description: Total views
 *                             example: 3200
 *                           avgViews:
 *                             type: number
 *                             description: Average views
 *                             example: 400
 *                           totalEngagement:
 *                             type: number
 *                             description: Total engagement
 *                             example: 1250
 *                           avgEngagement:
 *                             type: number
 *                             description: Average engagement
 *                             example: 156.25
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
 *                   example: "Failed to fetch admin statistics details"
 *                 generatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: Timestamp when the error occurred
 *                   example: "2025-09-09T12:00:00.000Z"
 */

const adminStatsService = new AdminStatsService();

export async function GET() {
  try {
    const statsDetails = await adminStatsService.getDetailedStats();

    return NextResponse.json({
      success: true,
      data: statsDetails,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching admin stats details:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch admin statistics details',
        generatedAt: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
