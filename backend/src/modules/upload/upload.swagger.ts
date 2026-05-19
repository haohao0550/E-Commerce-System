/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: Upload images to Cloudinary
 */

/**
 * @swagger
 * /upload/avatar:
 *   post:
 *     summary: USER - Upload avatar
 *     description: Upload một ảnh avatar cho user đã đăng nhập.
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - avatar
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: File ảnh avatar
 *     responses:
 *       200:
 *         description: Upload avatar thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Uploaded successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     image:
 *                       type: string
 *                       example: https://res.cloudinary.com/demo/image/upload/v123/avatar.png
 *       400:
 *         description: Không có file hoặc file không hợp lệ
 *       401:
 *         description: Chưa đăng nhập hoặc token không hợp lệ
 */

/**
 * @swagger
 * /upload/image:
 *   post:
 *     summary: ADMIN - Upload single image
 *     description: Admin upload một ảnh sản phẩm.
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: File ảnh sản phẩm
 *     responses:
 *       200:
 *         description: Upload ảnh thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Uploaded successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     image:
 *                       type: string
 *                       example: https://res.cloudinary.com/demo/image/upload/v123/product.png
 *       400:
 *         description: Không có file hoặc file không hợp lệ
 *       401:
 *         description: Chưa đăng nhập hoặc token không hợp lệ
 *       403:
 *         description: Không có quyền admin
 */

/**
 * @swagger
 * /upload/images:
 *   post:
 *     summary: ADMIN - Upload multiple images
 *     description: Admin upload nhiều ảnh sản phẩm, tối đa 3 ảnh.
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - images
 *             properties:
 *               images:
 *                 type: array
 *                 maxItems: 3
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Danh sách ảnh sản phẩm, tối đa 3 file
 *     responses:
 *       200:
 *         description: Upload nhiều ảnh thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Uploaded successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     images:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example:
 *                         - https://res.cloudinary.com/demo/image/upload/v123/product-1.png
 *                         - https://res.cloudinary.com/demo/image/upload/v123/product-2.png
 *       400:
 *         description: Không có file hoặc file không hợp lệ
 *       401:
 *         description: Chưa đăng nhập hoặc token không hợp lệ
 *       403:
 *         description: Không có quyền admin
 */
