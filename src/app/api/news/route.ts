import { NextRequest, NextResponse } from 'next/server';
import { NewsService } from '../../../application/services/news/NewsService';
import { NewsRepositoryPrisma } from '../../../infrastructure/persistence/prisma/NewsRepositoryPrisma';

const newsRepository = new NewsRepositoryPrisma();
const newsService = new NewsService(newsRepository);

/**
 * @openapi
 * /news:
 *   get:
 *     summary: Get All News
 *     description: Retrieve all news articles with optional filtering and pagination
 *     tags:
 *       - News
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
 *         description: Number of articles per page
 *         example: 10
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [FUNDING, PRODUCT, MARKET, TEAM, INDUSTRY]
 *         description: Filter by news category
 *         example: FUNDING
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search articles by title or content
 *         example: "AI startup"
 *       - in: query
 *         name: startupId
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Filter by startup ID
 *         example: 12
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter articles from this date (used with endDate)
 *         example: "2024-01-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter articles until this date (used with startDate)
 *         example: "2024-12-31"
 *     responses:
 *       200:
 *         description: News articles retrieved successfully
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
 *                         description: Article unique ID
 *                         example: 1
 *                       title:
 *                         type: string
 *                         description: Article title
 *                         example: "Tech Startup Raises $10M Series A"
 *                       content:
 *                         type: string
 *                         description: Article content
 *                         example: "A promising tech startup has successfully raised..."
 *                       author:
 *                         type: string
 *                         description: Article author
 *                         example: "John Journalist"
 *                       category:
 *                         type: string
 *                         description: Article category
 *                         example: "FUNDING"
 *                       imageUrl:
 *                         type: string
 *                         description: Article image URL
 *                         example: "https://example.com/image.jpg"
 *                       publishedAt:
 *                         type: string
 *                         format: date-time
 *                         description: Publication timestamp
 *                         example: "2024-01-15T09:00:00.000Z"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: Creation timestamp
 *                         example: "2024-01-15T08:30:00.000Z"
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
 *                       description: Total number of articles
 *                       example: 45
 *                     totalPages:
 *                       type: integer
 *                       description: Total number of pages
 *                       example: 5
 *       400:
 *         description: Invalid request parameters
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
 *                   example: "Invalid startup ID"
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
 *                   example: "Failed to fetch news articles"
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const startupId = searchParams.get('startupId');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (search) {
      const news = await newsService.searchNews(search);
      return NextResponse.json({ success: true, data: news });
    }

    if (startupId) {
      const id = parseInt(startupId);
      if (isNaN(id)) {
        return NextResponse.json(
          { success: false, error: 'Invalid startup ID' },
          { status: 400 }
        );
      }
      const news = await newsService.getNewsByStartupId(id);
      return NextResponse.json({ success: true, data: news });
    }

    if (category) {
      const news = await newsService.getNewsByCategory(category);
      return NextResponse.json({ success: true, data: news });
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return NextResponse.json(
          { success: false, error: 'Invalid date format' },
          { status: 400 }
        );
      }
      const news = await newsService.getNewsByDateRange(start, end);
      return NextResponse.json({ success: true, data: news });
    }

    if (page > 1 || limit !== 10) {
      const result = await newsService.getNewsPaginated(page, limit);
      return NextResponse.json({
        success: true,
        data: result.news,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit)
        }
      });
    }

    const news = await newsService.getAllNews();
    return NextResponse.json({ success: true, data: news });

  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch news'
      },
      { status: 500 }
    );
  }
}

/**
 * @openapi
 * /news:
 *   post:
 *     summary: Create News Article
 *     description: Create a new news article
 *     tags:
 *       - News
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - author
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *                 description: Article title
 *                 example: "Revolutionary AI Startup Secures $15M Funding"
 *               content:
 *                 type: string
 *                 description: Article content
 *                 example: "TechVenture AI, a cutting-edge artificial intelligence startup..."
 *               author:
 *                 type: string
 *                 description: Article author
 *                 example: "Sarah Tech Reporter"
 *               category:
 *                 type: string
 *                 enum: [FUNDING, PRODUCT, MARKET, TEAM, INDUSTRY]
 *                 description: Article category
 *                 example: "FUNDING"
 *               imageUrl:
 *                 type: string
 *                 description: Article image URL
 *                 example: "https://example.com/ai-startup.jpg"
 *               summary:
 *                 type: string
 *                 description: Article summary
 *                 example: "AI startup raises significant Series A funding round"
 *               startupId:
 *                 type: integer
 *                 minimum: 1
 *                 description: Related startup ID
 *                 example: 12
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Article tags
 *                 example: ["AI", "Funding", "Technology"]
 *           example:
 *             title: "Revolutionary AI Startup Secures $15M Funding"
 *             content: "TechVenture AI, a cutting-edge artificial intelligence startup..."
 *             author: "Sarah Tech Reporter"
 *             category: "FUNDING"
 *             imageUrl: "https://example.com/ai-startup.jpg"
 *             summary: "AI startup raises significant Series A funding round"
 *             startupId: 12
 *             tags: ["AI", "Funding", "Technology"]
 *     responses:
 *       201:
 *         description: News article created successfully
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
 *                       description: Article unique ID
 *                       example: 46
 *                     title:
 *                       type: string
 *                       description: Article title
 *                       example: "Revolutionary AI Startup Secures $15M Funding"
 *                     content:
 *                       type: string
 *                       description: Article content
 *                       example: "TechVenture AI, a cutting-edge artificial intelligence startup..."
 *                     author:
 *                       type: string
 *                       description: Article author
 *                       example: "Sarah Tech Reporter"
 *                     category:
 *                       type: string
 *                       description: Article category
 *                       example: "FUNDING"
 *                     imageUrl:
 *                       type: string
 *                       description: Article image URL
 *                       example: "https://example.com/ai-startup.jpg"
 *                     publishedAt:
 *                       type: string
 *                       format: date-time
 *                       description: Publication timestamp
 *                       example: "2024-01-15T14:30:00.000Z"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: Creation timestamp
 *                       example: "2024-01-15T14:30:00.000Z"
 *                 message:
 *                   type: string
 *                   description: Success message
 *                   example: "News created successfully"
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
 *                   example: "Title and content are required"
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const news = await newsService.createNews(body);

    return NextResponse.json({
      success: true,
      data: news,
      message: 'News created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating news:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create news'
      },
      { status: 400 }
    );
  }
}
