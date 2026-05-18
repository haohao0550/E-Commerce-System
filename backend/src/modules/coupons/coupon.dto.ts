export interface ValidateCouponInput {
    code: string;
    orderValue: number;
}

export interface CreateCouponInput {
    code: string;
    discount: number;
    minOrderValue?: number | null;
    maxDiscount?: number | null;
    usageLimit?: number | null;
    isActive?: boolean;
    expiresAt?: Date | null;
}

export interface UpdateCouponInput {
    code?: string;
    discount?: number;
    minOrderValue?: number | null;
    maxDiscount?: number | null;
    usageLimit?: number | null;
    isActive?: boolean;
    expiresAt?: Date | null;
}

export interface GetCouponsQuery {
    page: number;
    limit: number;
    search?: string;
    isActive?: boolean;
}
