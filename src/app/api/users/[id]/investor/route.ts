import { NextRequest, NextResponse } from 'next/server';
import { InvestorService } from '../../../../../application/services/investors/InvestorService';
import { InvestorRepositoryPrisma } from '../../../../../infrastructure/persistence/prisma/InvestorRepositoryPrisma';

const investorRepository = new InvestorRepositoryPrisma();
const investorService = new InvestorService(investorRepository);

/**
 * @api {get} /users/:id/investor Get User's Investor Profile
 * @apiName GetUserInvestor
 * @apiGroup Users
 * @apiVersion 0.1.0
 * @apiDescription Retrieve the investor profile associated with a specific user
 *
 * @apiParam {Number} id User unique ID
 *
 * @apiSuccess {Boolean} success Operation success status
 * @apiSuccess {Object} data Investor profile object
 * @apiSuccess {Number} data.id Investor profile ID
 * @apiSuccess {Number} data.userId Associated user ID
 * @apiSuccess {String} data.name Investor name
 * @apiSuccess {String} data.email Investor email
 * @apiSuccess {String} data.companyName Investment company name
 * @apiSuccess {String} data.role Investor role (ANGEL_INVESTOR, VENTURE_CAPITALIST, etc.)
 * @apiSuccess {Number} data.investmentCapacity Investment capacity amount
 * @apiSuccess {String[]} data.areasOfInterest Investment focus areas
 * @apiSuccess {String} data.bio Investor biography
 * @apiSuccess {String} data.linkedin LinkedIn profile URL
 * @apiSuccess {String} data.createdAt Creation timestamp
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "data": {
 *         "id": 1,
 *         "userId": 5,
 *         "name": "Jane Smith",
 *         "email": "jane@techventures.com",
 *         "companyName": "Tech Ventures Fund",
 *         "role": "VENTURE_CAPITALIST",
 *         "investmentCapacity": 500000,
 *         "areasOfInterest": ["Technology", "Healthcare", "Fintech"],
 *         "bio": "Experienced VC with 10+ years in tech investments",
 *         "linkedin": "https://linkedin.com/in/janesmith",
 *         "createdAt": "2024-01-01T00:00:00.000Z"
 *       }
 *     }
 *
 * @apiError (Error 400) {Boolean} success False
 * @apiError (Error 400) {String} error Invalid user ID
 * @apiError (Error 404) {Boolean} success False
 * @apiError (Error 404) {String} error Investor not found for this user
 * @apiError (Error 500) {Boolean} success False
 * @apiError (Error 500) {String} error Internal server error
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "success": false,
 *       "error": "Investor not found for this user"
 *     }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const userId = parseInt(paramId);

    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const investor = await investorService.getInvestorByUserId(userId);

    if (!investor) {
      return NextResponse.json(
        { success: false, error: 'Investor not found for this user' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: investor });

  } catch (error) {
    console.error('Error fetching investor by user ID:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch investor'
      },
      { status: 500 }
    );
  }
}
