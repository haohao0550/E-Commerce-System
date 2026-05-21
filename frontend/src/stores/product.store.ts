import { create } from 'zustand';
import { apiClient } from '@/services/api-client';
import { getApiErrorMessage } from '@/utils/api-error';
import type { Product, ProductVariant } from '@/features/products/types/product';
import type { GetProductsParams, ProductsListData, CreateProductPayload, UpdateProductPayload } from '@/types/product';

interface ProductPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ProductStore {
  // List State
  products: Product[];
  pagination: ProductPagination | null;
  
  // Detail State
  productDetail: Product | null;
  
  // Loading & Error
  listLoading: boolean;
  detailLoading: boolean;
  error: string | null;

  // Actions - List
  fetchProducts: (params?: GetProductsParams) => Promise<void>;
  
  // Actions - Detail
  fetchProductDetail: (id: string) => Promise<void>;
  fetchProductBySlug: (slug: string) => Promise<void>;
  
  // Actions - Create/Update/Delete
  createProduct: (data: CreateProductPayload) => Promise<Product>;
  updateProduct: (id: string, data: UpdateProductPayload) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  restoreProduct: (id: string) => Promise<void>;
  
  // Helper Actions
  clearError: () => void;
  clearProductDetail: () => void;
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

export const useProductStore = create<ProductStore>((set) => ({
  // Initial State
  products: [],
  pagination: null,
  productDetail: null,
  listLoading: false,
  detailLoading: false,
  error: null,

  // Fetch Products List
  fetchProducts: async (params?: GetProductsParams) => {
    set({ listLoading: true, error: null });
    try {
      const response = await apiClient<Product[]>(
        `/products${buildQuery(params)}`,
        { method: 'GET', auth: false }
      );
      set({
        products: response.data,
        pagination: (response as any).pagination || null,
        listLoading: false,
      });
    } catch (error) {
      const message = getApiErrorMessage(error);
      set({ error: message, listLoading: false });
      throw error;
    }
  },

  // Fetch Product Detail by ID
  fetchProductDetail: async (id: string) => {
    set({ detailLoading: true, error: null });
    try {
      const response = await apiClient<Product>(
        `/products/${id}`,
        { method: 'GET', auth: false }
      );
      set({ productDetail: response.data, detailLoading: false });
    } catch (error) {
      const message = getApiErrorMessage(error);
      set({ error: message, detailLoading: false });
      throw error;
    }
  },

  // Fetch Product Detail by Slug
  fetchProductBySlug: async (slug: string) => {
    set({ detailLoading: true, error: null });
    try {
      const response = await apiClient<Product>(
        `/products/${slug}`,
        { method: 'GET', auth: false }
      );
      set({ productDetail: response.data, detailLoading: false });
    } catch (error) {
      const message = getApiErrorMessage(error);
      set({ error: message, detailLoading: false });
      throw error;
    }
  },

  // Create Product
  createProduct: async (data: CreateProductPayload) => {
    set({ listLoading: true, error: null });
    try {
      const response = await apiClient<Product>(
        '/products',
        { method: 'POST', body: data, auth: true }
      );
      set((state) => ({
        products: [response.data, ...state.products],
        listLoading: false,
      }));
      return response.data;
    } catch (error) {
      const message = getApiErrorMessage(error);
      set({ error: message, listLoading: false });
      throw error;
    }
  },

  // Update Product
  updateProduct: async (id: string, data: UpdateProductPayload) => {
    set({ listLoading: true, error: null });
    try {
      const response = await apiClient<Product>(
        `/products/${id}`,
        { method: 'PATCH', body: data, auth: true }
      );
      set((state) => ({
        products: state.products.map((p) => (p.id === id ? response.data : p)),
        productDetail:
          state.productDetail?.id === id ? response.data : state.productDetail,
        listLoading: false,
      }));
      return response.data;
    } catch (error) {
      const message = getApiErrorMessage(error);
      set({ error: message, listLoading: false });
      throw error;
    }
  },

  // Delete Product
  deleteProduct: async (id: string) => {
    set({ listLoading: true, error: null });
    try {
      await apiClient<Product>(
        `/products/${id}`,
        { method: 'DELETE', auth: true }
      );
      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
        productDetail:
          state.productDetail?.id === id ? null : state.productDetail,
        listLoading: false,
      }));
    } catch (error) {
      const message = getApiErrorMessage(error);
      set({ error: message, listLoading: false });
      throw error;
    }
  },

  // Restore Product
  restoreProduct: async (id: string) => {
    set({ listLoading: true, error: null });
    try {
      const response = await apiClient<Product>(
        `/products/${id}/restore`,
        { method: 'PATCH', auth: true }
      );
      set((state) => ({
        products: state.products.map((p) => (p.id === id ? response.data : p)),
        productDetail:
          state.productDetail?.id === id ? response.data : state.productDetail,
        listLoading: false,
      }));
    } catch (error) {
      const message = getApiErrorMessage(error);
      set({ error: message, listLoading: false });
      throw error;
    }
  },

  // Helper Actions
  clearError: () => {
    set({ error: null });
  },

  clearProductDetail: () => {
    set({ productDetail: null });
  },
}));
