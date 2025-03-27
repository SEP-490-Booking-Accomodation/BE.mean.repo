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
  getBookingsByOwner,
  processMoMoPayment,
  processMoMoNotify,
  processMomoCallback,
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
 *         - accommodationTypeId
 *         - checkInHour
 *         - paymentMethod
 *         - adultNumber
 *         - childNumber
 *         - durationBookingHour
 *       properties:
 *         policySystemBookingId:
 *           type: string
 *           description: Reference to PolicySystemBooking
 *         customerId:
 *           type: string
 *           description: Reference to Customer
 *         accommodationTypeId:
 *           type: string
 *           description: Reference to AccommodationType
 *         couponId:
 *           type: string
 *           description: Reference to Coupon
 *         feedbackId:
 *           type: string
 *           description: Reference to Feedback
 *         basePrice:
 *           type: number
 *           description: Base Price of Accommodation Type
 *         overtimeHourlyPrice:
 *           type: number
 *           description: Overtime Hourly Price of Accommodation Type
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
 *           default: 1
 *           type: string
 *           description: Payment method
 *         paymentStatus:
 *           type: integer
 *           enum: [1, 2, 3, 4, 5]
 *           description: Payment method (1=BOOKING, 2=PENDING, 3=PAID, 4=REFUND, 5=FAILED)
 *         adultNumber:
 *           type: number
 *           description: Number of adults
 *         childNumber:
 *           type: number
 *           description: Number of children
 *         durationBookingHour:
 *           type: number
 *           description: Booking duration in hours
 *         completedDate:
 *           type: string
 *           format: date-time
 *           pattern: "^\\d{2}-\\d{2}-\\d{4} \\d{2}:\\d{2}:\\d{2} \\+07:00$"
 *           example: "04-02-2025 15:30:45 +07:00"
 *           description: Completion date
 *         passwordRoom:
 *           type: string
 *           description: Password room for open
 *         status:
 *           enum: [1, 2, 3, 4, 5, 6, 7]
 *           description: Booking method (CONFIRMED=1, NEEDCHECKIN=2, CHECKEDIN=3, NEEDCHECKOUT=4, CHECKEDOUT=5, CANCELLED=6, COMPLETED=7)
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
 * /api/booking/momo/payment:
 *   post:
 *     summary: Process MoMo payment
 *     description: Initiates a MoMo payment and returns a payment URL.
 *     tags: [MoMo Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingId
 *               - amount
 *             properties:
 *               bookingId:
 *                 type: string
 *                 description: ID of the booking
 *               amount:
 *                 type: number
 *                 description: Payment amount
 *               description:
 *                 type: string
 *                 description: Payment description (optional)
 *     responses:
 *       200:
 *         description: Returns payment URL for MoMo.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 payUrl:
 *                   type: string
 *                   description: MoMo payment URL
 *       400:
 *         description: Missing required fields.
 *       404:
 *         description: Booking not found.
 *       500:
 *         description: Server error.
 */
router.post("/momo/payment", processMoMoPayment);

/**
 * @swagger
 * /api/booking/momo/notify:
 *   post:
 *     summary: Receive MoMo payment notification
 *     description: Handles MoMo payment status updates.
 *     tags: [MoMo Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - requestId
 *               - orderId
 *               - amount
 *               - resultCode
 *               - message
 *             properties:
 *               requestId:
 *                 type: string
 *                 description: MoMo request ID
 *               orderId:
 *                 type: string
 *                 description: MoMo order ID
 *               amount:
 *                 type: number
 *                 description: Payment amount
 *               resultCode:
 *                 type: number
 *                 description: Transaction result code (0 = success)
 *               message:
 *                 type: string
 *                 description: MoMo response message
 *     responses:
 *       200:
 *         description: Notification received successfully.
 *       400:
 *         description: Invalid notification request.
 *       500:
 *         description: Server error.
 */

router.post("/momo/notify", processMoMoNotify); // API nhận notify từ MoMo

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

router.post("/momo/call-back",processMomoCallback);

router.get(
  "/booking-history/:customerId",
  authMiddleware,
  getBookingsByCustomerId
);

/**
 * @swagger
 * /api/booking/all-booking-by-owner/{ownerId}:
 *   get:
 *     summary: Get all bookings from rental locations owned by a specific owner
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ownerId
 *         required: true
 *         schema:
 *           type: string
 *           description: Owner ID
 *     responses:
 *       200:
 *         description: List of all bookings from rental locations owned by this owner
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: Total number of bookings
 *                 bookings:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       booking_n:
 *                         $ref: '#/components/schemas/Booking'
 *       404:
 *         description: No rental locations or accommodations found for this owner
 *       500:
 *         description: Failed to get bookings
 */

router.get(
    "/all-booking-by-owner/:ownerId",
    authMiddleware,
    getBookingsByOwner
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
