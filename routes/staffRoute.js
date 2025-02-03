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
} = require("../controller/staffCtrl");

/**
 * @swagger
 * components:
 *   schemas:
 *     Staff:
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
 * /api/staff/{id}:
 *   put:
 *     summary: Cập nhật thông tin staff theo ID.
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của staff cần cập nhật.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Staff'
 *     responses:
 *       200:
 *         description: Staff đã được cập nhật.
 *       404:
 *         description: Không tìm thấy staff.
 */
router.put("/:id", authMiddleware, isAdmin, updateStaff);

// /**
//  * @swagger
//  * /api/staff/{id}:
//  *   delete:
//  *     summary: Xóa staff theo ID.
//  *     tags: [Staff]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         schema:
//  *           type: string
//  *         required: true
//  *         description: ID của staff cần xóa.
//  *     responses:
//  *       200:
//  *         description: Staff đã được xóa.
//  *       404:
//  *         description: Không tìm thấy staff.
//  */
// router.delete("/:id", authMiddleware, isAdmin, deleteStaff);

/**
 * @swagger
 * /api/staff/all-staffs:
 *   get:
 *     summary: Lấy danh sách tất cả staff.
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách staff.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Staff'
 */
router.get("/all-staffs", authMiddleware, isAdmin, getAllStaff);

/**
 * @swagger
 * /api/staff/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết của một staff theo ID.
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của staff cần lấy thông tin.
 *     responses:
 *       200:
 *         description: Thông tin staff.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Staff'
 *       404:
 *         description: Không tìm thấy staff.
 */
router.get("/:id", authMiddleware, isAdmin, getStaff);

module.exports = router;
