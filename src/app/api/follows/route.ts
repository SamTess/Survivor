import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { ContentType } from '@/domain/enums/Analytics';

const prisma = new PrismaClient();

/**
 * @api {post} /follows Create Follow
 * @apiName CreateFollow
 * @apiGroup Follows
 * @apiVersion 0.1.0
 * @apiDescription Follow a specific content item or user
 *
 * @apiParam {Number} userId User ID (follower)
 * @apiParam {String} contentType Content type (STARTUP, USER)
 * @apiParam {Number} contentId Content ID (target)
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "userId": 1,
 *       "contentType": "STARTUP",
 *       "contentId": 5
 *     }
 *
 * @apiSuccess {Number} followerCount Total number of followers for this content
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "followerCount": 25
 *     }
 *
 * @apiError (Error 400) {String} error Missing required fields
 * @apiError (Error 409) {String} error Already following
 * @apiError (Error 500) {String} error Failed to create follow
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 409 Conflict
 *     {
 *       "error": "Already following"
 *     }
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, contentType, contentId } = await request.json();

    if (!userId || !contentType || !contentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const existingFollow = await prisma.s_FOLLOW.findUnique({
      where: {
        followerId_targetType_targetId: {
          followerId: userId,
          targetType: contentType,
          targetId: contentId,
        },
      },
    });

    if (existingFollow) {
      return NextResponse.json(
        { error: 'Already following' },
        { status: 409 }
      );
    }

    await prisma.s_FOLLOW.create({
      data: {
        followerId: userId,
        targetType: contentType,
        targetId: contentId,
      },
    });

    let followerCount = 0;
    if (contentType === ContentType.STARTUP) {
      const startup = await prisma.s_STARTUP.update({
        where: { id: contentId },
        data: { followersCount: { increment: 1 } },
      });
      followerCount = startup.followersCount;
    } else if (contentType === ContentType.USER) {
      const user = await prisma.s_USER.update({
        where: { id: contentId },
        data: { followersCount: { increment: 1 } },
      });
      followerCount = user.followersCount;
    }

    return NextResponse.json({ followerCount });
  } catch (error) {
    console.error('Error creating follow:', error);
    return NextResponse.json(
      { error: 'Failed to create follow' },
      { status: 500 }
    );
  }
}

/**
 * @api {delete} /follows Remove Follow
 * @apiName RemoveFollow
 * @apiGroup Follows
 * @apiVersion 0.1.0
 * @apiDescription Unfollow a specific content item or user
 *
 * @apiParam {Number} userId User ID (follower)
 * @apiParam {String} contentType Content type (STARTUP, USER)
 * @apiParam {Number} contentId Content ID (target)
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "userId": 1,
 *       "contentType": "STARTUP",
 *       "contentId": 5
 *     }
 *
 * @apiSuccess {Number} followerCount Total number of followers for this content
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "followerCount": 24
 *     }
 *
 * @apiError (Error 400) {String} error Missing required fields
 * @apiError (Error 500) {String} error Failed to delete follow
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Missing required fields"
 *     }
 */
export async function DELETE(request: NextRequest) {
  try {
    const { userId, contentType, contentId } = await request.json();

    if (!userId || !contentType || !contentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await prisma.s_FOLLOW.delete({
      where: {
        followerId_targetType_targetId: {
          followerId: userId,
          targetType: contentType,
          targetId: contentId,
        },
      },
    });

    let followerCount = 0;
    if (contentType === ContentType.STARTUP) {
      const startup = await prisma.s_STARTUP.update({
        where: { id: contentId },
        data: { followersCount: { decrement: 1 } },
      });
      followerCount = startup.followersCount;
    } else if (contentType === ContentType.USER) {
      const user = await prisma.s_USER.update({
        where: { id: contentId },
        data: { followersCount: { decrement: 1 } },
      });
      followerCount = user.followersCount;
    }

    return NextResponse.json({ followerCount });
  } catch (error) {
    console.error('Error deleting follow:', error);
    return NextResponse.json(
      { error: 'Failed to delete follow' },
      { status: 500 }
    );
  }
}
