const express = require("express");
const router = express.Router();
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const {
  createPolicySystem,
  updatePolicySystem,
  deletePolicySystem,
  getAllPolicySystem,
  getPolicySystem,
} = require("../controller/policySystemCtrl");

/**
 * @swagger
 * components:
 *   schemas:
 *     PolicySystem:
 *       type: object
 *       required:
 *         - staffId
 *         - policySystemCategoryId
 *         - name
 *         - startDate
 *         - endDate
 *       properties:
 *         staffId:
 *           type: string
 *           description: The ID of the staff member
 *         policySystemCategoryId:
 *           type: string
 *           description: The ID of the Policy System Category
 *         policySystemBookingId:
 *           type: string
 *           description: The ID of the Policy System Booking
 *         name:
 *           type: string
 *           description: The name of the policy system
 *         description:
 *           type: string
 *           description: Description of the policy system
 *         value:
 *           type: string
 *           description: The value of the policy
 *         unit:
 *           type: string
 *           description: The unit for the value
 *         startDate:
 *           type: string
 *           format: date-time
 *           pattern: "^\\d{2}-\\d{2}-\\d{4} \\d{2}:\\d{2}:\\d{2} \\+07:00$"
 *           description: Start date of the policy system
 *           example: "04-02-2025 15:30:45 +07:00"
 *         endDate:
 *           type: string
 *           format: date-time
 *           pattern: "^\\d{2}-\\d{2}-\\d{4} \\d{2}:\\d{2}:\\d{2} \\+07:00$"
 *           description: End date of the policy system
 *           example: "04-02-2025 15:30:45 +07:00"
 *         updateBy:
 *           type: string
 *           description: The user update to the policy system
 */

/**
 * @swagger
 * /api/policy-system/create-policy-system:
 *   post:
 *     summary: Create a new policy system
 *     description: Adds a new policy system to the database
 *     tags:
 *       - PolicySystem
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             $ref: '#/components/schemas/PolicySystem'
 *     responses:
 *       201:
 *         description: Policy system created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Forbidden, requires admin privileges
 */
router.post("/create-policy-system", authMiddleware, isAdmin, createPolicySystem);

/**
 * @swagger
 * /api/policy-system/{id}:
 *   patch:
 *     summary: Update a Policy System
 *     description: Partially update a Policy System by ID.
 *     tags:
 *       - PolicySystem
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Policy System ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               policySystemCategoryId:
 *                 type: string
 *               policySystemBookingId:
 *                 type: string
 *               description:
 *                 type: string
 *               value:
 *                 type: number
 *               unit:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 pattern: "^\\d{2}-\\d{2}-\\d{4} \\d{2}:\\d{2}:\\d{2} \\+07:00$"
 *                 description: Start date of the policy system
 *                 example: "04-02-2025 15:30:45 +07:00"
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 pattern: "^\\d{2}-\\d{2}-\\d{4} \\d{2}:\\d{2}:\\d{2} \\+07:00$"
 *                 description: End date of the policy system
 *                 example: "04-02-2025 15:30:45 +07:00"
 *               isActive:
 *                 type: boolean
 *               staffId:
 *                 type: string
 *               updateBy:
 *                 type: string
 *     responses:
 *       200:
 *         description: Policy System updated successfully
 *       400:
 *         description: Invalid input or date constraints not met
 *       404:
 *         description: Policy System not found
 */
router.patch("/:id", authMiddleware, isAdmin, updatePolicySystem);

/**
 * @swagger
 * /api/policy-system/{id}:
 *   delete:
 *     summary: Delete a policy system
 *     description: Deletes a policy system by its ID
 *     tags:
 *       - PolicySystem
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the policy system to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Policy system deleted successfully
 *       404:
 *         description: Policy system not found
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Forbidden, requires admin privileges
 */
router.delete("/:id", authMiddleware, isAdmin, deletePolicySystem);

/**
 * @swagger
 * /api/policy-system/all-policy-systems:
 *   get:
 *     summary: Get all policy systems
 *     description: Retrieves a list of all policy systems
 *     tags:
 *       - PolicySystem
 *     responses:
 *       200:
 *         description: A list of policy systems
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PolicySystem'
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Forbidden, requires admin privileges
 */
router.get("/all-policy-systems", authMiddleware, isAdmin, getAllPolicySystem);

/**
 * @swagger
 * /api/policy-system/{id}:
 *   get:
 *     summary: Get a specific policy system by ID
 *     description: Retrieves a single policy system by its ID
 *     tags:
 *       - PolicySystem
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the policy system to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The policy system data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PolicySystem'
 *       404:
 *         description: Policy system not found
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Forbidden, requires admin privileges
 */
router.get("/:id", authMiddleware, isAdmin, getPolicySystem);

module.exports = router;
