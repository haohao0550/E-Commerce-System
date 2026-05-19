import { z } from 'zod';

export const productVariantIdSchema = z.object({
    id: z.string().uuid('Invalid variant id'),
});

export const productIdSchema = z.object({
    productId: z.string().uuid('Invalid product id'),
});

export const getVariantsQuerySchema = z.object({
    productId: z.string().uuid('Invalid product id').optional(),
    sku: z.string().trim().optional(),
    color: z.string().trim().optional(),
    size: z.string().trim().optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    inStock: z.coerce.boolean().optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const createProductVariantSchema = z.object({
    sku: z.string().trim().min(1, 'SKU is required'),
    color: z.string().trim().optional(),
    size: z.string().trim().optional(),
    price: z.coerce.number().min(0, 'Price must be greater than or equal to 0'),
    stock: z.coerce.number().int().min(0).optional(),
});

export const updateProductVariantSchema = z.object({
    sku: z.string().trim().min(1).optional(),
    color: z.string().trim().nullable().optional(),
    size: z.string().trim().nullable().optional(),
    price: z.coerce.number().min(0).optional(),
    stock: z.coerce.number().int().min(0).optional(),
});

export type ProductVariantIdParams = z.infer<typeof productVariantIdSchema>;
export type ProductIdParams = z.infer<typeof productIdSchema>;
export type GetVariantsQuery = z.infer<typeof getVariantsQuerySchema>;
export type CreateProductVariantBody = z.infer<typeof createProductVariantSchema>;
export type UpdateProductVariantBody = z.infer<typeof updateProductVariantSchema>;
