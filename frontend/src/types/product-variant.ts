import type { ProductVariant } from '@/features/products/types/product';

export interface GetProductVariantsParams {
  productId?: string;
  sku?: string;
  color?: string;
  size?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateProductVariantPayload {
  sku: string;
  color?: string;
  size?: string;
  price: number;
  stock?: number;
}

export interface UpdateProductVariantPayload {
  sku?: string;
  color?: string | null;
  size?: string | null;
  price?: number;
  stock?: number;
}

export type { ProductVariant };
