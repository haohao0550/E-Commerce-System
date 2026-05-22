import useApiStore from '@/store/apiStore';
import type { CouponsListData, GetCouponsParams } from '@/types/coupon';

export interface CouponPayload {
  code: string;
  orderValue: number;
}

export interface CouponInfo {
  id: string;
  code: string;
  discount: number;
  minOrderValue: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
}

export interface ValidateCouponResponse {
  coupon: CouponInfo;
  orderValue: number;
  discountAmount: number;
  finalPrice: number;
}

class CouponService {
  async validateCoupon(data: CouponPayload): Promise<ValidateCouponResponse> {
    const { callApi } = useApiStore.getState();
    const response = await callApi<ValidateCouponResponse>('/coupons/validate', { method: 'POST', body: data, auth: true });
    return response.data;
  }

  async getCoupons(params: GetCouponsParams = {}): Promise<CouponsListData> {
    const { callApi } = useApiStore.getState();
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.set('page', String(params.page));
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.search) searchParams.set('search', params.search);
    if (typeof params.isActive === 'boolean') searchParams.set('isActive', String(params.isActive));

    const query = searchParams.toString();
    const response = await callApi<CouponsListData>(`/coupons${query ? `?${query}` : ''}`);
    return response.data;
  }
}

export const couponService = new CouponService();
