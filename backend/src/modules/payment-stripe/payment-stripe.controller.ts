import type { Request, Response } from 'express'
import { asyncHandler } from '@/shared/errors/async-handler.error.js'
import { paymentStripeService } from './payment-stripe.service.js'

export class PaymentStripeController {
  createCheckoutSession = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id || req.user?.userId
    const { orderId } = req.params

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      })
    }

    const result = await paymentStripeService.createCheckoutSession(userId, orderId as string)

    return res.status(200).json({
      success: true,
      message: 'Create Stripe checkout session successfully',
      data: result
    })
  })

  handleWebhook = asyncHandler(async (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'] as string | undefined

    await paymentStripeService.handleWebhook(req.body as Buffer, signature)

    return res.status(200).json({
      received: true
    })
  })

  getPaymentStatus = asyncHandler(async (req: Request, res: Response) => {
    const { sessionId } = req.params
    const result = await paymentStripeService.getPaymentStatus(sessionId as string)

    return res.status(200).json({
      success: true,
      message: 'Get Stripe payment status successfully',
      data: result
    })
  })
}

export const paymentStripeController = new PaymentStripeController()