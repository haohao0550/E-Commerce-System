import type { Order, Prisma } from '@/generated/prisma/client.js'

export interface CreateStripePaymentResponse {
  orderId: string
  checkoutSessionId: string
  paymentIntentId: string | null
  checkoutUrl: string
  amount: number
  currency: string
}

export interface StripePaymentStatusResponse {
  orderId: string
  checkoutSessionId: string
  paymentIntentId: string | null
  amount: number
  paymentStatus: string
  createdAt: Date
  updatedAt: Date
}

export interface IPaymentStripeRepo {
  transaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T>
  findOrderById(orderId: string): Promise<Order | null>
  findOrderByStripeSessionId(sessionId: string): Promise<Order | null>
  updateOrder(orderId: string, data: Prisma.OrderUpdateInput): Promise<Order>
  updateOrderTx(tx: Prisma.TransactionClient, orderId: string, data: Prisma.OrderUpdateInput): Promise<Order>
}