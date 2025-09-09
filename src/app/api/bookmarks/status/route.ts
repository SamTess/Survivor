import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { ContentType } from '@/domain/enums/Analytics';

const prisma = new PrismaClient();

/**
 * @openapi
 * /bookmarks/status:
 *   get:
 *     summary: Check Bookmark Status
 *     description: Check if a specific content item is bookmarked by a user
 *     tags:
 *       - Bookmarks
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
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
 *         description: Content ID
 *         example: 5
 *     responses:
 *       200:
 *         description: Bookmark status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isBookmarked:
 *                   type: boolean
 *                   description: Whether the content is bookmarked
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
 *         description: Failed to check bookmark status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to check bookmark status"
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

    const bookmark = await prisma.s_BOOKMARK.findUnique({
      where: {
        userId_contentType_contentId: {
          userId,
          contentType,
          contentId,
        },
      },
    });

    return NextResponse.json({ isBookmarked: !!bookmark });
  } catch (error) {
    console.error('Error checking bookmark status:', error);
    return NextResponse.json(
      { error: 'Failed to check bookmark status' },
      { status: 500 }
    );
  }
}
