const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  isAdmin,
  isCustomer,
} = require("../middlewares/authMiddleware");
const {
  createReport,
  updateReport,
  deleteReport,
  getAllReport,
  getReport,
} = require("../controller/reportCtrl");

/**
 * @swagger
 * components:
 *   schemas:
 *     Report:
 *       type: object
 *       required:
 *         - bookingId
 *         - reason
 *         - images
 *       properties:
 *         bookingId:
 *           type: string
 *           description: The ID of the associated booking
 *         replyBy:
 *           type: string
 *           description: The ID of the owner who responded
 *         contentReply:
 *           type: string
 *           description: Content of owner reply to the report
 *         content:
 *           type: string
 *           description: The content of the report
 *         reason:
 *           type: string
 *           description: The reason for the report 
 *         isReviewed:
 *           type: boolean
 *           description: Whether the report has been reviewed
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: A list of image URLs associated with the report
 */

/**
 * @swagger
 * /api/report/create-report:
 *   post:
 *     summary: Create a new report
 *     description: Creates a new report and associates it with a booking
 *     tags:
 *       - Report
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             $ref: '#/components/schemas/Report'
 *     responses:
 *       201:
 *         description: Report created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Forbidden, requires customer access
 */
router.post("/create-report", authMiddleware, isCustomer, createReport);

/**
 * @swagger
 * /api/report/{id}:
 *   put:
 *     summary: Update an existing report
 *     description: Updates the report details by ID
 *     tags:
 *       - Report
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the report to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Report'
 *     responses:
 *       200:
 *         description: Report updated successfully
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Report not found
 *       401:
 *         description: Unauthorized access
 */
router.put("/:id", authMiddleware, updateReport);

/**
 * @swagger
 * /api/report/all-reports:
 *   get:
 *     summary: Get all reports
 *     description: Retrieves a list of all reports
 *     tags:
 *       - Report
 *     responses:
 *       200:
 *         description: A list of reports
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Report'
 *       401:
 *         description: Unauthorized access
 */
router.get("/all-reports", authMiddleware, getAllReport);

/**
 * @swagger
 * /api/report/{id}:
 *   get:
 *     summary: Get a specific report by ID
 *     description: Retrieves a single report by its ID
 *     tags:
 *       - Report
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the report to retrieve
 *     responses:
 *       200:
 *         description: The report data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Report'
 *       404:
 *         description: Report not found
 *       401:
 *         description: Unauthorized access
 */
router.get("/:id", authMiddleware, getReport);

module.exports = router;
