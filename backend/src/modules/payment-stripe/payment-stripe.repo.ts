import type { Order, Prisma, PrismaClient } from '@/generated/prisma/client.js'
import prisma from '@/shared/configs/db.config.js'
import type { IPaymentStripeRepo } from './payment-stripe.repo.interface.js'

export class PaymentStripeRepo implements IPaymentStripeRepo {
  private readonly prisma: PrismaClient = prisma

  async transaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(fn)
  }

  async findOrderById(orderId: string): Promise<Order | null> {
    return this.prisma.order.findUnique({
      where: { id: orderId }
    })
  }

  async findOrderByStripeSessionId(sessionId: string): Promise<Order | null> {
    return this.prisma.order.findFirst({
      where: {
        stripeCheckoutSessionId: sessionId
      }
    })
  }

  async updateOrder(orderId: string, data: Prisma.OrderUpdateInput): Promise<Order> {
    return this.prisma.order.update({
      where: { id: orderId },
      data
    })
  }

  async updateOrderTx(
    tx: Prisma.TransactionClient,
    orderId: string,
    data: Prisma.OrderUpdateInput
  ): Promise<Order> {
    return tx.order.update({
      where: { id: orderId },
      data
    })
  }
}