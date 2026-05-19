import { Prisma } from '@/generated/prisma/client.js';
import { BadRequestError, NotFoundError } from '@/shared/errors/app.error.js';
import * as cartDto from './cart.dto.js';
import { CartRepo } from './cart.repo.js';

export class CartService {
    constructor(private readonly cartRepo: CartRepo = new CartRepo()) {}

    private toCartItem(item: cartDto.CartItemWithVariant) {
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

    private toPreviewItem(variant: cartDto.ProductVariantWithProduct, quantity: number) {
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

    private calculateSummary(
        items: Array<{ quantity: number; variant: { price: Prisma.Decimal } }>,
    ) {
        const subtotal = items.reduce(
            (acc, item) => acc.plus(item.variant.price.mul(item.quantity)),
            new Prisma.Decimal(0),
        );

        const itemsCount = items.length;
        const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);

        return { subtotal, itemsCount, totalQuantity };
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

    private buildSummary(items: Array<{ quantity: number; variant: { price: Prisma.Decimal } }>) {
        const summary = this.calculateSummary(items);

        return {
            ...summary,
            discount: new Prisma.Decimal(0),
            total: summary.subtotal,
            coupon: null,
        };
    }

    async getCarts(userId: string, query: cartDto.GetCartsQuery) {
        const page = query.page;
        const limit = query.limit;
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            this.cartRepo.findByUserId(userId, skip, limit),
            this.cartRepo.countByUserId(userId),
        ]);

        return {
            items: items.map((item) => this.toCartItem(item)),
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async addToCart(userId: string, input: cartDto.AddToCartInput) {
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

    async updateCartItem(userId: string, id: string, input: cartDto.UpdateCartItemInput) {
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
    }

    async validateCart(userId: string, input: cartDto.ValidateCartInput) {
        if (input.items?.length) {
            const previewItems = await Promise.all(
                input.items.map(async (item) => {
                    const variant = await this.ensureVariantAvailable(
                        item.variantId,
                        item.quantity,
                    );
                    return this.toPreviewItem(variant, item.quantity);
                }),
            );

            const summary = this.buildSummary(
                previewItems.map((item) => ({
                    quantity: item.quantity,
                    variant: { price: item.variant.price },
                })),
            );

            return { items: previewItems, summary };
        }

        const items = await this.cartRepo.findByUserId(userId);
        const summary = this.buildSummary(items);

        return { items: items.map((item) => this.toCartItem(item)), summary };
    }

    async getCartCount(userId: string) {
        return this.cartRepo.aggregateByUserId(userId);
    }
}
