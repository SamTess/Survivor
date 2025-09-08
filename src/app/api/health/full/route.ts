import { NextResponse } from 'next/server';
import prisma from '@/infrastructure/persistence/prisma/client';

/**
 * @api {get} /health/full Full Health Check
 * @apiName FullHealthCheck
 * @apiGroup System
 * @apiVersion 0.1.0
 * @apiDescription Comprehensive health check including database connectivity
 * 
 * @apiSuccess {String} status Service status (healthy/unhealthy)
 * @apiSuccess {String} timestamp ISO timestamp of the check
 * @apiSuccess {String} service Service state description
 * @apiSuccess {String} database Database connection status (connected/disconnected)
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "healthy",
 *       "timestamp": "2025-09-08T12:00:00.000Z",
 *       "service": "running",
 *       "database": "connected"
 *     }
 * 
 * @apiSuccessExample {json} Success-Response (DB Disconnected):
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "healthy",
 *       "timestamp": "2025-09-08T12:00:00.000Z",
 *       "service": "running",
 *       "database": "disconnected"
 *     }
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
