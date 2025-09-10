import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import prisma from '@/infrastructure/persistence/prisma/client';
import { detectMime } from '@/utils/image';

/**
 * @openapi
 * /users/{id}/image:
 *   get:
 *     summary: Get user profile image
 *     description: Return the raw image bytes for the given user ID with appropriate Content-Type
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: User ID
 *         example: 12
 *     responses:
 *       200:
 *         description: User image returned as binary
 *         content:
 *           image/png: {}
 *           image/jpeg: {}
 *           image/webp: {}
 *       400:
 *         description: Invalid user ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: false }
 *                 error: { type: string, example: "Invalid user ID" }
 *       404:
 *         description: User or image not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: false }
 *                 error: { type: string, example: "No image available for this user" }
 *       500:
 *         description: Server error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const user = await prisma.s_USER.findUnique({
      where: { id: userId },
      select: { image_data: true }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.image_data) {
      return NextResponse.json(
        { success: false, error: 'No image available for this user' },
        { status: 404 }
      );
    }

    const bytes = user.image_data as Buffer;
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
    console.error('Error fetching user image:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch image' 
      },
      { status: 500 }
    );
  }
}
