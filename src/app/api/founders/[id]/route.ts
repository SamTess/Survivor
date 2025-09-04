import { NextRequest, NextResponse } from 'next/server';
import { FounderService } from '../../../../application/services/founders/FounderService';
import { FounderRepositoryPrisma } from '../../../../infrastructure/persistence/prisma/FounderRepositoryPrisma';

const founderRepository = new FounderRepositoryPrisma();
const founderService = new FounderService(founderRepository);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid founder ID' },
        { status: 400 }
      );
    }

    const founder = await founderService.getFounderById(id);
    
    if (!founder) {
      return NextResponse.json(
        { success: false, error: 'Founder not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: founder });

  } catch (error) {
    console.error('Error fetching founder:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch founder' 
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
        { success: false, error: 'Invalid founder ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    const founder = await founderService.updateFounder(id, body);
    
    if (!founder) {
      return NextResponse.json(
        { success: false, error: 'Founder not found or update failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: founder,
      message: 'Founder updated successfully'
    });

  } catch (error) {
    console.error('Error updating founder:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update founder' 
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
        { success: false, error: 'Invalid founder ID' },
        { status: 400 }
      );
    }

    const deleted = await founderService.deleteFounder(id);
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Founder not found or deletion failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Founder deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting founder:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete founder' 
      },
      { status: 500 }
    );
  }
}
