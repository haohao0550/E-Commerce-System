import type { Product, ProductVariant } from '@/features/products/types/product';

export interface GetProductsParams {
  keyword?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export interface ProductsListData {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateProductPayload {
  name: string;
  description?: string;
  basePrice: number;
  categoryId?: string;
  images?: string[];
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {}

export type { Product, ProductVariant };
