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

const productVariantsRoute = Router()
const adminProductVariantsRoute = Router()
const productVariantsController = new ProductVariantsController()

productVariantsRoute.get(
  '/products/:productId/variants',
  validateParams(productIdSchema),
  productVariantsController.getByProductId
)

productVariantsRoute.get(
  '/variants/:id',
  validateParams(productVariantIdSchema),
  productVariantsController.getById
)

adminProductVariantsRoute.use(authenticate, requireRole('ADMIN'))

adminProductVariantsRoute.get(
  '/variants',
  validateQuery(getVariantsQuerySchema),
  productVariantsController.getAll
)

adminProductVariantsRoute.get(
  '/variants/:id',
  validateParams(productVariantIdSchema),
  productVariantsController.getById
)

adminProductVariantsRoute.post(
  '/products/:productId/variants',
  validateParams(productIdSchema),
  validateBody(createProductVariantSchema),
  productVariantsController.create
)

adminProductVariantsRoute.patch(
  '/variants/:id',
  validateParams(productVariantIdSchema),
  validateBody(updateProductVariantSchema),
  productVariantsController.update
)

adminProductVariantsRoute.delete(
  '/variants/:id',
  validateParams(productVariantIdSchema),
  productVariantsController.delete
)

export { productVariantsRoute, adminProductVariantsRoute }