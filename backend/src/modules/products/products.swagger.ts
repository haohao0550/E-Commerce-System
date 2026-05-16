/**
 * @swagger
 * tags:
 *   - name: Products
 *     description: Product management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *           example: Nike Air Force 1
 *         slug:
 *           type: string
 *           example: nike-air-force-1
 *         description:
 *           type: string
 *           nullable: true
 *           example: Classic sneakers for daily wear
 *         basePrice:
 *           type: number
 *           example: 2500000
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           example:
 *             - https://example.com/product-1.jpg
 *         categoryId:
 *           type: string
 *           format: uuid
 *         isDeleted:
 *           type: boolean
 *           example: false
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CreateProductRequest:
 *       type: object
 *       required:
 *         - name
 *         - basePrice
 *       properties:
 *         name:
 *           type: string
 *           example: Nike Air Force 1
 *         description:
 *           type: string
 *           example: Classic sneakers for daily wear
 *         basePrice:
 *           type: number
 *           example: 2500000
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           example:
 *             - https://example.com/product-1.jpg
 *         categoryId:
 *           type: string
 *           format: uuid
 *           example: 550e8400-e29b-41d4-a716-446655440000
 *
 *     UpdateProductRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: Nike Air Force 1 Updated
 *         description:
 *           type: string
 *           example: Updated product description
 *         basePrice:
 *           type: number
 *           example: 2600000
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           example:
 *             - https://example.com/product-updated.jpg
 *         categoryId:
 *           type: string
 *           format: uuid
 *           example: 550e8400-e29b-41d4-a716-446655440000
 */

/**
 * @swagger
 * /products:
 *   get:
 *     tags: [Products]
 *     summary: Get all products
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
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
 *         description: Get products successfully
 *
 *   post:
 *     tags: [Products]
 *     summary: ADMIN - Create product
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProductRequest'
 *     responses:
 *       201:
 *         description: Create product successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * /products/{slug}:
 *   get:
 *     tags: [Products]
 *     summary: Get product by slug
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *           example: nike-air-force-1
 *     responses:
 *       200:
 *         description: Get product successfully
 *       404:
 *         description: Product not found
 */

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get product by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: 550e8400-e29b-41d4-a716-446655440000
 *     responses:
 *       200:
 *         description: Get product successfully
 *       404:
 *         description: Product not found
 */

/**
 * @swagger
 * /products/{id}:
 *   patch:
 *     tags: [Products]
 *     summary: ADMIN - Update product
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
 *             $ref: '#/components/schemas/UpdateProductRequest'
 *     responses:
 *       200:
 *         description: Update product successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Product not found
 *
 *   delete:
 *     tags: [Products]
 *     summary: ADMIN - Delete product
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
 *         description: Delete product successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Product not found
 */

/**
 * @swagger
 * /products/{id}/restore:
 *   patch:
 *     tags: [Products]
 *     summary: ADMIN - Restore deleted product
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
 *         description: Restore product successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Product not found
 */