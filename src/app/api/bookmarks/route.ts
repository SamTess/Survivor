import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { ContentType } from '@/domain/enums/Analytics';

const prisma = new PrismaClient();

/**
 * @api {post} /bookmarks Create Bookmark
 * @apiName CreateBookmark
 * @apiGroup Bookmarks
 * @apiVersion 0.1.0
 * @apiDescription Add a bookmark for a specific content item
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
 * @apiSuccess {Number} bookmarkCount Total number of bookmarks for this content
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "bookmarkCount": 15
 *     }
 *
 * @apiError (Error 400) {String} error Missing required fields
 * @apiError (Error 409) {String} error Already bookmarked
 * @apiError (Error 500) {String} error Failed to create bookmark
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 409 Conflict
 *     {
 *       "error": "Already bookmarked"
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

    const existingBookmark = await prisma.s_BOOKMARK.findUnique({
      where: {
        userId_contentType_contentId: {
          userId,
          contentType,
          contentId,
        },
      },
    });

    if (existingBookmark) {
      return NextResponse.json(
        { error: 'Already bookmarked' },
        { status: 409 }
      );
    }

    await prisma.s_BOOKMARK.create({
      data: {
        userId,
        contentType,
        contentId,
      },
    });

    let bookmarkCount = 0;
    if (contentType === ContentType.STARTUP) {
      const startup = await prisma.s_STARTUP.update({
        where: { id: contentId },
        data: { bookmarksCount: { increment: 1 } },
      });
      bookmarkCount = startup.bookmarksCount;
    } else if (contentType === ContentType.NEWS) {
      const news = await prisma.s_NEWS.update({
        where: { id: contentId },
        data: { bookmarksCount: { increment: 1 } },
      });
      bookmarkCount = news.bookmarksCount;
    } else if (contentType === ContentType.EVENT) {
      const event = await prisma.s_EVENT.update({
        where: { id: contentId },
        data: { bookmarksCount: { increment: 1 } },
      });
      bookmarkCount = event.bookmarksCount;
    }

    return NextResponse.json({ bookmarkCount });
  } catch (error) {
    console.error('Error creating bookmark:', error);
    return NextResponse.json(
      { error: 'Failed to create bookmark' },
      { status: 500 }
    );
  }
}

/**
 * @api {delete} /bookmarks Remove Bookmark
 * @apiName RemoveBookmark
 * @apiGroup Bookmarks
 * @apiVersion 0.1.0
 * @apiDescription Remove a bookmark for a specific content item
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
 * @apiSuccess {Number} bookmarkCount Total number of bookmarks for this content
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "bookmarkCount": 14
 *     }
 *
 * @apiError (Error 400) {String} error Missing required fields
 * @apiError (Error 500) {String} error Failed to delete bookmark
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

    await prisma.s_BOOKMARK.delete({
      where: {
        userId_contentType_contentId: {
          userId,
          contentType,
          contentId,
        },
      },
    });

    let bookmarkCount = 0;
    if (contentType === ContentType.STARTUP) {
      const startup = await prisma.s_STARTUP.update({
        where: { id: contentId },
        data: { bookmarksCount: { decrement: 1 } },
      });
      bookmarkCount = startup.bookmarksCount;
    } else if (contentType === ContentType.NEWS) {
      const news = await prisma.s_NEWS.update({
        where: { id: contentId },
        data: { bookmarksCount: { decrement: 1 } },
      });
      bookmarkCount = news.bookmarksCount;
    } else if (contentType === ContentType.EVENT) {
      const event = await prisma.s_EVENT.update({
        where: { id: contentId },
        data: { bookmarksCount: { decrement: 1 } },
      });
      bookmarkCount = event.bookmarksCount;
    }

    return NextResponse.json({ bookmarkCount });
  } catch (error) {
    console.error('Error deleting bookmark:', error);
    return NextResponse.json(
      { error: 'Failed to delete bookmark' },
      { status: 500 }
    );
  }
}
