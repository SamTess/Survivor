import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '../../../application/services/users/UserService';
import { UserRepositoryPrisma } from '../../../infrastructure/persistence/prisma/UserRepositoryPrisma';

// Initialize dependencies
const userRepository = new UserRepositoryPrisma();
const userService = new UserService(userRepository);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    const founders = searchParams.get('founders') === 'true';
    const investors = searchParams.get('investors') === 'true';

    // Handle search query
    if (search) {
      const users = await userService.searchUsers(search);
      return NextResponse.json({ success: true, data: users });
    }

    // Handle founders filter
    if (founders) {
      const users = await userService.getFounders();
      return NextResponse.json({ success: true, data: users });
    }

    // Handle investors filter
    if (investors) {
      const users = await userService.getInvestors();
      return NextResponse.json({ success: true, data: users });
    }

    // Handle filtering by role
    if (role) {
      const users = await userService.getUsersByRole(role);
      return NextResponse.json({ success: true, data: users });
    }

    // Handle pagination
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

    // Default: get all users
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
