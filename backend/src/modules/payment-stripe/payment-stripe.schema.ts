import { z } from 'zod'

export const createStripePaymentParamsSchema = z.object({
  orderId: z.string().uuid('Invalid order id')
})

export const stripeSessionParamsSchema = z.object({
  sessionId: z.string().min(1, 'Stripe session id is required')
})