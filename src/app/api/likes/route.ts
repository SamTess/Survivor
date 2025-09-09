import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/infrastructure/persistence/prisma/client';
import { ContentType } from '@prisma/client';

/**
 * @api {post} /likes Create Like
 * @apiName CreateLike
 * @apiGroup Likes
 * @apiVersion 0.1.0
 * @apiDescription Add a like to a specific content item
 *
 * @apiParam {Number} userId User ID
 * @apiParam {String} contentType Content type (STARTUP, NEWS, EVENT)
 * @apiParam {Number} contentId Content ID
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "userId": 1,
 *       "contentType": "STARTUP",
 *       "contentId": 5
 *     }
 *
 * @apiSuccess {Number} likeCount Total number of likes for this content
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "likeCount": 42
 *     }
 *
 * @apiError (Error 400) {String} error Missing required fields
 * @apiError (Error 500) {String} error Internal server error
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Missing required fields"
 *     }
 */
export async function POST(req: NextRequest) {
  try {
    const { userId, contentType, contentId } = await req.json();

    if (!userId || !contentType || !contentId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await prisma.s_LIKE.upsert({
      where: {
        userId_contentType_contentId: {
          userId,
          contentType: contentType as ContentType,
          contentId,
        },
      },
      update: {},
      create: {
        userId,
        contentType: contentType as ContentType,
        contentId,
      },
    });

    const likeCount = await prisma.s_LIKE.count({
      where: {
        contentType: contentType as ContentType,
        contentId,
      },
    });

    if (contentType === 'STARTUP') {
      await prisma.s_STARTUP.update({
        where: { id: contentId },
        data: { likesCount: likeCount },
      });
    } else if (contentType === 'NEWS') {
      await prisma.s_NEWS.update({
        where: { id: contentId },
        data: { likesCount: likeCount },
      });
    } else if (contentType === 'EVENT') {
      await prisma.s_EVENT.update({
        where: { id: contentId },
        data: { likesCount: likeCount },
      });
    }

    return NextResponse.json({ likeCount });
  } catch (error) {
    console.error('Error creating like:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * @api {delete} /likes Remove Like
 * @apiName RemoveLike
 * @apiGroup Likes
 * @apiVersion 0.1.0
 * @apiDescription Remove a like from a specific content item
 *
 * @apiParam {Number} userId User ID
 * @apiParam {String} contentType Content type (STARTUP, NEWS, EVENT)
 * @apiParam {Number} contentId Content ID
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "userId": 1,
 *       "contentType": "STARTUP",
 *       "contentId": 5
 *     }
 *
 * @apiSuccess {Number} likeCount Total number of likes for this content
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "likeCount": 41
 *     }
 *
 * @apiError (Error 400) {String} error Missing required fields
 * @apiError (Error 500) {String} error Internal server error
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Missing required fields"
 *     }
 */
export async function DELETE(req: NextRequest) {
  try {
    const { userId, contentType, contentId } = await req.json();

    if (!userId || !contentType || !contentId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await prisma.s_LIKE.delete({
      where: {
        userId_contentType_contentId: {
          userId,
          contentType: contentType as ContentType,
          contentId,
        },
      },
    });

    const likeCount = await prisma.s_LIKE.count({
      where: {
        contentType: contentType as ContentType,
        contentId,
      },
    });

    if (contentType === 'STARTUP') {
      await prisma.s_STARTUP.update({
        where: { id: contentId },
        data: { likesCount: likeCount },
      });
    } else if (contentType === 'NEWS') {
      await prisma.s_NEWS.update({
        where: { id: contentId },
        data: { likesCount: likeCount },
      });
    } else if (contentType === 'EVENT') {
      await prisma.s_EVENT.update({
        where: { id: contentId },
        data: { likesCount: likeCount },
      });
    }

    return NextResponse.json({ likeCount });
  } catch (error) {
    console.error('Error deleting like:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
