import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const startups = await prisma.s_STARTUP.findMany({
      include: {
        details: true,
        founders: {
          include: {
            user: true
          }
        }
      }
    });

    return NextResponse.json(startups);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch startups' },
      { status: 500 }
    );
  }
}
