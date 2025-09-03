import { NextRequest, NextResponse } from 'next/server';
import { PartnerService } from '../../../application/services/partners/PartnerService';
import { PartnerRepositoryPrisma } from '../../../infrastructure/persistence/prisma/PartnerRepositoryPrisma';

// Initialize dependencies
const partnerRepository = new PartnerRepositoryPrisma();
const partnerService = new PartnerService(partnerRepository);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const partnershipType = searchParams.get('partnershipType');
    const search = searchParams.get('search');

    // Handle search query
    if (search) {
      const partners = await partnerService.searchPartners(search);
      return NextResponse.json({ success: true, data: partners });
    }

    // Handle filtering by partnership type
    if (partnershipType) {
      const partners = await partnerService.getPartnersByType(partnershipType);
      return NextResponse.json({ success: true, data: partners });
    }

    // Handle pagination
    if (page > 1 || limit !== 10) {
      const result = await partnerService.getPartnersPaginated(page, limit);
      return NextResponse.json({ 
        success: true, 
        data: result.partners,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit)
        }
      });
    }

    // Default: get all partners
    const partners = await partnerService.getAllPartners();
    return NextResponse.json({ success: true, data: partners });

  } catch (error) {
    console.error('Error fetching partners:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch partners' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const partner = await partnerService.createPartner(body);
    
    return NextResponse.json({ 
      success: true, 
      data: partner,
      message: 'Partner created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating partner:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create partner' 
      },
      { status: 400 }
    );
  }
}
