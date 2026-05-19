import * as argon2 from 'argon2';
import { Prisma } from '@/generated/prisma/client.js';
import { AppError, NotFoundError, UnauthorizedError } from '@/shared/errors/app.error.js';
import {
    ChangePasswordInput,
    GetUsersQuery,
    UpdateProfileInput,
    UpdateUserRoleInput,
} from './user.dto.js';
import { UserRepo } from './user.repo.js';

export class UserService {
    private userRepo: UserRepo;

    constructor() {
        this.userRepo = new UserRepo();
    }

    private toPublicUser(user: any) {
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            avatar: user.avatar,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }

    private toAdminUser(user: any) {
        return {
            ...this.toPublicUser(user),
            isDeleted: user.isDeleted,
            deletedAt: user.deletedAt,
        };
    }

    async getProfile(userId: string) {
        const user = await this.userRepo.findActiveById(userId);
        if (!user) {
            throw new NotFoundError('User');
        }

        return this.toPublicUser(user);
    }

    async updateProfile(userId: string, input: UpdateProfileInput) {
        const currentUser = await this.userRepo.findActiveById(userId);
        if (!currentUser) {
            throw new NotFoundError('User');
        }

        if (input.email && input.email !== currentUser.email) {
            const existingUser = await this.userRepo.findByEmail(input.email);
            if (existingUser && existingUser.id !== userId) {
                throw new AppError('Email already exists in the system', 400, 'EMAIL_EXISTS');
            }
        }

        if (input.phone && input.phone !== currentUser.phone) {
            const existingUser = await this.userRepo.findByPhone(input.phone);
            if (existingUser && existingUser.id !== userId) {
                throw new AppError('Phone already exists in the system', 400, 'PHONE_EXISTS');
            }
        }

        try {
            const updatedUser = await this.userRepo.updateById(userId, input);
            return this.toPublicUser(updatedUser);
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    const target = Array.isArray(error.meta?.target)
                        ? error.meta.target.join(', ')
                        : 'field';
                    throw new AppError(
                        `${target} already exists in the system`,
                        400,
                        'DUPLICATE_FIELD',
                    );
                }

                if (error.code === 'P2025') {
                    throw new NotFoundError('User');
                }
            }

            throw error;
        }
    }

    async changePassword(userId: string, input: ChangePasswordInput) {
        const user = await this.userRepo.findActiveById(userId);
        if (!user) {
            throw new NotFoundError('User');
        }

        const isPasswordValid = await argon2.verify(user.password, input.oldPassword);
        if (!isPasswordValid) {
            throw new UnauthorizedError('Old password is incorrect');
        }

        const hashedPassword = await argon2.hash(input.newPassword);
        await this.userRepo.updateById(userId, { password: hashedPassword });
        await this.userRepo.revokeRefreshTokens(userId);
    }

    async deleteAccount(userId: string) {
        const user = await this.userRepo.findActiveById(userId);
        if (!user) {
            throw new NotFoundError('User');
        }

        await this.userRepo.softDeleteById(userId);
        await this.userRepo.revokeRefreshTokens(userId);
    }

    async getUsers(query: GetUsersQuery) {
        const where: Prisma.UserWhereInput = {};

        if (query.search) {
            where.OR = [
                { email: { contains: query.search, mode: 'insensitive' } },
                { name: { contains: query.search, mode: 'insensitive' } },
                { phone: { contains: query.search, mode: 'insensitive' } },
            ];
        }

        if (query.role) {
            where.role = query.role;
        }

        if (typeof query.isDeleted === 'boolean') {
            where.isDeleted = query.isDeleted;
        }

        const skip = (query.page - 1) * query.limit;
        const [users, total] = await Promise.all([
            this.userRepo.findMany(where, skip, query.limit),
            this.userRepo.count(where),
        ]);

        return {
            users: users.map((user) => this.toAdminUser(user)),
            pagination: {
                page: query.page,
                limit: query.limit,
                total,
                totalPages: Math.ceil(total / query.limit),
            },
        };
    }

    async getUserById(id: string) {
        const user = await this.userRepo.findById(id);
        if (!user) {
            throw new NotFoundError('User');
        }

        return this.toAdminUser(user);
    }

    async updateUserRole(id: string, input: UpdateUserRoleInput) {
        const user = await this.userRepo.findById(id);
        if (!user) {
            throw new NotFoundError('User');
        }

        const updatedUser = await this.userRepo.updateById(id, { role: input.role });
        return this.toAdminUser(updatedUser);
    }

    async deleteUserByAdmin(id: string) {
        const user = await this.userRepo.findById(id);
        if (!user) {
            throw new NotFoundError('User');
        }

        if (user.isDeleted) {
            return this.toAdminUser(user);
        }

        const deletedUser = await this.userRepo.softDeleteById(id);
        await this.userRepo.revokeRefreshTokens(id);

        return this.toAdminUser(deletedUser);
    }

    async restoreUserByAdmin(id: string) {
        const user = await this.userRepo.findById(id);
        if (!user) {
            throw new NotFoundError('User');
        }

        if (!user.isDeleted) {
            return this.toAdminUser(user);
        }

        const restoredUser = await this.userRepo.restoreById(id);
        return this.toAdminUser(restoredUser);
    }
}
