import { NextRequest, NextResponse } from 'next/server';
import { FounderService } from '../../../../application/services/founders/FounderService';
import { FounderRepositoryPrisma } from '../../../../infrastructure/persistence/prisma/FounderRepositoryPrisma';

const founderRepository = new FounderRepositoryPrisma();
const founderService = new FounderService(founderRepository);

/**
 * @api {get} /founders/:id Get Founder by ID
 * @apiName GetFounderById
 * @apiGroup Founders
 * @apiVersion 0.1.0
 * @apiDescription Retrieve a specific founder by their ID
 *
 * @apiParam {Number} id Founder ID
 *
 * @apiSuccess {Boolean} success Request success status
 * @apiSuccess {Object} data Founder object
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "data": {
 *         "id": 1,
 *         "name": "John Doe",
 *         "role": "CEO",
 *         "startupId": 5,
 *         "bio": "Experienced entrepreneur"
 *       }
 *     }
 *
 * @apiError (Error 400) {Boolean} success false
 * @apiError (Error 400) {String} error Invalid founder ID
 * @apiError (Error 404) {Boolean} success false
 * @apiError (Error 404) {String} error Founder not found
 * @apiError (Error 500) {Boolean} success false
 * @apiError (Error 500) {String} error Failed to fetch founder
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "success": false,
 *       "error": "Founder not found"
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
        { success: false, error: 'Invalid founder ID' },
        { status: 400 }
      );
    }

    const founder = await founderService.getFounderById(id);

    if (!founder) {
      return NextResponse.json(
        { success: false, error: 'Founder not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: founder });

  } catch (error) {
    console.error('Error fetching founder:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch founder'
      },
      { status: 500 }
    );
  }
}

/**
 * @api {put} /founders/:id Update Founder
 * @apiName UpdateFounder
 * @apiGroup Founders
 * @apiVersion 0.1.0
 * @apiDescription Update an existing founder's information
 *
 * @apiParam {Number} id Founder unique ID
 * @apiParam {String} [name] Founder name
 * @apiParam {String} [role] Founder role/position
 * @apiParam {String} [bio] Founder biography
 * @apiParam {String} [expertise] Areas of expertise
 * @apiParam {String} [experience] Previous experience
 * @apiParam {String} [linkedin] LinkedIn profile URL
 * @apiParam {String} [twitter] Twitter profile URL
 * @apiParam {Number} [startupId] Associated startup ID
 * @apiParam {Number} [userId] Associated user ID
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "name": "John Smith",
 *       "role": "CTO & Co-Founder",
 *       "bio": "Senior entrepreneur with 15+ years experience in tech",
 *       "expertise": "Product Development, Team Leadership, AI/ML",
 *       "linkedin": "https://linkedin.com/in/johnsmith"
 *     }
 *
 * @apiSuccess {Boolean} success Operation success status
 * @apiSuccess {Object} data Updated founder object
 * @apiSuccess {Number} data.id Founder ID
 * @apiSuccess {String} data.name Founder name
 * @apiSuccess {String} data.role Founder role
 * @apiSuccess {String} data.bio Founder biography
 * @apiSuccess {String} data.expertise Areas of expertise
 * @apiSuccess {String} data.experience Previous experience
 * @apiSuccess {String} data.linkedin LinkedIn profile URL
 * @apiSuccess {String} data.twitter Twitter profile URL
 * @apiSuccess {String} data.updatedAt Last update timestamp
 * @apiSuccess {String} message Success message
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "data": {
 *         "id": 1,
 *         "name": "John Smith",
 *         "role": "CTO & Co-Founder",
 *         "bio": "Senior entrepreneur with 15+ years experience in tech",
 *         "expertise": "Product Development, Team Leadership, AI/ML",
 *         "linkedin": "https://linkedin.com/in/johnsmith",
 *         "updatedAt": "2024-01-15T14:00:00.000Z"
 *       },
 *       "message": "Founder updated successfully"
 *     }
 *
 * @apiError (Error 400) {Boolean} success False
 * @apiError (Error 400) {String} error Invalid founder ID or validation error
 * @apiError (Error 404) {Boolean} success False
 * @apiError (Error 404) {String} error Founder not found or update failed
 * @apiError (Error 500) {Boolean} success False
 * @apiError (Error 500) {String} error Internal server error
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "success": false,
 *       "error": "Founder not found or update failed"
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
        { success: false, error: 'Invalid founder ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    const founder = await founderService.updateFounder(id, body);

    if (!founder) {
      return NextResponse.json(
        { success: false, error: 'Founder not found or update failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: founder,
      message: 'Founder updated successfully'
    });

  } catch (error) {
    console.error('Error updating founder:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update founder'
      },
      { status: 400 }
    );
  }
}

/**
 * @api {delete} /founders/:id Delete Founder
 * @apiName DeleteFounder
 * @apiGroup Founders
 * @apiVersion 0.1.0
 * @apiDescription Delete a founder profile permanently
 *
 * @apiParam {Number} id Founder unique ID
 *
 * @apiSuccess {Boolean} success Operation success status
 * @apiSuccess {String} message Success message
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "message": "Founder deleted successfully"
 *     }
 *
 * @apiError (Error 400) {Boolean} success False
 * @apiError (Error 400) {String} error Invalid founder ID
 * @apiError (Error 404) {Boolean} success False
 * @apiError (Error 404) {String} error Founder not found or deletion failed
 * @apiError (Error 500) {Boolean} success False
 * @apiError (Error 500) {String} error Internal server error
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "success": false,
 *       "error": "Founder not found or deletion failed"
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
        { success: false, error: 'Invalid founder ID' },
        { status: 400 }
      );
    }

    const deleted = await founderService.deleteFounder(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Founder not found or deletion failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Founder deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting founder:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete founder'
      },
      { status: 500 }
    );
  }
}
