import crypto from 'crypto';
import axios from 'axios';
import type { PaymentStatus } from '@/generated/prisma/client.js';
import { PaymentMoMoRepo } from './payment-momo.repo.js';
import type {
    CreateMomoPaymentResponse,
    IPaymentMoMoRepo,
    MomoPaymentStatusResponse,
    MoMoCallbackBody,
    MoMoCreatePaymentRequest,
    MoMoCreatePaymentResponse,
} from './payment-momo.repo.interface.js';
import { BadRequestError, NotFoundError } from '@/shared/errors/app.error.js';
import { appConfig } from '@/shared/configs/app.config.js';

export class PaymentMoMoService {
    constructor(private readonly paymentRepo: IPaymentMoMoRepo = new PaymentMoMoRepo()) {}

    async createPayment(
        userId: string,
        orderId: string,
        description?: string,
    ): Promise<CreateMomoPaymentResponse> {
        const order = await this.paymentRepo.findOrderById(orderId);

        if (!order || order.userId !== userId) {
            throw new NotFoundError('Order not found');
        }

        if (order.paymentStatus === 'PAID') {
            throw new BadRequestError('Order has already been paid');
        }

        if (order.paymentMethod !== 'MOMO') {
            throw new BadRequestError('This order does not use MoMo payment');
        }

        if (order.status === 'CANCELLED') {
            throw new BadRequestError('Cancelled order cannot be paid');
        }

        const amount = Number(order.finalPrice);

        if (amount < 100000) {
            throw new BadRequestError('Amount must be at least 1,000 VND');
        }

        const paymentOrderId = `MOMO-${order.id}-${Date.now()}`;
        const paymentRequestId = `${paymentOrderId}-REQ`;
        const orderInfo = description || `Payment for order ${order.id}`;

        const requestBody = this.buildPaymentRequest({
            amount,
            orderId: paymentOrderId,
            requestId: paymentRequestId,
            orderInfo,
        });

        const momoResponse = await axios.post<MoMoCreatePaymentResponse>(
            appConfig.MOMO_ENDPOINT,
            requestBody,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            },
        );

        if (momoResponse.data.resultCode !== 0) {
            throw new BadRequestError(momoResponse.data.message || 'Create MoMo payment failed');
        }

        await this.paymentRepo.updateOrderPaymentInfo(order.id, {
            paymentOrderId,
            paymentRequestId,
            paymentOrderInfo: orderInfo,
            paymentStatus: 'UNPAID',
            paymentMethod: 'MOMO',
        });

        return {
            orderId: order.id,
            paymentOrderId,
            paymentRequestId,
            amount,
            payUrl: momoResponse.data.payUrl,
            qrCodeUrl: momoResponse.data.qrCodeUrl,
            deeplink: momoResponse.data.deeplink,
        };
    }

    async handleCallback(body: MoMoCallbackBody): Promise<void> {
        this.verifyCallbackSignature(body);

        await this.paymentRepo.transaction(async (tx) => {
            const order = await tx.order.findFirst({
                where: {
                    paymentOrderId: body.orderId,
                },
            });

            if (!order) {
                throw new Error('Transaction not found');
            }

            if (order.paymentStatus === 'PAID') {
                return;
            }

            if (Number(order.finalPrice) !== Number(body.amount)) {
                throw new Error('Amount mismatch');
            }

            const paymentStatus: PaymentStatus = body.resultCode === 0 ? 'PAID' : 'FAILED';

            await this.paymentRepo.updateOrderPaymentInfoTx(tx, order.id, {
                paymentStatus,
                status: body.resultCode === 0 ? 'PROCESSING' : order.status,
            });
        });
    }

    async getPaymentStatus(paymentOrderId: string): Promise<MomoPaymentStatusResponse> {
        const order = await this.paymentRepo.findOrderByPaymentOrderId(paymentOrderId);

        if (!order) {
            throw new NotFoundError('Order not found');
        }

        return {
            orderId: order.id,
            paymentOrderId: order.paymentOrderId || '',
            paymentRequestId: order.paymentRequestId || '',
            amount: Number(order.finalPrice),
            paymentStatus: order.paymentStatus,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
        };
    }

    private buildPaymentRequest(payload: {
        amount: number;
        orderId: string;
        requestId: string;
        orderInfo: string;
    }): MoMoCreatePaymentRequest {
        const partnerCode = appConfig.MOMO_PARTNER_CODE;
        const accessKey = appConfig.MOMO_ACCESS_KEY;
        const secretKey = appConfig.MOMO_SECRET_KEY;
        const redirectUrl = appConfig.MOMO_REDIRECT_URL;
        const ipnUrl = appConfig.MOMO_IPN_URL;
        const requestType = 'captureWallet';
        const extraData = '';

        const rawSignature =
            `accessKey=${accessKey}` +
            `&amount=${payload.amount}` +
            `&extraData=${extraData}` +
            `&ipnUrl=${ipnUrl}` +
            `&orderId=${payload.orderId}` +
            `&orderInfo=${payload.orderInfo}` +
            `&partnerCode=${partnerCode}` +
            `&redirectUrl=${redirectUrl}` +
            `&requestId=${payload.requestId}` +
            `&requestType=${requestType}`;

        const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

        return {
            partnerCode,
            partnerName: appConfig.MOMO_PARTNER_NAME,
            storeId: appConfig.MOMO_STORE_ID,
            requestId: payload.requestId,
            amount: payload.amount,
            orderId: payload.orderId,
            orderInfo: payload.orderInfo,
            redirectUrl,
            ipnUrl,
            lang: 'vi',
            requestType,
            autoCapture: true,
            extraData,
            signature,
        };
    }

    private verifyCallbackSignature(body: MoMoCallbackBody): void {
        const accessKey = appConfig.MOMO_ACCESS_KEY;
        const secretKey = appConfig.MOMO_SECRET_KEY;

        const rawSignature =
            `accessKey=${accessKey}` +
            `&amount=${body.amount}` +
            `&extraData=${body.extraData}` +
            `&message=${body.message}` +
            `&orderId=${body.orderId}` +
            `&orderInfo=${body.orderInfo}` +
            `&orderType=${body.orderType}` +
            `&partnerCode=${body.partnerCode}` +
            `&payType=${body.payType}` +
            `&requestId=${body.requestId}` +
            `&responseTime=${body.responseTime}` +
            `&resultCode=${body.resultCode}` +
            `&transId=${body.transId}`;

        const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

        if (signature !== body.signature) {
            throw new Error('Invalid signature');
        }
    }

    private getEnv(key: string, defaultValue?: string): string {
        const value = process.env[key] || defaultValue;

        if (!value) {
            throw new Error(`${key} is not configured`);
        }

        return value;
    }
}

export const paymentMoMoService = new PaymentMoMoService();
