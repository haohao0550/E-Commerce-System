import type { ProductVariant } from '@/generated/prisma/client.js';
import { Decimal } from '@/generated/prisma/internal/prismaNamespace.js';

export type ProductVariantResponse = ProductVariant;

export type CreateProductVariantDTO = {
    sku: string;
    color?: string;
    size?: string;
    price: number;
    stock?: number;
};

export type UpdateProductVariantDTO = {
    sku?: string;
    color?: string | null;
    size?: string | null;
    price?: number;
    stock?: number;
};

export type ProductVariantQueryDTO = {
    productId?: string;
    sku?: string;
    color?: string;
    size?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    page?: number;
    limit?: number;
};

export type ProductVariantCreateData = {
    productId: string;
    sku: string;
    color?: string;
    size?: string;
    price: number;
    stock?: number;
};

export type ProductVariantUpdateData = {
    sku?: string;
    color?: string | null;
    size?: string | null;
    price?: Decimal | number;
    stock?: number;
};
