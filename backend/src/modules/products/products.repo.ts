import prisma from '@/shared/configs/db.config.js'
import type { Prisma, Product } from '@/generated/prisma/client.js'
import type {
  ProductCreateData,
  ProductQueryDTO,
  ProductUpdateData,
  ProductWithCategory
} from './products.dto.js'
import type { IProductsRepo } from './products.repo.interface.js'

export class ProductsRepo implements IProductsRepo {
  async findAll(query: ProductQueryDTO): Promise<{ products: ProductWithCategory[]; total: number }> {
    const page = query.page ?? 1
    const limit = query.limit ?? 10
    const skip = (page - 1) * limit

    const take = Number(limit)

    const where: Prisma.ProductWhereInput = {
      isDeleted: false,
      ...(query.keyword && {
        name: {
          contains: query.keyword,
          mode: 'insensitive'
        }
      }),
      ...(query.categoryId && {
        categoryId: query.categoryId
      }),
      ...(query.minPrice !== undefined || query.maxPrice !== undefined
        ? {
            basePrice: {
              ...(query.minPrice !== undefined && { gte: query.minPrice }),
              ...(query.maxPrice !== undefined && { lte: query.maxPrice })
            }
          }
        : {})
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      }),
      prisma.product.count({ where })
    ])

    return { products, total }
  }

  async findById(id: string): Promise<ProductWithCategory | null> {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })
  }

  async findBySlug(slug: string): Promise<ProductWithCategory | null> {
    return prisma.product.findFirst({
      where: {
        slug,
        isDeleted: false
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })
  }

  async findBySlugIncludingDeleted(slug: string): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { slug }
    })
  }

  async create(data: ProductCreateData): Promise<Product> {
    return prisma.product.create({
      data
    })
  }

  async update(id: string, data: ProductUpdateData): Promise<Product> {
    return prisma.product.update({
      where: { id },
      data
    })
  }

  async softDelete(id: string): Promise<Product> {
    return prisma.product.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date()
      }
    })
  }

  async restore(id: string): Promise<Product> {
    return prisma.product.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null
      }
    })
  }
}