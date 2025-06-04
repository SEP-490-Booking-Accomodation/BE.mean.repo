const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/authMiddleware");
const {
  createNotification,
  updateNotification,
  deleteNotification,
  getNotification,
  getAllNotification,
  getUserNotifications,
} = require("../controller/notificationCtrl");

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       required:
 *         - userId
 *         - title
 *         - content
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique ID of the notification
 *         userId:
 *           type: string
 *           description: The ID of the user receiving the notification
 *         bookingId:
 *           type: string
 *           description: The ID of the related booking (if applicable)
 *         title:
 *           type: string
 *           description: The title of the notification
 *         content:
 *           type: string
 *           description: The notification content
 *         isRead:
 *           type: boolean
 *           description: The read status of the notification (default is false)
 *           default: false
 *         type:
 *           type: number
 *           enum: [1, 2, 3]
 *           description: The category/type of the notification (1=BOOKING, 2=FEEDBACK, 3=PAYMENT)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the notification was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the notification was last updated
 *       example:
 *         userId: "63b92f4e17d7b3c2a4e4f3d2"
 *         bookingId: "63b92f4e17d7b3c2a4e4f3d3"
 *         title: "Booking Confirmed"
 *         content: "Your booking has been confirmed successfully."
 *         isRead: false
 *         type: 1
 */

/**
 * @swagger
 * /api/notification/create-notification:
 *   post:
 *     summary: Create a new notification
 *     description: Creates a new notification for a user
 *     tags:
 *       - Notification
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Notification'
 *     responses:
 *       201:
 *         description: Notification created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       400:
 *         description: Invalid input
 */
router.post("/create-notification", authMiddleware, createNotification);

/**
 * @swagger
 * /api/notification/{id}:
 *   put:
 *     summary: Update a notification
 *     description: Updates the specified notification by ID
 *     tags:
 *       - Notification
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           description: The ID of the notification to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Notification'
 *     responses:
 *       200:
 *         description: Notification updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       404:
 *         description: Notification not found
 */
router.put("/:id", authMiddleware, updateNotification);

/**
 * @swagger
 * /api/notification/{id}:
 *   delete:
 *     summary: Delete a notification
 *     description: Deletes the specified notification by ID
 *     tags:
 *       - Notification
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           description: The ID of the notification to delete
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *       404:
 *         description: Notification not found
 */
router.delete("/:id", authMiddleware, deleteNotification);

/**
 * @swagger
 * /api/notification/all-notifications:
 *   get:
 *     summary: Get all notifications
 *     description: Retrieves a list of all notifications
 *     tags:
 *       - Notification
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 *       404:
 *         description: No notifications found
 */
router.get("/all-notifications", authMiddleware, getAllNotification);

/**
 * @swagger
 * /api/notification/{id}:
 *   get:
 *     summary: Get a notification by ID
 *     description: Retrieves a specific notification by ID
 *     tags:
 *       - Notification
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           description: The ID of the notification to retrieve
 *     responses:
 *       200:
 *         description: Successfully retrieved notification
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       404:
 *         description: Notification not found
 */
router.get("/:id", authMiddleware, getNotification);

/**
 * @swagger
 * /api/notification/user/{userId}:
 *   get:
 *     summary: Get all notifications for a specific user
 *     description: Retrieves all notifications for a user based on their ID
 *     tags:
 *       - Notification
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           description: The ID of the user whose notifications should be retrieved
 *     responses:
 *       200:
 *         description: Successfully retrieved notifications for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 *       404:
 *         description: No notifications found for the user
 */
router.get("/user/:userId", authMiddleware, getUserNotifications);

module.exports = router;
