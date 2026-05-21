import { apiClient } from '@/services/api-client';
import type { ProductVariant } from '@/features/products/types/product';
import type { CreateProductVariantPayload, UpdateProductVariantPayload, GetProductVariantsParams } from '@/types/product-variant';

const buildQuery = (params: GetProductVariantsParams = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

export const productVariantService = {
  async getVariantsByProductId(productId: string) {
    const response = await apiClient<ProductVariant[]>(`/products/${productId}/variants`, { auth: false });
    return response.data;
  },

  async getVariantById(id: string) {
    const response = await apiClient<ProductVariant>(`/variants/${id}`, { auth: false });
    return response.data;
  },

  async adminGetVariants(params?: GetProductVariantsParams) {
    const response = await apiClient<ProductVariant[]>(`/admin/variants${buildQuery(params)}`, { auth: true });
    return {
      variants: response.data,
      pagination: (response as any).pagination,
    };
  },

  async createVariant(productId: string, payload: CreateProductVariantPayload) {
    const response = await apiClient<ProductVariant>(`/admin/products/${productId}/variants`, {
      method: 'POST',
      body: payload,
      auth: true,
    });
    return response.data;
  },

  async updateVariant(id: string, payload: UpdateProductVariantPayload) {
    const response = await apiClient<ProductVariant>(`/admin/variants/${id}`, {
      method: 'PATCH',
      body: payload,
      auth: true,
    });
    return response.data;
  },

  async deleteVariant(id: string) {
    const response = await apiClient<ProductVariant>(`/admin/variants/${id}`, {
      method: 'DELETE',
      auth: true,
    });
    return response.data;
  },
};
