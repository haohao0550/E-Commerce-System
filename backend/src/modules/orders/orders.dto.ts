import type {
    Order,
    OrderStatus,
    PaymentMethod,
    PaymentStatus,
    OrderItem,
    Prisma,
} from '@/generated/prisma/client.js';

export type OrderResponse = Order & {
    items?: OrderItem[];
};

export type CreateOrderItemDTO = {
    variantId: string;
    quantity: number;
};

export type CreateOrderDTO = {
    paymentMethod?: PaymentMethod;
    shippingAddress: any; // Nên thay bằng interface cụ thể nếu có (VD: UserAddress)
    couponId?: string;
    note?: string;
    items: CreateOrderItemDTO[];
};

export type UpdateOrderDTO = {
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    shippingAddress?: any;
    note?: string;
};

export type OrderQueryDTO = {
    userId?: string;
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
};

export type OrderCreateData = {
    userId: string;
    status?: OrderStatus;
    paymentMethod?: PaymentMethod;
    paymentStatus?: PaymentStatus;
    totalPrice: number | Prisma.Decimal;
    shippingFee?: number | Prisma.Decimal;
    discountAmount?: number | Prisma.Decimal;
    finalPrice: number | Prisma.Decimal;
    shippingAddress: any;
    couponId?: string;
    note?: string;
};

export type OrderUpdateData = Partial<OrderCreateData>;
