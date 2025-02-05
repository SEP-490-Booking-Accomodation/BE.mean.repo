const express = require("express");
const router = express.Router();
const { authMiddleware, isCustomer } = require("../middlewares/authMiddleware");
const {
  createPolicyOwner,
  updatePolicyOwner,
  deletePolicyOwner,
  getPolicyOwner,
  getAllPolicyOwner,
} = require("../controller/policyOwnerCtrl");

/**
 * @swagger
 * components:
 *   schemas:
 *     PolicyOwner:
 *       type: object
 *       required:
 *         - policyTitle
 *         - policyDescription
 *         - createdDate
 *         - updatedDate
 *         - startDate
 *         - endDate
 *       properties:
 *         bookingId:
 *           type: string
 *           description: The ID of the owner associated with the policy (reference to Owner model)
 *         policyTitle:
 *           type: string
 *           description: The title of the policy
 *         policyDescription:
 *           type: string
 *           description: A detailed description of the policy
 *         createdDate:
 *           type: string
 *           format: date-time
 *           description: The date when the policy was created
 *         updatedDate:
 *           type: string
 *           format: date-time
 *           description: The date when the policy was last updated
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: The starting date of the policy
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: The ending date of the policy
 *       example:
 *         bookingId: "63b92f4e17d7b3c2a4e4f3d2"
 *         policyTitle: "Cancellation Policy"
 *         policyDescription: "This policy covers cancellation terms for bookings."
 *         createdDate: "2025-02-01T12:00:00Z"
 *         updatedDate: "2025-02-01T12:00:00Z"
 *         startDate: "2025-02-01T12:00:00Z"
 *         endDate: "2025-12-31T12:00:00Z"
 */

/**
 * @swagger
 * /api/policy-owner/create-policy-owner:
 *   post:
 *     summary: Create a new policy owner
 *     description: Creates a new policy owner record
 *     tags:
 *       - PolicyOwner
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PolicyOwner'
 *     responses:
 *       201:
 *         description: Policy owner created successfully
 *       400:
 *         description: Bad request
 */
router.post("/create-policy-owner", authMiddleware, isCustomer, createPolicyOwner);

/**
 * @swagger
 * /api/policy-owner/{id}:
 *   put:
 *     summary: Update a policy owner
 *     description: Updates an existing policy owner record by ID
 *     tags:
 *       - PolicyOwner
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the policy owner to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PolicyOwner'
 *     responses:
 *       200:
 *         description: Policy owner updated successfully
 *       404:
 *         description: Policy owner not found
 */
router.put("/:id", authMiddleware, updatePolicyOwner);


/**
 * @swagger
 * /api/policy-owner/{id}:
 *   delete:
 *     summary: Delete a policy owner
 *     description: Deletes a specific policy owner record by its ID
 *     tags:
 *       - PolicyOwner
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the policy owner to delete
 *     responses:
 *       200:
 *         description: Policy owner deleted successfully
 *       404:
 *         description: Policy owner not found
 */
router.put("/:id", authMiddleware, deletePolicyOwner);


/**
 * @swagger
 * /api/policy-owner/{id}:
 *   get:
 *     summary: Get a policy owner
 *     description: Retrieves a specific policy owner by ID
 *     tags:
 *       - PolicyOwner
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the policy owner to retrieve
 *     responses:
 *       200:
 *         description: Successfully retrieved policy owner
 *       404:
 *         description: Policy owner not found
 */
router.get("/:id", authMiddleware, getPolicyOwner);

/**
 * @swagger
 * /api/policy-owner/all-policy-owner:
 *   get:
 *     summary: Get all policy owners
 *     description: Retrieves a list of all policy owners
 *     tags:
 *       - PolicyOwner
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all policy owners
 *       404:
 *         description: No policy owners found
 */
router.get("/all-policy-owner", authMiddleware, getAllPolicyOwner);

module.exports = router;