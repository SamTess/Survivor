import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/infrastructure/persistence/prisma/client';
import { ContentType } from '@prisma/client';

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
