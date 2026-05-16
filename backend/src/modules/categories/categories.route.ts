import { Router } from 'express'
import { CategoriesController } from './categories.controller.js'
import {
  categoryIdSchema,
  createCategorySchema,
  updateCategorySchema
} from './categories.schema.js'
import { validateBody, validateParams } from '@/shared/middlewares/validate.middleware.js'
import { requireRole, authenticate } from '@/shared/middlewares/authenticate.middlware.js'
import { auditLog } from '@/shared/middlewares/audit-log.middleware.js'

const router = Router()
const categoriesController = new CategoriesController()

router.get('/',auditLog('category.getAllCategories'), categoriesController.getAll)

router.get('/slug/:slug', auditLog('category.getBySlug'), categoriesController.getBySlug)

router.get('/:id', auditLog('category.getById'), validateParams(categoryIdSchema), categoriesController.getById)

router.post(
  '/',
  authenticate,
  requireRole('ADMIN'),
  auditLog('category.create'),
  validateBody(createCategorySchema),
  categoriesController.create
)

router.patch(
  '/:id',
  authenticate,
  requireRole('ADMIN'),
  auditLog('category.update'),
  validateParams(categoryIdSchema),
  validateBody(updateCategorySchema),
  categoriesController.update
)

router.delete(
  '/:id',
  authenticate,
  requireRole('ADMIN'),
  auditLog('category.delete'),
  validateParams(categoryIdSchema),
  categoriesController.delete
)

export default router