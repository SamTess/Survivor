import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/domain/interfaces';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Hook that redirects to login if user is not authenticated
 */
export function useAuthRedirect(redirectTo: string = '/login') {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, loading, router, redirectTo]);

  return { isAuthenticated, loading };
}

/**
 * Hook that checks if user has required roles and redirects if not
 */
export function useRoleGuard(
  requiredRoles: UserRole | UserRole[],
  fallbackRoute: string = '/dashboard'
) {
  const { user, hasRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (!hasRole(requiredRoles)) {
        router.push(fallbackRoute);
      }
    }
  }, [user, hasRole, loading, requiredRoles, router, fallbackRoute]);

  return { user, loading, hasAccess: user ? hasRole(requiredRoles) : false };
}

/**
 * Hook that checks if user has required permissions
 */
export function usePermissionGuard(
  requiredPermissions: string | string[],
  fallbackRoute: string = '/dashboard'
) {
  const { user, hasPermission, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (!hasPermission(requiredPermissions)) {
        router.push(fallbackRoute);
      }
    }
  }, [user, hasPermission, loading, requiredPermissions, router, fallbackRoute]);

  return { user, loading, hasAccess: user ? hasPermission(requiredPermissions) : false };
}

/**
 * Hook for admin-only access
 */
export function useAdminGuard(fallbackRoute: string = '/dashboard') {
  return useRoleGuard('admin', fallbackRoute);
}

/**
 * Hook for moderator+ access (admin only, since moderator is not in UserRole type)
 */
export function useModeratorGuard(fallbackRoute: string = '/dashboard') {
  return useRoleGuard('admin', fallbackRoute);
}
