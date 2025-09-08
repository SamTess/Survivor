import { NextResponse } from 'next/server';

/**
 * @api {get} /health Health Check
 * @apiName HealthCheck
 * @apiGroup System
 * @apiVersion 0.1.0
 * @apiDescription Check if the API service is running and healthy
 *
 * @apiSuccess {String} status Service status (healthy/unhealthy)
 * @apiSuccess {String} timestamp ISO timestamp of the check
 * @apiSuccess {String} service Service state description
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "healthy",
 *       "timestamp": "2025-09-08T12:00:00.000Z",
 *       "service": "running"
 *     }
 *
 * @apiError (Error 503) {String} status Service status (unhealthy)
 * @apiError (Error 503) {String} timestamp ISO timestamp of the check
 * @apiError (Error 503) {String} error Error message
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 503 Service Unavailable
 *     {
 *       "status": "unhealthy",
 *       "timestamp": "2025-09-08T12:00:00.000Z",
 *       "error": "Database connection failed"
 *     }
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
