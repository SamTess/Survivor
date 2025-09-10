import { NextResponse } from 'next/server';
import prisma from '@/infrastructure/persistence/prisma/client';

/**
 * @openapi
 * /health/full:
 *   get:
 *     summary: Full Health Check
 *     description: Comprehensive health check including database connectivity
 *     tags:
 *       - System
 *     responses:
 *       200:
 *         description: Health check completed (always returns 200, check status field for actual health)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [healthy, unhealthy]
 *                   description: Service status
 *                   example: "healthy"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   description: ISO timestamp of the check
 *                   example: "2025-09-08T12:00:00.000Z"
 *                 service:
 *                   type: string
 *                   enum: [running, stopped, error]
 *                   description: Service state description
 *                   example: "running"
 *                 database:
 *                   type: string
 *                   enum: [connected, disconnected, unknown]
 *                   description: Database connection status
 *                   example: "connected"
 *             examples:
 *               healthy_with_db:
 *                 summary: Healthy service with database connected
 *                 value:
 *                   status: "healthy"
 *                   timestamp: "2025-09-08T12:00:00.000Z"
 *                   service: "running"
 *                   database: "connected"
 *               healthy_without_db:
 *                 summary: Healthy service with database disconnected
 *                 value:
 *                   status: "healthy"
 *                   timestamp: "2025-09-08T12:00:00.000Z"
 *                   service: "running"
 *                   database: "disconnected"
 */
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
