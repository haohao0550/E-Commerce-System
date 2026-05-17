import { Prisma } from '@/generated/prisma/client.js';
import prisma from '@/shared/configs/db.config.js';
import { BadRequestError, NotFoundError } from '@/shared/errors/app.error.js';
import { memDel, memGet, memSet } from '@/shared/cache/memCache.js';
import type {
	AddToCartInput,
	ApplyCouponInput,
	CartItemWithVariant,
	GetCartsQuery,
	ProductVariantWithProduct,
	SyncCartInput,
	UpdateCartItemInput,
	ValidateCartInput,
} from './cart.dto.js';
import { CartRepo } from './cart.repo.js';

type CouponSummary = {
	coupon: {
		id: string;
		code: string;
		discount: Prisma.Decimal;
		minOrderValue: Prisma.Decimal | null;
		maxDiscount: Prisma.Decimal | null;
	};
	discount: Prisma.Decimal;
	total: Prisma.Decimal;
};

export class CartService {
	constructor(private readonly cartRepo: CartRepo = new CartRepo()) {}

	private toCartItem(item: CartItemWithVariant) {
		return {
			id: item.id,
			variantId: item.variantId,
			quantity: item.quantity,
			createdAt: item.createdAt,
			updatedAt: item.updatedAt,
			variant: {
				id: item.variant.id,
				sku: item.variant.sku,
				color: item.variant.color,
				size: item.variant.size,
				price: item.variant.price,
				stock: item.variant.stock,
				product: {
					id: item.variant.product.id,
					name: item.variant.product.name,
					slug: item.variant.product.slug,
					images: item.variant.product.images,
					basePrice: item.variant.product.basePrice,
				},
			},
		};
	}

	private toPreviewItem(variant: ProductVariantWithProduct, quantity: number) {
		return {
			id: null,
			variantId: variant.id,
			quantity,
			createdAt: null,
			updatedAt: null,
			variant: {
				id: variant.id,
				sku: variant.sku,
				color: variant.color,
				size: variant.size,
				price: variant.price,
				stock: variant.stock,
				product: {
					id: variant.product.id,
					name: variant.product.name,
					slug: variant.product.slug,
					images: variant.product.images,
					basePrice: variant.product.basePrice,
				},
			},
		};
	}

	private calculateSummary(items: Array<{ quantity: number; variant: { price: Prisma.Decimal } }>) {
		const subtotal = items.reduce(
			(acc, item) => acc.plus(item.variant.price.mul(item.quantity)),
			new Prisma.Decimal(0),
		);

		const itemsCount = items.length;
		const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);

		return { subtotal, itemsCount, totalQuantity };
	}

	private getCouponCacheKey(userId: string) {
		return `cart-coupon:${userId}`;
	}

	private async ensureVariantAvailable(variantId: string, quantity: number) {
		const variant = await this.cartRepo.findVariantById(variantId);
		if (!variant || variant.product?.isDeleted) {
			throw new NotFoundError('Product variant');
		}

		if (variant.stock < quantity) {
			throw new BadRequestError('Quantity exceeds stock');
		}

		return variant;
	}

	private normalizeSyncItems(items: SyncCartInput['items']) {
		const map = new Map<string, number>();
		for (const item of items) {
			const current = map.get(item.variantId) ?? 0;
			map.set(item.variantId, current + item.quantity);
		}
		return Array.from(map.entries()).map(([variantId, quantity]) => ({ variantId, quantity }));
	}

	private computeCouponDiscount(coupon: {
		discount: Prisma.Decimal;
		maxDiscount: Prisma.Decimal | null;
	}, subtotal: Prisma.Decimal) {
		let discount = new Prisma.Decimal(coupon.discount);
		if (coupon.maxDiscount && discount.gt(coupon.maxDiscount)) {
			discount = coupon.maxDiscount;
		}
		if (discount.gt(subtotal)) {
			discount = subtotal;
		}
		return discount;
	}

	private async loadValidCoupon(userId: string, subtotal: Prisma.Decimal): Promise<CouponSummary | null> {
		const cached = memGet(this.getCouponCacheKey(userId)) as { code: string } | null;
		if (!cached?.code) {
			return null;
		}

		const coupon = await prisma.coupon.findUnique({
			where: { code: cached.code },
		});

		if (!coupon || !coupon.isActive) {
			memDel(this.getCouponCacheKey(userId));
			return null;
		}

		if (coupon.expiresAt && coupon.expiresAt < new Date()) {
			memDel(this.getCouponCacheKey(userId));
			return null;
		}

		if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
			memDel(this.getCouponCacheKey(userId));
			return null;
		}

		if (coupon.minOrderValue && subtotal.lt(coupon.minOrderValue)) {
			return null;
		}

		const discount = this.computeCouponDiscount(coupon, subtotal);
		const total = subtotal.minus(discount);

		return {
			coupon: {
				id: coupon.id,
				code: coupon.code,
				discount: coupon.discount,
				minOrderValue: coupon.minOrderValue,
				maxDiscount: coupon.maxDiscount,
			},
			discount,
			total,
		};
	}

	private async buildSummaryWithCoupon(userId: string, items: Array<{ quantity: number; variant: { price: Prisma.Decimal } }>) {
		const summary = this.calculateSummary(items);
		const applied = await this.loadValidCoupon(userId, summary.subtotal);

		return {
			...summary,
			discount: applied?.discount ?? new Prisma.Decimal(0),
			total: applied?.total ?? summary.subtotal,
			coupon: applied?.coupon ?? null,
		};
	}

	async getCarts(userId: string, query: GetCartsQuery) {
		const page = query.page;
		const limit = query.limit;
		const skip = (page - 1) * limit;

		const [items, total] = await Promise.all([
			this.cartRepo.findByUserId(userId, skip, limit),
			this.cartRepo.countByUserId(userId),
		]);

		const summary = await this.buildSummaryWithCoupon(userId, items);

		return {
			items: items.map((item) => this.toCartItem(item)),
			summary,
			meta: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		};
	}

	async addToCart(userId: string, input: AddToCartInput) {
		const variant = await this.ensureVariantAvailable(input.variantId, input.quantity);

		const existing = await this.cartRepo.findByVariantId(userId, input.variantId);

		if (existing) {
			const newQuantity = existing.quantity + input.quantity;
			if (variant.stock < newQuantity) {
				throw new BadRequestError('Quantity exceeds stock');
			}

			await this.cartRepo.update(existing.id, { quantity: newQuantity });
			const updated = await this.cartRepo.findByIdWithVariant(existing.id);
			if (!updated) {
				throw new NotFoundError('Cart item');
			}
			return this.toCartItem(updated);
		}

		const created = await this.cartRepo.create({
			quantity: input.quantity,
			user: { connect: { id: userId } },
			variant: { connect: { id: input.variantId } },
		});

		const createdItem = await this.cartRepo.findByIdWithVariant(created.id);
		if (!createdItem) {
			throw new NotFoundError('Cart item');
		}

		return this.toCartItem(createdItem);
	}

	async updateCartItem(userId: string, id: string, input: UpdateCartItemInput) {
		const cartItem = await this.cartRepo.findByIdWithVariant(id);
		if (!cartItem || cartItem.userId !== userId) {
			throw new NotFoundError('Cart item');
		}

		if (cartItem.variant.stock < input.quantity) {
			throw new BadRequestError('Quantity exceeds stock');
		}

		await this.cartRepo.update(id, { quantity: input.quantity });
		const updated = await this.cartRepo.findByIdWithVariant(id);
		if (!updated) {
			throw new NotFoundError('Cart item');
		}

		return this.toCartItem(updated);
	}

	async deleteCartItem(userId: string, id: string) {
		const cartItem = await this.cartRepo.findById(id);
		if (!cartItem || cartItem.userId !== userId) {
			throw new NotFoundError('Cart item');
		}
		await this.cartRepo.delete(id);
	}

	async clearCart(userId: string) {
		await this.cartRepo.deleteByUserId(userId);
		memDel(this.getCouponCacheKey(userId));
	}

	async updateCartItemByVariant(userId: string, variantId: string, input: UpdateCartItemInput) {
		const cartItem = await this.cartRepo.findByVariantId(userId, variantId);
		if (!cartItem) {
			throw new NotFoundError('Cart item');
		}

		const variant = await this.ensureVariantAvailable(variantId, input.quantity);
		if (variant.stock < input.quantity) {
			throw new BadRequestError('Quantity exceeds stock');
		}

		await this.cartRepo.update(cartItem.id, { quantity: input.quantity });
		const updated = await this.cartRepo.findByIdWithVariant(cartItem.id);
		if (!updated) {
			throw new NotFoundError('Cart item');
		}

		return this.toCartItem(updated);
	}

	async deleteCartItemByVariant(userId: string, variantId: string) {
		const cartItem = await this.cartRepo.findByVariantId(userId, variantId);
		if (!cartItem) {
			throw new NotFoundError('Cart item');
		}
		await this.cartRepo.deleteByVariantId(userId, variantId);
	}

	async syncCart(userId: string, input: SyncCartInput) {
		const normalizedItems = this.normalizeSyncItems(input.items);

		const validatedItems = await Promise.all(
			normalizedItems.map(async (item) => {
				const variant = await this.ensureVariantAvailable(item.variantId, item.quantity);
				return {
					variantId: variant.id,
					quantity: item.quantity,
				};
			}),
		);

		await this.cartRepo.transaction(async (tx) => {
			await this.cartRepo.deleteByUserId(userId, tx);
			if (validatedItems.length) {
				await this.cartRepo.createMany(
					validatedItems.map((item) => ({
						userId,
						variantId: item.variantId,
						quantity: item.quantity,
					})),
					tx,
				);
			}
		});

		return this.getCarts(userId, { page: 1, limit: 50 });
	}

	async validateCart(userId: string, input: ValidateCartInput) {
		if (input.items?.length) {
			const previewItems = await Promise.all(
				input.items.map(async (item) => {
					const variant = await this.ensureVariantAvailable(item.variantId, item.quantity);
					return this.toPreviewItem(variant, item.quantity);
				}),
			);

			const summary = await this.buildSummaryWithCoupon(
				userId,
				previewItems.map((item) => ({
					quantity: item.quantity,
					variant: { price: item.variant.price },
				})),
			);

			return { items: previewItems, summary };
		}

		const items = await this.cartRepo.findByUserId(userId);
		const summary = await this.buildSummaryWithCoupon(userId, items);

		return { items: items.map((item) => this.toCartItem(item)), summary };
	}

	async getCartCount(userId: string) {
		return this.cartRepo.aggregateByUserId(userId);
	}

	async applyCoupon(userId: string, input: ApplyCouponInput) {
		const items = await this.cartRepo.findByUserId(userId);
		if (!items.length) {
			throw new BadRequestError('Cart is empty');
		}

		const subtotal = this.calculateSummary(items).subtotal;
		const code = input.code.trim();

		const coupon = await prisma.coupon.findUnique({
			where: { code },
		});

		if (!coupon || !coupon.isActive) {
			throw new NotFoundError('Coupon');
		}

		if (coupon.expiresAt && coupon.expiresAt < new Date()) {
			throw new BadRequestError('Coupon expired');
		}

		if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
			throw new BadRequestError('Coupon usage limit reached');
		}

		if (coupon.minOrderValue && subtotal.lt(coupon.minOrderValue)) {
			throw new BadRequestError('Order value does not meet coupon requirements');
		}

		const discount = this.computeCouponDiscount(coupon, subtotal);
		const total = subtotal.minus(discount);

		memSet(this.getCouponCacheKey(userId), { code: coupon.code }, 24 * 60 * 60 * 1000);

		return {
			subtotal,
			discount,
			total,
			coupon: {
				id: coupon.id,
				code: coupon.code,
				discount: coupon.discount,
				minOrderValue: coupon.minOrderValue,
				maxDiscount: coupon.maxDiscount,
			},
		};
	}

	async removeCoupon(userId: string) {
		memDel(this.getCouponCacheKey(userId));
	}
}
