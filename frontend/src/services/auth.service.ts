import { apiClient, clearAccessToken, setAccessToken } from '@/services/api-client';
import type { User } from '@/features/users/types/user';
import type { LoginPayload, RegisterPayload, AuthData } from '@/types/auth';

/**
 * Auth Service - Handles authentication API calls
 * Note: Direct apiClient usage. State management delegated to useAuthStore (Zustand)
 * @deprecated Prefer using useAuthStore actions directly in components
 */
export const authService = {
  async login(payload: LoginPayload) {
    const response = await apiClient<AuthData>('/auth/login', { method: 'POST', body: payload, auth: false });
    setAccessToken(response.data.accessToken);
    return response.data;
  },

  async register(payload: RegisterPayload) {
    const response = await apiClient<AuthData>('/auth/register', { method: 'POST', body: payload, auth: false });
    setAccessToken(response.data.accessToken);
    return response.data;
  },

  async logout() {
    await apiClient<Record<string, never>>('/auth/logout', { method: 'POST' });
    clearAccessToken();
  },
};

export type { LoginPayload, RegisterPayload, AuthData };

