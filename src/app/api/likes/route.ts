import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/infrastructure/persistence/prisma/client';
import { ContentType } from '@prisma/client';

/**
 * @openapi
 * /likes:
 *   post:
 *     summary: Create Like
 *     description: Add a like to a specific content item
 *     tags:
 *       - Likes
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
 *         description: Like added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 likeCount:
 *                   type: integer
 *                   description: Total number of likes for this content
 *                   example: 42
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
 * @openapi
 * /likes:
 *   delete:
 *     summary: Remove Like
 *     description: Remove a like from a specific content item
 *     tags:
 *       - Likes
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
 *         description: Like removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 likeCount:
 *                   type: integer
 *                   description: Total number of likes for this content
 *                   example: 41
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
