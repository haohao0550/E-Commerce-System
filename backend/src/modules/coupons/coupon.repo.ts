import { Prisma } from '@/generated/prisma/client.js';
import prisma from '@/shared/configs/db.config.js';
import { ICouponRepo } from './coupon.repo.interface.js';

export class CouponRepo implements ICouponRepo {
    findById(id: string) {
        return prisma.coupon.findUnique({
            where: { id },
        });
    }

    findByCode(code: string) {
        return prisma.coupon.findUnique({
            where: { code },
        });
    }

    findMany(where: Prisma.CouponWhereInput, skip: number, take: number) {
        return prisma.coupon.findMany({
            where,
            skip,
            take,
            orderBy: { createdAt: 'desc' },
        });
    }

    count(where: Prisma.CouponWhereInput) {
        return prisma.coupon.count({ where });
    }

    create(data: Prisma.CouponCreateInput) {
        return prisma.coupon.create({ data });
    }

    update(id: string, data: Prisma.CouponUpdateInput) {
        return prisma.coupon.update({
            where: { id },
            data,
        });
    }

    delete(id: string) {
        return prisma.coupon.delete({
            where: { id },
        });
    }
}
