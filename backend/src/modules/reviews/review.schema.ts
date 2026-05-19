import { z } from 'zod';

const ratingSchema = z.coerce.number().int().min(1).max(5);

export const productIdParamSchema = z.object({
    productId: z.string().uuid('Invalid product id'),
});

export const reviewIdParamSchema = z.object({
    id: z.string().uuid('Invalid review id'),
});

export const createReviewSchema = z.object({
    rating: ratingSchema.default(5),
    comment: z.string().trim().min(1).max(1000).optional(),
    orderId: z.string().uuid('Invalid order id'),
});

export const updateReviewSchema = z
    .object({
        rating: ratingSchema.optional(),
        comment: z.string().trim().min(1).max(1000).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: 'At least one field must be provided',
    });

export const getProductReviewsQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    rating: ratingSchema.optional(),
});

export const getAdminReviewsQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    rating: ratingSchema.optional(),
    productId: z.string().uuid('Invalid product id').optional(),
    userId: z.string().uuid('Invalid user id').optional(),
    orderId: z.string().uuid('Invalid order id').optional(),
    search: z.string().trim().min(1).optional(),
});
