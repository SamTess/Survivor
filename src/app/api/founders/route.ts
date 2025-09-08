import { NextRequest, NextResponse } from 'next/server';
import { FounderService } from '../../../application/services/founders/FounderService';
import { FounderRepositoryPrisma } from '../../../infrastructure/persistence/prisma/FounderRepositoryPrisma';

const founderRepository = new FounderRepositoryPrisma();
const founderService = new FounderService(founderRepository);

/**
 * @api {get} /founders Get Founders
 * @apiName GetFounders
 * @apiGroup Founders
 * @apiVersion 0.1.0
 * @apiDescription Retrieve a list of founders with optional filtering
 *
 * @apiParam {Number} [startupId] Filter by startup ID
 * @apiParam {Number} [userId] Filter by user ID
 *
 * @apiParamExample {url} Request-Example:
 *     /founders?startupId=5
 *
 * @apiSuccess {Boolean} success Request success status
 * @apiSuccess {Object[]} data Array of founder objects
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "data": [
 *         {
 *           "id": 1,
 *           "name": "John Doe",
 *           "role": "CEO",
 *           "startupId": 5,
 *           "userId": 10
 *         }
 *       ]
 *     }
 *
 * @apiError (Error 400) {Boolean} success false
 * @apiError (Error 400) {String} error Invalid startup ID or user ID
 * @apiError (Error 500) {Boolean} success false
 * @apiError (Error 500) {String} error Failed to fetch founders
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "success": false,
 *       "error": "Invalid startup ID"
 *     }
 */
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

/**
 * @api {post} /founders Create Founder
 * @apiName CreateFounder
 * @apiGroup Founders
 * @apiVersion 0.1.0
 * @apiDescription Create a new founder record
 *
 * @apiParam {String} name Founder's name
 * @apiParam {String} [role] Founder's role
 * @apiParam {Number} startupId Associated startup ID
 * @apiParam {Number} [userId] Associated user ID
 * @apiParam {String} [bio] Founder's biography
 * @apiParam {String} [linkedin] LinkedIn profile URL
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "name": "Jane Smith",
 *       "role": "CTO",
 *       "startupId": 5,
 *       "userId": 15,
 *       "bio": "Experienced technology leader"
 *     }
 *
 * @apiSuccess (Success 201) {Boolean} success Request success status
 * @apiSuccess (Success 201) {Object} data Created founder object
 * @apiSuccess (Success 201) {String} message Success message
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 Created
 *     {
 *       "success": true,
 *       "data": {
 *         "id": 1,
 *         "name": "Jane Smith",
 *         "role": "CTO",
 *         "startupId": 5
 *       },
 *       "message": "Founder created successfully"
 *     }
 *
 * @apiError (Error 400) {Boolean} success false
 * @apiError (Error 400) {String} error Failed to create founder
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "success": false,
 *       "error": "Failed to create founder"
 *     }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

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
