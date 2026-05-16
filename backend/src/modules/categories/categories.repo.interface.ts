import type { Category } from '@/generated/prisma/client.js'
import type { CreateCategoryDTO, UpdateCategoryDTO } from './categories.dto.js'

export interface ICategoriesRepo {
  findAll(): Promise<Category[]>
  findById(id: string): Promise<Category | null>
  findBySlug(slug: string): Promise<Category | null>
  create(data: CreateCategoryDTO & { slug: string }): Promise<Category>
  update(id: string, data: UpdateCategoryDTO & { slug?: string }): Promise<Category>
  delete(id: string): Promise<Category>
}