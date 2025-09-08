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
