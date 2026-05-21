import type { Order, Prisma, PaymentStatus } from '@/generated/prisma/client.js';

export interface MoMoCreatePaymentRequest {
    partnerCode: string;
    partnerName: string;
    storeId: string;
    requestId: string;
    amount: number;
    orderId: string;
    orderInfo: string;
    redirectUrl: string;
    ipnUrl: string;
    lang: string;
    requestType: string;
    autoCapture: boolean;
    extraData: string;
    signature: string;
}

export interface MoMoCreatePaymentResponse {
    partnerCode: string;
    orderId: string;
    requestId: string;
    amount: number;
    responseTime: number;
    message: string;
    resultCode: number;
    payUrl: string;
    qrCodeUrl: string;
    deeplink: string;
    deeplinkMiniApp: string;
}

export interface MoMoCallbackBody {
    partnerCode: string;
    orderId: string;
    requestId: string;
    amount: number;
    orderInfo: string;
    orderType: string;
    transId: number;
    resultCode: number;
    message: string;
    payType: string;
    responseTime: number;
    extraData: string;
    signature: string;
}

export interface CreateMomoPaymentResponse {
    orderId: string;
    paymentOrderId: string;
    paymentRequestId: string;
    amount: number;
    payUrl: string;
    qrCodeUrl: string;
    deeplink?: string;
}

export interface MomoPaymentStatusResponse {
    orderId: string;
    paymentOrderId: string;
    paymentRequestId: string;
    amount: number;
    paymentStatus: PaymentStatus;
    createdAt: Date;
    updatedAt: Date;
}

export interface IPaymentMoMoRepo {
    transaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T>;
    findOrderById(orderId: string): Promise<Order | null>;
    findOrderByPaymentOrderId(paymentOrderId: string): Promise<Order | null>;
    updateOrderPaymentInfo(orderId: string, data: Prisma.OrderUpdateInput): Promise<Order>;
    updateOrderPaymentInfoTx(
        tx: Prisma.TransactionClient,
        orderId: string,
        data: Prisma.OrderUpdateInput,
    ): Promise<Order>;
}
