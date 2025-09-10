import React from 'react';
import { useAuth } from '@/context/auth';

interface AdminOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component that only renders children if the current user is an admin
 */
export function AdminOnly({ children, fallback = null }: AdminOnlyProps) {
  const { user } = useAuth();
  
  if (user?.role !== 'admin') {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallback?: React.ReactNode;
}

/**
 * Component that only renders children if the current user has one of the allowed roles
 */
export function RoleGuard({ children, allowedRoles, fallback = null }: RoleGuardProps) {
  const { user } = useAuth();
  
  if (!user || !allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

export default AdminOnly;
