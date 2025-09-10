import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyJwt } from '@/infrastructure/security/auth';
import { readFile } from 'fs/promises';
import { join } from 'path';

interface GlobalWithPrisma { prisma?: PrismaClient }
const globalForPrisma = globalThis as unknown as GlobalWithPrisma;
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (!globalForPrisma.prisma) globalForPrisma.prisma = prisma;

/**
 * @openapi
 * /media/{id}:
 *   get:
 *     summary: Serve Media File
 *     description: Serve a media file by ID. Public files can be accessed without authentication, private files require owner authentication.
 *     tags:
 *       - Media
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The file ID to serve
 *         example: 123
 *     responses:
 *       200:
 *         description: File served successfully
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
 *             description: How the file should be displayed
 *             schema:
 *               type: string
 *               example: 'inline; filename="company-logo.jpg"'
 *           Cache-Control:
 *             description: Caching instructions
 *             schema:
 *               type: string
 *               example: "public, max-age=3600"
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
 *       403:
 *         description: Access denied - file is private and user is not the owner
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Access denied"
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
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const fileId = parseInt(params.id);

    if (isNaN(fileId)) {
      return NextResponse.json({ error: 'Invalid file ID' }, { status: 400 });
    }

    const file = await prisma.s_MEDIA_STORAGE.findUnique({
      where: { id: fileId },
      include: {
        user: {
          select: { id: true }
        }
      }
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    let canAccess = file.is_public;

    if (!canAccess) {
      const token = req.cookies.get('auth')?.value;
      const secret = process.env.AUTH_SECRET || 'dev-secret';
      const payload = verifyJwt(token, secret);

      if (payload && payload.userId === file.user_id) {
        canAccess = true;
      }
    }

    if (!canAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const filePath = join(process.cwd(), 'uploads', 'media', file.user_id.toString(), file.filename);

    try {
      const fileBuffer = await readFile(filePath);

      return new NextResponse(new Uint8Array(fileBuffer), {
        headers: {
          'Content-Type': file.mime_type,
          'Content-Length': file.file_size.toString(),
          'Content-Disposition': `inline; filename="${file.original_name}"`,
          'Cache-Control': 'public, max-age=3600'
        }
      });
    } catch (fsError) {
      console.error('File read error:', fsError);
      return NextResponse.json({ error: 'File not found on disk' }, { status: 404 });
    }

  } catch (error) {
    console.error('Serve file error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
