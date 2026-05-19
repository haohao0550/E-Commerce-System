import prisma from '@/shared/configs/db.config.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '@/shared/errors/app.error.js';
import type { OrderStatus, PaymentStatus } from '@/generated/prisma/client.js';
import type { CreateOrderDTO, CreateOrderItemDTO, OrderQueryDTO } from './orders.dto.js';
import type {
    IOrdersRepo,
    OrderItemCreateRepoInput,
    CreateOrderTransactionInput,
} from './orders.repo.interface.js';
import { OrdersRepo } from './orders.repo.js';

export class OrdersService {
    constructor(private readonly ordersRepo: IOrdersRepo = new OrdersRepo()) {}

    async createOrder(userId: string, data: CreateOrderDTO) {
        // 1. Gom nhóm các item trùng variantId và cộng dồn quantity
        const consolidatedItems = this.consolidateItems(data.items);

        const variantIds = consolidatedItems.map((item) => item.variantId);

        // 2. Fetch thông tin giá và tồn kho thực tế từ DB
        const variants = await prisma.productVariant.findMany({
            where: { id: { in: variantIds } },
            include: { product: true },
        });

        if (variants.length !== variantIds.length) {
            throw new BadRequestError('One or more products do not exist');
        }

        let totalPrice = 0;
        const repoItems: OrderItemCreateRepoInput[] = [];
        const cartItemIdsToDelete: string[] = [];

        // Fetch giỏ hàng để dọn dẹp nếu khách mua từ giỏ
        const userCart = await prisma.cart.findMany({
            where: { userId, variantId: { in: variantIds } },
        });

        // 3. Tính toán tiền và check stock
        for (const item of consolidatedItems) {
            const variant = variants.find((v) => v.id === item.variantId);
            if (!variant) continue;

            if (variant.stock < item.quantity) {
                throw new BadRequestError(
                    `Product ${variant.product.name} (Color: ${variant.color || 'N/A'}, Size: ${variant.size || 'N/A'}) does not have enough stock`,
                );
            }

            const price = Number(variant.price);
            totalPrice += price * item.quantity;

            repoItems.push({
                variantId: variant.id,
                productName: variant.product.name,
                variantInfo: `Color: ${variant.color || 'N/A'}, Size: ${variant.size || 'N/A'}`,
                price,
                quantity: item.quantity,
            });

            const cartItem = userCart.find((c) => c.variantId === variant.id);
            if (cartItem) {
                cartItemIdsToDelete.push(cartItem.id);
            }
        }

        // 4. Áp dụng mã giảm giá (Nếu có)
        let discountAmount = 0;
        const shippingFee = 0; // Giả định freeship cho project này hoặc tích hợp GHTK tính sau

        if (data.couponId) {
            const coupon = await prisma.coupon.findUnique({ where: { id: data.couponId } });
            if (
                !coupon ||
                !coupon.isActive ||
                (coupon.expiresAt && coupon.expiresAt < new Date())
            ) {
                throw new BadRequestError('Invalid or expired coupon code');
            }
            if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
                throw new BadRequestError('Coupon code usage limit reached');
            }
            if (coupon.minOrderValue && totalPrice < Number(coupon.minOrderValue)) {
                throw new BadRequestError(
                    `Order has not reached the minimum value (${coupon.minOrderValue}) to apply this coupon code`,
                );
            }

            // Giả sử mã giảm giá là số tiền trừ thẳng (fixed discount)
            discountAmount = Number(coupon.discount);
            if (coupon.maxDiscount && discountAmount > Number(coupon.maxDiscount)) {
                discountAmount = Number(coupon.maxDiscount);
            }
        }

        let finalPrice = totalPrice + shippingFee - discountAmount;
        if (finalPrice < 0) finalPrice = 0;

        // 5. Chuẩn bị dữ liệu và gọi Repo để chạy Transaction
        const { district, ...shippingAddress } = data.shippingAddress || {};

        const createData: CreateOrderTransactionInput = {
            userId,
            status: 'PENDING',
            paymentMethod: data.paymentMethod || 'COD',
            paymentStatus: 'UNPAID',
            totalPrice,
            shippingFee,
            discountAmount,
            finalPrice,
            shippingAddress,
            couponId: data.couponId,
            note: data.note,
            items: repoItems,
        };

        return this.ordersRepo.createOrderTransaction(createData, cartItemIdsToDelete);
    }

    async getOrders(query: OrderQueryDTO) {
        const { orders, total } = await this.ordersRepo.findAll(query);
        const limit = query.limit || 10;
        const page = query.page || 1;

        return {
            orders,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
            },
        };
    }

    async getOrderById(id: string, userId?: string) {
        const order = await this.ordersRepo.findById(id);

        if (!order) {
            throw new NotFoundError('Order not found');
        }

        // Nếu API gọi từ phía User, bắt buộc check quyền sở hữu
        if (userId && order.userId !== userId) {
            throw new ForbiddenError('You do not have permission to access this order');
        }

        return order;
    }

    async cancelOrder(id: string, userId?: string) {
        const order = await this.ordersRepo.findById(id);

        if (!order) {
            throw new NotFoundError('Order not found');
        }

        if (userId && order.userId !== userId) {
            throw new ForbiddenError('You do not have permission to cancel this order');
        }

        if (order.status !== 'PENDING') {
            throw new BadRequestError('Only PENDING orders can be cancelled');
        }

        const cancelItems = (order.items || []).map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
        }));

        return this.ordersRepo.cancelOrderTransaction(order.id, cancelItems, order.couponId);
    }

    async updateOrderStatus(id: string, status: OrderStatus) {
        const order = await this.ordersRepo.findById(id);
        if (!order) {
            throw new NotFoundError('Order not found');
        }

        // Nếu Admin quyết định chuyển về CANCELLED, cũng phải rollback stock
        if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
            const cancelItems = (order.items || []).map((item) => ({
                variantId: item.variantId,
                quantity: item.quantity,
            }));
            return this.ordersRepo.cancelOrderTransaction(order.id, cancelItems, order.couponId);
        }

        return this.ordersRepo.updateStatus(id, status);
    }

    async updatePaymentStatus(id: string, paymentStatus: PaymentStatus) {
        const order = await this.ordersRepo.findById(id);
        if (!order) {
            throw new NotFoundError('Order not found');
        }

        return this.ordersRepo.updatePaymentStatus(id, paymentStatus);
    }

    private consolidateItems(items: CreateOrderItemDTO[]): CreateOrderItemDTO[] {
        return items.reduce((acc, current) => {
            const existing = acc.find((item) => item.variantId === current.variantId);
            if (existing) {
                existing.quantity += current.quantity;
            } else {
                acc.push({ ...current });
            }
            return acc;
        }, [] as CreateOrderItemDTO[]);
    }
}
