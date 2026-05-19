import prisma from '@/shared/configs/db.config.js';
import type { Prisma, Order, OrderStatus, PaymentStatus } from '@/generated/prisma/client.js';
import type { OrderQueryDTO, OrderUpdateData, OrderResponse } from './orders.dto.js';
import type { IOrdersRepo, CreateOrderTransactionInput } from './orders.repo.interface.js';
import { BadRequestError } from '@/shared/errors/app.error.js';

export class OrdersRepo implements IOrdersRepo {
    async findAll(query: OrderQueryDTO): Promise<{ orders: OrderResponse[]; total: number }> {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const skip = (page - 1) * limit;
        const take = Number(limit);

        const where: Prisma.OrderWhereInput = {
            ...(query.userId && { userId: query.userId }),
            ...(query.status && { status: query.status }),
            ...(query.paymentStatus && { paymentStatus: query.paymentStatus }),
            ...(query.startDate || query.endDate
                ? {
                      createdAt: {
                          ...(query.startDate && { gte: new Date(query.startDate) }),
                          ...(query.endDate && { lte: new Date(query.endDate) }),
                      },
                  }
                : {}),
        };

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                skip,
                take,
                orderBy: {
                    createdAt: 'desc',
                },
                include: {
                    items: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                        },
                    },
                },
            }),
            prisma.order.count({ where }),
        ]);

        return { orders, total };
    }

    async findById(id: string): Promise<OrderResponse | null> {
        return prisma.order.findUnique({
            where: { id },
            include: {
                items: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
            },
        });
    }

    async createOrderTransaction(
        data: CreateOrderTransactionInput,
        cartItemIdsToDelete?: string[],
    ): Promise<OrderResponse> {
        const { items, ...orderData } = data;

        // Thực thi tuần tự nhiều query trong 1 transaction an toàn
        const transactionResult = await prisma.$transaction(async (tx) => {
            // 1. Tạo bản ghi Order và OrderItems
            const newOrder = await tx.order.create({
                data: {
                    ...orderData,
                    items: {
                        create: items.map((item) => ({
                            variantId: item.variantId,
                            productName: item.productName,
                            variantInfo: item.variantInfo,
                            price: item.price,
                            quantity: item.quantity,
                        })),
                    },
                },
                include: {
                    items: true,
                },
            });

            // 2. Trừ stock cho từng product variant atomically và check stock âm
            for (const item of items) {
                if (item.variantId) {
                    const updatedVariant = await tx.productVariant.update({
                        where: { id: item.variantId },
                        data: {
                            stock: {
                                decrement: item.quantity,
                            },
                        },
                        include: { product: true },
                    });

                    if (updatedVariant.stock < 0) {
                        throw new BadRequestError(
                            `Product ${updatedVariant.product.name} (Color: ${updatedVariant.color || 'N/A'}, Size: ${updatedVariant.size || 'N/A'}) does not have enough stock`,
                        );
                    }
                }
            }

            // 3. Tăng usedCount của Coupon (nếu đơn hàng có áp dụng coupon) và check usageLimit atomically
            if (orderData.couponId) {
                const updatedCoupon = await tx.coupon.update({
                    where: { id: orderData.couponId },
                    data: {
                        usedCount: {
                            increment: 1,
                        },
                    },
                });

                if (
                    updatedCoupon.usageLimit &&
                    updatedCoupon.usedCount > updatedCoupon.usageLimit
                ) {
                    throw new BadRequestError('Coupon code usage limit reached');
                }
            }

            // 4. Xóa các sản phẩm khách vừa mua thành công ra khỏi giỏ hàng
            if (cartItemIdsToDelete && cartItemIdsToDelete.length > 0) {
                await tx.cart.deleteMany({
                    where: {
                        id: { in: cartItemIdsToDelete },
                    },
                });
            }

            return newOrder;
        });

        return transactionResult;
    }

    async update(id: string, data: OrderUpdateData): Promise<Order> {
        return prisma.order.update({
            where: { id },
            data,
        });
    }

    async updateStatus(id: string, status: OrderStatus): Promise<Order> {
        return prisma.order.update({
            where: { id },
            data: { status },
        });
    }

    async updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<Order> {
        return prisma.order.update({
            where: { id },
            data: { paymentStatus },
        });
    }

    async cancelOrderTransaction(
        id: string,
        items: { variantId: string | null; quantity: number }[],
        couponId: string | null,
    ): Promise<OrderResponse> {
        const transactionResult = await prisma.$transaction(async (tx) => {
            // 1. Đổi trạng thái đơn hàng thành CANCELLED atomically và đảm bảo không hủy trùng
            const updated = await tx.order.updateMany({
                where: {
                    id,
                    status: {
                        notIn: ['CANCELLED', 'DELIVERED', 'RETURNED'],
                    },
                },
                data: { status: 'CANCELLED' },
            });

            if (updated.count === 0) {
                throw new BadRequestError(
                    'Order cannot be cancelled (already cancelled, delivered or returned)',
                );
            }

            const updatedOrder = await tx.order.findUniqueOrThrow({
                where: { id },
                include: {
                    items: true,
                    user: {
                        select: { id: true, name: true, email: true, phone: true },
                    },
                },
            });

            // 2. Hoàn lại số lượng tồn kho (stock)
            for (const item of items) {
                if (item.variantId) {
                    await tx.productVariant.update({
                        where: { id: item.variantId },
                        data: {
                            stock: { increment: item.quantity },
                        },
                    });
                }
            }

            // 3. Hoàn lại lượt sử dụng Coupon (nếu có)
            if (couponId) {
                await tx.coupon.update({
                    where: { id: couponId },
                    data: {
                        usedCount: { decrement: 1 },
                    },
                });
            }

            return updatedOrder as unknown as OrderResponse;
        });

        return transactionResult;
    }
}
