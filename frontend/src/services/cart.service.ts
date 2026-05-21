import { apiClient } from '@/services/api-client';
import type { CartItem, CartResponse } from '@/types/cart';

/**
 * Cart Service - Handles cart API calls
 * Note: Direct apiClient usage. State management delegated to useCartStore (Zustand)
 * @deprecated Prefer using useCartStore actions directly in components
 */
class CartService {
  async getCart(): Promise<CartResponse> {
    const response = await apiClient<CartResponse>('/carts', {
      method: 'GET',
      auth: true,
    });
    return response.data;
  }

  async addToCart(variantId: string, quantity: number): Promise<CartItem> {
    const response = await apiClient<CartItem>('/carts', {
      method: 'POST',
      body: { variantId, quantity },
      auth: true,
    });
    return response.data;
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem> {
    const response = await apiClient<CartItem>(`/carts/${id}`, {
      method: 'PATCH',
      body: { quantity },
      auth: true,
    });
    return response.data;
  }

  async deleteCartItem(id: string): Promise<void> {
    await apiClient<void>(`/carts/${id}`, {
      method: 'DELETE',
      auth: true,
    });
  }

  async clearCart(): Promise<void> {
    await apiClient<void>('/carts', {
      method: 'DELETE',
      auth: true,
    });
  }
}

export const cartService = new CartService();
export type { CartItem, CartResponse } from '@/types/cart';
