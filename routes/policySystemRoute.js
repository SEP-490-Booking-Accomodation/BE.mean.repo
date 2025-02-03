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
 *         - name
 *         - startDate
 *         - endDate
 *       properties:
 *         staffId:
 *           type: string
 *           description: The ID of the staff member
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
 *           format: date
 *           pattern: "^\\d{2}-\\d{2}-\\d{4}$"
 *           description: Start date of the policy system
 *           example: "01-01-2025"
 *         endDate:
 *           type: string
 *           format: date
 *           pattern: "^\\d{2}-\\d{2}-\\d{4}$"
 *           description: End date of the policy system
 *           example: "01-01-2025"
 *         isActive:
 *           type: boolean
 *           description: Status if the policy system is active
 *       example:
 *         staffId: "605c72ef153207001f67d8c"
 *         name: "New Policy"
 *         description: "This policy system is active from now on."
 *         value: "10"
 *         unit: "VND"
 *         startDate: "2025-01-01"
 *         endDate: "2025-12-31"
 *         isActive: true
 */

/**
 * @swagger
 * /api/policy-system/create-policy-system:
 *   post:
 *     summary: Create a new policy system
 *     description: Adds a new policy system to the database
 *     tags:
 *       - Policy System
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
router.post(
  "/create-policysystem",
  authMiddleware,
  isAdmin,
  createPolicySystem
);

/**
 * @swagger
 * /api/policy-system/{id}:
 *   put:
 *     summary: Update an existing policy system
 *     description: Updates a policy system in the database by its ID
 *     tags:
 *       - Policy System
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the policy system to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             $ref: '#/components/schemas/PolicySystem'
 *     responses:
 *       200:
 *         description: Policy system updated successfully
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Policy system not found
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Forbidden, requires admin privileges
 */
router.put("/:id", authMiddleware, isAdmin, updatePolicySystem);

/**
 * @swagger
 * /api/policy-system/{id}:
 *   delete:
 *     summary: Delete a policy system
 *     description: Deletes a policy system by its ID
 *     tags:
 *       - Policy System
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
 *       - Policy System
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
 *       - Policy System
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
