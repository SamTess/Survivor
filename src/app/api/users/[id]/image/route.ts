import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import prisma from '@/infrastructure/persistence/prisma/client';
import { detectMime } from '@/utils/image';
import { canEditUserProfile } from '../../../auth-utils';

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

/**
 * @openapi
 * /users/{id}/image:
 *   put:
 *     summary: Upload user profile image
 *     description: Upload a new profile image for the specified user. Only the user themselves or an admin can upload.
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
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file (JPEG, PNG, WebP, or GIF, max 5MB)
 *             required:
 *               - image
 *     responses:
 *       200:
 *         description: Profile picture updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Profile picture updated successfully" }
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: false }
 *                 error: { type: string, example: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed" }
 *       403:
 *         description: Authentication required or insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: false }
 *                 error: { type: string, example: "Authentication required or insufficient permissions" }
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: false }
 *                 error: { type: string, example: "User not found" }
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: false }
 *                 error: { type: string, example: "Failed to upload image" }
 */
export async function PUT(
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

    // Check authentication and authorization
    const canUpload = await canEditUserProfile(request, userId);
    if (!canUpload) {
      return NextResponse.json(
        { success: false, error: 'Authentication required or insufficient permissions' },
        { status: 403 }
      );
    }

    // Check if target user exists
    const targetUser = await prisma.s_USER.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 5MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Update user image in database
    await prisma.s_USER.update({
      where: { id: userId },
      data: {
        image_data: buffer,
        updated_at: new Date()
      }
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Profile picture updated successfully'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error uploading user image:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload image'
      },
      { status: 500 }
    );
  }
}

/**
 * @openapi
 * /users/{id}/image:
 *   delete:
 *     summary: Delete user profile image
 *     description: Remove the profile image for the specified user. Only the user themselves or an admin can delete.
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
 *         description: Profile picture deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Profile picture deleted successfully" }
 *       400:
 *         description: Invalid user ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: false }
 *                 error: { type: string, example: "Invalid user ID" }
 *       403:
 *         description: Authentication required or insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: false }
 *                 error: { type: string, example: "Authentication required or insufficient permissions" }
 *       404:
 *         description: User or image not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: false }
 *                 error: { type: string, example: "No profile picture to delete" }
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: false }
 *                 error: { type: string, example: "Failed to delete image" }
 */
export async function DELETE(
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

    // Check authentication and authorization
    const canDelete = await canEditUserProfile(request, userId);
    if (!canDelete) {
      return NextResponse.json(
        { success: false, error: 'Authentication required or insufficient permissions' },
        { status: 403 }
      );
    }

    // Check if target user exists
    const targetUser = await prisma.s_USER.findUnique({
      where: { id: userId },
      select: { id: true, image_data: true }
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (!targetUser.image_data) {
      return NextResponse.json(
        { success: false, error: 'No profile picture to delete' },
        { status: 404 }
      );
    }

    // Remove image from database
    await prisma.s_USER.update({
      where: { id: userId },
      data: {
        image_data: null,
        updated_at: new Date()
      }
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Profile picture deleted successfully'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting user image:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete image'
      },
      { status: 500 }
    );
  }
}
