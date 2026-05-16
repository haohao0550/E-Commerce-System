import type { Category } from '@/generated/prisma/client.js'

export type CategoryResponse = Category

export type CreateCategoryDTO = {
  name: string
}

export type UpdateCategoryDTO = {
  name?: string
}