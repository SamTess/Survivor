import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { detectMime } from '@/utils/image';

/**
 * @api {get} /news/:id/image Get News Image
 * @apiName GetNewsImage
 * @apiGroup News
 * @apiVersion 0.1.0
 * @apiDescription Retrieve the image data for a specific news article
 * 
 * @apiParam {Number} id News ID
 * 
 * @apiSuccess {Binary} image News image data
 * @apiSuccess {String} Content-Type Image MIME type (image/jpeg, image/png, etc.)
 * 
 * @apiError (Error 400) {String} error Invalid news ID
 * @apiError (Error 404) {String} error News not found or no image available
 * @apiError (Error 500) {String} error Failed to fetch image
 * 
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "success": false,
 *       "error": "No image available for this news"
 *     }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const newsId = parseInt(id);

    if (isNaN(newsId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid news ID' },
        { status: 400 }
      );
    }

    const news = await prisma.s_NEWS.findUnique({
      where: { id: newsId },
      select: { image_data: true }
    });

    if (!news) {
      return NextResponse.json(
        { success: false, error: 'News not found' },
        { status: 404 }
      );
    }

    if (!news.image_data) {
      return NextResponse.json(
        { success: false, error: 'No image available for this news' },
        { status: 404 }
      );
    }

    const bytes = news.image_data as Buffer;
    const uint8 = new Uint8Array(bytes);
    const mime = detectMime(uint8);

    return new NextResponse(Buffer.from(uint8), {
      status: 200,
      headers: {
        'Content-Type': mime,
        'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400',
      },
    });

  } catch (error) {
    console.error('Error fetching news image:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch image' 
      },
      { status: 500 }
    );
  }
}
