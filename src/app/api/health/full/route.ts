import { NextResponse } from 'next/server';
import prisma from '@/infrastructure/persistence/prisma/client';

export async function GET() {
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'running',
    database: 'unknown'
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    healthStatus.database = 'connected';
  } catch (error) {
    console.error('Database health check failed:', error);
    healthStatus.database = 'disconnected';
  }

  return NextResponse.json(healthStatus, { status: 200 });
}
