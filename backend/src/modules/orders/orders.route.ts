import { Router } from 'express'
import { asyncHandler } from '@/shared/errors/async-handler.error.js'
import { OrdersController } from './orders.controller.js'
import { authenticate, requireRole } from '@/shared/middlewares/authenticate.middlware.js'
import { validateBody, validateParams, validateQuery } from '@/shared/middlewares/validate.middleware.js'
import { auditLog } from '@/shared/middlewares/audit-log.middleware.js'
import {
  orderIdSchema,
  getOrdersQuerySchema,
  createOrderSchema,
  updateOrderSchema
} from './orders.schema.js'

export const orderRoutes = Router()
export const adminOrderRoutes = Router()

const ordersController = new OrdersController()

orderRoutes.use(authenticate)

orderRoutes.post(
  '/',
  auditLog('order.createOrder'),
  validateBody(createOrderSchema),
  asyncHandler(ordersController.createOrder)
)

orderRoutes.get(
  '/',
  auditLog('order.getUserOrders'),
  validateQuery(getOrdersQuerySchema),
  asyncHandler(ordersController.getUserOrders)
)

orderRoutes.get(
  '/:id',
  auditLog('order.getUserOrderById'),
  validateParams(orderIdSchema),
  asyncHandler(ordersController.getUserOrderById)
)

orderRoutes.patch(
  '/:id/cancel',
  auditLog('order.cancelOrder'),
  validateParams(orderIdSchema),
  asyncHandler(ordersController.cancelOrder)
)



adminOrderRoutes.use(authenticate, requireRole('ADMIN'))

adminOrderRoutes.get(
  '/',
  auditLog('admin.order.getAllOrders'),
  validateQuery(getOrdersQuerySchema),
  asyncHandler(ordersController.getAllOrders)
)

adminOrderRoutes.get(
  '/:id',
  auditLog('admin.order.getOrderById'),
  validateParams(orderIdSchema),
  asyncHandler(ordersController.getOrderById)
)

adminOrderRoutes.patch(
  '/:id/status',
  auditLog('admin.order.updateOrderStatus'),
  validateParams(orderIdSchema),
  validateBody(updateOrderSchema),
  asyncHandler(ordersController.updateOrderStatus)
)

adminOrderRoutes.patch(
  '/:id/payment-status',
  auditLog('admin.order.updatePaymentStatus'),
  validateParams(orderIdSchema),
  validateBody(updateOrderSchema),
  asyncHandler(ordersController.updatePaymentStatus)
)
