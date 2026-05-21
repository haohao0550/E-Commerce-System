import type { User } from '@/features/users/types/user';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  name?: string;
  phone?: string;
}

export interface AuthData {
  user: User;
  accessToken: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}
