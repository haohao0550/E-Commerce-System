import { z } from 'zod';
import { OrderStatus, PaymentMethod, PaymentStatus } from '@/generated/prisma/client.js';

export const orderIdSchema = z.object({
  id: z.string().uuid('Invalid order id')
});

export const getOrdersQuerySchema = z.object({
  userId: z.string().uuid('Invalid user id').optional(),
  status: z.nativeEnum(OrderStatus).optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(10),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
});

export const createOrderItemSchema = z.object({
  variantId: z.string().uuid('Invalid variant id'),
  quantity: z.number().int().positive('Quantity must be greater than 0')
});

export const shippingAddressSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  phone: z.string().regex(/^[0-9]{10,11}$/, 'Invalid phone number format'),
  street: z.string().min(5, 'Street must be at least 5 characters').max(200),
  ward: z.string().min(2).max(100).optional(),
  province: z.string().min(2).max(100),
});

export const createOrderSchema = z.object({
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
  shippingAddress: shippingAddressSchema,
  couponId: z.string().uuid('Invalid coupon id').optional(),
  note: z.string().max(500, 'Note cannot exceed 500 characters').optional(),
  items: z.array(createOrderItemSchema).min(1, 'Order must contain at least one item')
});

export const updateOrderSchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  shippingAddress: shippingAddressSchema.optional(),
  note: z.string().max(500).optional()
});

export type OrderIdParams = z.infer<typeof orderIdSchema>;
export type GetOrdersQuery = z.infer<typeof getOrdersQuerySchema>;
export type CreateOrderBody = z.infer<typeof createOrderSchema>;
export type UpdateOrderBody = z.infer<typeof updateOrderSchema>;
