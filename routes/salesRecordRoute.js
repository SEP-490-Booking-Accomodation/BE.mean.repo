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
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
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
 *         - reportDate
 *       properties:
 *         _id:
 *           type: string
 *           example: 68581c4e5d2f9a001f85a999
 *
 *         userId:
 *           type: string
 *           example: 68581c4e5d2f9a001f85a123
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
 *         reportDate:
 *           type: string
 *           format: date
 *           example: 2026-06-24
 *
 *         note:
 *           type: string
 *           example: Khách hàng mới
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SalesRecord'
 *     responses:
 *       201:
 *         description: Tạo doanh thu thành công
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
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *
 *       - in: query
 *         name: productType
 *         schema:
 *           type: string
 *
 *       - in: query
 *         name: sourceType
 *         schema:
 *           type: string
 *
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           example: 6
 *
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           example: 2026
 *
 *     responses:
 *       200:
 *         description: Danh sách doanh thu
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
 *     responses:
 *       200:
 *         description: Thống kê doanh thu dashboard
 */
router.get("/dashboard", authMiddleware, dashboardSales);

/**
 * @swagger
 * /api/sales-record/calendar:
 *   get:
 *     summary: Calendar doanh thu theo tháng
 *     tags:
 *       - SalesRecord
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *           example: 6
 *
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *           example: 2026
 *
 *     responses:
 *       200:
 *         description: Dữ liệu calendar doanh thu
 */
router.get("/calendar", authMiddleware, getCalendarRevenue);

/**
 * @swagger
 * /api/sales-record/day:
 *   get:
 *     summary: Doanh thu chi tiết theo ngày
 *     tags:
 *       - SalesRecord
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: 2026-06-24
 *
 *     responses:
 *       200:
 *         description: Danh sách doanh thu trong ngày
 */
router.get("/day", authMiddleware, getRevenueByDay);

/**
 * @swagger
 * /api/sales-record/user/{userId}:
 *   get:
 *     summary: Doanh thu theo nhân viên
 *     tags:
 *       - SalesRecord
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
 *         description: Danh sách doanh thu của nhân viên
 */
router.get("/user/:userId", authMiddleware, getByUser);

/**
 * @swagger
 * /api/sales-record/all:
 *   get:
 *     summary: Danh sách toàn bộ doanh thu
 *     tags:
 *       - SalesRecord
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách doanh thu
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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết doanh thu
 */
router.get("/:id", authMiddleware, getSalesRecord);

/**
 * @swagger
 * /api/sales-record/{id}:
 *   put:
 *     summary: Cập nhật doanh thu
 *     tags:
 *       - SalesRecord
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SalesRecord'
 *
 *     responses:
 *       200:
 *         description: Cập nhật thành công
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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.delete("/:id", authMiddleware, isAdmin, deleteSalesRecord);

module.exports = router;