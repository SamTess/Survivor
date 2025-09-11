import { NextRequest } from 'next/server';
import { verifyJwt, getAuthSecret } from '../../infrastructure/security/auth';
import { UserService } from '../../application/services/users/UserService';
import { UserRepositoryPrisma } from '../../infrastructure/persistence/prisma/UserRepositoryPrisma';
import { User } from '../../domain/interfaces/User';

const userRepository = new UserRepositoryPrisma();
const userService = new UserService(userRepository);

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

export async function getCurrentUser(request: NextRequest): Promise<User | null> {
  const userId = getCurrentUserId(request);
  if (!userId) return null;

  try {
    return await userService.getUserById(userId);
  } catch {
    return null;
  }
}

export async function isCurrentUserAdmin(request: NextRequest): Promise<boolean> {
  const user = await getCurrentUser(request);
  return user?.role === 'admin';
}

export async function canEditUserProfile(request: NextRequest, targetUserId: number): Promise<boolean> {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) return false;

  const isOwnProfile = currentUser.id === targetUserId;
  const isAdmin = currentUser.role === 'admin';

  return isOwnProfile || isAdmin;
}

export async function hasRole(request: NextRequest, role: string): Promise<boolean> {
  const user = await getCurrentUser(request);
  return user?.role === role;
}

export async function hasAnyRole(request: NextRequest, roles: string[]): Promise<boolean> {
  const user = await getCurrentUser(request);
  return user ? roles.includes(user.role) : false;
}
