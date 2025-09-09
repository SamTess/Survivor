import { NextResponse } from 'next/server';

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health Check
 *     description: Check if the API service is running and healthy
 *     tags:
 *       - System
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [healthy, unhealthy]
 *                   example: "healthy"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   description: ISO timestamp of the check
 *                   example: "2025-09-08T12:00:00.000Z"
 *                 service:
 *                   type: string
 *                   description: Service state description
 *                   example: "running"
 *       503:
 *         description: Service is unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [healthy, unhealthy]
 *                   example: "unhealthy"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   description: ISO timestamp of the check
 *                   example: "2025-09-08T12:00:00.000Z"
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: "Database connection failed"
 */
export async function GET() {
  try {
    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'running'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    );
  }
}
