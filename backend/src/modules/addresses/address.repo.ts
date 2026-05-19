import { PrismaClient, Prisma, UserAddress } from '@/generated/prisma/client.js';
import prisma from '@/shared/configs/db.config.js';
import { IAddressRepo } from './address.repo.interface.js';

export class AddressRepo implements IAddressRepo {
    private prisma: PrismaClient = prisma;

    private getClient(tx?: Prisma.TransactionClient) {
        return tx ?? this.prisma;
    }

    async transaction<T>(fn: (prisma: Prisma.TransactionClient) => Promise<T>): Promise<T> {
        return this.prisma.$transaction(fn);
    }

    async count(where: Prisma.UserAddressWhereInput): Promise<number> {
        return this.prisma.userAddress.count({
            where,
        });
    }

    async findAllByUserId(
        where: Prisma.UserAddressWhereInput,
        skip: number,
        take: number,
    ): Promise<UserAddress[]> {
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

    async findDefaultByUserId(userId: string): Promise<UserAddress | null> {
        return this.prisma.userAddress.findFirst({
            where: {
                userId,
                isDefault: true,
            },
        });
    }

    async create(
        data: Prisma.UserAddressCreateInput,
        tx?: Prisma.TransactionClient,
    ): Promise<UserAddress> {
        return this.getClient(tx).userAddress.create({
            data,
        });
    }

    async update(
        id: string,
        data: Prisma.UserAddressUpdateInput,
        tx?: Prisma.TransactionClient,
    ): Promise<UserAddress> {
        return this.getClient(tx).userAddress.update({
            where: { id },
            data,
        });
    }

    async updateMany(
        where: Prisma.UserAddressWhereInput,
        data: Prisma.UserAddressUpdateManyMutationInput,
        tx?: Prisma.TransactionClient,
    ): Promise<Prisma.BatchPayload> {
        return this.getClient(tx).userAddress.updateMany({
            where,
            data,
        });
    }

    async delete(id: string): Promise<void> {
        await this.prisma.userAddress.delete({
            where: { id },
        });
    }
}
