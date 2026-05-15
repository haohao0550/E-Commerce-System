import { PrismaClient, User, RefreshToken, Prisma } from '@/generated/prisma/client.js';
import { IAuthRepo } from './auth.repo.interface.js';
import prisma from '@/shared/configs/db.config.js';
import { AppError } from '@/shared/errors/app.error.js';

export class AuthRepo implements IAuthRepo {
    private prisma: PrismaClient = prisma;

    async registerUser(data: Prisma.UserCreateInput): Promise<User> {
        return this.prisma.user.create({
            data,
        });
    }

    async updateUser(id: string, data: Prisma.UserUpdateInput): Promise<User> {
        return this.prisma.user.update({
            where: { id },
            data,
        });
    }

    async loginUser(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async findUserByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async logoutUser(id: string): Promise<User> {
        await this.prisma.refreshToken.deleteMany({
            where: { userId: id }
        });

        const user = await this.prisma.user.findUnique({
            where: { id }
        });

        if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
        return user;
    }

    async createRefreshToken(data: Prisma.RefreshTokenCreateInput): Promise<RefreshToken> {
        return this.prisma.refreshToken.create({
            data,
        });
    }

    async findRefreshTokenByJti(jti: string): Promise<RefreshToken | null> {
        return this.prisma.refreshToken.findUnique({
            where: { jti },
        });
    }

    async updateRefreshToken(jti: string, data: Prisma.RefreshTokenUpdateInput): Promise<RefreshToken> {
        return this.prisma.refreshToken.update({
            where: { jti },
            data,
        });
    }

    async findUserById(id: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { id },
        });
    }
}
