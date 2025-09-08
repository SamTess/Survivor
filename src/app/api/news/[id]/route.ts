import { NextRequest, NextResponse } from 'next/server';
import { NewsService } from '../../../../application/services/news/NewsService';
import { NewsRepositoryPrisma } from '../../../../infrastructure/persistence/prisma/NewsRepositoryPrisma';

const newsRepository = new NewsRepositoryPrisma();
const newsService = new NewsService(newsRepository);

/**
 * @api {get} /news/:id Get News Article by ID
 * @apiName GetNewsById
 * @apiGroup News
 * @apiVersion 0.1.0
 * @apiDescription Retrieve a specific news article by its ID
 *
 * @apiParam {Number} id News article unique ID
 *
 * @apiSuccess {Boolean} success Operation success status
 * @apiSuccess {Object} data News article object
 * @apiSuccess {Number} data.id News article ID
 * @apiSuccess {String} data.title Article title
 * @apiSuccess {String} data.content Article content
 * @apiSuccess {String} data.author Article author
 * @apiSuccess {String} data.category Article category
 * @apiSuccess {String} data.imageUrl Article image URL
 * @apiSuccess {Number} data.startup_id Associated startup ID
 * @apiSuccess {Number} data.viewsCount Number of views
 * @apiSuccess {Number} data.likesCount Number of likes
 * @apiSuccess {Number} data.bookmarksCount Number of bookmarks
 * @apiSuccess {String} data.publishedAt Publication timestamp
 * @apiSuccess {String} data.createdAt Creation timestamp
 * @apiSuccess {String} data.updatedAt Last update timestamp
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "data": {
 *         "id": 1,
 *         "title": "Tech Startup Raises $10M Series A",
 *         "content": "A promising tech startup has successfully raised $10M in Series A funding...",
 *         "author": "John Journalist",
 *         "category": "FUNDING",
 *         "imageUrl": "https://example.com/image.jpg",
 *         "startup_id": 5,
 *         "viewsCount": 1250,
 *         "likesCount": 87,
 *         "bookmarksCount": 23,
 *         "publishedAt": "2024-01-15T09:00:00.000Z",
 *         "createdAt": "2024-01-15T08:30:00.000Z",
 *         "updatedAt": "2024-01-15T12:00:00.000Z"
 *       }
 *     }
 *
 * @apiError (Error 400) {Boolean} success False
 * @apiError (Error 400) {String} error Invalid news ID
 * @apiError (Error 404) {Boolean} success False
 * @apiError (Error 404) {String} error News not found
 * @apiError (Error 500) {Boolean} success False
 * @apiError (Error 500) {String} error Internal server error
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "success": false,
 *       "error": "News not found"
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
        { success: false, error: 'Invalid news ID' },
        { status: 400 }
      );
    }

    const news = await newsService.getNewsById(id);

    if (!news) {
      return NextResponse.json(
        { success: false, error: 'News not found' },
        { status: 404 }
      );
    }

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
 * @api {put} /news/:id Update News Article
 * @apiName UpdateNews
 * @apiGroup News
 * @apiVersion 0.1.0
 * @apiDescription Update an existing news article
 *
 * @apiParam {Number} id News article unique ID
 * @apiParam {String} [title] Article title
 * @apiParam {String} [content] Article content
 * @apiParam {String} [author] Article author
 * @apiParam {String} [category] Article category (FUNDING, PRODUCT, TEAM, INDUSTRY, etc.)
 * @apiParam {String} [imageUrl] Article image URL
 * @apiParam {Number} [startup_id] Associated startup ID
 * @apiParam {String} [publishedAt] Publication timestamp
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "title": "Tech Startup Successfully Closes $15M Series A",
 *       "content": "The startup has successfully raised $15M in Series A funding, exceeding initial goals...",
 *       "category": "FUNDING",
 *       "author": "Jane Reporter"
 *     }
 *
 * @apiSuccess {Boolean} success Operation success status
 * @apiSuccess {Object} data Updated news article object
 * @apiSuccess {String} message Success message
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "data": {
 *         "id": 1,
 *         "title": "Tech Startup Successfully Closes $15M Series A",
 *         "content": "The startup has successfully raised $15M in Series A funding, exceeding initial goals...",
 *         "author": "Jane Reporter",
 *         "category": "FUNDING",
 *         "updatedAt": "2024-01-15T14:00:00.000Z"
 *       },
 *       "message": "News updated successfully"
 *     }
 *
 * @apiError (Error 400) {Boolean} success False
 * @apiError (Error 400) {String} error Invalid news ID or validation error
 * @apiError (Error 404) {Boolean} success False
 * @apiError (Error 404) {String} error News not found or update failed
 * @apiError (Error 500) {Boolean} success False
 * @apiError (Error 500) {String} error Internal server error
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "success": false,
 *       "error": "News not found or update failed"
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
        { success: false, error: 'Invalid news ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    const news = await newsService.updateNews(id, body);

    if (!news) {
      return NextResponse.json(
        { success: false, error: 'News not found or update failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: news,
      message: 'News updated successfully'
    });

  } catch (error) {
    console.error('Error updating news:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update news'
      },
      { status: 400 }
    );
  }
}

/**
 * @api {delete} /news/:id Delete News Article
 * @apiName DeleteNews
 * @apiGroup News
 * @apiVersion 0.1.0
 * @apiDescription Delete a news article permanently
 *
 * @apiParam {Number} id News article unique ID
 *
 * @apiSuccess {Boolean} success Operation success status
 * @apiSuccess {String} message Success message
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "message": "News deleted successfully"
 *     }
 *
 * @apiError (Error 400) {Boolean} success False
 * @apiError (Error 400) {String} error Invalid news ID
 * @apiError (Error 404) {Boolean} success False
 * @apiError (Error 404) {String} error News not found or deletion failed
 * @apiError (Error 500) {Boolean} success False
 * @apiError (Error 500) {String} error Internal server error
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "success": false,
 *       "error": "News not found or deletion failed"
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
        { success: false, error: 'Invalid news ID' },
        { status: 400 }
      );
    }

    const deleted = await newsService.deleteNews(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'News not found or deletion failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'News deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting news:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete news'
      },
      { status: 500 }
    );
  }
}
