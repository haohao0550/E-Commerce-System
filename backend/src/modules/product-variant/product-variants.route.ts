import { Router } from 'express'
import { ProductVariantsController } from './product-variants.controller.js'
import {
  createProductVariantSchema,
  getVariantsQuerySchema,
  productIdSchema,
  productVariantIdSchema,
  updateProductVariantSchema
} from './product-variants.schema.js'
import { validateBody, validateParams, validateQuery } from '@/shared/middlewares/validate.middleware.js'
import { authenticate, requireRole } from '@/shared/middlewares/authenticate.middlware.js'
import { auditLog } from '@/shared/middlewares/audit-log.middleware.js'
import { cacheMiddleware } from '@/shared/middlewares/cache.middleware.js'

const productVariantsRoute = Router()
const adminProductVariantsRoute = Router()
const productVariantsController = new ProductVariantsController()

productVariantsRoute.get(
  '/products/:productId/variants',
  auditLog('GET_PRODUCT_VARIANTS_BY_PRODUCT_ID'),
  validateParams(productIdSchema),
  cacheMiddleware('productVariantsByProductId:', 60),
  productVariantsController.getByProductId
)

productVariantsRoute.get(
  '/variants/:id',
  auditLog('GET_PRODUCT_VARIANT_BY_ID'),
  validateParams(productVariantIdSchema),
  cacheMiddleware('productVariantById:', 60),
  productVariantsController.getById
)

adminProductVariantsRoute.use(authenticate, requireRole('ADMIN'))

adminProductVariantsRoute.get(
  '/variants',
  auditLog('ADMIN_GET_PRODUCT_VARIANTS'),
  validateQuery(getVariantsQuerySchema),
  productVariantsController.getAll
)

adminProductVariantsRoute.get(
  '/variants/:id',
  auditLog('ADMIN_GET_PRODUCT_VARIANT_BY_ID'),
  validateParams(productVariantIdSchema),
  productVariantsController.getById
)

adminProductVariantsRoute.post(
  '/products/:productId/variants',
  auditLog('ADMIN_CREATE_PRODUCT_VARIANT'),
  validateParams(productIdSchema),
  validateBody(createProductVariantSchema),
  productVariantsController.create
)

adminProductVariantsRoute.patch(
  '/variants/:id',
  auditLog('ADMIN_UPDATE_PRODUCT_VARIANT'),
  validateParams(productVariantIdSchema),
  validateBody(updateProductVariantSchema),
  productVariantsController.update
)

adminProductVariantsRoute.delete(
  '/variants/:id',
  auditLog('ADMIN_DELETE_PRODUCT_VARIANT'),
  validateParams(productVariantIdSchema),
  productVariantsController.delete
)

export { productVariantsRoute, adminProductVariantsRoute }