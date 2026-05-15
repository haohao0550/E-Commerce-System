import { User, RefreshToken, Prisma } from '@/generated/prisma/client.js';

export interface IAuthRepo {
    // User
    registerUser(data: Prisma.UserCreateInput): Promise<User>;
    updateUser(id: string, data: Prisma.UserUpdateInput): Promise<User>;
    loginUser(email: string): Promise<User | null>;
    findUserByEmail(email: string): Promise<User | null>;
    findUserById(id: string): Promise<User | null>;
    logoutUser(id: string): Promise<User>;

    // Refresh Token
    createRefreshToken(data: Prisma.RefreshTokenCreateInput): Promise<RefreshToken>;
    findRefreshTokenByJti(jti: string): Promise<RefreshToken | null>;
    updateRefreshToken(jti: string, data: Prisma.RefreshTokenUpdateInput): Promise<RefreshToken>;
}

