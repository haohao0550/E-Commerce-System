import { apiClient } from '@/services/api-client';
import type { Product } from '@/features/products/types/product';
import type { GetProductsParams, ProductsListData } from '@/types/product';

const buildQuery = (params: GetProductsParams = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

/**
 * Product Service - Handles product API calls
 * Note: Direct apiClient usage. State management delegated to useProductStore (Zustand)
 * @deprecated Prefer using useProductStore actions directly in components
 */
export const productService = {
  async getProducts(params?: GetProductsParams) {
    const response = await apiClient<Product[]>(`/products${buildQuery(params)}`, { auth: false });
    return {
      products: response.data,
      pagination: (response as any).pagination,
    };
  },

  async getProductById(id: string) {
    const response = await apiClient<Product>(`/products/${id}`, {
      method: 'GET',
      auth: false,
    });
    return response.data;
  },

  async getProductBySlug(slug: string) {
    const response = await apiClient<Product>(`/products/${slug}`, { auth: false });
    return response.data;
  },

  async createProduct(data: unknown) {
    const response = await apiClient<Product>('/products', { method: 'POST', body: data });
    return response.data;
  },

  async updateProduct(id: string, data: unknown) {
    const response = await apiClient<Product>(`/products/${id}`, { method: 'PATCH', body: data });
    return response.data;
  },

  async deleteProduct(id: string) {
    const response = await apiClient<Product>(`/products/${id}`, { method: 'DELETE' });
    return response.data;
  },

  async restoreProduct(id: string) {
    const response = await apiClient<Product>(`/products/${id}/restore`, { method: 'PATCH' });
    return response.data;
  },
};

export type { GetProductsParams, ProductsListData };

