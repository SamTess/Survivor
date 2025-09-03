import { NextRequest, NextResponse } from 'next/server';
import { InvestorService } from '../../../application/services/investors/InvestorService';
import { InvestorRepositoryPrisma } from '../../../infrastructure/persistence/prisma/InvestorRepositoryPrisma';

// Initialize dependencies
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

    // Handle search query
    if (search) {
      const investors = await investorService.searchInvestors(search);
      return NextResponse.json({ success: true, data: investors });
    }

    // Handle filtering by investor type
    if (investorType) {
      const investors = await investorService.getInvestorsByType(investorType);
      return NextResponse.json({ success: true, data: investors });
    }

    // Handle filtering by investment focus
    if (investmentFocus) {
      const investors = await investorService.getInvestorsByFocus(investmentFocus);
      return NextResponse.json({ success: true, data: investors });
    }

    // Handle pagination
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

    // Default: get all investors
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
