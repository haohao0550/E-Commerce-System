import Stripe from 'stripe'
import * as appError from '@/shared/errors/app.error.js'
import { appConfig } from '@/shared/configs/app.config.js'
import { PaymentStripeRepo } from './payment-stripe.repo.js'
import type {
  CreateStripePaymentResponse,
  IPaymentStripeRepo,
  StripePaymentStatusResponse
} from './payment-stripe.repo.interface.js'

export class PaymentStripeService {
  private readonly stripe: Stripe

  constructor(private readonly paymentRepo: IPaymentStripeRepo = new PaymentStripeRepo()) {
    this.stripe = new Stripe(appConfig.STRIPE_SECRET_KEY)
  }

  async createCheckoutSession(userId: string, orderId: string): Promise<CreateStripePaymentResponse> {
    const order = await this.paymentRepo.findOrderById(orderId)

    if (!order || order.userId !== userId) {
      throw new appError.NotFoundError('Order not found')
    }

    if (order.paymentStatus === 'PAID') {
      throw new appError.BadRequestError('Order has already been paid')
    }

    if (order.paymentMethod !== 'STRIPE') {
      throw new appError.BadRequestError('This order does not use Stripe payment')
    }

    if (order.status === 'CANCELLED') {
      throw new appError.BadRequestError('Cancelled order cannot be paid')
    }

    const amount = Number(order.finalPrice)

    if (amount <= 0) {
      throw new appError.BadRequestError('Invalid payment amount')
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      success_url: appConfig.STRIPE_SUCCESS_URL,
      cancel_url: appConfig.STRIPE_CANCEL_URL,
      client_reference_id: order.id,
      metadata: {
        orderId: order.id,
        userId
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: appConfig.STRIPE_CURRENCY,
            unit_amount: this.toStripeAmount(amount),
            product_data: {
              name: `Order ${order.id}`
            }
          }
        }
      ]
    })

    if (!session.url) {
      throw new appError.BadRequestError('Create Stripe checkout session failed')
    }

    const paymentIntentId =
      typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id || null

    await this.paymentRepo.updateOrder(order.id, {
      stripeCheckoutSessionId: session.id,
      stripePaymentIntentId: paymentIntentId,
      paymentOrderInfo: `Stripe checkout session ${session.id}`,
      paymentStatus: 'UNPAID',
      paymentMethod: 'STRIPE'
    })

    return {
      orderId: order.id,
      checkoutSessionId: session.id,
      paymentIntentId,
      checkoutUrl: session.url,
      amount,
      currency: appConfig.STRIPE_CURRENCY
    }
  }

  async handleWebhook(rawBody: Buffer, signature?: string): Promise<void> {
    if (!signature) {
      throw new Error('Missing Stripe signature')
    }

    const event = this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      appConfig.STRIPE_WEBHOOK_SECRET
    )

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'checkout.session.expired':
        await this.handleCheckoutSessionExpired(event.data.object as Stripe.Checkout.Session)
        break

      case 'payment_intent.payment_failed':
        await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
        break

      default:
        break
    }
  }

  async getPaymentStatus(sessionId: string): Promise<StripePaymentStatusResponse> {
    const order = await this.paymentRepo.findOrderByStripeSessionId(sessionId)

    if (!order) {
      throw new appError.NotFoundError('Order not found')
    }

    return {
      orderId: order.id,
      checkoutSessionId: order.stripeCheckoutSessionId || '',
      paymentIntentId: order.stripePaymentIntentId,
      amount: Number(order.finalPrice),
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }
  }

  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const orderId = session.metadata?.orderId || session.client_reference_id

    if (!orderId) {
      throw new Error('Order id not found in Stripe session')
    }

    await this.paymentRepo.transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId }
      })

      if (!order) {
        throw new Error('Order not found')
      }

      if (order.paymentStatus === 'PAID') {
        return
      }

      const paidAmount = session.amount_total || 0
      const expectedAmount = this.toStripeAmount(Number(order.finalPrice))

      if (paidAmount !== expectedAmount) {
        throw new Error('Amount mismatch')
      }

      const paymentIntentId =
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id || order.stripePaymentIntentId

      await this.paymentRepo.updateOrderTx(tx, order.id, {
        paymentStatus: 'PAID',
        status: 'PROCESSING',
        stripeCheckoutSessionId: session.id,
        stripePaymentIntentId: paymentIntentId
      })
    })
  }

  private async handleCheckoutSessionExpired(session: Stripe.Checkout.Session): Promise<void> {
    const order = await this.paymentRepo.findOrderByStripeSessionId(session.id)

    if (!order || order.paymentStatus === 'PAID') {
      return
    }

    await this.paymentRepo.updateOrder(order.id, {
      paymentStatus: 'FAILED'
    })
  }

  private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const order = await this.paymentRepo.findOrderByStripeSessionId(
      String(paymentIntent.metadata?.checkoutSessionId || '')
    )

    if (!order || order.paymentStatus === 'PAID') {
      return
    }

    await this.paymentRepo.updateOrder(order.id, {
      paymentStatus: 'FAILED',
      stripePaymentIntentId: paymentIntent.id
    })
  }

  private toStripeAmount(amount: number): number {
    return Math.round(amount)
  }
}

export const paymentStripeService = new PaymentStripeService()