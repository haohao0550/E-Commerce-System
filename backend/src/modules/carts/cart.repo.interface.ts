import type { Prisma, Cart } from '@/generated/prisma/client.js';
import type { CartItemWithVariant, ProductVariantWithProduct } from './cart.dto.js';

export interface ICartRepo {
	transaction<T>(fn: (prisma: Prisma.TransactionClient) => Promise<T>): Promise<T>;
	findByUserId(userId: string, skip?: number, take?: number): Promise<CartItemWithVariant[]>;
	countByUserId(userId: string): Promise<number>;
	aggregateByUserId(userId: string): Promise<{ itemsCount: number; totalQuantity: number }>;
	findById(id: string): Promise<Cart | null>;
	findByIdWithVariant(id: string): Promise<CartItemWithVariant | null>;
	findByVariantId(userId: string, variantId: string): Promise<Cart | null>;
	create(data: Prisma.CartCreateInput, tx?: Prisma.TransactionClient): Promise<Cart>;
	createMany(data: Prisma.CartCreateManyInput[], tx?: Prisma.TransactionClient): Promise<void>;
	update(id: string, data: Prisma.CartUpdateInput, tx?: Prisma.TransactionClient): Promise<Cart>;
	delete(id: string, tx?: Prisma.TransactionClient): Promise<void>;
	deleteByUserId(userId: string, tx?: Prisma.TransactionClient): Promise<void>;
	deleteByVariantId(userId: string, variantId: string, tx?: Prisma.TransactionClient): Promise<void>;
	findVariantById(variantId: string): Promise<ProductVariantWithProduct | null>;
}
