const express = require("express");
const router = express.Router();
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const {
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getAllCoupon,
  getCoupon,
} = require("../controller/couponCtrl");

/**
 * @swagger
 * components:
 *   schemas:
 *     Coupon:
 *       type: object
 *       required:
 *         - name
 *         - startDate
 *         - endDate
 *         - discountBasedOn
 *         - amount
 *         - couponCode
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the coupon
 *         couponCode:
 *           type: string
 *           description: Unique coupon code (8 characters, A-Z, 0-9)
 *           example: "SUMR2024"
 *         startDate:
 *           type: string
 *           format: date-time
 *           pattern: "^\\d{2}-\\d{2}-\\d{4} \\d{2}:\\d{2}:\\d{2} \\+07:00$"
 *           description: Start date of the coupon
 *           example: "04-02-2025 15:30:45 +07:00"
 *         endDate:
 *           type: string
 *           format: date-time
 *           pattern: "^\\d{2}-\\d{2}-\\d{4} \\d{2}:\\d{2}:\\d{2} \\+07:00$"
 *           description: End date of the coupon
 *           example: "04-02-2025 15:30:45 +07:00"
 *         discountBasedOn:
 *           type: string
 *           description: The type of discount
 *         amount:
 *           type: number
 *           description: Discount amount
 *         maxDiscount:
 *           type: string
 *           description: Maximum discount value
 *       example:
 *         id: "60d0fe4f5311236168a109ca"
 *         name: "SUMMER50"
 *         startDate: "04-02-2025 15:30:45 +07:00"
 *         endDate: "04-02-2025 15:30:45 +07:00"
 *         discountBasedOn: "percentage"
 *         amount: 50
 *         maxDiscount: "100000"
 *         isActive: true
 */

/**
 * @swagger
 * /api/coupon/create-coupon:
 *   post:
 *     summary: Create a new coupon
 *     tags: [Coupon]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             $ref: '#/components/schemas/Coupon'
 *     responses:
 *       201:
 *         description: Coupon created successfully
 */
router.post("/create-coupon", authMiddleware, isAdmin, createCoupon);

/**
 * @swagger
 * /api/coupon/{id}:
 *   put:
 *     summary: Update a coupon
 *     tags: [Coupon]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The coupon ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Coupon'
 *     responses:
 *       200:
 *         description: Coupon updated successfully
 */
router.put("/:id", authMiddleware, isAdmin, updateCoupon);

/**
 * @swagger
 * /api/coupon/all-coupons:
 *   get:
 *     summary: Get all coupons
 *     tags: [Coupon]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all coupons
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Coupon'
 */
router.get("/all-coupons", authMiddleware, getAllCoupon);

/**
 * @swagger
 * /api/coupon/{id}:
 *   get:
 *     summary: Get a coupon by ID
 *     tags: [Coupon]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The coupon ID
 *     responses:
 *       200:
 *         description: Coupon details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Coupon'
 */
router.get("/:id", authMiddleware, getCoupon);

module.exports = router;
