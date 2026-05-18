import { apiClient } from '@/services/api-client';
import type { Category } from '@/features/categories/types/category';

export const categoryService = {
  async getCategories() {
    const response = await apiClient<Category[]>('/categories', { auth: false });
    return response.data;
  },

  async getCategoryById(id: string) {
    const response = await apiClient<Category>(`/categories/${id}`, { auth: false });
    return response.data;
  },

  async getCategoryBySlug(slug: string) {
    const response = await apiClient<Category>(`/categories/slug/${slug}`, { auth: false });
    return response.data;
  },

  async createCategory(name: string) {
    const response = await apiClient<Category>('/categories', {
      method: 'POST',
      body: { name },
    });
    return response.data;
  },

  async updateCategory(id: string, name: string) {
    const response = await apiClient<Category>(`/categories/${id}`, {
      method: 'PATCH',
      body: { name },
    });
    return response.data;
  },

  async deleteCategory(id: string) {
    const response = await apiClient<Category>(`/categories/${id}`, {
      method: 'DELETE',
    });
    return response.data;
  },
};

