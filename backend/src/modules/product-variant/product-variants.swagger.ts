/**
 * @swagger
 * tags:
 *   - name: Variants
 *     description: Public product variant endpoints
 *   - name: Admin Variant
 *     description: Admin product variant management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ProductVariant:
 *       type: object
 *       required: [id, productId, sku, price, stock]
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         productId:
 *           type: string
 *           format: uuid
 *         sku:
 *           type: string
 *           example: NIKE-AF1-WHITE-42
 *         color:
 *           type: string
 *           nullable: true
 *           example: White
 *         size:
 *           type: string
 *           nullable: true
 *           example: "42"
 *         price:
 *           type: number
 *           example: 2500000
 *         stock:
 *           type: integer
 *           example: 100
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateProductVariantRequest:
 *       type: object
 *       required: [sku, price]
 *       properties:
 *         sku:
 *           type: string
 *           example: NIKE-AF1-WHITE-42
 *         color:
 *           type: string
 *           example: White
 *         size:
 *           type: string
 *           example: "42"
 *         price:
 *           type: number
 *           example: 2500000
 *         stock:
 *           type: integer
 *           example: 100
 *     UpdateProductVariantRequest:
 *       type: object
 *       properties:
 *         sku:
 *           type: string
 *           example: NIKE-AF1-WHITE-43
 *         color:
 *           type: string
 *           nullable: true
 *           example: White
 *         size:
 *           type: string
 *           nullable: true
 *           example: "43"
 *         price:
 *           type: number
 *           example: 2600000
 *         stock:
 *           type: integer
 *           example: 80
 */

/**
 * @swagger
 * /products/{productId}/variants:
 *   get:
 *     tags: [Variants]
 *     summary: Get variants by product id
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Get product variants successfully
 *       404:
 *         description: Product not found
 */

/**
 * @swagger
 * /variants/{id}:
 *   get:
 *     tags: [Variants]
 *     summary: Get variant by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Get product variant successfully
 *       404:
 *         description: Product variant not found
 */

/**
 * @swagger
 * /admin/variants:
 *   get:
 *     tags: [Admin Variant]
 *     summary: Get all variants
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: productId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: sku
 *         schema:
 *           type: string
 *       - in: query
 *         name: color
 *         schema:
 *           type: string
 *       - in: query
 *         name: size
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: inStock
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       200:
 *         description: Get product variants successfully
 */

/**
 * @swagger
 * /admin/variants/{id}:
 *   get:
 *     tags: [Admin Variant]
 *     summary: Get variant by id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Get product variant successfully
 *       404:
 *         description: Product variant not found
 *   patch:
 *     tags: [Admin Variant]
 *     summary: Update variant
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProductVariantRequest'
 *     responses:
 *       200:
 *         description: Update product variant successfully
 *       404:
 *         description: Product variant not found
 *   delete:
 *     tags: [Admin Variant]
 *     summary: Delete variant
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Delete product variant successfully
 *       404:
 *         description: Product variant not found
 */

/**
 * @swagger
 * /admin/products/{productId}/variants:
 *   post:
 *     tags: [Admin Variant]
 *     summary: Create variant for product
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProductVariantRequest'
 *     responses:
 *       201:
 *         description: Create product variant successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Product not found
 */
