import { PrismaClient, Prisma, User } from '@/generated/prisma/client.js';
import prisma from '@/shared/configs/db.config.js';
import { IUserRepo } from './user.repo.interface.js';

export class UserRepo implements IUserRepo {
    private prisma: PrismaClient = prisma;

    async findMany(where: Prisma.UserWhereInput, skip: number, take: number): Promise<User[]> {
        return this.prisma.user.findMany({
            where,
            skip,
            take,
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async count(where: Prisma.UserWhereInput): Promise<number> {
        return this.prisma.user.count({
            where,
        });
    }

    async findById(id: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { id },
        });
    }

    async findActiveById(id: string): Promise<User | null> {
        return this.prisma.user.findFirst({
            where: {
                id,
                isDeleted: false,
            },
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async findByPhone(phone: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { phone },
        });
    }

    async updateById(id: string, data: Prisma.UserUpdateInput): Promise<User> {
        return this.prisma.user.update({
            where: { id },
            data,
        });
    }

    async softDeleteById(id: string): Promise<User> {
        return this.prisma.user.update({
            where: { id },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        });
    }

    async restoreById(id: string): Promise<User> {
        return this.prisma.user.update({
            where: { id },
            data: {
                isDeleted: false,
                deletedAt: null,
            },
        });
    }

    async revokeRefreshTokens(userId: string): Promise<Prisma.BatchPayload> {
        return this.prisma.refreshToken.updateMany({
            where: {
                userId,
                revoked: false,
            },
            data: {
                revoked: true,
            },
        });
    }
}
