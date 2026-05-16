import prisma from '@/shared/configs/db.config.js'
import type { Category } from '@/generated/prisma/client.js'
import type { CreateCategoryDTO, UpdateCategoryDTO } from './categories.dto.js'
import type { ICategoriesRepo } from './categories.repo.interface.js'

export class CategoriesRepo implements ICategoriesRepo {
  async findAll(): Promise<Category[]> {
    return prisma.category.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  async findById(id: string): Promise<Category | null> {
    return prisma.category.findUnique({
      where: { id }
    })
  }

  async findBySlug(slug: string): Promise<Category | null> {
    return prisma.category.findUnique({
      where: { slug }
    })
  }

  async create(data: CreateCategoryDTO & { slug: string }): Promise<Category> {
    return prisma.category.create({
      data
    })
  }

  async update(id: string, data: UpdateCategoryDTO & { slug?: string }): Promise<Category> {
    return prisma.category.update({
      where: { id },
      data
    })
  }

  async delete(id: string): Promise<Category> {
    return prisma.category.delete({
      where: { id }
    })
  }
}