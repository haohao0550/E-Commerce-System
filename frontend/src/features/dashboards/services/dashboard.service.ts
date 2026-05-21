import { apiClient } from '@/services/api-client';
import type {
  DashboardQuery,
  RevenuePoint,
  OrderCountPoint,
} from '@/features/dashboards/types/dashboard';

const buildQuery = (params: DashboardQuery = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

export const dashboardService = {
  async getRevenue(params?: DashboardQuery) {
    const response = await apiClient<RevenuePoint[]>(`/admin/dashboard/revenue${buildQuery(params)}`);
    return response.data;
  },

  async getOrderCount(params?: DashboardQuery) {
    const response = await apiClient<OrderCountPoint[]>(`/admin/dashboard/order-count${buildQuery(params)}`);
    return response.data;
  },
};
