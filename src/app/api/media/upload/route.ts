import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyJwt } from '@/infrastructure/security/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { existsSync } from 'fs';
import { MediaPreviewService } from '@/application/services/MediaPreviewService';

interface GlobalWithPrisma { prisma?: PrismaClient }
const globalForPrisma = global as unknown as GlobalWithPrisma;
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (!globalForPrisma.prisma) globalForPrisma.prisma = prisma;

const MAX_FILE_SIZE = 100 * 1024 * 1024;
const ALLOWED_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  video: ['video/mp4', 'video/webm', 'video/avi', 'video/mov'],
  audio: ['audio/mp3', 'audio/wav', 'audio/ogg']
};

function getFileType(mimeType: string): string {
  for (const [type, mimes] of Object.entries(ALLOWED_TYPES)) {
    if (mimes.includes(mimeType)) {
      return type;
    }
  }
  return 'other';
}

function isAllowedType(mimeType: string): boolean {
  return Object.values(ALLOWED_TYPES).flat().includes(mimeType);
}

async function checkUserIsFounder(userId: number): Promise<boolean> {
  const founder = await prisma.s_FOUNDER.findFirst({
    where: { user_id: userId }
  });
  return !!founder;
}

async function getUserStorageUsage(userId: number): Promise<{ used: bigint, max: bigint }> {
  let quota = await prisma.s_USER_STORAGE_QUOTA.findUnique({
    where: { user_id: userId }
  });

  if (!quota) {
    quota = await prisma.s_USER_STORAGE_QUOTA.create({
      data: {
        user_id: userId,
        used_bytes: BigInt(0),
        max_bytes: BigInt(2147483648)
      }
    });
  }

  return { used: quota.used_bytes, max: quota.max_bytes };
}

/**
 * @openapi
 * /media/upload:
 *   post:
 *     summary: Upload Media File
 *     description: Upload a media file (image, document, video, or audio) for the authenticated founder
 *     tags:
 *       - Media
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to upload (max 100MB)
 *               description:
 *                 type: string
 *                 description: Optional description for the file
 *                 example: "Company logo for presentation"
 *               tags:
 *                 type: string
 *                 description: Optional tags for the file (comma-separated)
 *                 example: "logo,branding,presentation"
 *               isPublic:
 *                 type: boolean
 *                 description: Whether the file should be publicly accessible
 *                 default: false
 *                 example: true
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 file:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: Unique file ID
 *                       example: 123
 *                     filename:
 *                       type: string
 *                       description: Generated unique filename
 *                       example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg"
 *                     originalName:
 *                       type: string
 *                       description: Original filename from upload
 *                       example: "company-logo.jpg"
 *                     fileType:
 *                       type: string
 *                       description: Categorized file type
 *                       enum: [image, document, video, audio, other]
 *                       example: "image"
 *                     fileSize:
 *                       type: integer
 *                       description: File size in bytes
 *                       example: 1024000
 *                     filePath:
 *                       type: string
 *                       description: Relative path to access the file
 *                       example: "/uploads/media/123/a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg"
 *                     description:
 *                       type: string
 *                       nullable: true
 *                       description: File description
 *                       example: "Company logo for presentation"
 *                     tags:
 *                       type: string
 *                       nullable: true
 *                       description: File tags
 *                       example: "logo,branding,presentation"
 *                     isPublic:
 *                       type: boolean
 *                       description: Whether the file is publicly accessible
 *                       example: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: Upload timestamp
 *                       example: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: Bad request - validation errors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   examples:
 *                     no_file:
 *                       value: "No file provided"
 *                     file_too_large:
 *                       value: "File too large. Maximum size is 100MB"
 *                     invalid_type:
 *                       value: "File type not allowed"
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
 *       403:
 *         description: Forbidden - only founders can upload media
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Only founders can upload media"
 *       413:
 *         description: Storage quota exceeded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Storage quota exceeded. You have 512MB remaining"
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
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth')?.value;
    const secret = process.env.AUTH_SECRET || 'dev-secret';
    const payload = verifyJwt(token, secret);

    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = payload.userId;

    const isFounder = await checkUserIsFounder(userId);
    if (!isFounder) {
      return NextResponse.json({ error: 'Only founders can upload media' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const description = formData.get('description') as string;
    const tags = formData.get('tags') as string;
    const isPublic = formData.get('isPublic') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({
        error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`
      }, { status: 400 });
    }

    if (!isAllowedType(file.type)) {
      return NextResponse.json({
        error: 'File type not allowed'
      }, { status: 400 });
    }

    const { used, max } = await getUserStorageUsage(userId);
    if (used + BigInt(file.size) > max) {
      const remainingMB = Number((max - used) / BigInt(1024 * 1024));
      return NextResponse.json({
        error: `Storage quota exceeded. You have ${remainingMB}MB remaining`
      }, { status: 413 });
    }

    const uploadDir = join(process.cwd(), 'uploads', 'media', userId.toString());
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const fileExtension = file.name.split('.').pop() || '';
    const uniqueFilename = `${randomUUID()}.${fileExtension}`;
    const filePath = join(uploadDir, uniqueFilename);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    try {
      await MediaPreviewService.generatePreview(filePath, uniqueFilename, file.type);
    } catch (previewError) {
      console.warn('Preview generation failed:', previewError);
    }

    const mediaRecord = await prisma.s_MEDIA_STORAGE.create({
      data: {
        user_id: userId,
        filename: uniqueFilename,
        original_name: file.name,
        file_type: getFileType(file.type),
        mime_type: file.type,
        file_size: file.size,
        file_path: `/uploads/media/${userId}/${uniqueFilename}`,
        description: description || null,
        tags: tags || null,
        is_public: isPublic
      }
    });

    await prisma.s_USER_STORAGE_QUOTA.update({
      where: { user_id: userId },
      data: {
        used_bytes: used + BigInt(file.size)
      }
    });

    return NextResponse.json({
      success: true,
      file: {
        id: mediaRecord.id,
        filename: mediaRecord.filename,
        originalName: mediaRecord.original_name,
        fileType: mediaRecord.file_type,
        fileSize: mediaRecord.file_size,
        filePath: mediaRecord.file_path,
        description: mediaRecord.description,
        tags: mediaRecord.tags,
        isPublic: mediaRecord.is_public,
        createdAt: mediaRecord.created_at
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
