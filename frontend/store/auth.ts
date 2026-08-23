'use client';

/**
 * Minimal auth store using localStorage + a simple pub/sub pattern.
 * This keeps auth state synced across components without adding Redux/Zustand.
 * Replace with a proper store (Zustand/Jotai) when needed.
 */

import type { User } from '@/types';

const TOKEN_KEY = 'luna_auth_token';
const USER_KEY  = 'luna_auth_user';

// ─── Persistence helpers ──────────────────────────────────────────────────────

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function saveAuth(token: string, user: User): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem('luna_welcome_seen');
}

export function isAuthenticated(): boolean {
  return !!getStoredToken();
}

export function hasSeenWelcome(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('luna_welcome_seen') === 'true';
}

export function markWelcomeSeen(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('luna_welcome_seen', 'true');
}
