/**
 * @swagger
 * tags:
 *   name: Payment Stripe
 *   description: Stripe sandbox payment endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateStripePaymentResponse:
 *       type: object
 *       properties:
 *         orderId:
 *           type: string
 *           format: uuid
 *         checkoutSessionId:
 *           type: string
 *         paymentIntentId:
 *           type: string
 *           nullable: true
 *         checkoutUrl:
 *           type: string
 *         amount:
 *           type: number
 *         currency:
 *           type: string
 *           example: vnd
 *     StripePaymentStatusResponse:
 *       type: object
 *       properties:
 *         orderId:
 *           type: string
 *           format: uuid
 *         checkoutSessionId:
 *           type: string
 *         paymentIntentId:
 *           type: string
 *           nullable: true
 *         amount:
 *           type: number
 *         paymentStatus:
 *           type: string
 *           enum: [UNPAID, PAID, FAILED, REFUNDED]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /payment/stripe/create/{orderId}:
 *   post:
 *     tags: [Payment Stripe]
 *     summary: Create Stripe checkout session for an existing order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Create Stripe checkout session successfully
 *       400:
 *         description: Invalid order or payment request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */

/**
 * @swagger
 * /payment/stripe/webhook:
 *   post:
 *     tags: [Payment Stripe]
 *     summary: Handle Stripe webhook
 *     description: Stripe calls this endpoint to confirm payment events.
 *     responses:
 *       200:
 *         description: Webhook received
 */

/**
 * @swagger
 * /payment/stripe/status/{sessionId}:
 *   get:
 *     tags: [Payment Stripe]
 *     summary: Get Stripe payment status by checkout session id
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Get Stripe payment status successfully
 *       404:
 *         description: Order not found
 */