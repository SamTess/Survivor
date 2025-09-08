import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { detectMime } from '@/utils/image';

const prisma = new PrismaClient();

/**
 * @api {get} /events/:id/image Get Event Image
 * @apiName GetEventImage
 * @apiGroup Events
 * @apiVersion 0.1.0
 * @apiDescription Retrieve the image data for a specific event
 *
 * @apiParam {Number} id Event ID
 *
 * @apiSuccess {Binary} image Event image data
 * @apiSuccess {String} Content-Type Image MIME type (image/jpeg, image/png, etc.)
 *
 * @apiError (Error 400) {String} error Invalid event ID
 * @apiError (Error 404) {String} error Event not found or no image available
 * @apiError (Error 500) {String} error Failed to fetch image
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "success": false,
 *       "error": "No image available for this event"
 *     }
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
