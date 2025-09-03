import { NextRequest, NextResponse } from 'next/server';
import { FounderService } from '../../../application/services/founders/FounderService';
import { FounderRepositoryPrisma } from '../../../infrastructure/persistence/prisma/FounderRepositoryPrisma';

// Initialize dependencies
const founderRepository = new FounderRepositoryPrisma();
const founderService = new FounderService(founderRepository);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startupId = searchParams.get('startupId');
    const userId = searchParams.get('userId');

    // Handle filtering by startup
    if (startupId) {
      const id = parseInt(startupId);
      if (isNaN(id)) {
        return NextResponse.json(
          { success: false, error: 'Invalid startup ID' },
          { status: 400 }
        );
      }
      const founders = await founderService.getFoundersByStartupId(id);
      return NextResponse.json({ success: true, data: founders });
    }

    // Handle filtering by user
    if (userId) {
      const id = parseInt(userId);
      if (isNaN(id)) {
        return NextResponse.json(
          { success: false, error: 'Invalid user ID' },
          { status: 400 }
        );
      }
      const founders = await founderService.getFoundersByUserId(id);
      return NextResponse.json({ success: true, data: founders });
    }

    // Default: get all founders
    const founders = await founderService.getAllFounders();
    return NextResponse.json({ success: true, data: founders });

  } catch (error) {
    console.error('Error fetching founders:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch founders' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const founder = await founderService.createFounder(body);
    
    return NextResponse.json({ 
      success: true, 
      data: founder,
      message: 'Founder created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating founder:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create founder' 
      },
      { status: 400 }
    );
  }
}
