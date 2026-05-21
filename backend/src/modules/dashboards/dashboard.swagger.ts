/**
 * @swagger
 * tags:
 *   name: Dashboards
 *   description: Dashboard and statistics
 */

/**
 * @swagger
 * /dashboard/top-products:
 *   get:
 *     summary: Get top selling products
 *     tags: [Dashboards]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Top products retrieved
 */

/**
 * @swagger
 * /admin/dashboard/revenue:
 *   get:
 *     summary: Get revenue grouped by period
 *     tags: [Dashboards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [day, month, year]
 *           default: day
 *     responses:
 *       200:
 *         description: Revenue data retrieved
 */

/**
 * @swagger
 * /admin/dashboard/order-count:
 *   get:
 *     summary: Get order counts grouped by period
 *     tags: [Dashboards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [day, month, year]
 *           default: day
 *     responses:
 *       200:
 *         description: Order count data retrieved
 */
