import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyJwt } from '@/infrastructure/security/auth';

interface GlobalWithPrisma { prisma?: PrismaClient }
const globalForPrisma = globalThis as unknown as GlobalWithPrisma;
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (!globalForPrisma.prisma) globalForPrisma.prisma = prisma;

/**
 * @openapi
 * /media:
 *   get:
 *     summary: Get User Media Files
 *     description: Retrieve a paginated list of media files uploaded by the authenticated user
 *     tags:
 *       - Media
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter by file type (e.g., 'image', 'video', 'document', or 'all')
 *         example: "image"
 *       - in: query
 *         name: public
 *         required: false
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filter by public/private files
 *         example: "true"
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of files per page
 *         example: 20
 *     responses:
 *       200:
 *         description: Media files retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 files:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: File ID
 *                         example: 123
 *                       filename:
 *                         type: string
 *                         description: Stored filename
 *                         example: "1639123456789_image.jpg"
 *                       original_name:
 *                         type: string
 *                         description: Original filename when uploaded
 *                         example: "my-photo.jpg"
 *                       file_type:
 *                         type: string
 *                         description: File type category
 *                         example: "image"
 *                       mime_type:
 *                         type: string
 *                         description: MIME type of the file
 *                         example: "image/jpeg"
 *                       file_size:
 *                         type: integer
 *                         description: File size in bytes
 *                         example: 1024000
 *                       file_path:
 *                         type: string
 *                         description: Relative path to the file
 *                         example: "/uploads/media/123/1639123456789_image.jpg"
 *                       description:
 *                         type: string
 *                         nullable: true
 *                         description: File description
 *                         example: "Profile photo"
 *                       tags:
 *                         type: array
 *                         items:
 *                           type: string
 *                         description: File tags
 *                         example: ["profile", "photo"]
 *                       is_public:
 *                         type: boolean
 *                         description: Whether the file is publicly accessible
 *                         example: true
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         description: File upload timestamp
 *                         example: "2024-01-15T10:30:00.000Z"
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                         description: File last update timestamp
 *                         example: "2024-01-15T10:30:00.000Z"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       description: Current page number
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       description: Number of items per page
 *                       example: 20
 *                     total:
 *                       type: integer
 *                       description: Total number of files
 *                       example: 150
 *                     totalPages:
 *                       type: integer
 *                       description: Total number of pages
 *                       example: 8
 *                 storage:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     used:
 *                       type: integer
 *                       description: Used storage in bytes
 *                       example: 52428800
 *                     max:
 *                       type: integer
 *                       description: Maximum storage in bytes
 *                       example: 1073741824
 *                     usedMB:
 *                       type: number
 *                       description: Used storage in megabytes
 *                       example: 50.0
 *                     maxMB:
 *                       type: number
 *                       description: Maximum storage in megabytes
 *                       example: 1024.0
 *                     percentUsed:
 *                       type: number
 *                       description: Percentage of storage used
 *                       example: 4.88
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
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth')?.value;
    const secret = process.env.AUTH_SECRET || 'dev-secret';
    const payload = verifyJwt(token, secret);

    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = payload.userId;
    const { searchParams } = new URL(req.url);
    const fileType = searchParams.get('type');
    const isPublic = searchParams.get('public');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const where: { user_id: number; file_type?: string; is_public?: boolean } = { user_id: userId };
    if (fileType && fileType !== 'all') {
      where.file_type = fileType;
    }
    if (isPublic !== null) {
      where.is_public = isPublic === 'true';
    }

    const [files, total, quota] = await Promise.all([
      prisma.s_MEDIA_STORAGE.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit,
        select: {
          id: true,
          filename: true,
          original_name: true,
          file_type: true,
          mime_type: true,
          file_size: true,
          file_path: true,
          description: true,
          tags: true,
          is_public: true,
          created_at: true,
          updated_at: true
        }
      }),
      prisma.s_MEDIA_STORAGE.count({ where }),
      prisma.s_USER_STORAGE_QUOTA.findUnique({
        where: { user_id: userId }
      })
    ]);

    const storageUsage = quota ? {
      used: Number(quota.used_bytes),
      max: Number(quota.max_bytes),
      usedMB: Number(quota.used_bytes) / (1024 * 1024),
      maxMB: Number(quota.max_bytes) / (1024 * 1024),
      percentUsed: (Number(quota.used_bytes) / Number(quota.max_bytes)) * 100
    } : null;

    return NextResponse.json({
      files,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      storage: storageUsage
    });

  } catch (error) {
    console.error('List files error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * @openapi
 * /media:
 *   delete:
 *     summary: Delete User Media File
 *     description: Delete a specific media file uploaded by the authenticated user
 *     tags:
 *       - Media
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the file to delete
 *         example: "123"
 *     responses:
 *       200:
 *         description: File deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Bad request - missing file ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "File ID required"
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
 *         description: File not found or doesn't belong to user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "File not found"
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
export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get('auth')?.value;
    const secret = process.env.AUTH_SECRET || 'dev-secret';
    const payload = verifyJwt(token, secret);

    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = payload.userId;
    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get('id');

    if (!fileId) {
      return NextResponse.json({ error: 'File ID required' }, { status: 400 });
    }

    const file = await prisma.s_MEDIA_STORAGE.findFirst({
      where: {
        id: parseInt(fileId),
        user_id: userId
      }
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.join(process.cwd(), 'uploads', 'media', userId.toString(), file.filename);

    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (fsError) {
      console.error('Failed to delete file from disk:', fsError);
    }

    await prisma.$transaction([
      prisma.s_MEDIA_STORAGE.delete({
        where: { id: parseInt(fileId) }
      }),
      prisma.s_USER_STORAGE_QUOTA.update({
        where: { user_id: userId },
        data: {
          used_bytes: {
            decrement: BigInt(file.file_size)
          }
        }
      })
    ]);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete file error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
