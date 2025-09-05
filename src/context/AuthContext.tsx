"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback
} from 'react';
import { apiService, ApiResponse } from '../infrastructure/services/ApiService';
import { SessionUser, LoginCredentials, SignupData, UserRole } from '@/domain/interfaces';



export interface AuthError {
  message: string;
  requiresPasswordReset?: boolean;
  devMode?: boolean;
  resetUrl?: string;
}

export interface LoginResult {
  success: boolean;
  user?: SessionUser;
  error?: AuthError;
}

export interface SignupResult {
  success: boolean;
  user?: SessionUser;
  error?: string;
}

interface AuthContextValue {
  // State
  user: SessionUser | null;
  loading: boolean;
  error: string | null;

  // Authentication actions
  login: (credentials: LoginCredentials) => Promise<LoginResult>;
  signup: (userData: SignupData) => Promise<SignupResult>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  clearError: () => void;

  // Authorization helpers
  hasRole: (role: UserRole | UserRole[]) => boolean;
  hasPermission: (perm: string | string[]) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  hasAllPermissions: (perms: string[]) => boolean;

  // Utility getters
  isAuthenticated: boolean;
  isAdmin: boolean;
  isUser: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load current user from API
  const loadUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getCurrentUser();

      if (response.success && response.data) {
        setUser(response.data);
      } else {
        setUser(null);
        if (response.error && response.error !== 'unauthorized') {
          setError(response.error);
        }
      }
    } catch (err) {
      console.error('Failed to load user:', err);
      setUser(null);
      setError('Failed to load user session');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Listen for unauthorized events from API interceptors
  useEffect(() => {
    const handleUnauthorized = () => {
      console.log('Unauthorized event received, clearing user session');
      setUser(null);
      setError('Session expired. Please login again.');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  // Authentication actions
  const login = async (credentials: LoginCredentials): Promise<LoginResult> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.login(credentials);

      if (response.success && response.data) {
        setUser(response.data);
        return { success: true, user: response.data };
      } else {
        // Handle the case where login failed due to password reset requirement
        const errorResponse = response as ApiResponse<SessionUser> & {
          requiresPasswordReset?: boolean;
          devMode?: boolean;
          resetUrl?: string;
        }; // Type assertion for special error response properties
        return {
          success: false,
          error: {
            message: response.error || 'Login failed',
            requiresPasswordReset: errorResponse.requiresPasswordReset,
            devMode: errorResponse.devMode,
            resetUrl: errorResponse.resetUrl
          } as AuthError
        };
      }
    } catch (err) {
      console.error('Login error:', err);
      return {
        success: false,
        error: { message: 'Network error during login' }
      };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData: SignupData): Promise<SignupResult> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.signup(userData);

      if (response.success && response.data) {
        setUser(response.data);
        return { success: true, user: response.data };
      } else {
        return {
          success: false,
          error: response.error || 'Signup failed'
        };
      }
    } catch (err) {
      console.error('Signup error:', err);
      return {
        success: false,
        error: 'Network error during signup'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await apiService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setError(null);
      setLoading(false);
      // Redirect to login page
      window.location.href = '/login';
    }
  };

  const refresh = async (): Promise<void> => {
    await loadUser();
  };

  const clearError = (): void => {
    setError(null);
  };

  // Authorization helpers
  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(user.role);
  };

  const hasPermission = (perm: string | string[]): boolean => {
    if (!user?.permissions) return false;
    const perms = Array.isArray(perm) ? perm : [perm];
    return perms.every(p => user.permissions!.includes(p));
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const hasAllPermissions = (perms: string[]): boolean => {
    if (!user?.permissions) return false;
    return perms.every(p => user.permissions!.includes(p));
  };

  // Utility getters
  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const isUser = user?.role === 'user';

  const value: AuthContextValue = {
    // State
    user,
    loading,
    error,

    // Actions
    login,
    signup,
    logout,
    refresh,
    clearError,

    // Authorization helpers
    hasRole,
    hasPermission,
    hasAnyRole,
    hasAllPermissions,

    // Utility getters
    isAuthenticated,
    isAdmin,
    isUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Higher-order component for protecting routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
      return <div>Loading...</div>; // Replace with your loading component
    }

    if (!isAuthenticated) {
      // Redirect to login or show unauthorized message
      window.location.href = '/login';
      return null;
    }

    return <Component {...props} />;
  };
}

// Hook for role-based access
export function useRequireAuth(requiredRole?: UserRole | UserRole[]) {
  const auth = useAuth();

  useEffect(() => {
    if (!auth.loading && !auth.isAuthenticated) {
      window.location.href = '/login';
    }

    if (requiredRole && auth.user && !auth.hasRole(requiredRole)) {
      // Handle unauthorized access - could redirect or show error
      console.warn('Insufficient permissions');
    }
  }, [auth.loading, auth.isAuthenticated, auth.user, requiredRole, auth.hasRole]);

  return auth;
}

export default AuthContext;
