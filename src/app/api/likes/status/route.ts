import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/infrastructure/persistence/prisma/client';
import { ContentType } from '@prisma/client';

/**
 * @api {get} /likes/status Check Like Status
 * @apiName CheckLikeStatus
 * @apiGroup Likes
 * @apiVersion 0.1.0
 * @apiDescription Check if a user has liked a specific content item
 * 
 * @apiParam {Number} userId User ID
 * @apiParam {String} contentType Content type (STARTUP, NEWS, EVENT)
 * @apiParam {Number} contentId Content ID
 * 
 * @apiParamExample {url} Request-Example:
 *     /likes/status?userId=1&contentType=STARTUP&contentId=5
 * 
 * @apiSuccess {Boolean} isLiked Whether the content is liked by the user
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "isLiked": true
 *     }
 * 
 * @apiError (Error 400) {String} error Missing required parameters
 * @apiError (Error 500) {String} error Internal server error
 * 
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Missing required parameters"
 *     }
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const contentType = searchParams.get('contentType');
    const contentId = searchParams.get('contentId');

    if (!userId || !contentType || !contentId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const like = await prisma.s_LIKE.findUnique({
      where: {
        userId_contentType_contentId: {
          userId: parseInt(userId),
          contentType: contentType as ContentType,
          contentId: parseInt(contentId),
        },
      },
    });

    return NextResponse.json({ isLiked: !!like });
  } catch (error) {
    console.error('Error checking like status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
