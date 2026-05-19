import { apiClient } from '@/services/api-client';
import type { Product } from '@/features/products/types/product';

export interface GetProductsParams {
  keyword?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export interface ProductsListData {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

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

export const productService = {
  async getProducts(params?: GetProductsParams) {
    const response = await apiClient<Product[]>(`/products${buildQuery(params)}`, { auth: false });
    return {
      products: response.data,
      pagination: (response as any).pagination,
    };
  },

  async getProductById(id: string) {
    const response = await apiClient<Product>(`/products/${id}`, { auth: false });
    return response.data;
  },

  async getProductBySlug(slug: string) {
    const response = await apiClient<Product>(`/products/${slug}`, { auth: false });
    return response.data;
  },

  async createProduct(data: unknown) {
    const response = await apiClient<Product>('/products', {
      method: 'POST',
      body: data,
    });
    return response.data;
  },

  async updateProduct(id: string, data: unknown) {
    const response = await apiClient<Product>(`/products/${id}`, {
      method: 'PATCH',
      body: data,
    });
    return response.data;
  },

  async deleteProduct(id: string) {
    const response = await apiClient<Product>(`/products/${id}`, {
      method: 'DELETE',
    });
    return response.data;
  },

  async restoreProduct(id: string) {
    const response = await apiClient<Product>(`/products/${id}/restore`, {
      method: 'PATCH',
    });
    return response.data;
  },
};

