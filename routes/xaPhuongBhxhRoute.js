const express = require("express");
const router = express.Router();

const {
  authMiddleware,
  isAdmin,
  isManager,
} = require("../middlewares/authMiddleware");

const {
  createXaPhuong,
  updateXaPhuong,
  deleteXaPhuong,
  getXaPhuong,
  getAllXaPhuong,
  getByAgency,
  getByProvince,
  lookupWardCode,
  lookupWardName,
  searchXaPhuong,
} = require("../controller/xaPhuongBhxhCtrl");

/**
 * @swagger
 * components:
 *   schemas:
 *     XaPhuongBHXH:
 *       type: object
 *       required:
 *         - wardCode
 *         - wardName
 *         - agency
 *       properties:
 *         wardCode:
 *           type: string
 *           example: "00001"
 *         wardName:
 *           type: string
 *           example: "Đa Tốn"
 *         agency:
 *           type: string
 *         province:
 *           type: string
 */

/**
 * @swagger
 * /api/xa-phuong-bhxh/create:
 *   post:
 *     summary: Tạo xã phường BHXH
 *     tags:
 *       - XaPhuongBHXH
 *     security:
 *       - bearerAuth: []
 */
router.post("/create", authMiddleware, isAdmin, isManager, createXaPhuong);

/**
 * @swagger
 * /api/xa-phuong-bhxh/search:
 *   get:
 *     summary: Tìm kiếm xã phường
 *     tags:
 *       - XaPhuongBHXH
 *     security:
 *       - bearerAuth: []
 */
router.get("/search", authMiddleware, searchXaPhuong);

/**
 * @swagger
 * /api/xa-phuong-bhxh/all:
 *   get:
 *     summary: Danh sách xã phường
 *     tags:
 *       - XaPhuongBHXH
 *     security:
 *       - bearerAuth: []
 */
router.get("/all", authMiddleware, getAllXaPhuong);

/**
 * @swagger
 * /api/xa-phuong-bhxh/agency/{agencyId}:
 *   get:
 *     summary: Xã phường theo cơ quan BHXH
 *     tags:
 *       - XaPhuongBHXH
 *     security:
 *       - bearerAuth: []
 */
router.get("/agency/:agencyId", authMiddleware, getByAgency);

/**
 * @swagger
 * /api/xa-phuong-bhxh/province/{provinceId}:
 *   get:
 *     summary: Xã phường theo tỉnh
 *     tags:
 *       - XaPhuongBHXH
 *     security:
 *       - bearerAuth: []
 */
router.get("/province/:provinceId", authMiddleware, getByProvince);

/**
 * @swagger
 * /api/xa-phuong-bhxh/lookup/code/{wardCode}:
 *   get:
 *     summary: Tra cứu theo mã xã
 *     tags:
 *       - XaPhuongBHXH
 *     security:
 *       - bearerAuth: []
 */
router.get("/lookup/code/:wardCode", authMiddleware, lookupWardCode);

/**
 * @swagger
 * /api/xa-phuong-bhxh/lookup/name:
 *   get:
 *     summary: Tra cứu theo tên xã
 *     tags:
 *       - XaPhuongBHXH
 *     security:
 *       - bearerAuth: []
 */
router.get("/lookup/name", authMiddleware, lookupWardName);

/**
 * @swagger
 * /api/xa-phuong-bhxh/{id}:
 *   get:
 *     summary: Chi tiết xã phường
 *     tags:
 *       - XaPhuongBHXH
 *     security:
 *       - bearerAuth: []
 */
router.get("/:id", authMiddleware, getXaPhuong);

/**
 * @swagger
 * /api/xa-phuong-bhxh/{id}:
 *   put:
 *     summary: Cập nhật xã phường
 *     tags:
 *       - XaPhuongBHXH
 *     security:
 *       - bearerAuth: []
 */
router.put("/:id", authMiddleware, isAdmin, isManager, updateXaPhuong);

/**
 * @swagger
 * /api/xa-phuong-bhxh/{id}:
 *   delete:
 *     summary: Xóa xã phường
 *     tags:
 *       - XaPhuongBHXH
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id", authMiddleware, isAdmin, isManager, deleteXaPhuong);

module.exports = router;
