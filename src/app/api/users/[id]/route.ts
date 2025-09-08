import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '../../../../application/services/users/UserService';
import { UserRepositoryPrisma } from '../../../../infrastructure/persistence/prisma/UserRepositoryPrisma';

const userRepository = new UserRepositoryPrisma();
const userService = new UserService(userRepository);

/**
 * @api {get} /users/:id Get User by ID
 * @apiName GetUserById
 * @apiGroup Users
 * @apiVersion 0.1.0
 * @apiDescription Retrieve a specific user by their ID
 *
 * @apiParam {Number} id User unique ID
 *
 * @apiSuccess {Boolean} success Operation success status
 * @apiSuccess {Object} data User object
 * @apiSuccess {Number} data.id User ID
 * @apiSuccess {String} data.name User full name
 * @apiSuccess {String} data.email User email
 * @apiSuccess {String} data.role User role
 * @apiSuccess {String} data.status User status
 * @apiSuccess {String} data.avatar Avatar URL
 * @apiSuccess {String} data.bio User biography
 * @apiSuccess {String} data.company Company name
 * @apiSuccess {String} data.position Job position
 * @apiSuccess {String} data.linkedin LinkedIn profile URL
 * @apiSuccess {String} data.twitter Twitter profile URL
 * @apiSuccess {String} data.createdAt Creation timestamp
 * @apiSuccess {String} data.lastLoginAt Last login timestamp
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "data": {
 *         "id": 1,
 *         "name": "John Doe",
 *         "email": "john@example.com",
 *         "role": "ENTREPRENEUR",
 *         "status": "ACTIVE",
 *         "avatar": "https://example.com/avatar.jpg",
 *         "bio": "Experienced entrepreneur in tech industry",
 *         "company": "Tech Startup Inc.",
 *         "position": "CEO & Founder",
 *         "linkedin": "https://linkedin.com/in/johndoe",
 *         "twitter": "https://twitter.com/johndoe",
 *         "createdAt": "2024-01-01T00:00:00.000Z",
 *         "lastLoginAt": "2024-01-15T09:30:00.000Z"
 *       }
 *     }
 *
 * @apiError (Error 400) {Boolean} success False
 * @apiError (Error 400) {String} error Invalid user ID
 * @apiError (Error 404) {Boolean} success False
 * @apiError (Error 404) {String} error User not found
 * @apiError (Error 500) {Boolean} success False
 * @apiError (Error 500) {String} error Internal server error
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "success": false,
 *       "error": "User not found"
 *     }
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
 * @api {put} /users/:id Update User
 * @apiName UpdateUser
 * @apiGroup Users
 * @apiVersion 0.1.0
 * @apiDescription Update an existing user's information
 *
 * @apiParam {Number} id User unique ID
 * @apiParam {String} [name] User full name
 * @apiParam {String} [email] User email address
 * @apiParam {String} [role] User role (USER, ENTREPRENEUR, INVESTOR, ADMIN)
 * @apiParam {String} [avatar] Avatar image URL
 * @apiParam {String} [bio] User biography
 * @apiParam {String} [company] Company name
 * @apiParam {String} [position] Job position
 * @apiParam {String} [linkedin] LinkedIn profile URL
 * @apiParam {String} [twitter] Twitter profile URL
 * @apiParam {String} [status] User status (ACTIVE, INACTIVE, SUSPENDED)
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "name": "John Smith",
 *       "bio": "Senior entrepreneur with 15+ years experience",
 *       "position": "CTO & Co-Founder",
 *       "linkedin": "https://linkedin.com/in/johnsmith"
 *     }
 *
 * @apiSuccess {Boolean} success Operation success status
 * @apiSuccess {Object} data Updated user object
 * @apiSuccess {String} message Success message
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "data": {
 *         "id": 1,
 *         "name": "John Smith",
 *         "email": "john@example.com",
 *         "role": "ENTREPRENEUR",
 *         "bio": "Senior entrepreneur with 15+ years experience",
 *         "position": "CTO & Co-Founder",
 *         "linkedin": "https://linkedin.com/in/johnsmith",
 *         "updatedAt": "2024-01-15T14:30:00.000Z"
 *       },
 *       "message": "User updated successfully"
 *     }
 *
 * @apiError (Error 400) {Boolean} success False
 * @apiError (Error 400) {String} error Invalid user ID or validation error
 * @apiError (Error 404) {Boolean} success False
 * @apiError (Error 404) {String} error User not found or update failed
 * @apiError (Error 500) {Boolean} success False
 * @apiError (Error 500) {String} error Internal server error
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "success": false,
 *       "error": "Email already exists"
 *     }
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

    const body = await request.json();

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
 * @api {delete} /users/:id Delete User
 * @apiName DeleteUser
 * @apiGroup Users
 * @apiVersion 0.1.0
 * @apiDescription Delete a user account permanently
 *
 * @apiParam {Number} id User unique ID
 *
 * @apiSuccess {Boolean} success Operation success status
 * @apiSuccess {String} message Success message
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "message": "User deleted successfully"
 *     }
 *
 * @apiError (Error 400) {Boolean} success False
 * @apiError (Error 400) {String} error Invalid user ID
 * @apiError (Error 404) {Boolean} success False
 * @apiError (Error 404) {String} error User not found or deletion failed
 * @apiError (Error 500) {Boolean} success False
 * @apiError (Error 500) {String} error Internal server error
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "success": false,
 *       "error": "User not found or deletion failed"
 *     }
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
