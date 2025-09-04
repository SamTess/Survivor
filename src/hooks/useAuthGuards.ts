import { useAuth } from '../context/EnhancedAuthContext';
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
  requiredRoles: string | string[],
  fallbackRoute: string = '/dashboard'
) {
  const { user, hasRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
      if (!hasRole(roles as any)) {
        router.push(fallbackRoute);
      }
    }
  }, [user, hasRole, loading, requiredRoles, router, fallbackRoute]);

  return { user, loading, hasAccess: user ? hasRole(requiredRoles as any) : false };
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
  return useRoleGuard('ADMIN', fallbackRoute);
}

/**
 * Hook for moderator+ access (ADMIN or MODERATOR)
 */
export function useModeratorGuard(fallbackRoute: string = '/dashboard') {
  return useRoleGuard(['ADMIN', 'MODERATOR'], fallbackRoute);
}
