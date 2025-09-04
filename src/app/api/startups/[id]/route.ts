import { NextRequest, NextResponse } from 'next/server';
import { StartupService } from '../../../../application/services/startups/StartupService';
import { StartupRepositoryPrisma } from '../../../../infrastructure/persistence/prisma/StartupRepositoryPrisma';

const startupRepository = new StartupRepositoryPrisma();
const startupService = new StartupService(startupRepository);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid startup ID' },
        { status: 400 }
      );
    }

    const startup = await startupService.getStartupById(id);
    
    if (!startup) {
      return NextResponse.json(
        { success: false, error: 'Startup not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: startup });

  } catch (error) {
    console.error('Error fetching startup:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch startup' 
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
        { success: false, error: 'Invalid startup ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    const startup = await startupService.updateStartup(id, body);
    
    if (!startup) {
      return NextResponse.json(
        { success: false, error: 'Startup not found or update failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: startup,
      message: 'Startup updated successfully'
    });

  } catch (error) {
    console.error('Error updating startup:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update startup' 
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
        { success: false, error: 'Invalid startup ID' },
        { status: 400 }
      );
    }

    const deleted = await startupService.deleteStartup(id);
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Startup not found or deletion failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Startup deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting startup:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete startup' 
      },
      { status: 500 }
    );
  }
}
