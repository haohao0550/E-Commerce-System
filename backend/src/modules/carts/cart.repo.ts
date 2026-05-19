import { PrismaClient, Prisma, Cart } from '@/generated/prisma/client.js';
import prisma from '@/shared/configs/db.config.js';
import type { ICartRepo } from './cart.repo.interface.js';
import type { CartItemWithVariant, ProductVariantWithProduct } from './cart.dto.js';

export class CartRepo implements ICartRepo {
    private prisma: PrismaClient = prisma;

    private getClient(tx?: Prisma.TransactionClient) {
        return tx ?? this.prisma;
    }

    async transaction<T>(fn: (prisma: Prisma.TransactionClient) => Promise<T>): Promise<T> {
        return this.prisma.$transaction(fn);
    }

    async findByUserId(
        userId: string,
        skip?: number,
        take?: number,
    ): Promise<CartItemWithVariant[]> {
        return this.prisma.cart.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            ...(typeof skip === 'number' ? { skip } : {}),
            ...(typeof take === 'number' ? { take } : {}),
            include: {
                variant: {
                    include: {
                        product: true,
                    },
                },
            },
        });
    }

    async countByUserId(userId: string): Promise<number> {
        return this.prisma.cart.count({
            where: { userId },
        });
    }

    async aggregateByUserId(
        userId: string,
    ): Promise<{ itemsCount: number; totalQuantity: number }> {
        const result = await this.prisma.cart.aggregate({
            where: { userId },
            _count: { _all: true },
            _sum: { quantity: true },
        });

        return {
            itemsCount: result._count._all,
            totalQuantity: result._sum.quantity ?? 0,
        };
    }

    async findById(id: string): Promise<Cart | null> {
        return this.prisma.cart.findUnique({
            where: { id },
        });
    }

    async findByIdWithVariant(id: string): Promise<CartItemWithVariant | null> {
        return this.prisma.cart.findUnique({
            where: { id },
            include: {
                variant: {
                    include: {
                        product: true,
                    },
                },
            },
        });
    }

    async findByVariantId(userId: string, variantId: string): Promise<Cart | null> {
        return this.prisma.cart.findUnique({
            where: {
                userId_variantId: {
                    userId,
                    variantId,
                },
            },
        });
    }

    async create(data: Prisma.CartCreateInput, tx?: Prisma.TransactionClient): Promise<Cart> {
        return this.getClient(tx).cart.create({
            data,
        });
    }

    async createMany(
        data: Prisma.CartCreateManyInput[],
        tx?: Prisma.TransactionClient,
    ): Promise<void> {
        if (!data.length) return;
        await this.getClient(tx).cart.createMany({
            data,
        });
    }

    async update(
        id: string,
        data: Prisma.CartUpdateInput,
        tx?: Prisma.TransactionClient,
    ): Promise<Cart> {
        return this.getClient(tx).cart.update({
            where: { id },
            data,
        });
    }

    async delete(id: string, tx?: Prisma.TransactionClient): Promise<void> {
        await this.getClient(tx).cart.delete({
            where: { id },
        });
    }

    async deleteByUserId(userId: string, tx?: Prisma.TransactionClient): Promise<void> {
        await this.getClient(tx).cart.deleteMany({
            where: { userId },
        });
    }

    async deleteByVariantId(
        userId: string,
        variantId: string,
        tx?: Prisma.TransactionClient,
    ): Promise<void> {
        await this.getClient(tx).cart.deleteMany({
            where: { userId, variantId },
        });
    }

    async findVariantById(variantId: string): Promise<ProductVariantWithProduct | null> {
        return this.prisma.productVariant.findUnique({
            where: { id: variantId },
            include: {
                product: true,
            },
        });
    }
}
