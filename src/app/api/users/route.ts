import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '../../../application/services/users/UserService';
import { UserRepositoryPrisma } from '../../../infrastructure/persistence/prisma/UserRepositoryPrisma';

const userRepository = new UserRepositoryPrisma();
const userService = new UserService(userRepository);

/**
 * @openapi
 * /users:
 *   get:
 *     summary: Get All Users
 *     description: Retrieve all users with optional filtering and pagination
 *     tags:
 *       - Users
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [USER, ENTREPRENEUR, INVESTOR, ADMIN]
 *         description: Filter by user role
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for user name or email
 *       - in: query
 *         name: founders
 *         schema:
 *           type: boolean
 *         description: Get only founders
 *       - in: query
 *         name: investors
 *         schema:
 *           type: boolean
 *         description: Get only investors
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "John Doe"
 *                       email:
 *                         type: string
 *                         format: email
 *                         example: "john@example.com"
 *                       role:
 *                         type: string
 *                         example: "ENTREPRENEUR"
 *                       status:
 *                         type: string
 *                         example: "ACTIVE"
 *                       avatar:
 *                         type: string
 *                         format: uri
 *                         example: "https://example.com/avatar.jpg"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-01T00:00:00.000Z"
 *                       lastLoginAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-15T09:30:00.000Z"
 *                 pagination:
 *                   type: object
 *                   description: Pagination information (when using page/limit)
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 25
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *       500:
 *         description: Server error
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
 *                   example: "Failed to fetch users"
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
 * @openapi
 * /users:
 *   post:
 *     summary: Create New User
 *     description: Create a new user account
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: User full name
 *                 example: "Jane Smith"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *                 example: "jane@startup.com"
 *               password:
 *                 type: string
 *                 description: User password
 *                 minLength: 6
 *                 example: "securePassword123"
 *               role:
 *                 type: string
 *                 enum: [USER, ENTREPRENEUR, INVESTOR, ADMIN]
 *                 default: USER
 *                 description: User role
 *                 example: "ENTREPRENEUR"
 *               avatar:
 *                 type: string
 *                 format: uri
 *                 description: Avatar image URL
 *               bio:
 *                 type: string
 *                 description: User biography
 *                 example: "Experienced entrepreneur in tech industry"
 *               company:
 *                 type: string
 *                 description: Company name
 *                 example: "Tech Startup Inc."
 *               position:
 *                 type: string
 *                 description: Job position
 *                 example: "CEO & Founder"
 *               linkedin:
 *                 type: string
 *                 format: uri
 *                 description: LinkedIn profile URL
 *                 example: "https://linkedin.com/in/janesmith"
 *               twitter:
 *                 type: string
 *                 format: uri
 *                 description: Twitter profile URL
 *     responses:
 *       201:
 *         description: User created successfully
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
 *                       example: 151
 *                     name:
 *                       type: string
 *                       example: "Jane Smith"
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: "jane@startup.com"
 *                     role:
 *                       type: string
 *                       example: "ENTREPRENEUR"
 *                     status:
 *                       type: string
 *                       example: "ACTIVE"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T16:00:00.000Z"
 *                 message:
 *                   type: string
 *                   example: "User created successfully"
 *       400:
 *         description: Validation error
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
