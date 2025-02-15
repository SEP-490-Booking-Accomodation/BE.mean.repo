const express = require("express");
const router = express.Router();
const { authMiddleware, isCustomer } = require("../middlewares/authMiddleware");
const {
  createOwner,
  updateOwner,
  deleteOwner,
  getAllOwner,
  getOwner,
} = require("../controller/ownerCtrl");
/**
 * @swagger
 * components:
 *   schemas:
 *     Owner:
 *       type: object
 *       required:
 *         - userId
 *         - paymentInformationId
 *         - businessInformationId
 *       properties:
 *         userId:
 *           type: string
 *           description: The ID of the user associated with this owner
 *         paymentInformationId:
 *           type: string
 *           description: The ID of the payment information related to this owner
 *         businessInformationId:
 *           type: string
 *           description: The ID of the business information related to this owner
 *         isApproved:
 *           type: boolean
 *           description: Indicates whether the owner is approved
 *           default: false
 *         note:
 *           type: string
 *           description: Additional notes for the owner
 */

/**
 * @swagger
 * /api/owner/create-owner:
 *   post:
 *     summary: Create a new owner
 *     tags: [Owner]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Owner'
 *     responses:
 *       201:
 *         description: Owner created successfully
 *       400:
 *         description: Bad request, validation failed
 */
router.post("/create-owner", authMiddleware, createOwner);

/**
 * @swagger
 * /api/owner/{id}:
 *   put:
 *     summary: Update an existing owner
 *     tags: [Owner]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The owner ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Owner'
 *     responses:
 *       200:
 *         description: Owner updated successfully
 *       404:
 *         description: Owner not found
 */
router.put("/:id", authMiddleware, updateOwner);

/**
 * @swagger
 * /api/owner/{id}:
 *   delete:
 *     summary: Delete an owner
 *     tags: [Owner]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The owner ID
 *     responses:
 *       200:
 *         description: Owner deleted successfully
 *       404:
 *         description: Owner not found
 */
router.delete("/:id", authMiddleware, deleteOwner);

/**
 * @swagger
 * /api/owner/all-owners:
 *   get:
 *     summary: Get all owners
 *     tags: [Owner]
 *     responses:
 *       200:
 *         description: List of all owners
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Owner'
 */
router.get("/all-owners", authMiddleware, getAllOwner);

/**
 * @swagger
 * /api/owner/{id}:
 *   get:
 *     summary: Get an owner by ID
 *     tags: [Owner]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The owner ID
 *     responses:
 *       200:
 *         description: Owner details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Owner'
 *       404:
 *         description: Owner not found
 */
router.get("/:id", authMiddleware, getOwner);

module.exports = router;