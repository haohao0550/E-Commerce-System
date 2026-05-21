import useApiStore from '@/store/apiStore';

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
    const { callApi } = useApiStore.getState();
    const response = await callApi<{ data: UserAddress[] }>('/addresses');
    return response.data.data;
  },

  async createAddress(payload: CreateAddressPayload) {
    const { callApi } = useApiStore.getState();
    const response = await callApi<{ data: UserAddress }>('/addresses', { method: 'POST', body: payload });
    return response.data.data;
  },

  async updateAddress(id: string, payload: Partial<CreateAddressPayload>) {
    const { callApi } = useApiStore.getState();
    const response = await callApi<{ data: UserAddress }>(`/addresses/${id}`, { method: 'PATCH', body: payload });
    return response.data.data;
  },

  async deleteAddress(id: string) {
    const { callApi } = useApiStore.getState();
    await callApi<Record<string, never>>(`/addresses/${id}`, { method: 'DELETE' });
  },

  async setDefaultAddress(id: string) {
    const { callApi } = useApiStore.getState();
    const response = await callApi<{ data: UserAddress }>(`/addresses/${id}/default`, { method: 'PATCH', body: { isDefault: true } });
    return response.data.data;
  },
};
