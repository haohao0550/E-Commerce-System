import type { Prisma } from '@/generated/prisma/client.js';

export type CartItemWithVariant = Prisma.CartGetPayload<{
	include: {
		variant: {
			include: {
				product: true;
			};
		};
	};
}>;

export type ProductVariantWithProduct = Prisma.ProductVariantGetPayload<{
	include: {
		product: true;
	};
}>;

export interface GetCartsQuery {
	page: number;
	limit: number;
}

export interface AddToCartInput {
	variantId: string;
	quantity: number;
}

export interface UpdateCartItemInput {
	quantity: number;
}

export interface SyncCartInput {
	items: Array<{
		variantId: string;
		quantity: number;
	}>;
}

export interface ValidateCartInput {
	items?: Array<{
		variantId: string;
		quantity: number;
	}>;
}

export interface ApplyCouponInput {
	code: string;
}
