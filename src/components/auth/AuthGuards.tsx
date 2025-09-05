"use client";
import React from 'react';
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/domain/interfaces";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
  requiredRoles?: UserRole[];
  requiredPermissions?: string[];
}

/**
 * Component that conditionally renders content based on authentication state
 */
export function ProtectedRoute({
  children,
  fallback = <div>Access denied</div>,
  requireAuth = true,
  requiredRoles = [],
  requiredPermissions = []
}: ProtectedRouteProps) {
  const { user, loading, hasRole, hasPermission } = useAuth();

  // Show loading state
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Check authentication requirement
  if (requireAuth && !user) {
    return <>{fallback}</>;
  }

  // Check role requirements
  if (requiredRoles.length > 0 && (!user || !hasRole(requiredRoles))) {
    return <>{fallback}</>;
  }

  // Check permission requirements
  if (requiredPermissions.length > 0 && (!user || !hasPermission(requiredPermissions))) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface RoleGuardProps {
  children: React.ReactNode;
  roles: UserRole | UserRole[];
  fallback?: React.ReactNode;
}

/**
 * Component that renders content only if user has required roles
 */
export function RoleGuard({ children, roles, fallback = null }: RoleGuardProps) {
  const { hasRole } = useAuth();

  if (!hasRole(roles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface PermissionGuardProps {
  children: React.ReactNode;
  permissions: string | string[];
  fallback?: React.ReactNode;
}

/**
 * Component that renders content only if user has required permissions
 */
export function PermissionGuard({ children, permissions, fallback = null }: PermissionGuardProps) {
  const { hasPermission } = useAuth();

  if (!hasPermission(permissions)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Component that renders content only for admins
 */
export function AdminOnly({ children, fallback = null }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  return <RoleGuard roles="admin" fallback={fallback}>{children}</RoleGuard>;
}

/**
 * Component that renders content only for moderators and admins
 */
export function ModeratorOnly({ children, fallback = null }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  return <RoleGuard roles="admin" fallback={fallback}>{children}</RoleGuard>;
}

/**
 * Component that renders content only for authenticated users
 */
export function AuthOnly({ children, fallback = null }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Component that renders content only for unauthenticated users (guests)
 */
export function GuestOnly({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
