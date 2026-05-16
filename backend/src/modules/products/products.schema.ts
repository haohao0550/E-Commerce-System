import { z } from 'zod'

export const productIdSchema = z.object({
  id: z.string().uuid('Invalid product id')
})

export const productSlugSchema = z.object({
  slug: z.string().trim().min(1, 'Product slug is required')
})

export const getProductsQuerySchema = z.object({
  keyword: z.string().trim().optional(),
  categoryId: z.string().uuid('Invalid category id').optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(10)
})

export const createProductSchema = z.object({
  name: z.string().trim().min(1, 'Product name is required'),
  description: z.string().trim().optional(),
  basePrice: z.coerce.number().min(0, 'Base price must be greater than or equal to 0'),
  images: z.array(z.string().url('Invalid image url')).optional(),
  categoryId: z.string().uuid('Invalid category id').optional()
})

export const updateProductSchema = z.object({
  name: z.string().trim().min(1, 'Product name is required').optional(),
  description: z.string().trim().optional(),
  basePrice: z.coerce.number().min(0, 'Base price must be greater than or equal to 0').optional(),
  images: z.array(z.string().url('Invalid image url')).optional(),
  categoryId: z.string().uuid('Invalid category id').nullable().optional()
})

export type ProductIdParams = z.infer<typeof productIdSchema>
export type ProductSlugParams = z.infer<typeof productSlugSchema>
export type GetProductsQuery = z.infer<typeof getProductsQuerySchema>
export type CreateProductBody = z.infer<typeof createProductSchema>
export type UpdateProductBody = z.infer<typeof updateProductSchema>