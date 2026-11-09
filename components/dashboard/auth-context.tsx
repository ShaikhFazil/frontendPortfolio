'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/client-api';

export type AdminUser = { _id: string; name: string; email: string; role: string };

type AuthState = {
  user: AdminUser | null;
  status: 'loading' | 'authenticated' | 'anonymous';
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [status, setStatus] = useState<AuthState['status']>('loading');
  const router = useRouter();
  const pathname = usePathname();

  const refresh = useCallback(async () => {
    try {
      const data = await api.get<{ user: AdminUser }>('/auth/me');
      setUser(data.user);
      setStatus('authenticated');
    } catch (error) {
      setUser(null);
      setStatus('anonymous');
      // a network failure is not a redirect reason; only a real 401 is
      if (error instanceof ApiError && error.status === 0) return;
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Client-side guard. The backend enforces the real one on every write.
  useEffect(() => {
    if (status === 'anonymous' && pathname !== '/dashboard/login') {
      router.replace('/dashboard/login');
    }
  }, [status, pathname, router]);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await api.post<{ user: AdminUser }>('/auth/login', { email, password });
      setUser(data.user);
      setStatus('authenticated');
      router.replace('/dashboard');
    },
    [router]
  );

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
      setStatus('anonymous');
      router.replace('/dashboard/login');
    }
  }, [router]);

  const value = useMemo(
    () => ({ user, status, login, logout, refresh }),
    [user, status, login, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
