const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  isAdmin,
  isCustomer,
} = require("../middlewares/authMiddleware");
const {
  createFeedback,
  updateFeedback,
  deleteFeedback,
  getAllFeedback,
  getFeedback,
} = require("../controller/feedbackCtrl");

/**
 * @swagger
 * components:
 *   schemas:
 *     Feedback:
 *       type: object
 *       required:
 *         - bookingId
 *         - content
 *         - rating
 *       properties:
 *         bookingId:
 *           type: string
 *           description: The ID of the booking associated with the feedback
 *         content:
 *           type: string
 *           description: The content of the feedback
 *         rating:
 *           type: number
 *           description: The rating given in the feedback (1-5)
 *         isHidden:
 *           type: boolean
 *           description: Whether the feedback is hidden or not
 *           default: false
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: List of images associated with the feedback
 */

/**
 * @swagger
 * /api/feedback/create-feedback:
 *   post:
 *     summary: Create new feedback
 *     description: Adds new feedback for a booking
 *     tags:
 *       - Feedback
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             $ref: '#/components/schemas/Feedback'
 *     responses:
 *       201:
 *         description: Feedback created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Forbidden, requires customer privileges
 */
router.post("/create-feedback", authMiddleware, isCustomer, createFeedback);

/**
 * @swagger
 * /api/feedback/{id}:
 *   put:
 *     summary: Update existing feedback
 *     description: Updates feedback by its ID
 *     tags:
 *       - Feedback
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the feedback to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             $ref: '#/components/schemas/Feedback'
 *     responses:
 *       200:
 *         description: Feedback updated successfully
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Feedback not found
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Forbidden, requires admin privileges
 */
router.put("/:id", authMiddleware, updateFeedback);

/**
 * @swagger
 * /api/feedback/all-feedbacks:
 *   get:
 *     summary: Get all feedbacks
 *     description: Retrieves a list of all feedbacks
 *     tags:
 *       - Feedback
 *     responses:
 *       200:
 *         description: A list of all feedbacks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Feedback'
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Forbidden, requires admin privileges
 */
router.get("/all-feedbacks", authMiddleware, getAllFeedback);

/**
 * @swagger
 * /api/feedback/{id}:
 *   get:
 *     summary: Get a specific feedback by ID
 *     description: Retrieves a single feedback by its ID
 *     tags:
 *       - Feedback
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the feedback to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The feedback data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Feedback'
 *       404:
 *         description: Feedback not found
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Forbidden, requires admin privileges
 */
router.get("/:id", authMiddleware, getFeedback);

module.exports = router;
