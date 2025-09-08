import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '../../../application/services/users/UserService';
import { UserRepositoryPrisma } from '../../../infrastructure/persistence/prisma/UserRepositoryPrisma';

const userRepository = new UserRepositoryPrisma();
const userService = new UserService(userRepository);

/**
 * @api {get} /users Get Users
 * @apiName GetUsers
 * @apiGroup Users
 * @apiVersion 0.1.0
 * @apiDescription Retrieve a list of users with optional filtering and pagination
 * 
 * @apiParam {Number} [page=1] Page number for pagination
 * @apiParam {Number} [limit=10] Number of items per page
 * @apiParam {String} [role] Filter by user role
 * @apiParam {String} [search] Search term for user name or email
 * @apiParam {Boolean} [founders] Get only founders (true/false)
 * @apiParam {Boolean} [investors] Get only investors (true/false)
 * 
 * @apiSuccess {Boolean} success Request success status
 * @apiSuccess {Object[]} data Array of user objects
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
 *           "role": "founder"
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
 * @apiError (Error 500) {Boolean} success false
 * @apiError (Error 500) {String} error Error message
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
