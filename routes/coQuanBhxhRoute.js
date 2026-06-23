const express = require("express");
const router = express.Router();

const {
  authMiddleware,
  isAdmin,
  isManager,
} = require("../middlewares/authMiddleware");

const {
  createCoQuanBhxh,
  updateCoQuanBhxh,
  deleteCoQuanBhxh,
  getCoQuanBhxh,
  getAllCoQuanBhxh,
  searchCoQuanBhxh,
  getCoQuanBhxhByProvince,
  getByWardCode,
  getByWardName,
} = require("../controller/coQuanBhxhCtrl");

/**
 * @swagger
 * components:
 *   schemas:
 *     CoQuanBHXH:
 *       type: object
 *       required:
 *         - agencyCode
 *         - agencyName
 *         - provinceId
 *       properties:
 *         agencyCode:
 *           type: string
 *           example: "03611"
 *
 *         agencyName:
 *           type: string
 *           example: "BHXH cơ sở Gia Lâm"
 *
 *         provinceId:
 *           type: string
 *           example: "68580f12ab34567890abcd12"
 *
 *         status:
 *           type: boolean
 *           default: true
 *
 *         isDelete:
 *           type: boolean
 *           default: false
 *
 *     XaPhuongBHXH:
 *       type: object
 *       properties:
 *         wardCode:
 *           type: string
 *           example: "00001"
 *
 *         wardName:
 *           type: string
 *           example: "Đa Tốn"
 *
 *         agency:
 *           type: string
 *
 *         province:
 *           type: string
 */

/**
 * @swagger
 * /api/co-quan-bhxh/create:
 *   post:
 *     summary: Tạo cơ quan BHXH
 *     description: Tạo mới cơ quan BHXH
 *     tags:
 *       - CoQuanBHXH
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CoQuanBHXH'
 *     responses:
 *       201:
 *         description: Tạo thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post("/create", authMiddleware, isAdmin, isManager, createCoQuanBhxh);

/**
 * @swagger
 * /api/co-quan-bhxh/search:
 *   get:
 *     summary: Tìm kiếm cơ quan BHXH
 *     description: |
 *       Tìm kiếm theo:
 *       - Mã cơ quan
 *       - Tên cơ quan
 *       - Mã xã
 *       - Tên xã
 *       - Tên tỉnh
 *     tags:
 *       - CoQuanBHXH
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         example: Gia Lâm
 *
 *       - in: query
 *         name: provinceId
 *         schema:
 *           type: string
 *
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *
 *     responses:
 *       200:
 *         description: Danh sách kết quả
 */
router.get("/search", authMiddleware, searchCoQuanBhxh);

/**
 * @swagger
 * /api/co-quan-bhxh/all:
 *   get:
 *     summary: Lấy toàn bộ cơ quan BHXH
 *     tags:
 *       - CoQuanBHXH
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách cơ quan BHXH
 */
router.get("/all", authMiddleware, getAllCoQuanBhxh);

/**
 * @swagger
 * /api/co-quan-bhxh/province/{provinceId}:
 *   get:
 *     summary: Lấy danh sách cơ quan BHXH theo tỉnh
 *     tags:
 *       - CoQuanBHXH
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: provinceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get("/province/:provinceId", authMiddleware, getCoQuanBhxhByProvince);

/**
 * @swagger
 * /api/co-quan-bhxh/ward-code/{wardCode}:
 *   get:
 *     summary: Tra cứu theo mã xã
 *     tags:
 *       - CoQuanBHXH
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: wardCode
 *         required: true
 *         schema:
 *           type: string
 *         example: "00001"
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get("/ward-code/:wardCode", authMiddleware, getByWardCode);

/**
 * @swagger
 * /api/co-quan-bhxh/ward-name:
 *   get:
 *     summary: Tra cứu theo tên xã
 *     tags:
 *       - CoQuanBHXH
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: wardName
 *         required: true
 *         schema:
 *           type: string
 *         example: Đa Tốn
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get("/ward-name", authMiddleware, getByWardName);

/**
 * @swagger
 * /api/co-quan-bhxh/{id}:
 *   get:
 *     summary: Chi tiết cơ quan BHXH
 *     tags:
 *       - CoQuanBHXH
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
 *         description: Thành công
 *       404:
 *         description: Không tìm thấy
 */
router.get("/:id", authMiddleware, getCoQuanBhxh);

/**
 * @swagger
 * /api/co-quan-bhxh/{id}:
 *   put:
 *     summary: Cập nhật cơ quan BHXH
 *     tags:
 *       - CoQuanBHXH
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CoQuanBHXH'
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put("/:id", authMiddleware, isAdmin, isManager, updateCoQuanBhxh);

/**
 * @swagger
 * /api/co-quan-bhxh/{id}:
 *   delete:
 *     summary: Xóa mềm cơ quan BHXH
 *     tags:
 *       - CoQuanBHXH
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
 *         description: Xóa thành công
 */
router.delete("/:id", authMiddleware, isAdmin, deleteCoQuanBhxh);

module.exports = router;
