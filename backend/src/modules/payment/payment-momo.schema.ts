import { z } from 'zod'

export const createMomoPaymentParamsSchema = z.object({
  orderId: z.string().uuid('Invalid order id')
})

export const momoStatusParamsSchema = z.object({
  paymentOrderId: z.string().min(1, 'Payment order id is required')
})

export const createMomoPaymentSchema = z.object({
  description: z.string().trim().optional()
})