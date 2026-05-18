import { Prisma } from '@/generated/prisma/client.js';

export interface ICouponRepo {
    findById(id: string): Promise<any | null>;
    findByCode(code: string): Promise<any | null>;
    findMany(where: Prisma.CouponWhereInput, skip: number, take: number): Promise<any[]>;
    count(where: Prisma.CouponWhereInput): Promise<number>;
    create(data: Prisma.CouponCreateInput): Promise<any>;
    update(id: string, data: Prisma.CouponUpdateInput): Promise<any>;
    delete(id: string): Promise<any>;
}
