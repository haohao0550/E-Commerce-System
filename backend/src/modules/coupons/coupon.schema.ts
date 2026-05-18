import { z } from 'zod';

const moneySchema = z.coerce.number().min(0, 'Value must be greater than or equal to 0');

const nullableMoneySchema = z.preprocess(
    (value) => (value === '' ? null : value),
    moneySchema.nullable().optional(),
);

const nullableDateSchema = z.preprocess(
    (value) => (value === '' ? null : value),
    z.coerce.date().nullable().optional(),
);

export const couponIdParamSchema = z.object({
    id: z.string().uuid('Invalid coupon id'),
});

export const validateCouponSchema = z.object({
    code: z.string().trim().min(1, 'Coupon code is required').max(50, 'Coupon code is too long'),
    orderValue: moneySchema,
});

const couponBodySchema = z.object({
    code: z.string().trim().min(1, 'Coupon code is required').max(50, 'Coupon code is too long'),
    discount: z.coerce
        .number()
        .min(0.01, 'Discount percent must be greater than 0')
        .max(100, 'Discount percent must be at most 100'),
    minOrderValue: nullableMoneySchema,
    maxDiscount: nullableMoneySchema,
    usageLimit: z.preprocess(
        (value) => (value === '' ? null : value),
        z.coerce.number().int().min(1, 'Usage limit must be at least 1').nullable().optional(),
    ),
    isActive: z.boolean().optional(),
    expiresAt: nullableDateSchema,
});

export const createCouponSchema = couponBodySchema
    .refine(
        (data) => data.maxDiscount == null || data.maxDiscount > 0,
        { message: 'Max discount must be greater than 0', path: ['maxDiscount'] },
    );

export const updateCouponSchema = couponBodySchema
    .partial()
    .refine(
        (data) => data.maxDiscount == null || data.maxDiscount > 0,
        { message: 'Max discount must be greater than 0', path: ['maxDiscount'] },
    )
    .refine((data) => Object.keys(data).length > 0, {
        message: 'At least one field must be provided',
    });

export const getCouponsQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().trim().min(1).optional(),
    isActive: z
        .enum(['true', 'false'])
        .transform((value) => value === 'true')
        .optional(),
});
