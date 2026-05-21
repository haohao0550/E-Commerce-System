import { create } from 'zustand';
import { apiClient } from '@/services/api-client';
import { getApiErrorMessage } from '@/utils/api-error';
import type { CartItem, CartResponse, AddToCartPayload, UpdateCartItemPayload } from '@/types/cart';

interface CartStore {
  // State
  items: CartItem[];
  isLoading: boolean;
  error: string | null;

  // Computed State
  cartCount: number;
  cartTotal: number;

  // Actions
  fetchCart: () => Promise<void>;
  addToCart: (variantId: string, quantity: number) => Promise<CartItem>;
  updateCartItem: (id: string, quantity: number) => Promise<CartItem>;
  deleteCartItem: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;

  // Helper Actions
  clearError: () => void;
}

export const useCartStore = create<CartStore>((set, get) => ({
  // Initial State
  items: [],
  isLoading: false,
  error: null,
  cartCount: 0,
  cartTotal: 0,

  // Fetch Cart
  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient<CartResponse>('/carts', {
        method: 'GET',
        auth: true,
      });
      set({
        items: response.data.items || [],
        isLoading: false,
      });
    } catch (error) {
      const message = getApiErrorMessage(error);
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  // Add to Cart
  addToCart: async (variantId: string, quantity: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient<CartItem>('/carts', {
        method: 'POST',
        body: { variantId, quantity },
        auth: true,
      });
      set((state) => ({
        items: [...state.items, response.data],
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      const message = getApiErrorMessage(error);
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  // Update Cart Item
  updateCartItem: async (id: string, quantity: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient<CartItem>(`/carts/${id}`, {
        method: 'PATCH',
        body: { quantity },
        auth: true,
      });
      set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? response.data : item
        ),
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      const message = getApiErrorMessage(error);
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  // Delete Cart Item
  deleteCartItem: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient<void>(`/carts/${id}`, {
        method: 'DELETE',
        auth: true,
      });
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      const message = getApiErrorMessage(error);
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  // Clear Cart
  clearCart: async () => {
    set({ isLoading: true, error: null });
    try {
      await apiClient<void>('/carts', {
        method: 'DELETE',
        auth: true,
      });
      set({ items: [], isLoading: false });
    } catch (error) {
      const message = getApiErrorMessage(error);
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  // Helper Actions
  clearError: () => {
    set({ error: null });
  },
}));
