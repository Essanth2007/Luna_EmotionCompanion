// Frontend auth service — wired to the Luna backend (FastAPI + JWT).

import { api } from './api';

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface ForgotPasswordCredentials {
  email: string;
}

export interface ResetPasswordCredentials {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface BackendUser {
  id: number | string;
  name: string;
  email: string;
  created_at?: string;
}

function toAuthUser(u: BackendUser): AuthUser {
  return { id: String(u.id), name: u.name, email: u.email };
}

// Auth Service
export const authService = {
  // Login (OAuth2 password flow on the backend)
  login: async (credentials: LoginCredentials) => {
    try {
      const form = new URLSearchParams();
      form.append('username', credentials.email);
      form.append('password', credentials.password);

      const loginRes = await api.post<{ access_token: string; token_type: string }>(
        '/auth/login',
        form.toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );

      const token = loginRes.data.access_token;
      const meRes = await api.get<BackendUser>('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      return { data: { user: toAuthUser(meRes.data), token }, error: null };
    } catch (err) {
      const message =
        (err as any)?.response?.data?.detail ||
        (err as any)?.message ||
        'Login failed';
      return { data: null, error: message };
    }
  },

  // Register
  register: async (credentials: RegisterCredentials) => {
    try {
      await api.post<BackendUser>('/auth/register', {
        name: credentials.name,
        email: credentials.email,
        password: credentials.password,
      });
      // Backend register does not return a token; log in to obtain one.
      return authService.login({
        email: credentials.email,
        password: credentials.password,
      });
    } catch (err) {
      const message =
        (err as any)?.response?.data?.detail ||
        (err as any)?.message ||
        'Registration failed';
      return { data: null, error: message };
    }
  },

  // Logout (JWT is stateless; just clear client state)
  logout: async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('luna_auth_token');
    }
    return { data: null, error: null };
  },

  // Forgot Password (endpoint may not exist yet — best effort)
  forgotPassword: async (_credentials: ForgotPasswordCredentials) => {
    return { data: null, error: null };
  },

  // Reset Password
  resetPassword: async (_credentials: ResetPasswordCredentials) => {
    return { data: null, error: null };
  },

  // Get Current User from a stored token
  getCurrentUser: async (token: string) => {
    try {
      const res = await api.get<BackendUser>('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return { data: toAuthUser(res.data), error: null };
    } catch {
      return { data: null, error: 'Session expired' };
    }
  },
};
