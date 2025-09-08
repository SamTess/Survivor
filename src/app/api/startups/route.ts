import { NextRequest, NextResponse } from 'next/server';
import { StartupService } from '../../../application/services/startups/StartupService';
import { StartupRepositoryPrisma } from '../../../infrastructure/persistence/prisma/StartupRepositoryPrisma';

const startupRepository = new StartupRepositoryPrisma();
const startupService = new StartupService(startupRepository);

/**
 * @api {get} /startups Get Startups
 * @apiName GetStartups
 * @apiGroup Startups
 * @apiVersion 0.1.0
 * @apiDescription Retrieve a list of startups with optional filtering and pagination
 *
 * @apiParam {Number} [page=1] Page number for pagination
 * @apiParam {Number} [limit=10] Number of items per page
 * @apiParam {String} [sector] Filter by startup sector
 * @apiParam {String} [maturity] Filter by startup maturity stage
 * @apiParam {String} [search] Search term for startup name or description
 *
 * @apiSuccess {Boolean} success Request success status
 * @apiSuccess {Object[]} data Array of startup objects
 * @apiSuccess {Object} [pagination] Pagination information (when using page/limit)
 * @apiSuccess {Number} pagination.page Current page number
 * @apiSuccess {Number} pagination.limit Items per page
 * @apiSuccess {Number} pagination.total Total number of startups
 * @apiSuccess {Number} pagination.totalPages Total number of pages
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "data": [
 *         {
 *           "id": 1,
 *           "name": "TechStartup Inc",
 *           "sector": "Technology",
 *           "maturity": "Seed",
 *           "description": "A revolutionary tech startup"
 *         }
 *       ],
 *       "pagination": {
 *         "page": 1,
 *         "limit": 10,
 *         "total": 50,
 *         "totalPages": 5
 *       }
 *     }
 *
 * @apiError (Error 500) {Boolean} success false
 * @apiError (Error 500) {String} error Error message
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "success": false,
 *       "error": "Failed to fetch startups"
 *     }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sector = searchParams.get('sector');
    const maturity = searchParams.get('maturity');
    const search = searchParams.get('search');

    if (search) {
      const startups = await startupService.searchStartups(search);
      return NextResponse.json({ success: true, data: startups });
    }

    if (sector) {
      const startups = await startupService.getStartupsBysector(sector);
      return NextResponse.json({ success: true, data: startups });
    }

    if (maturity) {
      const startups = await startupService.getStartupsByMaturity(maturity);
      return NextResponse.json({ success: true, data: startups });
    }

    if (page > 1 || limit !== 10) {
      const result = await startupService.getStartupsPaginated(page, limit);
      return NextResponse.json({
        success: true,
        data: result.startups,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit)
        }
      });
    }

    const startups = await startupService.getAllStartups();
    return NextResponse.json({ success: true, data: startups });

  } catch (error) {
    console.error('Error fetching startups:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch startups'
      },
      { status: 500 }
    );
  }
}

/**
 * @api {post} /startups Create Startup
 * @apiName CreateStartup
 * @apiGroup Startups
 * @apiVersion 0.1.0
 * @apiDescription Create a new startup
 *
 * @apiParam {String} name Startup name
 * @apiParam {String} [description] Startup description
 * @apiParam {String} [sector] Startup sector/industry
 * @apiParam {String} [maturity] Startup maturity stage
 * @apiParam {String} [website] Startup website URL
 * @apiParam {String} [location] Startup location
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "name": "TechStartup Inc",
 *       "description": "A revolutionary tech startup",
 *       "sector": "Technology",
 *       "maturity": "Seed",
 *       "website": "https://techstartup.com",
 *       "location": "San Francisco, CA"
 *     }
 *
 * @apiSuccess (Success 201) {Boolean} success Request success status
 * @apiSuccess (Success 201) {Object} data Created startup object
 * @apiSuccess (Success 201) {String} message Success message
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 Created
 *     {
 *       "success": true,
 *       "data": {
 *         "id": 1,
 *         "name": "TechStartup Inc",
 *         "description": "A revolutionary tech startup",
 *         "sector": "Technology",
 *         "maturity": "Seed",
 *         "website": "https://techstartup.com",
 *         "location": "San Francisco, CA"
 *       },
 *       "message": "Startup created successfully"
 *     }
 *
 * @apiError (Error 400) {Boolean} success false
 * @apiError (Error 400) {String} error Error message
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "success": false,
 *       "error": "Failed to create startup"
 *     }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const startup = await startupService.createStartup(body);

    return NextResponse.json({
      success: true,
      data: startup,
      message: 'Startup created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating startup:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create startup'
      },
      { status: 400 }
    );
  }
}
