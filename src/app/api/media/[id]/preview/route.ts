import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { PrismaClient } from '@prisma/client';
import { verifyJwtEdge } from '@/infrastructure/security/auth-edge';
import { MediaPreviewService } from '@/application/services/MediaPreviewService';

interface GlobalWithPrisma { prisma?: PrismaClient }
const globalForPrisma = globalThis as unknown as GlobalWithPrisma;
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (!globalForPrisma.prisma) globalForPrisma.prisma = prisma;

/**
 * @openapi
 * /media/{id}/preview:
 *   get:
 *     summary: Get Media File Preview
 *     description: Get a preview thumbnail of a media file. Only the file owner can access previews.
 *     tags:
 *       - Media
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The file ID to get preview for
 *         example: 123
 *     responses:
 *       200:
 *         description: Preview image served successfully
 *         content:
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *         headers:
 *           Content-Type:
 *             description: Always image/jpeg for previews
 *             schema:
 *               type: string
 *               example: "image/jpeg"
 *           Cache-Control:
 *             description: Caching instructions for preview
 *             schema:
 *               type: string
 *               example: "public, max-age=86400"
 *       302:
 *         description: Redirect to original file (for images without separate preview)
 *         headers:
 *           Location:
 *             description: URL of the original file
 *             schema:
 *               type: string
 *               example: "/api/media/123"
 *       400:
 *         description: Invalid file ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid file ID"
 *       401:
 *         description: Unauthorized - missing or invalid authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *       404:
 *         description: File not found or preview not available
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   examples:
 *                     not_found:
 *                       value: "File not found"
 *                     no_preview:
 *                       value: "Preview not available"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid file ID' }, { status: 400 });
    }

    const token = request.cookies.get('auth')?.value;
    const secret = process.env.AUTH_SECRET || 'dev-secret';
    const payload = await verifyJwtEdge(token, secret);

    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = payload.userId as number;

    const file = await prisma.s_MEDIA_STORAGE.findFirst({
      where: {
        id: id,
        user_id: userId
      }
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const hasPreview = await MediaPreviewService.hasPreview(file.filename);

    if (hasPreview) {
      const previewPath = MediaPreviewService.getPreviewPath(file.filename);
      const previewBuffer = await readFile(previewPath);

      return new NextResponse(new Uint8Array(previewBuffer), {
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=86400'
        }
      });
    } else {
      if (file.mime_type.startsWith('image/')) {
        return NextResponse.redirect(new URL(`/api/media/${id}`, request.url));
      }

      return NextResponse.json({ error: 'Preview not available' }, { status: 404 });
    }

  } catch (error) {
    console.error('Preview error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
