import { PrismaClient, Prisma, UserAddress } from '@/generated/prisma/client.js';
import prisma from '@/shared/configs/db.config.js';
import { IAddressRepo } from './address.repo.interface.js';

export class AddressRepo implements IAddressRepo {
    private prisma: PrismaClient = prisma;

    async count(where: Prisma.UserAddressWhereInput): Promise<number> {
        return this.prisma.userAddress.count({
            where,
        });
    }

    async findAllByUserId(where: Prisma.UserAddressWhereInput, skip: number, take: number): Promise<UserAddress[]> {
        return await this.prisma.userAddress.findMany({
            where,
            orderBy: {
                createdAt: 'desc',
            },
            skip,
            take,
        });
    }

    async findById(id: string): Promise<UserAddress | null> {
        return this.prisma.userAddress.findUnique({
            where: { id },
        });
    }

    async create(data: Prisma.UserAddressCreateInput): Promise<UserAddress> {
        return this.prisma.userAddress.create({
            data,
        });
    }

    async update(id: string, data: Prisma.UserAddressUpdateInput): Promise<UserAddress> {
        return this.prisma.userAddress.update({
            where: { id },
            data,
        });
    }

    async delete(id: string): Promise<void> {
        await this.prisma.userAddress.delete({
            where: { id },
        });
    }
}