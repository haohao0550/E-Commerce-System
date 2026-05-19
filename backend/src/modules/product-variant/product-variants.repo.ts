import prisma from '@/shared/configs/db.config.js';
import type { Prisma, ProductVariant } from '@/generated/prisma/client.js';
import type {
    ProductVariantCreateData,
    ProductVariantQueryDTO,
    ProductVariantUpdateData,
} from './product-variants.dto.js';
import type { IProductVariantsRepo } from './product-variants.repo.interface.js';

export class ProductVariantsRepo implements IProductVariantsRepo {
    async findAll(
        query: ProductVariantQueryDTO,
    ): Promise<{ variants: ProductVariant[]; total: number }> {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = Number((page - 1) * limit);

        const take = Number(limit);

        const where: Prisma.ProductVariantWhereInput = {
            ...(query.productId && { productId: query.productId }),
            ...(query.sku && { sku: { contains: query.sku, mode: 'insensitive' } }),
            ...(query.color && { color: { contains: query.color, mode: 'insensitive' } }),
            ...(query.size && { size: { contains: query.size, mode: 'insensitive' } }),
            ...(query.inStock !== undefined && {
                stock: query.inStock ? { gt: 0 } : { equals: 0 },
            }),
            ...(query.minPrice !== undefined || query.maxPrice !== undefined
                ? {
                      price: {
                          ...(query.minPrice !== undefined && { gte: query.minPrice }),
                          ...(query.maxPrice !== undefined && { lte: query.maxPrice }),
                      },
                  }
                : {}),
        };

        const [variants, total] = await Promise.all([
            prisma.productVariant.findMany({
                where,
                skip,
                take,
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            prisma.productVariant.count({ where }),
        ]);

        return { variants, total };
    }

    async findById(id: string): Promise<ProductVariant | null> {
        return prisma.productVariant.findUnique({
            where: { id },
        });
    }

    async findByProductId(productId: string): Promise<ProductVariant[]> {
        return prisma.productVariant.findMany({
            where: {
                productId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async findBySku(sku: string): Promise<ProductVariant | null> {
        return prisma.productVariant.findUnique({
            where: { sku },
        });
    }

    async findByProductColorSize(
        productId: string,
        color?: string | null,
        size?: string | null,
    ): Promise<ProductVariant | null> {
        return prisma.productVariant.findFirst({
            where: {
                productId,
                color: color ?? null,
                size: size ?? null,
            },
        });
    }

    async create(data: ProductVariantCreateData): Promise<ProductVariant> {
        return prisma.productVariant.create({
            data,
        });
    }

    async update(id: string, data: ProductVariantUpdateData): Promise<ProductVariant> {
        return prisma.productVariant.update({
            where: { id },
            data,
        });
    }

    async delete(id: string): Promise<ProductVariant> {
        return prisma.productVariant.delete({
            where: { id },
        });
    }
}
