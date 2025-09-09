import { NextRequest, NextResponse } from 'next/server';
import { StartupService } from '../../../application/services/startups/StartupService';
import { StartupRepositoryPrisma } from '../../../infrastructure/persistence/prisma/StartupRepositoryPrisma';
import prisma from '../../../infrastructure/persistence/prisma/client';
import { verifyJwt } from '../../../infrastructure/security/auth';

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

    if (search) {
      const startups = await startupService.searchStartups(search);
      return NextResponse.json({ success: true, data: startups });
    }

    if (sector) {
      const startups = await startupService.getStartupsBysector(sector);
      return NextResponse.json({ success: true, data: startups });
    }

    if (maturity) {
      const startups = await startupService.getStartupsByMaturity(maturity);
      return NextResponse.json({ success: true, data: startups });
    }

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
    const token = request.cookies.get('auth')?.value;
    const secret = process.env.AUTH_SECRET || 'dev-secret';
    const payload = verifyJwt(token, secret);
    if (payload) {
      const userId = payload.userId;
      const existing = await prisma.s_FOUNDER.findFirst({
        where: { user_id: userId, startup_id: startup.id },
      });
      if (!existing) {
        await prisma.s_FOUNDER.create({
          data: {
            user_id: userId,
            startup_id: startup.id,
          },
        });
        const user = await prisma.s_USER.findUnique({ where: { id: userId } });
        if (user && user.role !== 'founder') {
          await prisma.s_USER.update({ where: { id: userId }, data: { role: 'founder' } });
        }
      }
    }

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
