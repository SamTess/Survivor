import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';
import { verifyJwtEdge } from '@/infrastructure/security/auth-edge';

interface GlobalWithPrisma { prisma?: PrismaClient }
const globalForPrisma = globalThis as unknown as GlobalWithPrisma;
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (!globalForPrisma.prisma) globalForPrisma.prisma = prisma;

/**
 * @openapi
 * /media/{id}/download:
 *   get:
 *     summary: Download Media File
 *     description: Download a media file as an attachment. Only the file owner can download files.
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
 *         description: The file ID to download
 *         example: 123
 *     responses:
 *       200:
 *         description: File download started successfully
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *         headers:
 *           Content-Type:
 *             description: MIME type of the file
 *             schema:
 *               type: string
 *               example: "image/jpeg"
 *           Content-Length:
 *             description: Size of the file in bytes
 *             schema:
 *               type: string
 *               example: "1024000"
 *           Content-Disposition:
 *             description: Forces download with original filename
 *             schema:
 *               type: string
 *               example: 'attachment; filename="company-logo.jpg"'
 *           Cache-Control:
 *             description: No caching for downloads
 *             schema:
 *               type: string
 *               example: "no-cache"
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
 *         description: File not found in database or on disk
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
 *                     disk_error:
 *                       value: "File not found on disk"
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

    const filePath = join(process.cwd(), 'uploads', 'media', file.user_id.toString(), file.filename);

    try {
      const fileBuffer = await readFile(filePath);

      return new NextResponse(new Uint8Array(fileBuffer), {
        headers: {
          'Content-Type': file.mime_type,
          'Content-Length': file.file_size.toString(),
          'Content-Disposition': `attachment; filename="${file.original_name}"`,
          'Cache-Control': 'no-cache'
        }
      });
    } catch (fsError) {
      console.error('File read error:', fsError);
      return NextResponse.json({ error: 'File not found on disk' }, { status: 404 });
    }

  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
