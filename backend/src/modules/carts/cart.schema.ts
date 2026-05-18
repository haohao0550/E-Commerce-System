import { z } from 'zod';

export const getCartsQuerySchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const cartIdParamsSchema = z.object({
	id: z.string().uuid('Invalid cart id'),
});

export const addToCartSchema = z.object({
	variantId: z.string().uuid('Invalid variant id'),
	quantity: z.coerce.number().int().min(1).default(1),
});

export const updateCartItemSchema = z.object({
	quantity: z.coerce.number().int().min(1),
});

export const validateCartSchema = z.object({
	items: z
		.array(
			z.object({
				variantId: z.string().uuid('Invalid variant id'),
				quantity: z.coerce.number().int().min(1),
			}),
		)
		.optional(),
});

export type GetCartsQuery = z.infer<typeof getCartsQuerySchema>;
export type CartIdParams = z.infer<typeof cartIdParamsSchema>;
export type AddToCartBody = z.infer<typeof addToCartSchema>;
export type UpdateCartItemBody = z.infer<typeof updateCartItemSchema>;
export type ValidateCartBody = z.infer<typeof validateCartSchema>;
