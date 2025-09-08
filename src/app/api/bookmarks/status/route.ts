import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { ContentType } from '@/domain/enums/Analytics';

const prisma = new PrismaClient();

/**
 * @api {get} /bookmarks/status Check Bookmark Status
 * @apiName CheckBookmarkStatus
 * @apiGroup Bookmarks
 * @apiVersion 0.1.0
 * @apiDescription Check if a specific content item is bookmarked by a user
 *
 * @apiParam {Number} userId User ID
 * @apiParam {String} contentType Content type (STARTUP, NEWS, EVENT)
 * @apiParam {Number} contentId Content ID
 *
 * @apiParamExample {url} Request-Example:
 *     /bookmarks/status?userId=1&contentType=STARTUP&contentId=5
 *
 * @apiSuccess {Boolean} isBookmarked Whether the content is bookmarked
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "isBookmarked": true
 *     }
 *
 * @apiError (Error 400) {String} error Missing required parameters
 * @apiError (Error 500) {String} error Failed to check bookmark status
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Missing required parameters"
 *     }
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
