import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { ContentType } from '@/domain/enums/Analytics';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { userId, contentType, contentId } = await request.json();

    if (!userId || !contentType || !contentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if follow already exists
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

    // Create follow
    await prisma.s_FOLLOW.create({
      data: {
        followerId: userId,
        targetType: contentType,
        targetId: contentId,
      },
    });

    // Update follower count based on content type
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

export async function DELETE(request: NextRequest) {
  try {
    const { userId, contentType, contentId } = await request.json();

    if (!userId || !contentType || !contentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Delete follow
    await prisma.s_FOLLOW.delete({
      where: {
        followerId_targetType_targetId: {
          followerId: userId,
          targetType: contentType,
          targetId: contentId,
        },
      },
    });

    // Update follower count based on content type
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
