const express = require("express");
const router = express.Router();

const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const {
  createSalesRecord,
  updateSalesRecord,
  deleteSalesRecord,
  getSalesRecord,
  getAllSalesRecord,
  searchSalesRecord,
  getByUser,
  dashboardSales,
  getCalendarRevenue,
  getRevenueByDay,
} = require("../controller/salesRecordCtrl");

/**
 * @swagger
 * components:
 *   schemas:
 *     SalesRecord:
 *       type: object
 *       required:
 *         - userId
 *         - productType
 *         - sourceType
 *         - customerCount
 *         - productQuantity
 *         - revenue
 *       properties:
 *         userId:
 *           type: string
 *           example: "68581c4e5d2f9a001f85a123"
 *
 *         productType:
 *           type: string
 *           enum:
 *             - EasyHRM
 *             - iCare
 *
 *         sourceType:
 *           type: string
 *           enum:
 *             - Marketing
 *             - ChuDong
 *             - CTV_DaiLy
 *
 *         customerCount:
 *           type: number
 *           example: 10
 *
 *         productQuantity:
 *           type: number
 *           example: 15
 *
 *         revenue:
 *           type: number
 *           example: 25000000
 *
 *         note:
 *           type: string
 */

/**
 * @swagger
 * /api/sales-record/create:
 *   post:
 *     summary: Tạo doanh thu
 *     tags:
 *       - SalesRecord
 *     security:
 *       - bearerAuth: []
 */
router.post("/create", authMiddleware, createSalesRecord);

/**
 * @swagger
 * /api/sales-record/search:
 *   get:
 *     summary: Tìm kiếm doanh thu
 *     tags:
 *       - SalesRecord
 *     security:
 *       - bearerAuth: []
 */
router.get("/search", authMiddleware, searchSalesRecord);

/**
 * @swagger
 * /api/sales-record/dashboard:
 *   get:
 *     summary: Dashboard doanh thu
 *     tags:
 *       - SalesRecord
 *     security:
 *       - bearerAuth: []
 */
router.get("/dashboard", authMiddleware, dashboardSales);

/**
 * @swagger
 * /api/sales-record/user/{userId}:
 *   get:
 *     summary: Doanh thu theo nhân viên
 *     tags:
 *       - SalesRecord
 *     security:
 *       - bearerAuth: []
 */
router.get("/user/:userId", authMiddleware, getByUser);

/**
 * @swagger
 * /api/sales-record/all:
 *   get:
 *     summary: Danh sách doanh thu
 *     tags:
 *       - SalesRecord
 *     security:
 *       - bearerAuth: []
 */
router.get("/all", authMiddleware, getAllSalesRecord);

/**
 * @swagger
 * /api/sales-record/{id}:
 *   get:
 *     summary: Chi tiết doanh thu
 *     tags:
 *       - SalesRecord
 *     security:
 *       - bearerAuth: []
 */
router.get("/:id", authMiddleware, getSalesRecord);

/**
 * @swagger
 * /api/sales-record/calendar:
 *   get:
 *     summary: Calendar Revenue
 */
router.get("/calendar", authMiddleware, getCalendarRevenue);

/**
 * @swagger
 * /api/sales-record/day:
 *   get:
 *     summary: Revenue Detail By Day
 */
router.get("/day", authMiddleware, getRevenueByDay);

/**
 * @swagger
 * /api/sales-record/{id}:
 *   put:
 *     summary: Cập nhật doanh thu
 *     tags:
 *       - SalesRecord
 *     security:
 *       - bearerAuth: []
 */
router.put("/:id", authMiddleware, updateSalesRecord);

/**
 * @swagger
 * /api/sales-record/{id}:
 *   delete:
 *     summary: Xóa doanh thu
 *     tags:
 *       - SalesRecord
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id", authMiddleware, isAdmin, deleteSalesRecord);

module.exports = router;
