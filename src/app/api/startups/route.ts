import { NextRequest, NextResponse } from 'next/server';
import { StartupService } from '../../../application/services/startups/StartupService';
import { StartupRepositoryPrisma } from '../../../infrastructure/persistence/prisma/StartupRepositoryPrisma';

// Initialize dependencies
const startupRepository = new StartupRepositoryPrisma();
const startupService = new StartupService(startupRepository);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sector = searchParams.get('sector');
    const maturity = searchParams.get('maturity');
    const search = searchParams.get('search');

    // Handle search query
    if (search) {
      const startups = await startupService.searchStartups(search);
      return NextResponse.json({ success: true, data: startups });
    }

    // Handle filtering by sector
    if (sector) {
      const startups = await startupService.getStartupsBysector(sector);
      return NextResponse.json({ success: true, data: startups });
    }

    // Handle filtering by maturity
    if (maturity) {
      const startups = await startupService.getStartupsByMaturity(maturity);
      return NextResponse.json({ success: true, data: startups });
    }

    // Handle pagination
    if (page > 1 || limit !== 10) {
      const result = await startupService.getStartupsPaginated(page, limit);
      return NextResponse.json({ 
        success: true, 
        data: result.startups,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit)
        }
      });
    }

    // Default: get all startups
    const startups = await startupService.getAllStartups();
    return NextResponse.json({ success: true, data: startups });

  } catch (error) {
    console.error('Error fetching startups:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch startups' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const startup = await startupService.createStartup(body);
    
    return NextResponse.json({ 
      success: true, 
      data: startup,
      message: 'Startup created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating startup:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create startup' 
      },
      { status: 400 }
    );
  }
}
