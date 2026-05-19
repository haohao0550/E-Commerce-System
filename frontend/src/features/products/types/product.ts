export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  color?: string;
  size?: string;
  price: number;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  images?: string[];
  categoryId?: string;
  slug: string;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
  variants?: ProductVariant[];
}

