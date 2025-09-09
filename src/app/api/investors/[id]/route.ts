import { NextRequest, NextResponse } from 'next/server';
import { InvestorService } from '../../../../application/services/investors/InvestorService';
import { InvestorRepositoryPrisma } from '../../../../infrastructure/persistence/prisma/InvestorRepositoryPrisma';

const investorRepository = new InvestorRepositoryPrisma();
const investorService = new InvestorService(investorRepository);

/**
 * @api {get} /api/investors/:id Get Investor by ID
 * @apiName GetInvestor
 * @apiGroup Investors
 * @apiVersion 1.0.0
 * @apiDescription Retrieve a specific investor by their ID
 *
 * @apiParam {Number} id Investor's unique ID
 *
 * @apiSuccess {Boolean} success Request success status
 * @apiSuccess {Object} data Investor data
 * @apiSuccess {Number} data.id Investor ID
 * @apiSuccess {String} data.name Investor name
 * @apiSuccess {String} data.email Investor email
 * @apiSuccess {String} data.company Investment company name
 * @apiSuccess {String} data.bio Investor biography
 * @apiSuccess {String} data.expertise Investment expertise areas
 * @apiSuccess {Date} data.createdAt Creation timestamp
 * @apiSuccess {Date} data.updatedAt Last update timestamp
 *
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "data": {
 *         "id": 1,
 *         "name": "John Investor",
 *         "email": "john@venture.com",
 *         "company": "Venture Capital Inc",
 *         "bio": "Experienced investor in tech startups",
 *         "expertise": "fintech, AI, blockchain",
 *         "createdAt": "2024-01-01T00:00:00Z",
 *         "updatedAt": "2024-01-01T00:00:00Z"
 *       }
 *     }
 *
 * @apiError {Boolean} success Request success status (false)
 * @apiError {String} error Error message
 *
 * @apiErrorExample {json} Invalid ID:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "success": false,
 *       "error": "Invalid investor ID"
 *     }
 *
 * @apiErrorExample {json} Not Found:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "success": false,
 *       "error": "Investor not found"
 *     }
 *
 * @apiErrorExample {json} Server Error:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "success": false,
 *       "error": "Failed to fetch investor"
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
        { success: false, error: 'Invalid investor ID' },
        { status: 400 }
      );
    }

    const investor = await investorService.getInvestorById(id);

    if (!investor) {
      return NextResponse.json(
        { success: false, error: 'Investor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: investor });

  } catch (error) {
    console.error('Error fetching investor:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch investor'
      },
      { status: 500 }
    );
  }
}

/**
 * @api {put} /api/investors/:id Update Investor
 * @apiName UpdateInvestor
 * @apiGroup Investors
 * @apiVersion 1.0.0
 * @apiDescription Update an existing investor's information
 *
 * @apiParam {Number} id Investor's unique ID
 *
 * @apiBody {String} [name] Investor name
 * @apiBody {String} [email] Investor email
 * @apiBody {String} [company] Investment company name
 * @apiBody {String} [bio] Investor biography
 * @apiBody {String} [expertise] Investment expertise areas
 * @apiBody {String} [website] Company website
 * @apiBody {String} [phone] Contact phone number
 * @apiBody {String} [location] Investor location
 *
 * @apiExample {json} Request Example:
 *     {
 *       "name": "John Updated Investor",
 *       "email": "john.updated@venture.com",
 *       "company": "New Venture Capital",
 *       "bio": "Updated investor biography",
 *       "expertise": "fintech, AI, blockchain, web3"
 *     }
 *
 * @apiSuccess {Boolean} success Request success status
 * @apiSuccess {Object} data Updated investor data
 * @apiSuccess {String} message Success message
 *
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "data": {
 *         "id": 1,
 *         "name": "John Updated Investor",
 *         "email": "john.updated@venture.com",
 *         "company": "New Venture Capital",
 *         "bio": "Updated investor biography",
 *         "expertise": "fintech, AI, blockchain, web3",
 *         "updatedAt": "2024-01-02T00:00:00Z"
 *       },
 *       "message": "Investor updated successfully"
 *     }
 *
 * @apiError {Boolean} success Request success status (false)
 * @apiError {String} error Error message
 *
 * @apiErrorExample {json} Invalid ID:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "success": false,
 *       "error": "Invalid investor ID"
 *     }
 *
 * @apiErrorExample {json} Not Found:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "success": false,
 *       "error": "Investor not found or update failed"
 *     }
 *
 * @apiErrorExample {json} Validation Error:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "success": false,
 *       "error": "Failed to update investor"
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
        { success: false, error: 'Invalid investor ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    const investor = await investorService.updateInvestor(id, body);

    if (!investor) {
      return NextResponse.json(
        { success: false, error: 'Investor not found or update failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: investor,
      message: 'Investor updated successfully'
    });

  } catch (error) {
    console.error('Error updating investor:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update investor'
      },
      { status: 400 }
    );
  }
}

/**
 * @api {delete} /api/investors/:id Delete Investor
 * @apiName DeleteInvestor
 * @apiGroup Investors
 * @apiVersion 1.0.0
 * @apiDescription Delete an investor from the system
 *
 * @apiParam {Number} id Investor's unique ID
 *
 * @apiSuccess {Boolean} success Request success status
 * @apiSuccess {String} message Success message
 *
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "message": "Investor deleted successfully"
 *     }
 *
 * @apiError {Boolean} success Request success status (false)
 * @apiError {String} error Error message
 *
 * @apiErrorExample {json} Invalid ID:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "success": false,
 *       "error": "Invalid investor ID"
 *     }
 *
 * @apiErrorExample {json} Not Found:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "success": false,
 *       "error": "Investor not found or deletion failed"
 *     }
 *
 * @apiErrorExample {json} Server Error:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "success": false,
 *       "error": "Failed to delete investor"
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
        { success: false, error: 'Invalid investor ID' },
        { status: 400 }
      );
    }

    const deleted = await investorService.deleteInvestor(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Investor not found or deletion failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Investor deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting investor:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete investor'
      },
      { status: 500 }
    );
  }
}
