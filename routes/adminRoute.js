// const express = require("express");
// const router = express.Router();
// const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

// const {
//   createStaff,
//   updateStaff,
//   deleteStaff,
//   getAllStaff,
//   getStaff,
// } = require("../controller/staffCtrl");

// router.post("/create-staff", authMiddleware, isAdmin, createStaff);
// router.put("/:id", authMiddleware, isAdmin, updateStaff);
// router.delete("/:id", authMiddleware, isAdmin, deleteStaff);
// router.get("/all-staffs", authMiddleware, isAdmin, getAllStaff);
// router.get("/:id", authMiddleware, isAdmin, getStaff);

// module.exports = router;

const express = require("express");
const router = express.Router();
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const {
  createStaff,
  updateStaff,
  deleteStaff,
  getAllStaff,
  getStaff,
} = require("../controller/adminCtrl");

/**
 * @swagger
 * components:
 *   schemas:
 *     Admin:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           description: ID của người dùng (tham chiếu đến User).
 */

// /**
//  * @swagger
//  * /api/staff/create-staff:
//  *   post:
//  *     summary: Tạo mới một staff.
//  *     tags: [Staff]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             $ref: '#/components/schemas/Staff'
//  *     responses:
//  *       201:
//  *         description: Staff đã được tạo thành công.
//  *       401:
//  *         description: Unauthorized.
//  *       403:
//  *         description: Forbidden.
//  */
// router.post("/create-staff", authMiddleware, isAdmin, createStaff);

/**
 * @swagger
 * /api/admin/{id}:
 *   put:
 *     summary: Cập nhật thông tin admin theo ID.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của admin cần cập nhật.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Staff'
 *     responses:
 *       200:
 *         description: admin đã được cập nhật.
 *       404:
 *         description: Không tìm thấy admin.
 */
router.put("/:id", authMiddleware, isAdmin, updateStaff);

// /**
//  * @swagger
//  * /api/admin/{id}:
//  *   delete:
//  *     summary: Xóa admin theo ID.
//  *     tags: [Admin]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         schema:
//  *           type: string
//  *         required: true
//  *         description: ID của admin cần xóa.
//  *     responses:
//  *       200:
//  *         description: admin đã được xóa.
//  *       404:
//  *         description: Không tìm thấy admin.
//  */
// router.delete("/:id", authMiddleware, isAdmin, deleteStaff);

/**
 * @swagger
 * /api/admin/all-admins:
 *   get:
 *     summary: Lấy danh sách tất cả admin.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách admin.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Admin'
 */
router.get("/all-admins", authMiddleware, isAdmin, getAllStaff);

/**
 * @swagger
 * /api/admin/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết của một admin theo ID.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của admin cần lấy thông tin.
 *     responses:
 *       200:
 *         description: Thông tin admin.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Admin'
 *       404:
 *         description: Không tìm thấy admin.
 */
router.get("/:id", authMiddleware, isAdmin, getStaff);

module.exports = router;
