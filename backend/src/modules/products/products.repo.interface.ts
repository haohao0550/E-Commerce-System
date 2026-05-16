import type { Product } from '@/generated/prisma/client.js'
import type {
  ProductCreateData,
  ProductQueryDTO,
  ProductUpdateData,
  ProductWithCategory
} from './products.dto.js'

export interface IProductsRepo {
  findAll(query: ProductQueryDTO): Promise<{
    products: ProductWithCategory[]
    total: number
  }>

  findById(id: string): Promise<ProductWithCategory | null>
  findBySlug(slug: string): Promise<ProductWithCategory | null>
  findBySlugIncludingDeleted(slug: string): Promise<Product | null>

  create(data: ProductCreateData): Promise<Product>
  update(id: string, data: ProductUpdateData): Promise<Product>
  softDelete(id: string): Promise<Product>
  restore(id: string): Promise<Product>
}