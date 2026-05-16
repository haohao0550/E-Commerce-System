import { z } from 'zod'

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, 'Category name is required')
})

export const updateCategorySchema = z.object({
  name: z.string().trim().min(1, 'Category name is required').optional()
})

export const categoryIdSchema = z.object({
  id: z.string().uuid('Invalid category id')
})

export type CreateCategoryBody = z.infer<typeof createCategorySchema>
export type UpdateCategoryBody = z.infer<typeof updateCategorySchema>