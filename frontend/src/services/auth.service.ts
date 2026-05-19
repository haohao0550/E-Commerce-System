import { apiClient, clearAccessToken, setAccessToken } from '@/services/api-client';
import type { User } from '@/features/users/types/user';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  name?: string;
  phone?: string;
}

interface AuthData {
  user: User;
  accessToken: string;
}

export const authService = {
  async login(payload: LoginPayload) {
    const response = await apiClient<AuthData>('/auth/login', {
      method: 'POST',
      body: payload,
      auth: false,
    });
    setAccessToken(response.data.accessToken);
    return response.data;
  },

  async register(payload: RegisterPayload) {
    const response = await apiClient<AuthData>('/auth/register', {
      method: 'POST',
      body: payload,
      auth: false,
    });
    setAccessToken(response.data.accessToken);
    return response.data;
  },

  async logout() {
    await apiClient<Record<string, never>>('/auth/logout', {
      method: 'POST',
    });
    clearAccessToken();
  },
};

