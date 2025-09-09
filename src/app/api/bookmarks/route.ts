import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { ContentType } from '@/domain/enums/Analytics';

const prisma = new PrismaClient();

/**
 * @openapi
 * /bookmarks:
 *   post:
 *     summary: Create Bookmark
 *     description: Add a bookmark for a specific content item
 *     tags:
 *       - Bookmarks
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - contentType
 *               - contentId
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: User ID
 *                 example: 1
 *               contentType:
 *                 type: string
 *                 enum: [STARTUP, NEWS, EVENT, USER, FOUNDER, PARTNER]
 *                 description: Content type
 *                 example: "STARTUP"
 *               contentId:
 *                 type: integer
 *                 description: Content ID
 *                 example: 5
 *     responses:
 *       200:
 *         description: Bookmark created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bookmarkCount:
 *                   type: integer
 *                   description: Total number of bookmarks for this content
 *                   example: 15
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Missing required fields"
 *       409:
 *         description: Already bookmarked
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Already bookmarked"
 *       500:
 *         description: Failed to create bookmark
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to create bookmark"
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
 * @openapi
 * /bookmarks:
 *   delete:
 *     summary: Remove Bookmark
 *     description: Remove a bookmark for a specific content item
 *     tags:
 *       - Bookmarks
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - contentType
 *               - contentId
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: User ID
 *                 example: 1
 *               contentType:
 *                 type: string
 *                 enum: [STARTUP, NEWS, EVENT, USER, FOUNDER, PARTNER]
 *                 description: Content type
 *                 example: "STARTUP"
 *               contentId:
 *                 type: integer
 *                 description: Content ID
 *                 example: 5
 *     responses:
 *       200:
 *         description: Bookmark removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bookmarkCount:
 *                   type: integer
 *                   description: Total number of bookmarks for this content
 *                   example: 14
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Missing required fields"
 *       500:
 *         description: Failed to delete bookmark
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to delete bookmark"
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
