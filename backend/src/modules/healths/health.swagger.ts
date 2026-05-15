/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     summary: Check API health (public endpoint)
 *     tags: [Health]
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 uptime:
 *                   type: number
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */