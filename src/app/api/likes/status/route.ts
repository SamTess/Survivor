import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/infrastructure/persistence/prisma/client';
import { ContentType } from '@prisma/client';

/**
 * @openapi
 * /likes/status:
 *   get:
 *     summary: Check Like Status
 *     description: Check if a user has liked a specific content item
 *     tags:
 *       - Likes
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
 *         description: Like status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isLiked:
 *                   type: boolean
 *                   description: Whether the content is liked by the user
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
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = parseInt(searchParams.get('userId') || '0', 10);
    const contentType = searchParams.get('contentType') as ContentType | null;
    const contentId = parseInt(searchParams.get('contentId') || '0', 10);

    if (!userId || !contentType || !contentId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const like = await prisma.s_LIKE.findUnique({
      where: {
        userId_contentType_contentId: {
          userId,
          contentType,
          contentId,
        },
      },
    });

    return NextResponse.json({ isLiked: !!like });
  } catch (error) {
    console.error('Error checking like status:', error);
    return NextResponse.json({ error: 'Failed to check like status' }, { status: 500 });
  }
}
