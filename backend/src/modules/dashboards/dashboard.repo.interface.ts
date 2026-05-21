import { Prisma } from '@/generated/prisma/client.js';

export interface IDashboardRepo {
    getTopProducts(limit: number): Promise<
        Array<{
            productName: string;
            _sum: { quantity: number | null } | null;
        }>
    >;

    getOrdersWithinRange(startDate?: Date, endDate?: Date): Promise<
        Array<{
            createdAt: Date;
            finalPrice: Prisma.Decimal | number | null;
        }>
    >;
}