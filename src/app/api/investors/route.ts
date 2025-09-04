import { NextRequest, NextResponse } from 'next/server';
import { InvestorService } from '../../../application/services/investors/InvestorService';
import { InvestorRepositoryPrisma } from '../../../infrastructure/persistence/prisma/InvestorRepositoryPrisma';

const investorRepository = new InvestorRepositoryPrisma();
const investorService = new InvestorService(investorRepository);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const investorType = searchParams.get('investorType');
    const investmentFocus = searchParams.get('investmentFocus');
    const search = searchParams.get('search');

    if (search) {
      const investors = await investorService.searchInvestors(search);
      return NextResponse.json({ success: true, data: investors });
    }

    if (investorType) {
      const investors = await investorService.getInvestorsByType(investorType);
      return NextResponse.json({ success: true, data: investors });
    }

    if (investmentFocus) {
      const investors = await investorService.getInvestorsByFocus(investmentFocus);
      return NextResponse.json({ success: true, data: investors });
    }

    if (page > 1 || limit !== 10) {
      const result = await investorService.getInvestorsPaginated(page, limit);
      return NextResponse.json({ 
        success: true, 
        data: result.investors,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit)
        }
      });
    }

    const investors = await investorService.getAllInvestors();
    return NextResponse.json({ success: true, data: investors });

  } catch (error) {
    console.error('Error fetching investors:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch investors' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const investor = await investorService.createInvestor(body);
    
    return NextResponse.json({ 
      success: true, 
      data: investor,
      message: 'Investor created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating investor:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create investor' 
      },
      { status: 400 }
    );
  }
}
