import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/infrastructure/persistence/prisma/client';
import { ContentType } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = parseInt(searchParams.get('userId') || '0', 10);
    const contentType = searchParams.get('contentType') as ContentType | null;
    const contentId = parseInt(searchParams.get('contentId') || '0', 10);

    if (!userId || !contentType || !contentId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const like = await prisma.s_LIKE.findUnique({
      where: {
        userId_contentType_contentId: {
          userId,
          contentType,
          contentId,
        },
      },
    });

    return NextResponse.json({ isLiked: !!like });
  } catch (error) {
    console.error('Error checking like status:', error);
    return NextResponse.json({ error: 'Failed to check like status' }, { status: 500 });
  }
}
