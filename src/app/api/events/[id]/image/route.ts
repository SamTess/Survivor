import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { detectMime } from '@/utils/image';

const prisma = new PrismaClient();

/**
 * @openapi
 * /events/{id}/image:
 *   get:
 *     summary: Get Event Image
 *     description: Retrieve the image data for a specific event
 *     tags:
 *       - Events
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Event ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Event image data retrieved successfully
 *         content:
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *               description: Event image data
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *               description: Event image data
 *           image/gif:
 *             schema:
 *               type: string
 *               format: binary
 *               description: Event image data
 *           image/webp:
 *             schema:
 *               type: string
 *               format: binary
 *               description: Event image data
 *         headers:
 *           Content-Type:
 *             description: Image MIME type
 *             schema:
 *               type: string
 *               enum: [image/jpeg, image/png, image/gif, image/webp]
 *           Cache-Control:
 *             description: Cache control header
 *             schema:
 *               type: string
 *               example: "public, max-age=604800, stale-while-revalidate=86400"
 *       400:
 *         description: Invalid event ID
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
 *                   example: "Invalid event ID"
 *       404:
 *         description: Event not found or no image available
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
 *                   enum: ["Event not found", "No image available for this event"]
 *                   example: "No image available for this event"
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
    const eventId = parseInt(id);

    if (isNaN(eventId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    const event = await prisma.s_EVENT.findUnique({
      where: { id: eventId },
      select: { image_data: true }
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    if (!event.image_data) {
      return NextResponse.json(
        { success: false, error: 'No image available for this event' },
        { status: 404 }
      );
    }

    const bytes = event.image_data as Buffer;
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
    console.error('Error fetching event image:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch image'
      },
      { status: 500 }
    );
  }
}
