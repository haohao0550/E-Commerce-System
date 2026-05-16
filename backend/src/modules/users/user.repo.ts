import { PrismaClient, Prisma, User } from '@/generated/prisma/client.js';
import prisma from '@/shared/configs/db.config.js';
import { IUserRepo } from './user.repo.interface.js';

export class UserRepo implements IUserRepo {
    private prisma: PrismaClient = prisma;

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
