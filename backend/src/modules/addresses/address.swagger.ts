/**
 * @swagger
 * tags:
 *   name: Addresses
 *   description: Address management
 */

/**
 * @swagger
 * /addresses:
 *   get:
 *     summary: Get all addresses
 *     tags: [Addresses]
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
 *     responses:
 *       200:
 *         description: Get all addresses successful
 *       401:
 *         description: Unauthorized
 *
 *   post:
 *     summary: Create new address
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - phone
 *               - street
 *               - province
 *             properties:
 *               fullName:
 *                 type: string
 *               phone:
 *                 type: string
 *               street:
 *                 type: string
 *               ward:
 *                 type: string
 *                 nullable: true
 *               district:
 *                 type: string
 *                 nullable: true
 *               province:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Create address successful
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *
 * /addresses/{id}:
 *   get:
 *     summary: Get address by ID
 *     tags: [Addresses]
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
 *         description: Get address by ID successful
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Address not found
 *
 *   patch:
 *     summary: Update address by ID
 *     tags: [Addresses]
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
 *               fullName:
 *                 type: string
 *               phone:
 *                 type: string
 *               street:
 *                 type: string
 *               ward:
 *                 type: string
 *               district:
 *                 type: string
 *               province:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Update address successful
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Address not found
 *
 *   delete:
 *     summary: Delete address by ID
 *     tags: [Addresses]
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
 *         description: Delete address successful
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Address not found
 */
