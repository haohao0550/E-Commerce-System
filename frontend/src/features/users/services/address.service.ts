import { apiClient } from '@/services/api-client';

export interface UserAddress {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  ward?: string | null;
  district?: string | null;
  province: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressPayload {
  fullName: string;
  phone: string;
  street: string;
  ward?: string;
  district?: string | null;
  province: string;
  isDefault?: boolean;
}

export const addressService = {
  async getAddresses() {
    const response = await apiClient<{ data: UserAddress[] }>('/addresses');
    return response.data.data;
  },

  async createAddress(payload: CreateAddressPayload) {
    const response = await apiClient<{ data: UserAddress }>('/addresses', {
      method: 'POST',
      body: payload,
    });
    return response.data.data;
  },

  async updateAddress(id: string, payload: Partial<CreateAddressPayload>) {
    const response = await apiClient<{ data: UserAddress }>(`/addresses/${id}`, {
      method: 'PATCH',
      body: payload,
    });
    return response.data.data;
  },

  async deleteAddress(id: string) {
    await apiClient<Record<string, never>>(`/addresses/${id}`, {
      method: 'DELETE',
    });
  },

  async setDefaultAddress(id: string) {
    const response = await apiClient<{ data: UserAddress }>(`/addresses/${id}/default`, {
      method: 'PATCH',
      body: { isDefault: true },
    });
    return response.data.data;
  },
};
