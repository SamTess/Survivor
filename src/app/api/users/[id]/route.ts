import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '../../../../application/services/users/UserService';
import { UserRepositoryPrisma } from '../../../../infrastructure/persistence/prisma/UserRepositoryPrisma';
import { getCurrentUser, canEditUserProfile } from '../../auth-utils';

const userRepository = new UserRepositoryPrisma();
const userService = new UserService(userRepository);

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user by ID
 *     description: Retrieve a specific user by their ID
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User unique ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: "john@example.com"
 *                     role:
 *                       type: string
 *                       enum: [USER, ENTREPRENEUR, INVESTOR, ADMIN]
 *                       example: "ENTREPRENEUR"
 *                     status:
 *                       type: string
 *                       enum: [ACTIVE, INACTIVE, SUSPENDED]
 *                       example: "ACTIVE"
 *                     avatar:
 *                       type: string
 *                       format: uri
 *                       example: "https://example.com/avatar.jpg"
 *                     bio:
 *                       type: string
 *                       example: "Experienced entrepreneur in tech industry"
 *                     company:
 *                       type: string
 *                       example: "Tech Startup Inc."
 *                     position:
 *                       type: string
 *                       example: "CEO & Founder"
 *                     linkedin:
 *                       type: string
 *                       format: uri
 *                       example: "https://linkedin.com/in/johndoe"
 *                     twitter:
 *                       type: string
 *                       format: uri
 *                       example: "https://twitter.com/johndoe"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-01T00:00:00.000Z"
 *                     lastLoginAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T09:30:00.000Z"
 *             example:
 *               success: true
 *               data:
 *                 id: 1
 *                 name: "John Doe"
 *                 email: "john@example.com"
 *                 role: "ENTREPRENEUR"
 *                 status: "ACTIVE"
 *                 avatar: "https://example.com/avatar.jpg"
 *                 bio: "Experienced entrepreneur in tech industry"
 *                 company: "Tech Startup Inc."
 *                 position: "CEO & Founder"
 *                 linkedin: "https://linkedin.com/in/johndoe"
 *                 twitter: "https://twitter.com/johndoe"
 *                 createdAt: "2024-01-01T00:00:00.000Z"
 *                 lastLoginAt: "2024-01-15T09:30:00.000Z"
 *       400:
 *         description: Bad request - Invalid user ID
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
 *                   example: "Invalid user ID"
 *       404:
 *         description: User not found
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
 *                   example: "User not found"
 *       500:
 *         description: Internal server error
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
 *                   example: "Failed to fetch user"
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await userService.getUserById(id);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch user'
      },
      { status: 500 }
    );
  }
}

/**
 * @openapi
 * /api/users/{id}:
 *   put:
 *     tags:
 *       - Users
 *     summary: Update user
 *     description: Update an existing user's information
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User unique ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Smith"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               role:
 *                 type: string
 *                 enum: [USER, ENTREPRENEUR, INVESTOR, ADMIN]
 *                 example: "ENTREPRENEUR"
 *               avatar:
 *                 type: string
 *                 format: uri
 *                 example: "https://example.com/avatar.jpg"
 *               bio:
 *                 type: string
 *                 example: "Senior entrepreneur with 15+ years experience"
 *               company:
 *                 type: string
 *                 example: "Tech Startup Inc."
 *               position:
 *                 type: string
 *                 example: "CTO & Co-Founder"
 *               linkedin:
 *                 type: string
 *                 format: uri
 *                 example: "https://linkedin.com/in/johnsmith"
 *               twitter:
 *                 type: string
 *                 format: uri
 *                 example: "https://twitter.com/johnsmith"
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, SUSPENDED]
 *                 example: "ACTIVE"
 *           example:
 *             name: "John Smith"
 *             bio: "Senior entrepreneur with 15+ years experience"
 *             position: "CTO & Co-Founder"
 *             linkedin: "https://linkedin.com/in/johnsmith"
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "John Smith"
 *                     email:
 *                       type: string
 *                       example: "john@example.com"
 *                     role:
 *                       type: string
 *                       example: "ENTREPRENEUR"
 *                     bio:
 *                       type: string
 *                       example: "Senior entrepreneur with 15+ years experience"
 *                     position:
 *                       type: string
 *                       example: "CTO & Co-Founder"
 *                     linkedin:
 *                       type: string
 *                       example: "https://linkedin.com/in/johnsmith"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T14:30:00.000Z"
 *                 message:
 *                   type: string
 *                   example: "User updated successfully"
 *             example:
 *               success: true
 *               data:
 *                 id: 1
 *                 name: "John Smith"
 *                 email: "john@example.com"
 *                 role: "ENTREPRENEUR"
 *                 bio: "Senior entrepreneur with 15+ years experience"
 *                 position: "CTO & Co-Founder"
 *                 linkedin: "https://linkedin.com/in/johnsmith"
 *                 updatedAt: "2024-01-15T14:30:00.000Z"
 *               message: "User updated successfully"
 *       400:
 *         description: Bad request - Invalid user ID or validation error
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
 *                   example: "Email already exists"
 *       404:
 *         description: User not found or update failed
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
 *                   example: "User not found or update failed"
 *       500:
 *         description: Internal server error
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
 *                   example: "Failed to update user"
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const canEdit = await canEditUserProfile(request, id);
    if (!canEdit) {
      return NextResponse.json(
        { success: false, error: 'Authentication required or insufficient permissions' },
        { status: 403 }
      );
    }

    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const isOwnProfile = currentUser.id === id;
    const isAdmin = currentUser.role === 'admin';

    if (isOwnProfile && body.role === 'admin' && currentUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'You cannot grant yourself admin privileges' },
        { status: 403 }
      );
    }

    if (!isOwnProfile && body.role === 'admin' && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Only administrators can grant admin privileges' },
        { status: 403 }
      );
    }

    const user = await userService.updateUser(id, body);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found or update failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update user'
      },
      { status: 400 }
    );
  }
}

/**
 * @openapi
 * /api/users/{id}:
 *   delete:
 *     tags:
 *       - Users
 *     summary: Delete user
 *     description: Delete a user account permanently
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User unique ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User deleted successfully"
 *             example:
 *               success: true
 *               message: "User deleted successfully"
 *       400:
 *         description: Bad request - Invalid user ID
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
 *                   example: "Invalid user ID"
 *       404:
 *         description: User not found or deletion failed
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
 *                   example: "User not found or deletion failed"
 *       500:
 *         description: Internal server error
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
 *                   example: "Failed to delete user"
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const deleted = await userService.deleteUser(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'User not found or deletion failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete user'
      },
      { status: 500 }
    );
  }
}
