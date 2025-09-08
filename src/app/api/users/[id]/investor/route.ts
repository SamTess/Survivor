import { NextRequest, NextResponse } from 'next/server';
import { InvestorService } from '../../../../../application/services/investors/InvestorService';
import { InvestorRepositoryPrisma } from '../../../../../infrastructure/persistence/prisma/InvestorRepositoryPrisma';

const investorRepository = new InvestorRepositoryPrisma();
const investorService = new InvestorService(investorRepository);

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

    const investor = await investorService.getInvestorByUserId(userId);

    if (!investor) {
      return NextResponse.json(
        { success: false, error: 'Investor not found for this user' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: investor });

  } catch (error) {
    console.error('Error fetching investor by user ID:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch investor'
      },
      { status: 500 }
    );
  }
}
