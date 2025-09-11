import { NextRequest, NextResponse } from 'next/server';
import { FounderService } from '../../../../../application/services/founders/FounderService';
import { FounderRepositoryPrisma } from '../../../../../infrastructure/persistence/prisma/FounderRepositoryPrisma';

const founderRepository = new FounderRepositoryPrisma();
const founderService = new FounderService(founderRepository);

/**
 * @openapi
 * /api/users/{id}/founder:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user's founder profiles
 *     description: Retrieve all founder profiles associated with a specific user
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User unique ID
 *     responses:
 *       200:
 *         description: Founder profiles retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       userId:
 *                         type: integer
 *                         example: 5
 *                       name:
 *                         type: string
 *                         example: "John Doe"
 *                       role:
 *                         type: string
 *                         example: "CEO & Founder"
 *                       bio:
 *                         type: string
 *                         example: "Experienced entrepreneur with 10+ years in tech"
 *                       expertise:
 *                         type: string
 *                         example: "Product Development, Team Leadership"
 *                       experience:
 *                         type: string
 *                         example: "Former CTO at TechCorp, Founded 2 previous startups"
 *                       linkedin:
 *                         type: string
 *                         format: uri
 *                         example: "https://linkedin.com/in/johndoe"
 *                       twitter:
 *                         type: string
 *                         format: uri
 *                         example: "https://twitter.com/johndoe"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-01T00:00:00.000Z"
 *             example:
 *               success: true
 *               data:
 *                 - id: 1
 *                   userId: 5
 *                   name: "John Doe"
 *                   role: "CEO & Founder"
 *                   bio: "Experienced entrepreneur with 10+ years in tech"
 *                   expertise: "Product Development, Team Leadership"
 *                   experience: "Former CTO at TechCorp, Founded 2 previous startups"
 *                   linkedin: "https://linkedin.com/in/johndoe"
 *                   twitter: "https://twitter.com/johndoe"
 *                   createdAt: "2024-01-01T00:00:00.000Z"
 *       400:
 *         description: Bad request - Invalid user ID
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
 *                   example: "Invalid user ID"
 *       404:
 *         description: No founders found for this user
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
 *                   example: "No founders found for this user"
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
 *                   example: "Failed to fetch founders"
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const userId = parseInt(paramId);

    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const founders = await founderService.getFoundersByUserId(userId);

    if (!founders || founders.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No founders found for this user' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: founders });

  } catch (error) {
    console.error('Error fetching founders by user ID:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch founders'
      },
      { status: 500 }
    );
  }
}
