const express = require("express");
const router = express.Router();
const { authMiddleware, isOwner, isAdminAndOwner, isCustomer } = require("../middlewares/authMiddleware");
const {
  createBooking,
  updateBooking,
  deleteBooking,
  getAllBooking,
  getBooking,
  getBookingsByRentalLocation,
  getBookingsByCustomerId,
  getBookingsByOwner,
  getAllOwnerBookings,
  processMoMoPayment,
  processMoMoNotify,
  processMomoCallback,
  generateRoomPassword,
  query,
  getOccupiedTimeSlots,
  checkRoomAvailability,
  getWeeklyBookingCountByOwner,
  getMonthlyBookingCountByOwner,
  getWeeklyRevenueByOwner,
  getMonthlyRevenueByOwner,
} = require("../controller/bookingCtrl");

/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       required:
 *         - policySystemIds
 *         - customerId
 *         - accommodationTypeId
 *         - checkInHour
 *         - paymentMethod
 *         - adultNumber
 *         - childNumber
 *         - durationBookingHour
 *       properties:
 *         policySystemIds:
 *           type: array
 *           items:
 *             type: string
 *           description: Reference to PolicySystemBooking
 *           example: ["policy123", "policy456"]
 *         customerId:
 *           type: string
 *           description: Reference to Customer
 *         accommodationTypeId:
 *           type: string
 *           description: Reference to AccommodationType
 *         rentalLocationId:
 *           type: string
 *           description: Reference to RentalLocation
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
 *           pattern: "^\\d{2}-\\d{2}-\\d{4} \\d{2}:\\d{2}:\\d{2}"
 *           example: "04-02-2025 15:30:45"
 *           description: Check-in time
 *         checkOutHour:
 *           type: string
 *           format: date-time
 *           pattern: "^\\d{2}-\\d{2}-\\d{4} \\d{2}:\\d{2}:\\d{2}"
 *           example: "04-02-2025 15:30:45"
 *           description: Check-out time
 *         confirmDate:
 *           type: string
 *           format: date-time
 *           pattern: "^\\d{2}-\\d{2}-\\d{4} \\d{2}:\\d{2}:\\d{2}"
 *           example: "04-02-2025 15:30:45"
 *           description: Confirmation date
 *         paymentMethod:
 *           type: integer
 *           enum: [1]
 *           description: Payment method (1=MOMO)
 *         paymentStatus:
 *           type: integer
 *           enum: [1, 2, 3, 4, 5]
 *           description: Payment status (1=BOOKING, 2=PENDING, 3=PAID, 4=REFUND, 5=FAILED)
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
 *           description: Total Price of Booking
 *         passwordRoom:
 *           type: string
 *           description: Password room for open
 *         note:
 *           type: string
 *           description: Note of customer
 *         timeExpireRefund:
 *           type: string
 *           format: date-time
 *           pattern: "^\\d{2}-\\d{2}-\\d{4} \\d{2}:\\d{2}:\\d{2}"
 *           example: "04-02-2025 15:30:45"
 *           description: Time for valid refund
 *         status:
 *           type: integer
 *           enum: [1, 2, 3, 4, 5, 6, 7, 8, 9]
 *           description: Booking method (1=CONFIRMED, 2=NEEDCHECKIN, 3=CHECKEDIN, 4=NEEDCHECKOUT, 5=CHECKEDOUT 6=CANCELLED, 7=COMPLETED, 8=PENDING, 9=REFUND)
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
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Booking'
 *     responses:
 *       201:
 *         description: Booking created successfully
 */
router.post("/create-Booking", authMiddleware,isCustomer, createBooking);

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
 *         application/x-www-form-urlencoded:
 *           schema:
 *             $ref: '#/components/schemas/Booking'
 *     responses:
 *       200:
 *         description: Booking updated successfully
 */
router.put("/:id", authMiddleware, updateBooking);

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
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - bookingId
 *               - amount
 *               - returnUrlFE
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
 *               returnUrlFE:
 *                 type: string
 *                 description: Payment return URL
 *               orderIdFE:
 *                 type: string
 *                 description: Payment order ID
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
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
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

router.post("/momo/call-back", processMomoCallback);

/**
 * @swagger
 * /api/secret/query:
 *   post:
 *     summary: Execute dynamic queries for find() and aggregate()
 *     tags: [Query]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               collection:
 *                 type: string
 *                 enum: ["Booking", "Transaction", "User"]
 *                 description: The collection to query
 *               query:
 *                 type: object
 *                 description: MongoDB find query (used if pipeline is not provided)
 *               projection:
 *                 type: object
 *                 description: Fields to include/exclude in the result
 *               pipeline:
 *                 type: array
 *                 items:
 *                   type: object
 *                 description: MongoDB aggregation pipeline (if used, 'query' is ignored)
 *     responses:
 *       200:
 *         description: Query result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Invalid request (e.g., missing parameters, invalid collection)
 *       500:
 *         description: Server error
 */

router.post("/query", query);

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
 * /api/booking/occupied-time-slots:
 *   get:
 *     summary: Get occupied time slots for all active accommodations
 *     tags: [Booking]
 *     responses:
 *       200:
 *         description: Occupied time slots fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Occupied time slots fetched successfully
 *                 data:
 *                   type: object
 *                   additionalProperties:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         checkInHour:
 *                           type: string
 *                           example: "10:00"
 *                         checkOutHour:
 *                           type: string
 *                           example: "12:00"
 *       500:
 *         description: Server error
 */
router.get("/occupied-time-slots", getOccupiedTimeSlots);

/**
 * @swagger
 * /api/booking/check-availability:
 *   post:
 *     summary: Check room availability for a specific accommodation type and time slot
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []  # Requires authentication (adjust if not needed)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accommodationTypeId
 *               - rentalLocationId
 *               - checkIn
 *               - checkOut
 *             properties:
 *               accommodationTypeId:
 *                 type: string
 *                 description: The ID of the accommodation type
 *                 example: "67f40b0ca4689ec49f9f6afd"
 *               rentalLocationId:
 *                 type: string
 *                 description: The ID of the rental location
 *                 example: "67f40b0ca4689ec49f9f6afd"
 *               checkIn:
 *                 type: string
 *                 format: date-time
 *                 description: Check-in time in DD-MM-YYYY HH:mm:ss format (Asia/Ho_Chi_Minh timezone)
 *                 example: "10-04-2025 08:26:00"
 *               checkOut:
 *                 type: string
 *                 format: date-time
 *                 description: Check-out time in DD-MM-YYYY HH:mm:ss format (Asia/Ho_Chi_Minh timezone)
 *                 example: "10-04-2025 11:26:00"
 *     responses:
 *       200:
 *         description: Accommodation availability checked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isAvailable:
 *                   type: boolean
 *                   description: Indicates whether Accommodations are available for the requested time slot
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Accommodations are available for the selected time slot"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       roomId:
 *                         type: string
 *                         example: "room1_id"
 *                       name:
 *                         type: string
 *                         example: "Capsule Room 1"
 *       400:
 *         description: Invalid input (e.g., missing required fields or invalid check-in/check-out times)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "accommodationTypeId, checkIn, and checkOut are required"
 *       404:
 *         description: No active Accommodations found for the specified accommodation type
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No active Accommodations found for this accommodation type"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */
router.post("/check-availability", checkRoomAvailability);

/**
 * @swagger
 * /api/booking/stats/weekly-count/{userId}:
 *   get:
 *     summary: Get booking count for each weekday [T2 - CN]
 *     tags: [Booking Statistics]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID of the owner
 *     responses:
 *       200:
 *         description: Weekly booking count returned successfully
 */
router.get("/stats/weekly-count/:userId", getWeeklyBookingCountByOwner);

/**
 * @swagger
 * /api/booking/stats/monthly-count/{userId}:
 *   get:
 *     summary: Get booking count for each month in the current year [T1 - T12]
 *     tags: [Booking Statistics]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID of the owner
 *     responses:
 *       200:
 *         description: Monthly booking count returned successfully
 */
router.get("/stats/monthly-count/:userId", getMonthlyBookingCountByOwner);

/**
 * @swagger
 * /api/booking/stats/weekly-revenue/{userId}:
 *   get:
 *     summary: Get total revenue for each weekday [T2 - CN]
 *     tags: [Booking Statistics]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID of the owner
 *     responses:
 *       200:
 *         description: Weekly revenue returned successfully
 */
router.get("/stats/weekly-revenue/:userId", getWeeklyRevenueByOwner);

/**
 * @swagger
 * /api/booking/stats/monthly-revenue/{userId}:
 *   get:
 *     summary: Get total revenue for each month in the current year [T1 - T12]
 *     tags: [Booking Statistics]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID of the owner
 *     responses:
 *       200:
 *         description: Monthly revenue returned successfully
 */
router.get("/stats/monthly-revenue/:userId", getMonthlyRevenueByOwner);

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
 * /api/booking/all-owner-bookings:
 *   get:
 *     summary: Get all owner bookings
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of owner bookings
 */
router.get("/all-owner-bookings", authMiddleware, getAllOwnerBookings);

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
 * /api/booking/{bookingId}/generate-password:
 *   put:
 *     summary: Generate or update passwordRoom for a booking
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               passwordRoomInput:
 *                 type: string
 *                 description: Input password for the room
 *     responses:
 *       200:
 *         description: Password room updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 passwordRoomInput:
 *                   type: string
 *                   description: Generated password for the room
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Server error
 */

router.put(
  "/:bookingId/generate-password",
  authMiddleware,
  isOwner,
  generateRoomPassword
);

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
