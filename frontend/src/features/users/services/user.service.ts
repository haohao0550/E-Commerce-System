import useApiStore from '@/store/apiStore';
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
    const { callApi } = useApiStore.getState();
    const response = await callApi<{ user: User }>('/users/me');
    return response.data.user;
  },

  async updateProfile(payload: UpdateProfilePayload) {
    const { callApi } = useApiStore.getState();
    const response = await callApi<{ user: User }>('/users/me', { method: 'PATCH', body: payload });
    return response.data.user;
  },

  async changePassword(payload: ChangePasswordPayload) {
    const { callApi } = useApiStore.getState();
    await callApi<Record<string, never>>('/users/me/change-password', { method: 'PATCH', body: payload });
  },

  async deleteAccount() {
    const { callApi } = useApiStore.getState();
    await callApi<Record<string, never>>('/users/me', { method: 'DELETE' });
  },

  async getUsers(params?: GetUsersParams) {
    const { callApi } = useApiStore.getState();
    const response = await callApi<UsersListData>(`/admin/users${buildQuery(params)}`);
    return response.data;
  },

  async updateUserRole(id: string, role: UserRole) {
    const { callApi } = useApiStore.getState();
    const response = await callApi<{ user: User }>(`/admin/users/${id}/role`, { method: 'PATCH', body: { role } });
    return response.data.user;
  },

  async deleteUser(id: string) {
    const { callApi } = useApiStore.getState();
    const response = await callApi<{ user: User }>(`/admin/users/${id}`, { method: 'DELETE' });
    return response.data.user;
  },

  async restoreUser(id: string) {
    const { callApi } = useApiStore.getState();
    const response = await callApi<{ user: User }>(`/admin/users/${id}/restore`, { method: 'PATCH' });
    return response.data.user;
  },

  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);

    const { callApi } = useApiStore.getState();
    const response = await callApi<{ image: string }>('/upload/avatar', { method: 'POST', body: formData });
    return response.data.image;
  },
};

