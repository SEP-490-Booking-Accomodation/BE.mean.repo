const express = require("express");
const router = express.Router();

const {
  authMiddleware,
  isAdmin,
  isManager,
} = require("../middlewares/authMiddleware");

const {
  createProvince,
  updateProvince,
  deleteProvince,
  getProvince,
  getAllProvince,
  searchProvince,
} = require("../controller/provinceCtrl");

/**
 * @swagger
 * components:
 *   schemas:
 *     Province:
 *       type: object
 *       required:
 *         - provinceCode
 *         - provinceName
 *       properties:
 *         provinceCode:
 *           type: string
 *           example: "01"
 *         provinceName:
 *           type: string
 *           example: "Thành phố Hà Nội"
 */

/**
 * @swagger
 * /api/province/create:
 *   post:
 *     summary: Tạo tỉnh thành
 *     tags:
 *       - Province
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Province'
 *     responses:
 *       201:
 *         description: Thành công
 */
router.post("/create", authMiddleware, isAdmin, isManager, createProvince);

/**
 * @swagger
 * /api/province/search:
 *   get:
 *     summary: Tìm kiếm tỉnh thành
 *     tags:
 *       - Province
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         example: Hà Nội
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get("/search", authMiddleware, searchProvince);

/**
 * @swagger
 * /api/province/all:
 *   get:
 *     summary: Danh sách tỉnh thành
 *     tags:
 *       - Province
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get("/all", authMiddleware, getAllProvince);

/**
 * @swagger
 * /api/province/{id}:
 *   get:
 *     summary: Chi tiết tỉnh thành
 *     tags:
 *       - Province
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
 */
router.get("/:id", authMiddleware, getProvince);

/**
 * @swagger
 * /api/province/{id}:
 *   put:
 *     summary: Cập nhật tỉnh thành
 *     tags:
 *       - Province
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
 *             $ref: '#/components/schemas/Province'
 *     responses:
 *       200:
 *         description: Thành công
 */
router.put("/:id", authMiddleware, isAdmin, isManager, updateProvince);

/**
 * @swagger
 * /api/province/{id}:
 *   delete:
 *     summary: Xóa tỉnh thành
 *     tags:
 *       - Province
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
 */
router.delete("/:id", authMiddleware, isAdmin, isManager, deleteProvince);

module.exports = router;
