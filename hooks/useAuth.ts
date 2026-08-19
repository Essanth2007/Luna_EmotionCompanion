'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth';
import {
  saveAuth, clearAuth, getStoredToken, getStoredUser,
  hasSeenWelcome, markWelcomeSeen,
} from '@/store/auth';
import type { User } from '@/types';

export function useAuth() {
  const router = useRouter();
  const [user, setUser]             = useState<User | null>(getStoredUser());
  const [token, setToken]           = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading]   = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const isAuthenticated = !!token;

  // ── Login ──────────────────────────────────────────────────────────────────

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login({ email, password });
      if (response.data) {
        const { token: t, user: u } = response.data;
        // Persist to localStorage
        saveAuth(t, u as User);
        // Also set cookie so middleware can read it
        document.cookie = `luna_auth_token=${t}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
        setToken(t);
        setUser(u as User);
        // Decide route: welcome if first time, dashboard otherwise
        if (!hasSeenWelcome()) {
          router.push('/welcome');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError(response.error ?? 'Login failed');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // ── Register ───────────────────────────────────────────────────────────────

  const register = useCallback(async (name: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.register({ name, email, password });
      if (response.data) {
        const { token: t, user: u } = response.data;
        saveAuth(t, u as User);
        document.cookie = `luna_auth_token=${t}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
        setToken(t);
        setUser(u as User);
        // New users always see the welcome screen
        router.push('/welcome');
      } else {
        setError(response.error ?? 'Registration failed');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // ── Logout ─────────────────────────────────────────────────────────────────

  const logout = useCallback(async () => {
    await authService.logout();
    clearAuth();
    // Remove cookie
    document.cookie = 'luna_auth_token=; path=/; max-age=0';
    setToken(null);
    setUser(null);
    router.push('/login');
  }, [router]);

  // ── Welcome ────────────────────────────────────────────────────────────────

  const completeWelcome = useCallback(() => {
    markWelcomeSeen();
    router.push('/dashboard');
  }, [router]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    completeWelcome,
    hasSeenWelcome,
  };
}
