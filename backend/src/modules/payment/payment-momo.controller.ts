import type { Request, Response } from 'express'
import { asyncHandler } from '@/shared/errors/async-handler.error.js'
import { paymentMoMoService } from './payment-momo.service.js'
import type { MoMoCallbackBody } from './payment-momo.repo.interface.js'

export class PaymentMoMoController {
  createPayment = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId
    const { orderId } = req.params
    const { description } = req.body

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      })
    }

    const result = await paymentMoMoService.createPayment(userId, orderId as string, description)

    return res.status(200).json({
      success: true,
      message: 'Create MoMo payment successfully',
      data: result
    })
  })

  handleCallback = asyncHandler(async (req: Request, res: Response) => {
    const callbackBody = req.body as MoMoCallbackBody

    try {
      await paymentMoMoService.handleCallback(callbackBody)

      return res.status(200).json({
        message: 'OK'
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : ''
      const logicErrors = ['Invalid signature', 'Amount mismatch', 'Transaction not found']
      const isLogicError = logicErrors.some((logicError) => message.includes(logicError))

      if (isLogicError) {
        return res.status(200).json({
          message: 'Error acknowledged'
        })
      }

      return res.status(500).json({
        message: 'Server busy'
      })
    }
  })

  handleReturn = asyncHandler(async (req: Request, res: Response) => {
    const { orderId, resultCode, message } = req.query
    const frontendUrl = process.env.FRONTEND_PAYMENT_RESULT_URL || 'http://localhost:3000/payment-result'

    return res.redirect(
      `${frontendUrl}?paymentOrderId=${orderId}&resultCode=${resultCode}&message=${encodeURIComponent(
        String(message || '')
      )}&methodPayment=MOMO`
    )
  })

  getPaymentStatus = asyncHandler(async (req: Request, res: Response) => {
    const { paymentOrderId } = req.params
    const result = await paymentMoMoService.getPaymentStatus(paymentOrderId as string)

    return res.status(200).json({
      success: true,
      message: 'Get MoMo payment status successfully',
      data: result
    })
  })
}

export const paymentMoMoController = new PaymentMoMoController()