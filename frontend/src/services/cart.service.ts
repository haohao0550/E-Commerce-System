import { apiClient } from './api-client';

export interface CartItem {
  id: string;
  variantId: string;
  quantity: number;
  variant: {
    id: string;
    sku: string;
    color: string | null;
    size: string | null;
    price: string | number;
    stock: number;
    product: {
      id: string;
      name: string;
      slug: string;
      images: string[];
      basePrice: string | number;
    };
  };
}

export interface CartResponse {
  items: CartItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

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
