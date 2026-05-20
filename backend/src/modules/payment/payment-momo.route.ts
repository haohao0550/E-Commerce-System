import { Router } from 'express'
import { authenticate } from '@/shared/middlewares/authenticate.middlware.js'
import { validateBody, validateParams } from '@/shared/middlewares/validate.middleware.js'
import { paymentMoMoController } from './payment-momo.controller.js'
import {
  createMomoPaymentParamsSchema,
  createMomoPaymentSchema,
  momoStatusParamsSchema
} from './payment-momo.schema.js'

const router = Router()

router.post(
  '/create/:orderId',
  authenticate,
  validateParams(createMomoPaymentParamsSchema),
  validateBody(createMomoPaymentSchema),
  paymentMoMoController.createPayment
)

router.post('/callback', paymentMoMoController.handleCallback)

router.get('/return', paymentMoMoController.handleReturn)

router.get(
  '/status/:paymentOrderId',
  validateParams(momoStatusParamsSchema),
  paymentMoMoController.getPaymentStatus
)

export const paymentMoMoRouter = router