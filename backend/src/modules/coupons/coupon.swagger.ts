/**
 * @swagger
 * /coupons/validate:
 *   post:
 *     summary: Validate coupon for current user
 *     tags: [Coupon]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - orderValue
 *             properties:
 *               code:
 *                 type: string
 *                 example: SALE20
 *               orderValue:
 *                 type: number
 *                 example: 500000
 *     responses:
 *       200:
 *         description: Validate coupon successful
 *       400:
 *         description: Coupon is inactive, expired, usage limit reached, or minimum order value not met
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Coupon not found
 *
 * /admin/coupons:
 *   get:
 *     summary: Admin get coupons
 *     tags: [Admin Coupon]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Get coupons successful
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *
 *   post:
 *     summary: Admin create coupon
 *     tags: [Admin Coupon]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - discount
 *             properties:
 *               code:
 *                 type: string
 *                 example: SALE20
 *               discount:
 *                 type: number
 *                 description: Discount percent. Example 20 means 20%.
 *                 example: 20
 *               minOrderValue:
 *                 type: number
 *                 nullable: true
 *                 example: 200000
 *               maxDiscount:
 *                 type: number
 *                 nullable: true
 *                 description: Maximum discount amount in money.
 *                 example: 50000
 *               usageLimit:
 *                 type: integer
 *                 nullable: true
 *                 example: 100
 *               isActive:
 *                 type: boolean
 *                 example: true
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 example: 2026-12-31T23:59:59.000Z
 *     responses:
 *       201:
 *         description: Create coupon successful
 *       400:
 *         description: Validation error or coupon code already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *
 * /admin/coupons/{id}:
 *   patch:
 *     summary: Admin update coupon
 *     tags: [Admin Coupon]
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
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               discount:
 *                 type: number
 *                 description: Discount percent. Example 20 means 20%.
 *               minOrderValue:
 *                 type: number
 *                 nullable: true
 *               maxDiscount:
 *                 type: number
 *                 nullable: true
 *               usageLimit:
 *                 type: integer
 *                 nullable: true
 *               isActive:
 *                 type: boolean
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Update coupon successful
 *       400:
 *         description: Validation error
 *       404:
 *         description: Coupon not found
 *
 *   delete:
 *     summary: Admin delete coupon
 *     tags: [Admin Coupon]
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
 *         description: Delete coupon successful
 *       404:
 *         description: Coupon not found
 */
