import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { ContentType } from '@/domain/enums/Analytics';

const prisma = new PrismaClient();

/**
 * @openapi
 * /follows/status:
 *   get:
 *     summary: Check Follow Status
 *     description: Check if a user is following a specific content item
 *     tags:
 *       - Follows
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: User ID
 *         example: 1
 *       - in: query
 *         name: contentType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [STARTUP, NEWS, EVENT, USER, FOUNDER, PARTNER]
 *         description: Content type
 *         example: "STARTUP"
 *       - in: query
 *         name: contentId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Content ID
 *         example: 5
 *     responses:
 *       200:
 *         description: Follow status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isFollowing:
 *                   type: boolean
 *                   description: Whether the user is following the content
 *                   example: true
 *       400:
 *         description: Missing required parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Missing required parameters"
 *       500:
 *         description: Failed to check follow status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to check follow status"
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = parseInt(searchParams.get('userId') || '0');
    const contentType = searchParams.get('contentType') as ContentType;
    const contentId = parseInt(searchParams.get('contentId') || '0');

    if (!userId || !contentType || !contentId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const follow = await prisma.s_FOLLOW.findUnique({
      where: {
        followerId_targetType_targetId: {
          followerId: userId,
          targetType: contentType,
          targetId: contentId,
        },
      },
    });

    return NextResponse.json({ isFollowing: !!follow });
  } catch (error) {
    console.error('Error checking follow status:', error);
    return NextResponse.json(
      { error: 'Failed to check follow status' },
      { status: 500 }
    );
  }
}
