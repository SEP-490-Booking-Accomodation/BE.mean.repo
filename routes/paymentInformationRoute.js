const express = require("express");
const router = express.Router();
const { authMiddleware, isCustomer } = require("../middlewares/authMiddleware");
const {
  createPaymentInformation,
  updatePaymentInformation,
  deletePaymentInformation,
  getPaymentInformation,
  getAllPaymentInformation,
} = require("../controller/paymentInformationCtrl");
/**
 * @swagger
 * components:
 *   schemas:
 *     PaymentInformation:
 *       type: object
 *       required:
 *         - bankName
 *         - bankNo
 *         - bankAccountName
 *       properties:
 *         bankName:
 *           type: string
 *           description: The name of the bank
 *         bankNo:
 *           type: string
 *           description: The bank account number
 *         bankAccountName:
 *           type: string
 *           description: The name associated with the bank account
 *       example:
 *         bankName: "Vietcombank"
 *         bankNo: "1234567890"
 *         bankAccountName: "John Doe"
 */

/**
 * @swagger
 * /api/payment-information/create-payment-information:
 *   post:
 *     summary: Create a new payment information
 *     description: Creates a new payment information record
 *     tags:
 *       - PaymentInformation
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentInformation'
 *     responses:
 *       201:
 *         description: Payment information created successfully
 *       400:
 *         description: Bad request
 */
router.post("/create-payment-information", authMiddleware, isCustomer, createPaymentInformation);

/**
 * @swagger
 * /api/payment-information/{id}:
 *   put:
 *     summary: Update payment information
 *     description: Updates an existing payment information record by ID
 *     tags:
 *       - PaymentInformation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the payment information to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentInformation'
 *     responses:
 *       200:
 *         description: Payment information updated successfully
 *       404:
 *         description: Payment information not found
 */
router.put("/:id", authMiddleware, updatePaymentInformation);

/**
 * @swagger
 * /api/payment-information/{id}:
 *   delete:
 *     summary: Delete payment information
 *     description: Deletes a specific payment information record by its ID
 *     tags:
 *       - PaymentInformation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the payment information to delete
 *     responses:
 *       200:
 *         description: Payment information deleted successfully
 *       404:
 *         description: Payment information not found
 */
router.delete("/:id", authMiddleware, deletePaymentInformation);

/**
 * @swagger
 * /api/payment-information/{id}:
 *   get:
 *     summary: Get payment information
 *     description: Retrieves a specific payment information by ID
 *     tags:
 *       - PaymentInformation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the payment information to retrieve
 *     responses:
 *       200:
 *         description: Successfully retrieved payment information
 *       404:
 *         description: Payment information not found
 */
router.get("/:id", authMiddleware, getPaymentInformation);

/**
 * @swagger
 * /api/payment-information/all-payment-information:
 *   get:
 *     summary: Get all payment information
 *     description: Retrieves a list of all payment information records
 *     tags:
 *       - PaymentInformation
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all payment information
 *       404:
 *         description: No payment information found
 */
router.get("/all-payment-information", authMiddleware, getAllPaymentInformation);

module.exports = router;