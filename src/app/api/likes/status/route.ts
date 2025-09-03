import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/infrastructure/persistence/prisma/client';
import { ContentType } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const contentType = searchParams.get('contentType');
    const contentId = searchParams.get('contentId');

    if (!userId || !contentType || !contentId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const like = await prisma.s_LIKE.findUnique({
      where: {
        userId_contentType_contentId: {
          userId: parseInt(userId),
          contentType: contentType as ContentType,
          contentId: parseInt(contentId),
        },
      },
    });

    return NextResponse.json({ isLiked: !!like });
  } catch (error) {
    console.error('Error checking like status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
