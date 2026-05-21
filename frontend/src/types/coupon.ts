export interface Coupon {
  id: string;
  code: string;
  discount: number;
  minOrderValue: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CouponsListData {
  coupons: Coupon[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetCouponsParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface CreateCouponPayload {
  code: string;
  discount: number;
  minOrderValue?: number | null;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  isActive?: boolean;
  expiresAt?: string | null;
}

export interface UpdateCouponPayload extends Partial<CreateCouponPayload> {}
