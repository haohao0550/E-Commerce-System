import express, { Router } from 'express'
import { authenticate } from '@/shared/middlewares/authenticate.middlware.js'
import { validateParams } from '@/shared/middlewares/validate.middleware.js'
import { paymentStripeController } from './payment-stripe.controller.js'
import {
  createStripePaymentParamsSchema,
  stripeSessionParamsSchema
} from './payment-stripe.schema.js'

const router = Router()

router.post(
  '/create/:orderId',
  authenticate,
  validateParams(createStripePaymentParamsSchema),
  paymentStripeController.createCheckoutSession
)

router.get(
  '/status/:sessionId',
  validateParams(stripeSessionParamsSchema),
  paymentStripeController.getPaymentStatus
)

export const paymentStripeRouter = router