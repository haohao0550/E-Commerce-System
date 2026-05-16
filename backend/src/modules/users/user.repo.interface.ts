import { Prisma, User } from '@/generated/prisma/client.js';

export interface IUserRepo {
    findById(id: string): Promise<User | null>;
    findActiveById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findByPhone(phone: string): Promise<User | null>;
    updateById(id: string, data: Prisma.UserUpdateInput): Promise<User>;
    softDeleteById(id: string): Promise<User>;
    revokeRefreshTokens(userId: string): Promise<Prisma.BatchPayload>;
}
