import { NextRequest, NextResponse } from 'next/server';
import { FounderService } from '../../../../../application/services/founders/FounderService';
import { FounderRepositoryPrisma } from '../../../../../infrastructure/persistence/prisma/FounderRepositoryPrisma';

const founderRepository = new FounderRepositoryPrisma();
const founderService = new FounderService(founderRepository);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const userId = parseInt(paramId);

    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const founders = await founderService.getFoundersByUserId(userId);

    if (!founders || founders.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No founders found for this user' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: founders });

  } catch (error) {
    console.error('Error fetching founders by user ID:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch founders'
      },
      { status: 500 }
    );
  }
}
