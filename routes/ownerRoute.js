const express = require("express");
const router = express.Router();
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const {
  createOwner,
  updateOwner,
  deleteOwner,
  getAllOwner,
  getOwner,
} = require("../controller/ownerCtrl");

/**
 * @swagger
 * components:
 *   schemas:
 *     Owner:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           description: Tham chiếu đến model Owner
 */

// /**
//  * @swagger
//  * /api/owner/create-owner:
//  *   post:
//  *     summary: Tạo Owner mới
//  *     tags: [Owner]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       201:
//  *         description: Tạo Owner thành công
//  */
// router.post("/create-owner", authMiddleware, createOwner);

/**
 * @swagger
 * /api/owner/{id}:
 *   put:
 *     summary: Cập nhật Owner theo ID
 *     tags: [Owner]
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
 *         description: Cập nhật owner thành công
 */
router.put("/:id", authMiddleware, updateOwner);

// /**
//  * @swagger
//  * /api/owner/{id}:
//  *   delete:
//  *     summary: Xóa owner theo ID
//  *     tags: [Owner]
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
//  *         description: Xóa owner thành công
//  */
// router.delete("/:id", authMiddleware, isAdmin, deleteOwner);

/**
 * @swagger
 * /api/owner/all-owners:
 *   get:
 *     summary: Lấy danh sách tất cả owner
 *     tags: [Owner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách owner
 */
router.get("/all-owners", authMiddleware, isAdmin, getAllOwner);

/**
 * @swagger
 * /api/owner/{id}:
 *   get:
 *     summary: Lấy thông owner theo ID
 *     tags: [Owner]
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
 *         description: Thông tin chi tiết owner
 */
router.get("/:id", authMiddleware, isAdmin, getOwner);

module.exports = router;