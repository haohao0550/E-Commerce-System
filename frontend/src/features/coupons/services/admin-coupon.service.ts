import { apiClient } from '@/services/api-client';
import type { Coupon, CouponsListData, CreateCouponPayload, UpdateCouponPayload, GetCouponsParams } from '@/types/coupon';

const buildQuery = (params: GetCouponsParams = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

export const adminCouponService = {
  async getCoupons(params?: GetCouponsParams) {
    const response = await apiClient<CouponsListData>(`/coupons${buildQuery(params)}`, { auth: true });
    return response.data;
  },

  async createCoupon(payload: CreateCouponPayload) {
    const response = await apiClient<{ coupon: Coupon }>(`/admin/coupons`, {
      method: 'POST',
      body: payload,
      auth: true,
    });
    return response.data.coupon;
  },

  async updateCoupon(id: string, payload: UpdateCouponPayload) {
    const response = await apiClient<{ coupon: Coupon }>(`/admin/coupons/${id}`, {
      method: 'PATCH',
      body: payload,
      auth: true,
    });
    return response.data.coupon;
  },

  async deleteCoupon(id: string) {
    const response = await apiClient<{ coupon: Coupon }>(`/admin/coupons/${id}`, {
      method: 'DELETE',
      auth: true,
    });
    return response.data.coupon;
  },
};
