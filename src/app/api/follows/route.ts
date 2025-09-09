import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { ContentType } from '@/domain/enums/Analytics';

const prisma = new PrismaClient();

/**
 * @openapi
 * /follows:
 *   post:
 *     summary: Create Follow
 *     description: Follow a specific content item or user
 *     tags:
 *       - Follows
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
 *                 description: User ID (follower)
 *                 example: 1
 *               contentType:
 *                 type: string
 *                 enum: [STARTUP, NEWS, EVENT, USER, FOUNDER, PARTNER]
 *                 description: Content type
 *                 example: "STARTUP"
 *               contentId:
 *                 type: integer
 *                 description: Content ID (target)
 *                 example: 5
 *     responses:
 *       200:
 *         description: Follow created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 followerCount:
 *                   type: integer
 *                   description: Total number of followers for this content
 *                   example: 25
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
 *         description: Already following
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Already following"
 *       500:
 *         description: Failed to create follow
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to create follow"
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
 * @openapi
 * /follows:
 *   delete:
 *     summary: Remove Follow
 *     description: Unfollow a specific content item or user
 *     tags:
 *       - Follows
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
 *                 description: User ID (follower)
 *                 example: 1
 *               contentType:
 *                 type: string
 *                 enum: [STARTUP, NEWS, EVENT, USER, FOUNDER, PARTNER]
 *                 description: Content type
 *                 example: "STARTUP"
 *               contentId:
 *                 type: integer
 *                 description: Content ID (target)
 *                 example: 5
 *     responses:
 *       200:
 *         description: Follow removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 followerCount:
 *                   type: integer
 *                   description: Total number of followers for this content
 *                   example: 24
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
 *         description: Failed to delete follow
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to delete follow"
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
