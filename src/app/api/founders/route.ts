import { NextRequest, NextResponse } from 'next/server';
import { FounderService } from '../../../application/services/founders/FounderService';
import { FounderRepositoryPrisma } from '../../../infrastructure/persistence/prisma/FounderRepositoryPrisma';
import { verifyJwt } from '../../../infrastructure/security/auth';
import prisma from '../../../infrastructure/persistence/prisma/client';

const founderRepository = new FounderRepositoryPrisma();
const founderService = new FounderService(founderRepository);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startupId = searchParams.get('startupId');
    const userId = searchParams.get('userId');

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

    // If authenticated and no explicit name provided, link to current user
    const token = request.cookies.get('auth')?.value;
    const secret = process.env.AUTH_SECRET || 'dev-secret';
    const payload = verifyJwt(token, secret);
    if (payload) {
      const user = await prisma.s_USER.findUnique({ where: { id: payload.userId } });
      if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 401 });
      body.name = body.name || user.name;
      if (user.role !== 'founder') {
        await prisma.s_USER.update({ where: { id: user.id }, data: { role: 'founder' } });
      }
      // Avoid duplicates for (user_id, startup_id)
      if (body.startup_id) {
        const existing = await prisma.s_FOUNDER.findFirst({ where: { user_id: user.id, startup_id: body.startup_id }, include: { user: true } });
        if (existing) {
          const mapped = { id: existing.id, name: existing.user?.name || '', startup_id: existing.startup_id, created_at: existing.user?.created_at || new Date(0), updated_at: existing.user?.created_at || new Date(0) };
          return NextResponse.json({ success: true, data: mapped, message: 'Founder link already exists' }, { status: 200 });
        }
      }
    }

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
