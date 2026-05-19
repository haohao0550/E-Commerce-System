import type { Product, ProductVariant } from '@/generated/prisma/client.js';

export type ProductResponse = Product;

export type CreateProductDTO = {
    name: string;
    description?: string;
    basePrice: number;
    images?: string[];
    categoryId?: string;
};

export type UpdateProductDTO = {
    name?: string;
    description?: string;
    basePrice?: number;
    images?: string[];
    categoryId?: string | null;
};

export type ProductQueryDTO = {
    keyword?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
};

export type ProductWithCategory = Product & {
    category?: {
        id: string;
        name: string;
        slug: string;
    } | null;
    variants?: ProductVariant[];
};

export type ProductCreateData = {
    name: string;
    slug: string;
    description?: string;
    basePrice: number;
    images?: string[];
    categoryId?: string;
};

export type ProductUpdateData = Partial<ProductCreateData> & {
    categoryId?: string | null;
};
