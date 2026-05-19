import { Router } from 'express';
import { ProductsController } from './products.controller.js';
import {
    createProductSchema,
    getProductsQuerySchema,
    productIdSchema,
    productSlugSchema,
    updateProductSchema,
} from './products.schema.js';
import {
    validateBody,
    validateParams,
    validateQuery,
} from '@/shared/middlewares/validate.middleware.js';
import { authenticate, requireRole } from '@/shared/middlewares/authenticate.middlware.js';
import { auditLog } from '@/shared/middlewares/audit-log.middleware.js';
import { cacheMiddleware } from '@/shared/middlewares/cache.middleware.js';

const router = Router();
const productsController = new ProductsController();

router.get(
    '/',
    auditLog('product.getAllProducts'),
    validateQuery(getProductsQuerySchema),
    cacheMiddleware('products:', 60),
    productsController.getAll,
);

router.get(
    '/:id',
    auditLog('product.getProductById'),
    validateParams(productIdSchema),
    cacheMiddleware('productById:', 60),
    productsController.getProductById,
);

router.post(
    '/',
    authenticate,
    requireRole('ADMIN'),
    auditLog('product.createProduct'),
    validateBody(createProductSchema),
    productsController.create,
);

router.patch(
    '/:id',
    authenticate,
    requireRole('ADMIN'),
    auditLog('product.updateProduct'),
    validateParams(productIdSchema),
    validateBody(updateProductSchema),
    productsController.update,
);

router.delete(
    '/:id',
    authenticate,
    requireRole('ADMIN'),
    auditLog('product.deleteProduct'),
    validateParams(productIdSchema),
    productsController.delete,
);

router.patch(
    '/:id/restore',
    authenticate,
    requireRole('ADMIN'),
    auditLog('product.restoreProduct'),
    validateParams(productIdSchema),
    productsController.restore,
);

router.get(
    '/:slug',
    auditLog('product.getProductBySlug'),
    validateParams(productSlugSchema),
    cacheMiddleware('productBySlug:', 60),
    productsController.getBySlug,
);

export default router;
