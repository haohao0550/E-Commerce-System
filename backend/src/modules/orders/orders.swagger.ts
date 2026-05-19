/**
 * @swagger
 * tags:
 *   - name: Orders
 *     description: User order management endpoints
 *   - name: Admin Orders
 *     description: Admin order management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderItemRequest:
 *       type: object
 *       required:
 *         - variantId
 *         - quantity
 *       properties:
 *         variantId:
 *           type: string
 *           format: uuid
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           example: 2
 *
 *     ShippingAddress:
 *       type: object
 *       required:
 *         - fullName
 *         - phone
 *         - street
 *         - province
 *       properties:
 *         fullName:
 *           type: string
 *           example: "Nguyen Van A"
 *         phone:
 *           type: string
 *           example: "0901234567"
 *         street:
 *           type: string
 *           example: "123 Nguyen Trai"
 *         ward:
 *           type: string
 *           example: "Ben Thanh"
 *         district:
 *           type: string
 *           example: "Quan 1"
 *         province:
 *           type: string
 *           example: "Ho Chi Minh"
 *
 *     CreateOrderRequest:
 *       type: object
 *       required:
 *         - items
 *         - shippingAddress
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItemRequest'
 *         paymentMethod:
 *           type: string
 *           enum: [COD, VNPAY, MOMO]
 *           default: COD
 *         shippingAddress:
 *           $ref: '#/components/schemas/ShippingAddress'
 *         couponId:
 *           type: string
 *           format: uuid
 *         note:
 *           type: string
 *           example: "Giao trong giờ hành chính"
 *
 *     UpdateOrderStatusRequest:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED, RETURNED]
 *
 *     UpdatePaymentStatusRequest:
 *       type: object
 *       required:
 *         - paymentStatus
 *       properties:
 *         paymentStatus:
 *           type: string
 *           enum: [UNPAID, PAID, FAILED, REFUNDED]
 */

/**
 * @swagger
 * /orders:
 *   get:
 *     tags: [Orders]
 *     summary: Get current user's orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED, RETURNED]
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *           enum: [UNPAID, PAID, FAILED, REFUNDED]
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
 *     responses:
 *       200:
 *         description: Get user orders successfully
 *       401:
 *         description: Unauthorized
 *
 *   post:
 *     tags: [Orders]
 *     summary: Create a new order
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderRequest'
 *     responses:
 *       201:
 *         description: Create order successfully
 *       400:
 *         description: Bad request (Invalid stock, coupon, etc.)
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Get details of a specific user order
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
 *         description: Get order details successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Not the owner)
 *       404:
 *         description: Order not found
 */

/**
 * @swagger
 * /orders/{id}/cancel:
 *   patch:
 *     tags: [Orders]
 *     summary: Cancel a pending order
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
 *         description: Cancel order successfully
 *       400:
 *         description: Order cannot be cancelled
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Not the owner)
 *       404:
 *         description: Order not found
 */

/**
 * @swagger
 * /admin/orders:
 *   get:
 *     tags: [Admin Orders]
 *     summary: ADMIN - Get all orders in the system
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED, RETURNED]
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *           enum: [UNPAID, PAID, FAILED, REFUNDED]
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
 *     responses:
 *       200:
 *         description: Get all orders successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * /admin/orders/{id}:
 *   get:
 *     tags: [Admin Orders]
 *     summary: ADMIN - Get order details
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
 *         description: Get order details successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Order not found
 */

/**
 * @swagger
 * /admin/orders/{id}/status:
 *   patch:
 *     tags: [Admin Orders]
 *     summary: ADMIN - Update order delivery status
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
 *             $ref: '#/components/schemas/UpdateOrderStatusRequest'
 *     responses:
 *       200:
 *         description: Update order status successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Order not found
 */

/**
 * @swagger
 * /admin/orders/{id}/payment-status:
 *   patch:
 *     tags: [Admin Orders]
 *     summary: ADMIN - Update order payment status
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
 *             $ref: '#/components/schemas/UpdatePaymentStatusRequest'
 *     responses:
 *       200:
 *         description: Update payment status successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Order not found
 */
