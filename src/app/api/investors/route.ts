import { NextRequest, NextResponse } from 'next/server';
import { InvestorService } from '../../../application/services/investors/InvestorService';
import { InvestorRepositoryPrisma } from '../../../infrastructure/persistence/prisma/InvestorRepositoryPrisma';
import { verifyJwt } from '../../../infrastructure/security/auth';
import prisma from '../../../infrastructure/persistence/prisma/client';

const investorRepository = new InvestorRepositoryPrisma();
const investorService = new InvestorService(investorRepository);

/**
 * @openapi
 * /investors:
 *   get:
 *     summary: Get All Investors
 *     description: Retrieve all investors with pagination support and filtering options
 *     tags:
 *       - Investors
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *         example: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of investors per page
 *         example: 10
 *       - in: query
 *         name: investorType
 *         required: false
 *         schema:
 *           type: string
 *           enum: [ANGEL_INVESTOR, VENTURE_CAPITALIST, PRIVATE_EQUITY, INSTITUTIONAL]
 *         description: Filter by investor type
 *         example: "ANGEL_INVESTOR"
 *       - in: query
 *         name: investmentFocus
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter by investment focus
 *         example: "Technology"
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *         description: Search investors by name
 *         example: "John"
 *     responses:
 *       200:
 *         description: Investors retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "John Doe"
 *                       email:
 *                         type: string
 *                         format: email
 *                         example: "john@example.com"
 *                       companyName:
 *                         type: string
 *                         example: "Tech Ventures"
 *                       role:
 *                         type: string
 *                         enum: [ANGEL_INVESTOR, VENTURE_CAPITALIST, PRIVATE_EQUITY, INSTITUTIONAL]
 *                         example: "ANGEL_INVESTOR"
 *                       investmentCapacity:
 *                         type: number
 *                         example: 100000
 *                       areasOfInterest:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["Technology", "Healthcare"]
 *                       bio:
 *                         type: string
 *                         example: "Experienced investor in tech startups"
 *                       linkedin:
 *                         type: string
 *                         format: uri
 *                         example: "https://linkedin.com/in/johndoe"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-01T00:00:00.000Z"
 *                 pagination:
 *                   type: object
 *                   description: Pagination information (when using page/limit)
 *                   properties:
 *                     page:
 *                       type: integer
 *                       description: Current page number
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       description: Items per page
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       description: Total number of investors
 *                       example: 25
 *                     totalPages:
 *                       type: integer
 *                       description: Total number of pages
 *                       example: 3
 *       500:
 *         description: Failed to fetch investors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Failed to fetch investors"
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
 * @openapi
 * /investors:
 *   post:
 *     summary: Create New Investor
 *     description: Create a new investor profile
 *     tags:
 *       - Investors
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - companyName
 *               - role
 *               - investmentCapacity
 *               - areasOfInterest
 *             properties:
 *               name:
 *                 type: string
 *                 description: Investor name
 *                 example: "Jane Smith"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Investor email
 *                 example: "jane@techventures.com"
 *               companyName:
 *                 type: string
 *                 description: Company name
 *                 example: "Tech Ventures Fund"
 *               role:
 *                 type: string
 *                 enum: [ANGEL_INVESTOR, VENTURE_CAPITALIST, PRIVATE_EQUITY, INSTITUTIONAL]
 *                 description: Investor role
 *                 example: "VENTURE_CAPITALIST"
 *               investmentCapacity:
 *                 type: number
 *                 minimum: 0
 *                 description: Investment capacity
 *                 example: 500000
 *               areasOfInterest:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Areas of interest
 *                 example: ["Technology", "Healthcare", "Fintech"]
 *               bio:
 *                 type: string
 *                 description: Investor biography
 *                 example: "Experienced VC with 10+ years in tech investments"
 *               linkedin:
 *                 type: string
 *                 format: uri
 *                 description: LinkedIn profile URL
 *                 example: "https://linkedin.com/in/janesmith"
 *               website:
 *                 type: string
 *                 format: uri
 *                 description: Company website
 *                 example: "https://techventures.com"
 *               phone:
 *                 type: string
 *                 description: Contact phone number
 *                 example: "+1-555-0123"
 *               location:
 *                 type: string
 *                 description: Investor location
 *                 example: "San Francisco, CA"
 *     responses:
 *       201:
 *         description: Investor created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 26
 *                     name:
 *                       type: string
 *                       example: "Jane Smith"
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: "jane@techventures.com"
 *                     companyName:
 *                       type: string
 *                       example: "Tech Ventures Fund"
 *                     role:
 *                       type: string
 *                       example: "VENTURE_CAPITALIST"
 *                     investmentCapacity:
 *                       type: number
 *                       example: 500000
 *                     areasOfInterest:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Technology", "Healthcare", "Fintech"]
 *                     bio:
 *                       type: string
 *                       example: "Experienced VC with 10+ years in tech investments"
 *                     linkedin:
 *                       type: string
 *                       format: uri
 *                       example: "https://linkedin.com/in/janesmith"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T10:30:00.000Z"
 *                 message:
 *                   type: string
 *                   example: "Investor created successfully"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Email already exists"
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
