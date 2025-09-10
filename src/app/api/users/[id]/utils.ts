import { NextRequest } from 'next/server';
import { verifyJwt, getAuthSecret } from '../../../../infrastructure/security/auth';
import { UserService } from '../../../../application/services/users/UserService';
import { UserRepositoryPrisma } from '../../../../infrastructure/persistence/prisma/UserRepositoryPrisma';
import { User } from '../../../../domain/interfaces/User';

const userRepository = new UserRepositoryPrisma();
const userService = new UserService(userRepository);

/**
 * Extract user ID from JWT token in request cookies
 * @param request - The Next.js request object
 * @returns User ID if valid token exists, null otherwise
 */
export function getCurrentUserId(request: NextRequest): number | null {
  const token = request.cookies.get('auth')?.value;
  if (!token) return null;

  try {
    const secret = getAuthSecret();
    const payload = verifyJwt(token, secret);
    return payload?.userId ?? null;
  } catch {
    return null;
  }
}

/**
 * Get the current authenticated user's full information
 * @param request - The Next.js request object
 * @returns User object if authenticated, null otherwise
 */
export async function getCurrentUser(request: NextRequest): Promise<User | null> {
  const userId = getCurrentUserId(request);
  if (!userId) return null;

  try {
    return await userService.getUserById(userId);
  } catch {
    return null;
  }
}

/**
 * Check if the current user is an administrator
 * @param request - The Next.js request object
 * @returns true if user is admin, false otherwise
 */
export async function isCurrentUserAdmin(request: NextRequest): Promise<boolean> {
  const user = await getCurrentUser(request);
  return user?.role === 'admin';
}

/**
 * Check if the current user can edit a specific user profile
 * @param request - The Next.js request object
 * @param targetUserId - ID of the user profile to edit
 * @returns true if user can edit the profile, false otherwise
 */
export async function canEditUserProfile(request: NextRequest, targetUserId: number): Promise<boolean> {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) return false;

  const isOwnProfile = currentUser.id === targetUserId;
  const isAdmin = currentUser.role === 'admin';

  return isOwnProfile || isAdmin;
}
