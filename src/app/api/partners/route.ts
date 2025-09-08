import { NextRequest, NextResponse } from 'next/server';
import { PartnerService } from '../../../application/services/partners/PartnerService';
import { PartnerRepositoryPrisma } from '../../../infrastructure/persistence/prisma/PartnerRepositoryPrisma';

const partnerRepository = new PartnerRepositoryPrisma();
const partnerService = new PartnerService(partnerRepository);

/**
 * @api {get} /partners Get All Partners
 * @apiName GetPartners
 * @apiGroup Partners
 * @apiVersion 0.1.0
 * @apiDescription Retrieve all partners with optional filtering and pagination
 *
 * @apiQuery {Number} [page=1] Page number
 * @apiQuery {Number} [limit=10] Number of partners per page
 * @apiQuery {String} [partnerType] Filter by partner type
 * @apiQuery {String} [industry] Filter by industry
 * @apiQuery {String} [search] Search partners by name
 *
 * @apiSuccess {Boolean} success Operation success status
 * @apiSuccess {Object[]} data Array of partner objects
 * @apiSuccess {Number} data.id Partner ID
 * @apiSuccess {String} data.name Partner name
 * @apiSuccess {String} data.email Partner email
 * @apiSuccess {String} data.companyName Company name
 * @apiSuccess {String} data.partnerType Partner type (STRATEGIC, TECHNOLOGY, VENDOR, etc.)
 * @apiSuccess {String} data.industry Industry sector
 * @apiSuccess {String} data.description Partner description
 * @apiSuccess {String} data.website Website URL
 * @apiSuccess {String} data.createdAt Creation timestamp
 * @apiSuccess {Object} [pagination] Pagination information (when using page/limit)
 * @apiSuccess {Number} pagination.page Current page number
 * @apiSuccess {Number} pagination.limit Items per page
 * @apiSuccess {Number} pagination.total Total number of partners
 * @apiSuccess {Number} pagination.totalPages Total number of pages
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "data": [
 *         {
 *           "id": 1,
 *           "name": "TechCorp Solutions",
 *           "email": "contact@techcorp.com",
 *           "companyName": "TechCorp Inc.",
 *           "partnerType": "STRATEGIC",
 *           "industry": "Technology",
 *           "description": "Leading technology solutions provider",
 *           "website": "https://techcorp.com",
 *           "createdAt": "2024-01-01T00:00:00.000Z"
 *         }
 *       ],
 *       "pagination": {
 *         "page": 1,
 *         "limit": 10,
 *         "total": 15,
 *         "totalPages": 2
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
 *       "error": "Failed to fetch partners"
 *     }
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
 * @api {post} /partners Create New Partner
 * @apiName CreatePartner
 * @apiGroup Partners
 * @apiVersion 0.1.0
 * @apiDescription Create a new partnership
 *
 * @apiParam {String} name Partner name
 * @apiParam {String} email Partner email
 * @apiParam {String} companyName Company name
 * @apiParam {String} partnerType Partner type (STRATEGIC, TECHNOLOGY, VENDOR, DISTRIBUTION, etc.)
 * @apiParam {String} industry Industry sector
 * @apiParam {String} description Partner description
 * @apiParam {String} [website] Website URL
 * @apiParam {String} [contactPerson] Contact person name
 * @apiParam {String} [phone] Contact phone number
 * @apiParam {String[]} [services] Services offered
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "name": "CloudTech Partners",
 *       "email": "partnerships@cloudtech.com",
 *       "companyName": "CloudTech Solutions Ltd.",
 *       "partnerType": "TECHNOLOGY",
 *       "industry": "Cloud Computing",
 *       "description": "Leading cloud infrastructure and services provider",
 *       "website": "https://cloudtech.com",
 *       "contactPerson": "Alex Johnson",
 *       "phone": "+1-555-0123",
 *       "services": ["Infrastructure", "Platform", "Software"]
 *     }
 *
 * @apiSuccess {Boolean} success Operation success status
 * @apiSuccess {Object} data Created partner object
 * @apiSuccess {Number} data.id Partner ID
 * @apiSuccess {String} data.name Partner name
 * @apiSuccess {String} data.email Partner email
 * @apiSuccess {String} data.companyName Company name
 * @apiSuccess {String} data.partnerType Partner type
 * @apiSuccess {String} data.industry Industry sector
 * @apiSuccess {String} data.description Partner description
 * @apiSuccess {String} data.website Website URL
 * @apiSuccess {String} data.createdAt Creation timestamp
 * @apiSuccess {String} message Success message
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 Created
 *     {
 *       "success": true,
 *       "data": {
 *         "id": 16,
 *         "name": "CloudTech Partners",
 *         "email": "partnerships@cloudtech.com",
 *         "companyName": "CloudTech Solutions Ltd.",
 *         "partnerType": "TECHNOLOGY",
 *         "industry": "Cloud Computing",
 *         "description": "Leading cloud infrastructure and services provider",
 *         "website": "https://cloudtech.com",
 *         "createdAt": "2024-01-15T15:00:00.000Z"
 *       },
 *       "message": "Partner created successfully"
 *     }
 *
 * @apiError (Error 400) {Boolean} success False
 * @apiError (Error 400) {String} error Validation error message
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "success": false,
 *       "error": "Partner with this email already exists"
 *     }
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
