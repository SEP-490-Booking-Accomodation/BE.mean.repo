const express = require("express");
const router = express.Router();
const { authMiddleware, isCustomer } = require("../middlewares/authMiddleware");
const {
  createBooking,
  updateBooking,
  deleteBooking,
  getAllBooking,
  getBooking,
  getBookingsByRentalLocation,
  getBookingsByCustomerId,
} = require("../controller/bookingCtrl");

/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       required:
 *         - policySystemBookingId
 *         - customerId
 *         - accommodationId
 *         - checkInHour
 *         - paymentMethod
 *         - roomPrice
 *         - adultNumber
 *         - childNumber
 *         - durationBookingHour
 *         - totalPrice
 *       properties:
 *         policySystemBookingId:
 *           type: string
 *           description: Reference to PolicySystemBooking
 *         customerId:
 *           type: string
 *           description: Reference to Customer
 *         accommodationId:
 *           type: string
 *           description: Reference to Accommodation
 *         couponId:
 *           type: string
 *           description: Reference to Coupon
 *         feedbackId:
 *           type: string
 *           description: Reference to Feedback
 *         checkInHour:
 *           type: string
 *           format: date-time
 *           pattern: "^\\d{2}-\\d{2}-\\d{4} \\d{2}:\\d{2}:\\d{2} \\+07:00$"
 *           example: "04-02-2025 15:30:45 +07:00"
 *           description: Check-in time
 *         checkOutHour:
 *           type: string
 *           format: date-time
 *           pattern: "^\\d{2}-\\d{2}-\\d{4} \\d{2}:\\d{2}:\\d{2} \\+07:00$"
 *           example: "04-02-2025 15:30:45 +07:00"
 *           description: Check-out time
 *         confirmDate:
 *           type: string
 *           format: date-time
 *           pattern: "^\\d{2}-\\d{2}-\\d{4} \\d{2}:\\d{2}:\\d{2} \\+07:00$"
 *           example: "04-02-2025 15:30:45 +07:00"
 *           description: Confirmation date
 *         paymentMethod:
 *           type: string
 *           description: Payment method
 *         paymentStatus:
 *           type: string
 *           description: Payment status
 *           default: "Chờ thanh toán"
 *         downPrice:
 *           type: number
 *           description: Down payment amount
 *         roomPrice:
 *           type: number
 *           description: Room price
 *         adultNumber:
 *           type: number
 *           description: Number of adults
 *         childNumber:
 *           type: number
 *           description: Number of children
 *         durationBookingHour:
 *           type: number
 *           description: Booking duration in hours
 *         totalPrice:
 *           type: number
 *           description: Total price
 *         isFullPay:
 *           type: boolean
 *           description: Full payment status
 *           default: false
 *         isPayOnlyDeposit:
 *           type: boolean
 *           description: Deposit-only payment status
 *           default: false
 *         isCancel:
 *           type: boolean
 *           description: Cancellation status
 *           default: false
 *         completedDate:
 *           type: string
 *           format: date-time
 *           pattern: "^\\d{2}-\\d{2}-\\d{4} \\d{2}:\\d{2}:\\d{2} \\+07:00$"
 *           example: "04-02-2025 15:30:45 +07:00"
 *           description: Completion date
 *         haveEKey:
 *           type: boolean
 *           description: Whether an electronic key is issued
 *           default: false
 *         eKeyNo:
 *           type: string
 *           description: Electronic key number
 *         status:
 *           type: string
 *           description: Booking status
 */

/**
 * @swagger
 * /api/booking/create-booking:
 *   post:
 *     summary: Create a new booking
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             $ref: '#/components/schemas/Booking'
 *     responses:
 *       201:
 *         description: Booking created successfully
 */
router.post("/create-Booking", authMiddleware, createBooking);

/**
 * @swagger
 * /api/booking/{id}:
 *   put:
 *     summary: Update a booking
 *     tags: [Booking]
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
 *             $ref: '#/components/schemas/Booking'
 *     responses:
 *       200:
 *         description: Booking updated successfully
 */
router.put("/:id", authMiddleware, isCustomer, updateBooking);

/**
 * @swagger
 * /api/booking/booking-history/{customerId}:
 *   get:
 *     summary: Get all bookings by customer ID
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *           description: Customer ID
 *     responses:
 *       200:
 *         description: List of bookings for the specified customer
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Booking'
 *       404:
 *         description: No bookings found for this customer
 */

router.get(
  "/booking-history/:customerId",
  authMiddleware,
  getBookingsByCustomerId
);

/**
 * @swagger
 * /api/booking/all-booking-in-rental-location/{rentalLocationId}:
 *   get:
 *     summary: Get all bookings by customer ID
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rentalLocationId
 *         required: true
 *         schema:
 *           type: string
 *           description: Rental Location ID
 *     responses:
 *       200:
 *         description: List of all bookings that's rental location have
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Booking'
 *       404:
 *         description: No bookings found for this customer
 */

router.get(
  "/all-booking-in-rental-location/:rentalLocationId",
  authMiddleware,
  getBookingsByRentalLocation
);

/**
 * @swagger
 * /api/booking/all-bookings:
 *   get:
 *     summary: Get all bookings
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookings
 */
router.get("/all-Bookings", authMiddleware, getAllBooking);

/**
 * @swagger
 * /api/booking/{id}:
 *   get:
 *     summary: Get booking by ID
 *     tags: [Booking]
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
 *         description: Booking details
 */
router.get("/:id", authMiddleware, getBooking);

module.exports = router;
