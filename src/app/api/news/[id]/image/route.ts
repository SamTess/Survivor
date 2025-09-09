import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { detectMime } from '@/utils/image';

/**
 * @openapi
 * /news/{id}/image:
 *   get:
 *     summary: Get News Image
 *     description: Retrieve the image data for a specific news article
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
 *         description: News image retrieved successfully
 *         content:
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *               description: News image data in JPEG format
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *               description: News image data in PNG format
 *           image/gif:
 *             schema:
 *               type: string
 *               format: binary
 *               description: News image data in GIF format
 *           image/webp:
 *             schema:
 *               type: string
 *               format: binary
 *               description: News image data in WebP format
 *         headers:
 *           Content-Type:
 *             schema:
 *               type: string
 *               enum: [image/jpeg, image/png, image/gif, image/webp]
 *               description: Image MIME type
 *               example: "image/jpeg"
 *           Cache-Control:
 *             schema:
 *               type: string
 *               example: "public, max-age=604800, stale-while-revalidate=86400"
 *               description: Cache control directives for optimal image caching
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
 *         description: News not found or no image available
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
 *                   example: "No image available for this news"
 *       500:
 *         description: Failed to fetch image
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
 *                   example: "Failed to fetch image"
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
