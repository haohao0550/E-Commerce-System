import { apiClient } from '@/services/api-client';

export interface ShippingAddressInput {
  fullName: string;
  phone: string;
  street: string;
  ward?: string;
  district?: string;
  province: string;
}

export interface CreateOrderItemInput {
  variantId: string;
  quantity: number;
}

export interface CreateOrderInput {
  paymentMethod?: 'COD' | 'VNPAY' | 'MOMO';
  shippingAddress: ShippingAddressInput;
  couponId?: string;
  note?: string;
  items: CreateOrderItemInput[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  variantId: string;
  productName: string;
  variantInfo: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
  paymentMethod: 'COD' | 'VNPAY' | 'MOMO';
  paymentStatus: 'UNPAID' | 'PAID' | 'FAILED' | 'REFUNDED';
  totalPrice: number;
  shippingFee: number;
  discountAmount: number;
  finalPrice: number;
  shippingAddress: ShippingAddressInput;
  couponId?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
}

export interface OrdersQuery {
  status?: string;
  paymentStatus?: string;
  page?: number;
  limit?: number;
}

class OrderService {
  async createOrder(data: CreateOrderInput): Promise<Order> {
    const response = await apiClient<Order>('/orders', {
      method: 'POST',
      body: data,
      auth: true,
    });
    return response.data;
  }

  async getUserOrders(query?: OrdersQuery): Promise<{ orders: Order[]; total: number }> {
    const params = new URLSearchParams();
    if (query?.status) params.append('status', query.status);
    if (query?.paymentStatus) params.append('paymentStatus', query.paymentStatus);
    if (query?.page) params.append('page', String(query.page));
    if (query?.limit) params.append('limit', String(query.limit));

    const path = `/orders?${params.toString()}`;
    const response = await apiClient<Order[]>(path, {
      method: 'GET',
      auth: true,
    });

    const orders = response.data || [];
    const total = (response as any).pagination?.total || orders.length;

    return { orders, total };
  }

  async getUserOrderById(id: string): Promise<Order> {
    const response = await apiClient<Order>(`/orders/${id}`, {
      method: 'GET',
      auth: true,
    });
    return response.data;
  }

  async cancelOrder(id: string): Promise<Order> {
    const response = await apiClient<Order>(`/orders/${id}/cancel`, {
      method: 'PATCH',
      auth: true,
    });
    return response.data;
  }
}

export const orderService = new OrderService();
