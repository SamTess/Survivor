import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { ContentType } from '@/domain/enums/Analytics';

const prisma = new PrismaClient();

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
