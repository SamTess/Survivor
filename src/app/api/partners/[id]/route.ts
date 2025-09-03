import { NextRequest, NextResponse } from 'next/server';
import { PartnerService } from '../../../../application/services/partners/PartnerService';
import { PartnerRepositoryPrisma } from '../../../../infrastructure/persistence/prisma/PartnerRepositoryPrisma';

// Initialize dependencies
const partnerRepository = new PartnerRepositoryPrisma();
const partnerService = new PartnerService(partnerRepository);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid partner ID' },
        { status: 400 }
      );
    }

    const partner = await partnerService.getPartnerById(id);
    
    if (!partner) {
      return NextResponse.json(
        { success: false, error: 'Partner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: partner });

  } catch (error) {
    console.error('Error fetching partner:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch partner' 
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
        { success: false, error: 'Invalid partner ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    const partner = await partnerService.updatePartner(id, body);
    
    if (!partner) {
      return NextResponse.json(
        { success: false, error: 'Partner not found or update failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: partner,
      message: 'Partner updated successfully'
    });

  } catch (error) {
    console.error('Error updating partner:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update partner' 
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
        { success: false, error: 'Invalid partner ID' },
        { status: 400 }
      );
    }

    const deleted = await partnerService.deletePartner(id);
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Partner not found or deletion failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Partner deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting partner:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete partner' 
      },
      { status: 500 }
    );
  }
}
