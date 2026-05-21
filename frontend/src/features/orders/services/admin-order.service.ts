import useApiStore from '@/store/apiStore';
import type { Order, OrdersQuery } from '@/features/orders/services/order.service';

export type AdminOrdersQuery = OrdersQuery;

class AdminOrderService {
  async getOrders(query?: AdminOrdersQuery): Promise<{ orders: Order[]; total: number }> {
    const params = new URLSearchParams();
    if (query?.status) params.append('status', query.status);
    if (query?.paymentStatus) params.append('paymentStatus', query.paymentStatus);
    if (query?.page) params.append('page', String(query.page));
    if (query?.limit) params.append('limit', String(query.limit));
    const path = `/admin/orders?${params.toString()}`;
    const { callApi } = useApiStore.getState();
    const response = await callApi<Order[]>(path, { method: 'GET', auth: true });

    const orders = response.data || [];
    const total = (response as any).pagination?.total || orders.length;

    return { orders, total };
  }

  async getOrderById(id: string): Promise<Order> {
    const { callApi } = useApiStore.getState();
    const response = await callApi<Order>(`/admin/orders/${id}`, { method: 'GET', auth: true });
    return response.data;
  }

  async updateOrderStatus(id: string, status: Order['status']): Promise<Order> {
    const { callApi } = useApiStore.getState();
    const response = await callApi<Order>(`/admin/orders/${id}/status`, { method: 'PATCH', body: { status }, auth: true });
    return response.data;
  }

  async updatePaymentStatus(id: string, paymentStatus: Order['paymentStatus']): Promise<Order> {
    const { callApi } = useApiStore.getState();
    const response = await callApi<Order>(`/admin/orders/${id}/payment-status`, { method: 'PATCH', body: { paymentStatus }, auth: true });
    return response.data;
  }
}

export const adminOrderService = new AdminOrderService();
