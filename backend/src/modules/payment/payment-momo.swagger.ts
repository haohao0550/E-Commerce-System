/**
 * @swagger
 * tags:
 *   name: Payment MoMo
 *   description: MoMo payment endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateMoMoPaymentRequest:
 *       type: object
 *       properties:
 *         description:
 *           type: string
 *           example: Payment for order
 *     CreateMoMoPaymentResponse:
 *       type: object
 *       properties:
 *         orderId:
 *           type: string
 *           format: uuid
 *         paymentOrderId:
 *           type: string
 *           example: MOMO-1716123456789-a1b2c3d4
 *         paymentRequestId:
 *           type: string
 *           example: REQ-1716123456789-a1b2c3d4
 *         amount:
 *           type: number
 *           example: 250000
 *         payUrl:
 *           type: string
 *         qrCodeUrl:
 *           type: string
 *         deeplink:
 *           type: string
 *     MoMoCallbackBody:
 *       type: object
 *       properties:
 *         partnerCode:
 *           type: string
 *         orderId:
 *           type: string
 *         requestId:
 *           type: string
 *         amount:
 *           type: number
 *         orderInfo:
 *           type: string
 *         orderType:
 *           type: string
 *         transId:
 *           type: number
 *         resultCode:
 *           type: number
 *         message:
 *           type: string
 *         payType:
 *           type: string
 *         responseTime:
 *           type: number
 *         extraData:
 *           type: string
 *         signature:
 *           type: string
 *     MoMoPaymentStatusResponse:
 *       type: object
 *       properties:
 *         orderId:
 *           type: string
 *           format: uuid
 *         paymentOrderId:
 *           type: string
 *         paymentRequestId:
 *           type: string
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
 * /payment/momo/create/{orderId}:
 *   post:
 *     tags: [Payment MoMo]
 *     summary: Create MoMo payment for an existing order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMoMoPaymentRequest'
 *     responses:
 *       200:
 *         description: Create MoMo payment successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Create MoMo payment successfully
 *                 data:
 *                   $ref: '#/components/schemas/CreateMoMoPaymentResponse'
 *       400:
 *         description: Invalid order or payment request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */

/**
 * @swagger
 * /payment/momo/callback:
 *   post:
 *     tags: [Payment MoMo]
 *     summary: Handle MoMo IPN callback
 *     description: This endpoint is called by MoMo server to update payment status.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MoMoCallbackBody'
 *     responses:
 *       200:
 *         description: Callback received or acknowledged
 *       500:
 *         description: Temporary server error, MoMo can retry
 */

/**
 * @swagger
 * /payment/momo/return:
 *   get:
 *     tags: [Payment MoMo]
 *     summary: Handle MoMo redirect return
 *     description: Redirect user to frontend payment result page.
 *     parameters:
 *       - in: query
 *         name: orderId
 *         schema:
 *           type: string
 *       - in: query
 *         name: resultCode
 *         schema:
 *           type: string
 *       - in: query
 *         name: message
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Redirect to frontend payment result page
 */

/**
 * @swagger
 * /payment/momo/status/{paymentOrderId}:
 *   get:
 *     tags: [Payment MoMo]
 *     summary: Get MoMo payment status
 *     parameters:
 *       - in: path
 *         name: paymentOrderId
 *         required: true
 *         schema:
 *           type: string
 *           example: MOMO-1716123456789-a1b2c3d4
 *     responses:
 *       200:
 *         description: Get MoMo payment status successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Get MoMo payment status successfully
 *                 data:
 *                   $ref: '#/components/schemas/MoMoPaymentStatusResponse'
 *       404:
 *         description: Order not found
 */