import { apiClient } from '@/services/api-client';
import type { User, UserRole } from '@/features/users/types/user';

export interface UpdateProfilePayload {
  email?: string;
  name?: string | null;
  phone?: string | null;
  avatar?: string | null;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  isDeleted?: boolean;
}

export interface UsersListData {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const buildQuery = (params: GetUsersParams = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

export const userService = {
  async getProfile() {
    const response = await apiClient<{ user: User }>('/users/me');
    return response.data.user;
  },

  async updateProfile(payload: UpdateProfilePayload) {
    const response = await apiClient<{ user: User }>('/users/me', {
      method: 'PATCH',
      body: payload,
    });
    return response.data.user;
  },

  async changePassword(payload: ChangePasswordPayload) {
    await apiClient<Record<string, never>>('/users/me/change-password', {
      method: 'PATCH',
      body: payload,
    });
  },

  async deleteAccount() {
    await apiClient<Record<string, never>>('/users/me', {
      method: 'DELETE',
    });
  },

  async getUsers(params?: GetUsersParams) {
    const response = await apiClient<UsersListData>(`/admin/users${buildQuery(params)}`);
    return response.data;
  },

  async updateUserRole(id: string, role: UserRole) {
    const response = await apiClient<{ user: User }>(`/admin/users/${id}/role`, {
      method: 'PATCH',
      body: { role },
    });
    return response.data.user;
  },

  async deleteUser(id: string) {
    const response = await apiClient<{ user: User }>(`/admin/users/${id}`, {
      method: 'DELETE',
    });
    return response.data.user;
  },

  async restoreUser(id: string) {
    const response = await apiClient<{ user: User }>(`/admin/users/${id}/restore`, {
      method: 'PATCH',
    });
    return response.data.user;
  },

  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await apiClient<{ image: string }>('/upload/avatar', {
      method: 'POST',
      body: formData,
    });
    return response.data.image;
  },
};

