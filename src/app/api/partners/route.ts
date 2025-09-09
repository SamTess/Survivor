import { NextRequest, NextResponse } from 'next/server';
import { PartnerService } from '../../../application/services/partners/PartnerService';
import { PartnerRepositoryPrisma } from '../../../infrastructure/persistence/prisma/PartnerRepositoryPrisma';

const partnerRepository = new PartnerRepositoryPrisma();
const partnerService = new PartnerService(partnerRepository);

/**
 * @openapi
 * /partners:
 *   get:
 *     summary: Get All Partners
 *     description: Retrieve all partners with optional filtering and pagination
 *     tags:
 *       - Partners
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of partners per page
 *         example: 10
 *       - in: query
 *         name: partnershipType
 *         schema:
 *           type: string
 *           enum: [STRATEGIC, TECHNOLOGY, VENDOR, DISTRIBUTION, FINANCIAL]
 *         description: Filter by partnership type
 *         example: TECHNOLOGY
 *       - in: query
 *         name: industry
 *         schema:
 *           type: string
 *         description: Filter by industry sector
 *         example: "Technology"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search partners by name
 *         example: "TechCorp"
 *     responses:
 *       200:
 *         description: Partners retrieved successfully
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
 *                         description: Partner unique ID
 *                         example: 1
 *                       name:
 *                         type: string
 *                         description: Partner name
 *                         example: "TechCorp Solutions"
 *                       email:
 *                         type: string
 *                         description: Partner email
 *                         example: "contact@techcorp.com"
 *                       companyName:
 *                         type: string
 *                         description: Company name
 *                         example: "TechCorp Inc."
 *                       partnerType:
 *                         type: string
 *                         description: Partner type
 *                         example: "STRATEGIC"
 *                       industry:
 *                         type: string
 *                         description: Industry sector
 *                         example: "Technology"
 *                       description:
 *                         type: string
 *                         description: Partner description
 *                         example: "Leading technology solutions provider"
 *                       website:
 *                         type: string
 *                         description: Website URL
 *                         example: "https://techcorp.com"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: Creation timestamp
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
 *                       description: Total number of partners
 *                       example: 15
 *                     totalPages:
 *                       type: integer
 *                       description: Total number of pages
 *                       example: 2
 *       500:
 *         description: Internal server error
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
 *                   example: "Failed to fetch partners"
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const partnershipType = searchParams.get('partnershipType');
    const search = searchParams.get('search');

    if (search) {
      const partners = await partnerService.searchPartners(search);
      return NextResponse.json({ success: true, data: partners });
    }

    if (partnershipType) {
      const partners = await partnerService.getPartnersByType(partnershipType);
      return NextResponse.json({ success: true, data: partners });
    }

    if (page > 1 || limit !== 10) {
      const result = await partnerService.getPartnersPaginated(page, limit);
      return NextResponse.json({
        success: true,
        data: result.partners,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit)
        }
      });
    }

    const partners = await partnerService.getAllPartners();
    return NextResponse.json({ success: true, data: partners });

  } catch (error) {
    console.error('Error fetching partners:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch partners'
      },
      { status: 500 }
    );
  }
}

/**
 * @openapi
 * /partners:
 *   post:
 *     summary: Create New Partner
 *     description: Create a new partnership
 *     tags:
 *       - Partners
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
 *               - partnerType
 *               - industry
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 description: Partner name
 *                 example: "CloudTech Partners"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Partner email
 *                 example: "partnerships@cloudtech.com"
 *               companyName:
 *                 type: string
 *                 description: Company name
 *                 example: "CloudTech Solutions Ltd."
 *               partnerType:
 *                 type: string
 *                 enum: [STRATEGIC, TECHNOLOGY, VENDOR, DISTRIBUTION, FINANCIAL]
 *                 description: Partner type
 *                 example: "TECHNOLOGY"
 *               industry:
 *                 type: string
 *                 description: Industry sector
 *                 example: "Cloud Computing"
 *               description:
 *                 type: string
 *                 description: Partner description
 *                 example: "Leading cloud infrastructure and services provider"
 *               website:
 *                 type: string
 *                 format: uri
 *                 description: Website URL
 *                 example: "https://cloudtech.com"
 *               contactPerson:
 *                 type: string
 *                 description: Contact person name
 *                 example: "Alex Johnson"
 *               phone:
 *                 type: string
 *                 description: Contact phone number
 *                 example: "+1-555-0123"
 *               services:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Services offered
 *                 example: ["Infrastructure", "Platform", "Software"]
 *           example:
 *             name: "CloudTech Partners"
 *             email: "partnerships@cloudtech.com"
 *             companyName: "CloudTech Solutions Ltd."
 *             partnerType: "TECHNOLOGY"
 *             industry: "Cloud Computing"
 *             description: "Leading cloud infrastructure and services provider"
 *             website: "https://cloudtech.com"
 *             contactPerson: "Alex Johnson"
 *             phone: "+1-555-0123"
 *             services: ["Infrastructure", "Platform", "Software"]
 *     responses:
 *       201:
 *         description: Partner created successfully
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
 *                       description: Partner unique ID
 *                       example: 16
 *                     name:
 *                       type: string
 *                       description: Partner name
 *                       example: "CloudTech Partners"
 *                     email:
 *                       type: string
 *                       description: Partner email
 *                       example: "partnerships@cloudtech.com"
 *                     companyName:
 *                       type: string
 *                       description: Company name
 *                       example: "CloudTech Solutions Ltd."
 *                     partnerType:
 *                       type: string
 *                       description: Partner type
 *                       example: "TECHNOLOGY"
 *                     industry:
 *                       type: string
 *                       description: Industry sector
 *                       example: "Cloud Computing"
 *                     description:
 *                       type: string
 *                       description: Partner description
 *                       example: "Leading cloud infrastructure and services provider"
 *                     website:
 *                       type: string
 *                       description: Website URL
 *                       example: "https://cloudtech.com"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: Creation timestamp
 *                       example: "2024-01-15T15:00:00.000Z"
 *                 message:
 *                   type: string
 *                   description: Success message
 *                   example: "Partner created successfully"
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
 *                   example: "Partner with this email already exists"
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const partner = await partnerService.createPartner(body);

    return NextResponse.json({
      success: true,
      data: partner,
      message: 'Partner created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating partner:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create partner'
      },
      { status: 400 }
    );
  }
}
