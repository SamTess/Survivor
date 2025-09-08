import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '../../../application/services/users/UserService';
import { UserRepositoryPrisma } from '../../../infrastructure/persistence/prisma/UserRepositoryPrisma';

const userRepository = new UserRepositoryPrisma();
const userService = new UserService(userRepository);

/**
 * @api {get} /users Get All Users
 * @apiName GetUsers
 * @apiGroup Users
 * @apiVersion 0.1.0
 * @apiDescription Retrieve all users with optional filtering and pagination
 *
 * @apiQuery {Number} [page=1] Page number for pagination
 * @apiQuery {Number} [limit=10] Number of items per page
 * @apiQuery {String} [role] Filter by user role
 * @apiQuery {String} [search] Search term for user name or email
 * @apiQuery {Boolean} [founders] Get only founders (true/false)
 * @apiQuery {Boolean} [investors] Get only investors (true/false)
 *
 * @apiSuccess {Boolean} success Request success status
 * @apiSuccess {Object[]} data Array of user objects
 * @apiSuccess {Number} data.id User ID
 * @apiSuccess {String} data.name User full name
 * @apiSuccess {String} data.email User email
 * @apiSuccess {String} data.role User role
 * @apiSuccess {String} data.status User status
 * @apiSuccess {String} data.avatar Avatar URL
 * @apiSuccess {String} data.createdAt Creation timestamp
 * @apiSuccess {String} data.lastLoginAt Last login timestamp
 * @apiSuccess {Object} [pagination] Pagination information (when using page/limit)
 * @apiSuccess {Number} pagination.page Current page number
 * @apiSuccess {Number} pagination.limit Items per page
 * @apiSuccess {Number} pagination.total Total number of users
 * @apiSuccess {Number} pagination.totalPages Total number of pages
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "data": [
 *         {
 *           "id": 1,
 *           "name": "John Doe",
 *           "email": "john@example.com",
 *           "role": "ENTREPRENEUR",
 *           "status": "ACTIVE",
 *           "avatar": "https://example.com/avatar.jpg",
 *           "createdAt": "2024-01-01T00:00:00.000Z",
 *           "lastLoginAt": "2024-01-15T09:30:00.000Z"
 *         }
 *       ],
 *       "pagination": {
 *         "page": 1,
 *         "limit": 10,
 *         "total": 25,
 *         "totalPages": 3
 *       }
 *     }
 *
 * @apiError (Error 500) {Boolean} success False
 * @apiError (Error 500) {String} error Error message
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "success": false,
 *       "error": "Failed to fetch users"
 *     }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    const founders = searchParams.get('founders') === 'true';
    const investors = searchParams.get('investors') === 'true';

    if (search) {
      const users = await userService.searchUsers(search);
      return NextResponse.json({ success: true, data: users });
    }

    if (founders) {
      const users = await userService.getFounders();
      return NextResponse.json({ success: true, data: users });
    }

    if (investors) {
      const users = await userService.getInvestors();
      return NextResponse.json({ success: true, data: users });
    }

    if (role) {
      const users = await userService.getUsersByRole(role);
      return NextResponse.json({ success: true, data: users });
    }

    if (page > 1 || limit !== 10) {
      const result = await userService.getUsersPaginated(page, limit);
      return NextResponse.json({
        success: true,
        data: result.users,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit)
        }
      });
    }

    const users = await userService.getAllUsers();
    return NextResponse.json({ success: true, data: users });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch users'
      },
      { status: 500 }
    );
  }
}

/**
 * @api {post} /users Create New User
 * @apiName CreateUser
 * @apiGroup Users
 * @apiVersion 0.1.0
 * @apiDescription Create a new user account
 *
 * @apiParam {String} name User full name
 * @apiParam {String} email User email address
 * @apiParam {String} password User password
 * @apiParam {String} [role=USER] User role (USER, ENTREPRENEUR, INVESTOR, ADMIN)
 * @apiParam {String} [avatar] Avatar image URL
 * @apiParam {String} [bio] User biography
 * @apiParam {String} [company] Company name
 * @apiParam {String} [position] Job position
 * @apiParam {String} [linkedin] LinkedIn profile URL
 * @apiParam {String} [twitter] Twitter profile URL
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "name": "Jane Smith",
 *       "email": "jane@startup.com",
 *       "password": "securePassword123",
 *       "role": "ENTREPRENEUR",
 *       "bio": "Experienced entrepreneur in tech industry",
 *       "company": "Tech Startup Inc.",
 *       "position": "CEO & Founder",
 *       "linkedin": "https://linkedin.com/in/janesmith"
 *     }
 *
 * @apiSuccess {Boolean} success Operation success status
 * @apiSuccess {Object} data Created user object
 * @apiSuccess {Number} data.id User ID
 * @apiSuccess {String} data.name User full name
 * @apiSuccess {String} data.email User email
 * @apiSuccess {String} data.role User role
 * @apiSuccess {String} data.status User status
 * @apiSuccess {String} data.createdAt Creation timestamp
 * @apiSuccess {String} message Success message
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 Created
 *     {
 *       "success": true,
 *       "data": {
 *         "id": 151,
 *         "name": "Jane Smith",
 *         "email": "jane@startup.com",
 *         "role": "ENTREPRENEUR",
 *         "status": "ACTIVE",
 *         "createdAt": "2024-01-15T16:00:00.000Z"
 *       },
 *       "message": "User created successfully"
 *     }
 *
 * @apiError (Error 400) {Boolean} success False
 * @apiError (Error 400) {String} error Validation error message
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "success": false,
 *       "error": "Email already exists"
 *     }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const user = await userService.createUser(body);

    return NextResponse.json({
      success: true,
      data: user,
      message: 'User created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create user'
      },
      { status: 400 }
    );
  }
}
