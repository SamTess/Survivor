import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import prisma from '@/infrastructure/persistence/prisma/client';
import { detectMime } from '@/utils/image';
import { canEditUserProfile } from '../../../auth-utils';

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
