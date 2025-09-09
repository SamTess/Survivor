import { NextRequest, NextResponse } from 'next/server';
import { StartupService } from '../../../application/services/startups/StartupService';
import { StartupRepositoryPrisma } from '../../../infrastructure/persistence/prisma/StartupRepositoryPrisma';

const startupRepository = new StartupRepositoryPrisma();
const startupService = new StartupService(startupRepository);

/**
 * @openapi
 * /api/startups:
 *   get:
 *     tags:
 *       - Startups
 *     summary: Get startups
 *     description: Retrieve a list of startups with optional filtering and pagination
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *         description: Filter by startup sector
 *       - in: query
 *         name: maturity
 *         schema:
 *           type: string
 *         description: Filter by startup maturity stage
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for startup name or description
 *     responses:
 *       200:
 *         description: Startups retrieved successfully
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
 *                         example: "TechStartup Inc"
 *                       sector:
 *                         type: string
 *                         example: "Technology"
 *                       maturity:
 *                         type: string
 *                         example: "Seed"
 *                       description:
 *                         type: string
 *                         example: "A revolutionary tech startup"
 *                       website:
 *                         type: string
 *                         example: "https://techstartup.com"
 *                       location:
 *                         type: string
 *                         example: "San Francisco, CA"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 50
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *             example:
 *               success: true
 *               data:
 *                 - id: 1
 *                   name: "TechStartup Inc"
 *                   sector: "Technology"
 *                   maturity: "Seed"
 *                   description: "A revolutionary tech startup"
 *               pagination:
 *                 page: 1
 *                 limit: 10
 *                 total: 50
 *                 totalPages: 5
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
 *                   example: "Failed to fetch startups"
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
 * @openapi
 * /api/startups:
 *   post:
 *     tags:
 *       - Startups
 *     summary: Create startup
 *     description: Create a new startup
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "TechStartup Inc"
 *               description:
 *                 type: string
 *                 example: "A revolutionary tech startup"
 *               sector:
 *                 type: string
 *                 example: "Technology"
 *               maturity:
 *                 type: string
 *                 example: "Seed"
 *               website:
 *                 type: string
 *                 format: uri
 *                 example: "https://techstartup.com"
 *               location:
 *                 type: string
 *                 example: "San Francisco, CA"
 *           example:
 *             name: "TechStartup Inc"
 *             description: "A revolutionary tech startup"
 *             sector: "Technology"
 *             maturity: "Seed"
 *             website: "https://techstartup.com"
 *             location: "San Francisco, CA"
 *     responses:
 *       201:
 *         description: Startup created successfully
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
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "TechStartup Inc"
 *                     description:
 *                       type: string
 *                       example: "A revolutionary tech startup"
 *                     sector:
 *                       type: string
 *                       example: "Technology"
 *                     maturity:
 *                       type: string
 *                       example: "Seed"
 *                     website:
 *                       type: string
 *                       example: "https://techstartup.com"
 *                     location:
 *                       type: string
 *                       example: "San Francisco, CA"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                 message:
 *                   type: string
 *                   example: "Startup created successfully"
 *             example:
 *               success: true
 *               data:
 *                 id: 1
 *                 name: "TechStartup Inc"
 *                 description: "A revolutionary tech startup"
 *                 sector: "Technology"
 *                 maturity: "Seed"
 *                 website: "https://techstartup.com"
 *                 location: "San Francisco, CA"
 *               message: "Startup created successfully"
 *       400:
 *         description: Bad request - Invalid input data
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
 *                   example: "Failed to create startup"
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
