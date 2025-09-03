import { NextRequest, NextResponse } from 'next/server';
import { InvestorService } from '../../../../application/services/investors/InvestorService';
import { InvestorRepositoryPrisma } from '../../../../infrastructure/persistence/prisma/InvestorRepositoryPrisma';

// Initialize dependencies
const investorRepository = new InvestorRepositoryPrisma();
const investorService = new InvestorService(investorRepository);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid investor ID' },
        { status: 400 }
      );
    }

    const investor = await investorService.getInvestorById(id);
    
    if (!investor) {
      return NextResponse.json(
        { success: false, error: 'Investor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: investor });

  } catch (error) {
    console.error('Error fetching investor:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch investor' 
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid investor ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    const investor = await investorService.updateInvestor(id, body);
    
    if (!investor) {
      return NextResponse.json(
        { success: false, error: 'Investor not found or update failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: investor,
      message: 'Investor updated successfully'
    });

  } catch (error) {
    console.error('Error updating investor:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update investor' 
      },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid investor ID' },
        { status: 400 }
      );
    }

    const deleted = await investorService.deleteInvestor(id);
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Investor not found or deletion failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Investor deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting investor:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete investor' 
      },
      { status: 500 }
    );
  }
}
