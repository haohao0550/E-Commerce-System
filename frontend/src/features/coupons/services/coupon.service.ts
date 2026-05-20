import { apiClient } from '@/services/api-client';

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
    const response = await apiClient<ValidateCouponResponse>('/coupons/validate', {
      method: 'POST',
      body: data,
      auth: true,
    });
    return response.data;
  }
}

export const couponService = new CouponService();
