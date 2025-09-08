import { NextRequest, NextResponse } from 'next/server';
import { StartupService } from '../../../../application/services/startups/StartupService';
import { StartupRepositoryPrisma } from '../../../../infrastructure/persistence/prisma/StartupRepositoryPrisma';

const startupRepository = new StartupRepositoryPrisma();
const startupService = new StartupService(startupRepository);

/**
 * @api {get} /startups/:id Get Startup by ID
 * @apiName GetStartupById
 * @apiGroup Startups
 * @apiVersion 0.1.0
 * @apiDescription Retrieve a specific startup by its ID
 *
 * @apiParam {Number} id Startup unique ID
 *
 * @apiSuccess {Boolean} success Operation success status
 * @apiSuccess {Object} data Startup object
 * @apiSuccess {Number} data.id Startup ID
 * @apiSuccess {String} data.name Startup name
 * @apiSuccess {String} data.description Startup description
 * @apiSuccess {String} data.industry Industry sector
 * @apiSuccess {String} data.stage Development stage
 * @apiSuccess {Number} data.fundingGoal Funding goal amount
 * @apiSuccess {Number} data.currentFunding Current funding amount
 * @apiSuccess {String} data.foundedDate Founded date
 * @apiSuccess {String} data.location Startup location
 * @apiSuccess {String} data.website Website URL
 * @apiSuccess {String} data.email Contact email
 * @apiSuccess {Object[]} data.founders Array of founder objects
 * @apiSuccess {Object[]} data.pitchDecks Array of pitch deck objects
 * @apiSuccess {String} data.createdAt Creation timestamp
 * @apiSuccess {String} data.updatedAt Last update timestamp
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "data": {
 *         "id": 1,
 *         "name": "TechVenture AI",
 *         "description": "Revolutionary AI solutions for businesses",
 *         "industry": "Artificial Intelligence",
 *         "stage": "SERIES_A",
 *         "fundingGoal": 5000000,
 *         "currentFunding": 2500000,
 *         "foundedDate": "2023-01-15",
 *         "location": "San Francisco, CA",
 *         "website": "https://techventure-ai.com",
 *         "email": "contact@techventure-ai.com",
 *         "founders": [
 *           {
 *             "id": 1,
 *             "name": "John Doe",
 *             "role": "CEO"
 *           }
 *         ],
 *         "pitchDecks": [],
 *         "createdAt": "2024-01-01T00:00:00.000Z",
 *         "updatedAt": "2024-01-15T12:00:00.000Z"
 *       }
 *     }
 *
 * @apiError (Error 400) {Boolean} success False
 * @apiError (Error 400) {String} error Invalid startup ID
 * @apiError (Error 404) {Boolean} success False
 * @apiError (Error 404) {String} error Startup not found
 * @apiError (Error 500) {Boolean} success False
 * @apiError (Error 500) {String} error Internal server error
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "success": false,
 *       "error": "Startup not found"
 *     }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid startup ID' },
        { status: 400 }
      );
    }

    const startup = await startupService.getStartupById(id);

    if (!startup) {
      return NextResponse.json(
        { success: false, error: 'Startup not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: startup });

  } catch (error) {
    console.error('Error fetching startup:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch startup'
      },
      { status: 500 }
    );
  }
}

/**
 * @api {put} /startups/:id Update Startup
 * @apiName UpdateStartup
 * @apiGroup Startups
 * @apiVersion 0.1.0
 * @apiDescription Update an existing startup
 *
 * @apiParam {Number} id Startup unique ID
 * @apiParam {String} [name] Startup name
 * @apiParam {String} [description] Startup description
 * @apiParam {String} [industry] Industry sector
 * @apiParam {String} [stage] Development stage
 * @apiParam {Number} [fundingGoal] Funding goal amount
 * @apiParam {Number} [currentFunding] Current funding amount
 * @apiParam {String} [location] Startup location
 * @apiParam {String} [website] Website URL
 * @apiParam {String} [email] Contact email
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "name": "TechVenture AI Pro",
 *       "description": "Advanced AI solutions for enterprise businesses",
 *       "stage": "SERIES_B",
 *       "currentFunding": 7500000,
 *       "location": "San Francisco, CA"
 *     }
 *
 * @apiSuccess {Boolean} success Operation success status
 * @apiSuccess {Object} data Updated startup object
 * @apiSuccess {String} message Success message
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "data": {
 *         "id": 1,
 *         "name": "TechVenture AI Pro",
 *         "description": "Advanced AI solutions for enterprise businesses",
 *         "industry": "Artificial Intelligence",
 *         "stage": "SERIES_B",
 *         "fundingGoal": 5000000,
 *         "currentFunding": 7500000,
 *         "location": "San Francisco, CA",
 *         "updatedAt": "2024-01-15T14:00:00.000Z"
 *       },
 *       "message": "Startup updated successfully"
 *     }
 *
 * @apiError (Error 400) {Boolean} success False
 * @apiError (Error 400) {String} error Invalid startup ID or validation error
 * @apiError (Error 404) {Boolean} success False
 * @apiError (Error 404) {String} error Startup not found
 * @apiError (Error 500) {Boolean} success False
 * @apiError (Error 500) {String} error Internal server error
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "success": false,
 *       "error": "Startup not found"
 *     }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid startup ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    const startup = await startupService.updateStartup(id, body);

    if (!startup) {
      return NextResponse.json(
        { success: false, error: 'Startup not found or update failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: startup,
      message: 'Startup updated successfully'
    });

  } catch (error) {
    console.error('Error updating startup:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update startup'
      },
      { status: 400 }
    );
  }
}

/**
 * @api {delete} /startups/:id Delete Startup
 * @apiName DeleteStartup
 * @apiGroup Startups
 * @apiVersion 0.1.0
 * @apiDescription Delete a startup by ID
 *
 * @apiParam {Number} id Startup unique ID
 *
 * @apiSuccess {Boolean} success Operation success status
 * @apiSuccess {String} message Success message
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "message": "Startup deleted successfully"
 *     }
 *
 * @apiError (Error 400) {Boolean} success False
 * @apiError (Error 400) {String} error Invalid startup ID
 * @apiError (Error 404) {Boolean} success False
 * @apiError (Error 404) {String} error Startup not found
 * @apiError (Error 500) {Boolean} success False
 * @apiError (Error 500) {String} error Internal server error
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "success": false,
 *       "error": "Startup not found"
 *     }
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid startup ID' },
        { status: 400 }
      );
    }

    const deleted = await startupService.deleteStartup(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Startup not found or deletion failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Startup deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting startup:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete startup'
      },
      { status: 500 }
    );
  }
}
