"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';

export type UserRole = 'USER' | 'ADMIN' | 'MODERATOR' | 'GUEST';

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  permissions?: string[];
}

interface AuthContextValue {
  user: SessionUser | null;
  loading: boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  hasPermission: (perm: string | string[]) => boolean;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchMe(): Promise<SessionUser | null> {
  try {
    const res = await fetch('/api/auth/me', { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const me = await fetchMe();
    setUser(me);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function hasRole(role: UserRole | UserRole[]): boolean {
    if (!user) return false;
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(user.role);
  }

  function hasPermission(perm: string | string[]): boolean {
    if (!user?.permissions) return false;
    const perms = Array.isArray(perm) ? perm : [perm];
    return perms.every(p => user.permissions!.includes(p));
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    window.location.href = '/login';
  }

  async function refresh() { await load(); }

  const value: AuthContextValue = { user, loading, hasRole, hasPermission, logout, refresh };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
