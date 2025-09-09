import { NextRequest, NextResponse } from 'next/server';
import { NewsService } from '../../../../application/services/news/NewsService';
import { NewsRepositoryPrisma } from '../../../../infrastructure/persistence/prisma/NewsRepositoryPrisma';

const newsRepository = new NewsRepositoryPrisma();
const newsService = new NewsService(newsRepository);

/**
 * @openapi
 * /news/{id}:
 *   get:
 *     summary: Get News Article by ID
 *     description: Retrieve a specific news article by its ID
 *     tags:
 *       - News
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: News article unique ID
 *         example: 1
 *     responses:
 *       200:
 *         description: News article retrieved successfully
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
 *                       description: News article ID
 *                       example: 1
 *                     title:
 *                       type: string
 *                       description: Article title
 *                       example: "Tech Startup Raises $10M Series A"
 *                     content:
 *                       type: string
 *                       description: Article content
 *                       example: "A promising tech startup has successfully raised $10M in Series A funding..."
 *                     author:
 *                       type: string
 *                       description: Article author
 *                       example: "John Journalist"
 *                     category:
 *                       type: string
 *                       description: Article category
 *                       example: "FUNDING"
 *                     imageUrl:
 *                       type: string
 *                       description: Article image URL
 *                       example: "https://example.com/image.jpg"
 *                     startup_id:
 *                       type: integer
 *                       description: Associated startup ID
 *                       example: 5
 *                     viewsCount:
 *                       type: integer
 *                       description: Number of views
 *                       example: 1250
 *                     likesCount:
 *                       type: integer
 *                       description: Number of likes
 *                       example: 87
 *                     bookmarksCount:
 *                       type: integer
 *                       description: Number of bookmarks
 *                       example: 23
 *                     publishedAt:
 *                       type: string
 *                       format: date-time
 *                       description: Publication timestamp
 *                       example: "2024-01-15T09:00:00.000Z"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: Creation timestamp
 *                       example: "2024-01-15T08:30:00.000Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: Last update timestamp
 *                       example: "2024-01-15T12:00:00.000Z"
 *       400:
 *         description: Invalid news ID
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
 *                   example: "Invalid news ID"
 *       404:
 *         description: News article not found
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
 *                   example: "News not found"
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
 *                   example: "Failed to fetch news"
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
 * @openapi
 * /news/{id}:
 *   put:
 *     summary: Update News Article
 *     description: Update an existing news article
 *     tags:
 *       - News
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: News article unique ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Article title
 *                 example: "Tech Startup Successfully Closes $15M Series A"
 *               content:
 *                 type: string
 *                 description: Article content
 *                 example: "The startup has successfully raised $15M in Series A funding, exceeding initial goals..."
 *               author:
 *                 type: string
 *                 description: Article author
 *                 example: "Jane Reporter"
 *               category:
 *                 type: string
 *                 enum: [FUNDING, PRODUCT, MARKET, TEAM, INDUSTRY]
 *                 description: Article category
 *                 example: "FUNDING"
 *               imageUrl:
 *                 type: string
 *                 description: Article image URL
 *                 example: "https://example.com/updated-image.jpg"
 *               startup_id:
 *                 type: integer
 *                 minimum: 1
 *                 description: Associated startup ID
 *                 example: 5
 *               publishedAt:
 *                 type: string
 *                 format: date-time
 *                 description: Publication timestamp
 *                 example: "2024-01-15T09:00:00.000Z"
 *           example:
 *             title: "Tech Startup Successfully Closes $15M Series A"
 *             content: "The startup has successfully raised $15M in Series A funding, exceeding initial goals..."
 *             category: "FUNDING"
 *             author: "Jane Reporter"
 *     responses:
 *       200:
 *         description: News article updated successfully
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
 *                     title:
 *                       type: string
 *                       example: "Tech Startup Successfully Closes $15M Series A"
 *                     content:
 *                       type: string
 *                       example: "The startup has successfully raised $15M in Series A funding, exceeding initial goals..."
 *                     author:
 *                       type: string
 *                       example: "Jane Reporter"
 *                     category:
 *                       type: string
 *                       example: "FUNDING"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T14:00:00.000Z"
 *                 message:
 *                   type: string
 *                   description: Success message
 *                   example: "News updated successfully"
 *       400:
 *         description: Invalid news ID or validation error
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
 *                   example: "Invalid news ID"
 *       404:
 *         description: News article not found or update failed
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
 *                   example: "News not found or update failed"
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
 *                   example: "Failed to update news"
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
 * @openapi
 * /news/{id}:
 *   delete:
 *     summary: Delete News Article
 *     description: Delete a news article permanently
 *     tags:
 *       - News
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: News article unique ID
 *         example: 1
 *     responses:
 *       200:
 *         description: News article deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: Success message
 *                   example: "News deleted successfully"
 *       400:
 *         description: Invalid news ID
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
 *                   example: "Invalid news ID"
 *       404:
 *         description: News article not found or deletion failed
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
 *                   example: "News not found or deletion failed"
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
 *                   example: "Failed to delete news"
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
