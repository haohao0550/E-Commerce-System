import zod from 'zod';

export const createAddressSchema = zod.object({
    fullName: zod.string().min(2).max(100),
    phone: zod.string().regex(/^[0-9]{10,11}$/, 'Invalid phone number format'),
    street: zod.string().min(5).max(200),
    ward: zod.string().min(2).max(100).optional(),
    district: zod.string().min(2).max(100).nullable().optional(),
    province: zod.string().min(2).max(100),
    isDefault: zod.boolean().optional(),
});

export const updateAddressParamsSchema = zod.object({
    id: zod.string().uuid('Invalid address ID format'),
});

export const updateAddressSchema = zod.object({
    fullName: zod.string().min(2).max(100).optional(),
    phone: zod.string().regex(/^[0-9]{10,11}$/, 'Invalid phone number format').optional(),
    street: zod.string().min(5).max(200).optional(),
    ward: zod.string().min(2).max(100).optional(),
    district: zod.string().min(2).max(100).nullable().optional(),
    province: zod.string().min(2).max(100).optional(),
    isDefault: zod.boolean().optional(),
});

export const setDefaultAddressSchema = zod.object({
    isDefault: zod.literal(true),
});

export const getAddressListSchema = zod.object({
    page: zod.coerce.number().default(1),
    limit: zod.coerce.number().max(100).default(10),
    search: zod.string().min(1).max(100).optional(),
});


export const deleteAddressParamsSchema = updateAddressParamsSchema