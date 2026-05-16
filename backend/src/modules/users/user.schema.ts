import { z } from 'zod';

export const updateProfileSchema = z
    .object({
        email: z.string().email('Invalid email format').optional(),
        name: z
            .string()
            .min(2, 'Name must be at least 2 characters')
            .max(100, 'Name must be at most 100 characters')
            .nullable()
            .optional(),
        phone: z
            .string()
            .regex(/^[0-9]{10,11}$/, 'Invalid phone number format')
            .nullable()
            .optional(),
        avatar: z.string().url('Invalid avatar URL').nullable().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: 'At least one field must be provided',
    });

export const changePasswordSchema = z
    .object({
        oldPassword: z.string().min(6, 'Old password must be at least 6 characters'),
        newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    })
    .refine((data) => data.oldPassword !== data.newPassword, {
        message: 'New password must be different from old password',
        path: ['newPassword'],
    });

export const userIdParamSchema = z.object({
    id: z.string().uuid('Invalid user id'),
});

export const updateUserRoleSchema = z.object({
    role: z.enum(['USER', 'ADMIN']),
});

export const getUsersQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().trim().min(1).optional(),
    role: z.enum(['USER', 'ADMIN']).optional(),
    isDeleted: z
        .enum(['true', 'false'])
        .transform((value) => value === 'true')
        .optional(),
});
