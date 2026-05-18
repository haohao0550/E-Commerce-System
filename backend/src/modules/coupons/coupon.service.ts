import { Prisma } from '@/generated/prisma/client.js';
import { AppError, NotFoundError } from '@/shared/errors/app.error.js';
import { CouponRepo } from './coupon.repo.js';
import {
    CreateCouponInput,
    GetCouponsQuery,
    UpdateCouponInput,
    ValidateCouponInput,
} from './coupon.dto.js';

export class CouponService {
    private couponRepo: CouponRepo;

    constructor() {
        this.couponRepo = new CouponRepo();
    }

    private normalizeCode(code: string) {
        return code.trim().toUpperCase();
    }

    private toCoupon(coupon: any) {
        return {
            id: coupon.id,
            code: coupon.code,
            discount: Number(coupon.discount),
            minOrderValue: coupon.minOrderValue === null ? null : Number(coupon.minOrderValue),
            maxDiscount: coupon.maxDiscount === null ? null : Number(coupon.maxDiscount),
            usageLimit: coupon.usageLimit,
            usedCount: coupon.usedCount,
            isActive: coupon.isActive,
            expiresAt: coupon.expiresAt,
            createdAt: coupon.createdAt,
            updatedAt: coupon.updatedAt,
        };
    }

    private calculateDiscount(coupon: any, orderValue: number) {
        const discountPercent = Number(coupon.discount);
        const maxDiscount = coupon.maxDiscount === null ? null : Number(coupon.maxDiscount);
        const discountAmount = (orderValue * discountPercent) / 100;

        return Math.min(orderValue, maxDiscount === null ? discountAmount : Math.min(discountAmount, maxDiscount));
    }

    private ensureCouponUsable(coupon: any, orderValue: number) {
        if (!coupon) {
            throw new NotFoundError('Coupon');
        }

        if (!coupon.isActive) {
            throw new AppError('Coupon is inactive', 400, 'COUPON_INACTIVE');
        }

        if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
            throw new AppError('Coupon has expired', 400, 'COUPON_EXPIRED');
        }

        if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
            throw new AppError('Coupon usage limit reached', 400, 'COUPON_USAGE_LIMIT_REACHED');
        }

        const minOrderValue = coupon.minOrderValue === null ? null : Number(coupon.minOrderValue);
        if (minOrderValue !== null && orderValue < minOrderValue) {
            throw new AppError('Order value does not meet coupon minimum', 400, 'COUPON_MIN_ORDER_VALUE_NOT_MET');
        }
    }

    private async ensureCodeUnique(code: string, currentCouponId?: string) {
        const existedCoupon = await this.couponRepo.findByCode(code);
        if (existedCoupon && existedCoupon.id !== currentCouponId) {
            throw new AppError('Coupon code already exists', 400, 'COUPON_CODE_EXISTS');
        }
    }

    async validateCoupon(input: ValidateCouponInput) {
        const code = this.normalizeCode(input.code);
        const coupon = await this.couponRepo.findByCode(code);

        this.ensureCouponUsable(coupon, input.orderValue);

        const discountAmount = this.calculateDiscount(coupon, input.orderValue);
        const finalPrice = Math.max(input.orderValue - discountAmount, 0);

        return {
            coupon: this.toCoupon(coupon),
            orderValue: input.orderValue,
            discountAmount,
            finalPrice,
        };
    }

    async getCoupons(query: GetCouponsQuery) {
        const where: Prisma.CouponWhereInput = {};

        if (query.search) {
            where.code = {
                contains: query.search.trim().toUpperCase(),
                mode: 'insensitive',
            };
        }

        if (typeof query.isActive === 'boolean') {
            where.isActive = query.isActive;
        }

        const skip = (query.page - 1) * query.limit;
        const [coupons, total] = await Promise.all([
            this.couponRepo.findMany(where, skip, query.limit),
            this.couponRepo.count(where),
        ]);

        return {
            coupons: coupons.map((coupon) => this.toCoupon(coupon)),
            pagination: {
                page: query.page,
                limit: query.limit,
                total,
                totalPages: Math.ceil(total / query.limit),
            },
        };
    }

    async createCoupon(input: CreateCouponInput) {
        const code = this.normalizeCode(input.code);
        await this.ensureCodeUnique(code);

        const coupon = await this.couponRepo.create({
            code,
            discount: input.discount,
            minOrderValue: input.minOrderValue,
            maxDiscount: input.maxDiscount,
            usageLimit: input.usageLimit,
            isActive: input.isActive ?? true,
            expiresAt: input.expiresAt,
        });

        return this.toCoupon(coupon);
    }

    async updateCoupon(id: string, input: UpdateCouponInput) {
        const coupon = await this.couponRepo.findById(id);
        if (!coupon) {
            throw new NotFoundError('Coupon');
        }

        const payload: Prisma.CouponUpdateInput = { ...input };

        if (input.code) {
            const code = this.normalizeCode(input.code);
            await this.ensureCodeUnique(code, id);
            payload.code = code;
        }

        try {
            const updatedCoupon = await this.couponRepo.update(id, payload);
            return this.toCoupon(updatedCoupon);
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new NotFoundError('Coupon');
            }

            throw error;
        }
    }

    async deleteCoupon(id: string) {
        const coupon = await this.couponRepo.findById(id);
        if (!coupon) {
            throw new NotFoundError('Coupon');
        }

        const deletedCoupon = await this.couponRepo.delete(id);
        return this.toCoupon(deletedCoupon);
    }
}
