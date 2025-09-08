import { NextRequest, NextResponse } from 'next/server';
import { NewsService } from '../../../application/services/news/NewsService';
import { NewsRepositoryPrisma } from '../../../infrastructure/persistence/prisma/NewsRepositoryPrisma';

const newsRepository = new NewsRepositoryPrisma();
const newsService = new NewsService(newsRepository);

/**
 * @api {get} /news Get All News
 * @apiName GetNews
 * @apiGroup News
 * @apiVersion 0.1.0
 * @apiDescription Retrieve all news articles with optional filtering and pagination
 *
 * @apiQuery {Number} [page=1] Page number
 * @apiQuery {Number} [limit=10] Number of articles per page
 * @apiQuery {String} [category] Filter by news category
 * @apiQuery {String} [search] Search articles by title or content
 * @apiQuery {String} [sortBy=createdAt] Sort field (createdAt, title, author)
 * @apiQuery {String} [sortOrder=desc] Sort order (asc, desc)
 *
 * @apiSuccess {Boolean} success Operation success status
 * @apiSuccess {Object[]} data Array of news articles
 * @apiSuccess {Number} data.id Article ID
 * @apiSuccess {String} data.title Article title
 * @apiSuccess {String} data.content Article content
 * @apiSuccess {String} data.author Article author
 * @apiSuccess {String} data.category Article category
 * @apiSuccess {String} data.imageUrl Article image URL
 * @apiSuccess {String} data.publishedAt Publication timestamp
 * @apiSuccess {String} data.createdAt Creation timestamp
 * @apiSuccess {Object} [pagination] Pagination information (when using page/limit)
 * @apiSuccess {Number} pagination.page Current page number
 * @apiSuccess {Number} pagination.limit Items per page
 * @apiSuccess {Number} pagination.total Total number of articles
 * @apiSuccess {Number} pagination.totalPages Total number of pages
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "data": [
 *         {
 *           "id": 1,
 *           "title": "Tech Startup Raises $10M Series A",
 *           "content": "A promising tech startup has successfully raised...",
 *           "author": "John Journalist",
 *           "category": "FUNDING",
 *           "imageUrl": "https://example.com/image.jpg",
 *           "publishedAt": "2024-01-15T09:00:00.000Z",
 *           "createdAt": "2024-01-15T08:30:00.000Z"
 *         }
 *       ],
 *       "pagination": {
 *         "page": 1,
 *         "limit": 10,
 *         "total": 45,
 *         "totalPages": 5
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
 *       "error": "Failed to fetch news articles"
 *     }
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
 * @api {post} /news Create News Article
 * @apiName CreateNews
 * @apiGroup News
 * @apiVersion 0.1.0
 * @apiDescription Create a new news article
 *
 * @apiParam {String} title Article title
 * @apiParam {String} content Article content
 * @apiParam {String} author Article author
 * @apiParam {String} category Article category (FUNDING, PRODUCT, MARKET, etc.)
 * @apiParam {String} [imageUrl] Article image URL
 * @apiParam {String} [summary] Article summary
 * @apiParam {Number} [startupId] Related startup ID
 * @apiParam {String[]} [tags] Article tags
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "title": "Revolutionary AI Startup Secures $15M Funding",
 *       "content": "TechVenture AI, a cutting-edge artificial intelligence startup...",
 *       "author": "Sarah Tech Reporter",
 *       "category": "FUNDING",
 *       "imageUrl": "https://example.com/ai-startup.jpg",
 *       "summary": "AI startup raises significant Series A funding round",
 *       "startupId": 12,
 *       "tags": ["AI", "Funding", "Technology"]
 *     }
 *
 * @apiSuccess {Boolean} success Operation success status
 * @apiSuccess {Object} data Created news article object
 * @apiSuccess {Number} data.id Article ID
 * @apiSuccess {String} data.title Article title
 * @apiSuccess {String} data.content Article content
 * @apiSuccess {String} data.author Article author
 * @apiSuccess {String} data.category Article category
 * @apiSuccess {String} data.imageUrl Article image URL
 * @apiSuccess {String} data.publishedAt Publication timestamp
 * @apiSuccess {String} data.createdAt Creation timestamp
 * @apiSuccess {String} message Success message
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 Created
 *     {
 *       "success": true,
 *       "data": {
 *         "id": 46,
 *         "title": "Revolutionary AI Startup Secures $15M Funding",
 *         "content": "TechVenture AI, a cutting-edge artificial intelligence startup...",
 *         "author": "Sarah Tech Reporter",
 *         "category": "FUNDING",
 *         "imageUrl": "https://example.com/ai-startup.jpg",
 *         "publishedAt": "2024-01-15T14:30:00.000Z",
 *         "createdAt": "2024-01-15T14:30:00.000Z"
 *       },
 *       "message": "News created successfully"
 *     }
 *
 * @apiError (Error 400) {Boolean} success False
 * @apiError (Error 400) {String} error Validation error message
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "success": false,
 *       "error": "Title and content are required"
 *     }
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
