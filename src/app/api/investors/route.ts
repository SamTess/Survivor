import { NextRequest, NextResponse } from 'next/server';
import { InvestorService } from '../../../application/services/investors/InvestorService';
import { InvestorRepositoryPrisma } from '../../../infrastructure/persistence/prisma/InvestorRepositoryPrisma';

const investorRepository = new InvestorRepositoryPrisma();
const investorService = new InvestorService(investorRepository);

/**
 * @api {get} /investors Get All Investors
 * @apiName GetInvestors
 * @apiGroup Investors
 * @apiVersion 0.1.0
 * @apiDescription Retrieve all investors with pagination support
 *
 * @apiQuery {Number} [page=1] Page number
 * @apiQuery {Number} [limit=10] Number of investors per page
 * @apiQuery {String} [investorType] Filter by investor type
 * @apiQuery {String} [investmentFocus] Filter by investment focus
 * @apiQuery {String} [search] Search investors by name
 *
 * @apiSuccess {Boolean} success Operation success status
 * @apiSuccess {Object[]} data Array of investor objects
 * @apiSuccess {Number} data.id Investor ID
 * @apiSuccess {String} data.name Investor name
 * @apiSuccess {String} data.email Investor email
 * @apiSuccess {String} data.companyName Company name
 * @apiSuccess {String} data.role Investor role
 * @apiSuccess {Number} data.investmentCapacity Investment capacity
 * @apiSuccess {String[]} data.areasOfInterest Areas of interest
 * @apiSuccess {String} data.createdAt Creation timestamp
 * @apiSuccess {Object} [pagination] Pagination information (when using page/limit)
 * @apiSuccess {Number} pagination.page Current page number
 * @apiSuccess {Number} pagination.limit Items per page
 * @apiSuccess {Number} pagination.total Total number of investors
 * @apiSuccess {Number} pagination.totalPages Total number of pages
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "data": [
 *         {
 *           "id": 1,
 *           "name": "John Doe",
 *           "email": "john@example.com",
 *           "companyName": "Tech Ventures",
 *           "role": "ANGEL_INVESTOR",
 *           "investmentCapacity": 100000,
 *           "areasOfInterest": ["Technology", "Healthcare"],
 *           "createdAt": "2024-01-01T00:00:00.000Z"
 *         }
 *       ],
 *       "pagination": {
 *         "page": 1,
 *         "limit": 10,
 *         "total": 25,
 *         "totalPages": 3
 *       }
 *     }
 *
 * @apiError (Error 500) {Boolean} success False
 * @apiError (Error 500) {String} error Error message
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "success": false,
 *       "error": "Failed to fetch investors"
 *     }
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const investorType = searchParams.get('investorType');
    const investmentFocus = searchParams.get('investmentFocus');
    const search = searchParams.get('search');

    if (search) {
      const investors = await investorService.searchInvestors(search);
      return NextResponse.json({ success: true, data: investors });
    }

    if (investorType) {
      const investors = await investorService.getInvestorsByType(investorType);
      return NextResponse.json({ success: true, data: investors });
    }

    if (investmentFocus) {
      const investors = await investorService.getInvestorsByFocus(investmentFocus);
      return NextResponse.json({ success: true, data: investors });
    }

    if (page > 1 || limit !== 10) {
      const result = await investorService.getInvestorsPaginated(page, limit);
      return NextResponse.json({
        success: true,
        data: result.investors,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit)
        }
      });
    }

    const investors = await investorService.getAllInvestors();
    return NextResponse.json({ success: true, data: investors });

  } catch (error) {
    console.error('Error fetching investors:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch investors'
      },
      { status: 500 }
    );
  }
}

/**
 * @api {post} /investors Create New Investor
 * @apiName CreateInvestor
 * @apiGroup Investors
 * @apiVersion 0.1.0
 * @apiDescription Create a new investor profile
 *
 * @apiParam {String} name Investor name
 * @apiParam {String} email Investor email
 * @apiParam {String} companyName Company name
 * @apiParam {String} role Investor role (ANGEL_INVESTOR, VENTURE_CAPITALIST, etc.)
 * @apiParam {Number} investmentCapacity Investment capacity
 * @apiParam {String[]} areasOfInterest Areas of interest
 * @apiParam {String} [bio] Investor biography
 * @apiParam {String} [linkedin] LinkedIn profile URL
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "name": "Jane Smith",
 *       "email": "jane@techventures.com",
 *       "companyName": "Tech Ventures Fund",
 *       "role": "VENTURE_CAPITALIST",
 *       "investmentCapacity": 500000,
 *       "areasOfInterest": ["Technology", "Healthcare", "Fintech"],
 *       "bio": "Experienced VC with 10+ years in tech investments",
 *       "linkedin": "https://linkedin.com/in/janesmith"
 *     }
 *
 * @apiSuccess {Boolean} success Operation success status
 * @apiSuccess {Object} data Created investor object
 * @apiSuccess {Number} data.id Investor ID
 * @apiSuccess {String} data.name Investor name
 * @apiSuccess {String} data.email Investor email
 * @apiSuccess {String} data.companyName Company name
 * @apiSuccess {String} data.role Investor role
 * @apiSuccess {Number} data.investmentCapacity Investment capacity
 * @apiSuccess {String[]} data.areasOfInterest Areas of interest
 * @apiSuccess {String} data.createdAt Creation timestamp
 * @apiSuccess {String} message Success message
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 Created
 *     {
 *       "success": true,
 *       "data": {
 *         "id": 26,
 *         "name": "Jane Smith",
 *         "email": "jane@techventures.com",
 *         "companyName": "Tech Ventures Fund",
 *         "role": "VENTURE_CAPITALIST",
 *         "investmentCapacity": 500000,
 *         "areasOfInterest": ["Technology", "Healthcare", "Fintech"],
 *         "createdAt": "2024-01-15T10:30:00.000Z"
 *       },
 *       "message": "Investor created successfully"
 *     }
 *
 * @apiError (Error 400) {Boolean} success False
 * @apiError (Error 400) {String} error Validation error message
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "success": false,
 *       "error": "Email already exists"
 *     }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const investor = await investorService.createInvestor(body);

    return NextResponse.json({
      success: true,
      data: investor,
      message: 'Investor created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating investor:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create investor'
      },
      { status: 400 }
    );
  }
}
