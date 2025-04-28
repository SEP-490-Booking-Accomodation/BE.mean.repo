const express = require("express");
const router = express.Router();
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const {
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getAllCustomer,
  getCustomer,
  getCustomerByUserId,
} = require("../controller/customerCtrl");

/**
 * @swagger
 * components:
 *   schemas:
 *     Customer:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           description: Tham chiếu đến model Người dùng
 *         paymentInformationId:
 *           type: string
 *           description: The ID of the payment information related to this owner
 */

// /**
//  * @swagger
//  * /api/customer/create-customer:
//  *   post:
//  *     summary: Tạo khách hàng mới
//  *     tags: [Customer]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       201:
//  *         description: Tạo khách hàng thành công
//  */
// router.post("/create-customer", authMiddleware, createCustomer);

/**
 * @swagger
 * /api/customer/{id}:
 *   put:
 *     summary: Cập nhật khách hàng theo ID
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của customer cần cập nhật.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Customer'
 *     responses:
 *       200:
 *         description: Cập nhật khách hàng thành công
 */
router.put("/:id", authMiddleware, updateCustomer);

// /**
//  * @swagger
//  * /api/customer/{id}:
//  *   delete:
//  *     summary: Xóa khách hàng theo ID
//  *     tags: [Customer]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Xóa khách hàng thành công
//  */
// router.delete("/:id", authMiddleware, isAdmin, deleteCustomer);

/**
 * @swagger
 * /api/customer/detail-customer/{userId}:
 *   get:
 *     summary: Lấy thông tin khách hàng theo userId
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thông tin chi tiết khách hàng
 */
router.get(
  "/detail-customer/:userId",
  authMiddleware,
  getCustomerByUserId
);

/**
 * @swagger
 * /api/customer/all-customers:
 *   get:
 *     summary: Lấy danh sách tất cả khách hàng
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách khách hàng
 */
router.get("/all-customers", authMiddleware, isAdmin, getAllCustomer);

/**
 * @swagger
 * /api/customer/{id}:
 *   get:
 *     summary: Lấy thông tin khách hàng theo ID
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thông tin chi tiết khách hàng
 */
router.get("/:id", authMiddleware, isAdmin, getCustomer);

module.exports = router;
