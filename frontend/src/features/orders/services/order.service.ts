import useApiStore from '@/store/apiStore';

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
  paymentMethod?: 'COD' | 'MOMO' | 'STRIPE';
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
  variant?: {
    id: string;
    productId: string;
    sku: string;
    color?: string;
    size?: string;
    price: number;
    stock: number;
    product?: {
      id: string;
      name: string;
      slug: string;
      description?: string;
      basePrice: number;
      images: string[] | string | any;
    };
  };
}

export interface Order {
  id: string;
  userId: string;
  user?: {
    id: string;
    name: string | null;
    email: string;
    phone?: string | null;
  };
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

export interface CreateMomoPaymentResponse {
  orderId: string;
  paymentOrderId: string;
  paymentRequestId: string;
  amount: number;
  payUrl: string;
  qrCodeUrl: string;
  deeplink: string;
}

export interface CreateStripePaymentResponse {
  orderId: string;
  checkoutSessionId: string;
  paymentIntentId: string | null;
  checkoutUrl: string;
  amount: number;
  currency: string;
}

class OrderService {
  async createOrder(data: CreateOrderInput): Promise<Order> {
    const { callApi } = useApiStore.getState();
    const response = await callApi<Order>('/orders', { method: 'POST', body: data, auth: true });
    return response.data;
  }

  async createMomoPayment(orderId: string, description?: string): Promise<CreateMomoPaymentResponse> {
    const { callApi } = useApiStore.getState();
    const response = await callApi<CreateMomoPaymentResponse>(`/payment/momo/create/${orderId}`, {
      method: 'POST',
      body: {
        description: description ?? undefined,
      },
      auth: true,
    });

    return response.data;
  }

  async createStripePayment(orderId: string, description?: string): Promise<CreateStripePaymentResponse> {
    const { callApi } = useApiStore.getState();
    const response = await callApi<CreateStripePaymentResponse>(`/payment/stripe/create/${orderId}`, {
      method: 'POST',
      body: {
        description: description ?? undefined,
      },
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
    const { callApi } = useApiStore.getState();
    const response = await callApi<Order[]>(path, { method: 'GET', auth: true });

    const orders = response.data || [];
    const total = (response as any).pagination?.total || orders.length;

    return { orders, total };
  }

  async getUserOrderById(id: string): Promise<Order> {
    const { callApi } = useApiStore.getState();
    const response = await callApi<Order>(`/orders/${id}`, { method: 'GET', auth: true });
    return response.data;
  }

  async cancelOrder(id: string): Promise<Order> {
    const { callApi } = useApiStore.getState();
    const response = await callApi<Order>(`/orders/${id}/cancel`, { method: 'PATCH', auth: true });
    return response.data;
  }
}

export const orderService = new OrderService();
