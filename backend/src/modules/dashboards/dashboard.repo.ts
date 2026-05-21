import { PrismaClient } from '@/generated/prisma/client.js';
import prisma from '@/shared/configs/db.config.js';
import { IDashboardRepo } from './dashboard.repo.interface.js';
import { create } from 'node:domain';

export class DashboardRepo implements IDashboardRepo {
	private prisma: PrismaClient = prisma;

	async getTopProducts(limit: number) {
		return this.prisma.orderItem.groupBy({
            where: {
                order: {
                    status: 'DELIVERED',
                    paymentStatus: 'PAID',
                },
            },
			by: ['productName'],
			_sum: { quantity: true },
			orderBy: { _sum: { quantity: 'desc' } },
			take: limit,
		});
	}

	async getOrdersWithinRange(startDate?: Date, endDate?: Date) {
		const where: any = {
            createdAt: {},
        };

		if (startDate) {
			where.createdAt = { ...where.createdAt, gte: startDate };
		} else if (endDate) {
			where.createdAt = { ...where.createdAt, lte: endDate };
		}

		return this.prisma.order.findMany({
			where,
			select: {
				createdAt: true,
				finalPrice: true,
			},
			orderBy: { createdAt: 'asc' },
		});
	}
}
