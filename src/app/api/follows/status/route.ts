import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { ContentType } from '@/domain/enums/Analytics';

const prisma = new PrismaClient();

/**
 * @api {get} /follows/status Check Follow Status
 * @apiName CheckFollowStatus
 * @apiGroup Follows
 * @apiVersion 0.1.0
 * @apiDescription Check if a user is following a specific content item
 * 
 * @apiParam {Number} userId User ID
 * @apiParam {String} contentType Content type (STARTUP, USER)
 * @apiParam {Number} contentId Content ID
 * 
 * @apiParamExample {url} Request-Example:
 *     /follows/status?userId=1&contentType=STARTUP&contentId=5
 * 
 * @apiSuccess {Boolean} isFollowing Whether the user is following the content
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "isFollowing": true
 *     }
 * 
 * @apiError (Error 400) {String} error Missing required parameters
 * @apiError (Error 500) {String} error Failed to check follow status
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
