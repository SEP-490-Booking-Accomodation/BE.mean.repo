const express = require("express");
const router = express.Router();
const { authMiddleware, isCustomer } = require("../middlewares/authMiddleware");
const {
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getAllTransaction,
  getTransaction,
  getAllTransactionByOwnerId,
} = require("../controller/transactionCtrl");

/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       required:
 *         - paymentCode
 *         - amount
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique ID of the transaction
 *         bookingId:
 *           type: string
 *           description: The ID of the related booking
 *         ownerId:
 *           type: string
 *           description: The ID of the related ownerId
 *         paymentCode:
 *           type: string
 *           description: Unique payment code for the transaction
 *         transactionEndDate:
 *           type: string
 *           format: date-time
 *           pattern: "^\\d{2}-\\d{2}-\\d{4} \\d{2}:\\d{2}:\\d{2}"
 *           description: The end date of the transaction
 *         transactionStatus:
 *           type: boolean
 *           description: The status of the transaction (completed or not)
 *           default: false
 *         description:
 *           type: string
 *           description: Additional details about the transaction
 *         typeTransaction:
 *           type: number
 *           description: The type of transaction (e.g., 1 for default)
 *           default: 1
 *         amount:
 *           type: number
 *           description: The total amount of the transaction
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date when the transaction was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date when the transaction was last updated
 *       example:
 *         bookingId: "63b92f4e17d7b3c2a4e4f3d2"
 *         ownerId: ""
 *         paymentCode: "PAY123456"
 *         transactionEndDate: "06-02-2025 10:30:00"
 *         transactionStatus: true
 *         description: "Payment for booking ID 63b92f4e17d7b3c2a4e4f3d2"
 *         typeTransaction: 1
 *         amount: 500.75
 */

/**
 * @swagger
 * /api/transaction/create-transaction:
 *   post:
 *     summary: Create a new transaction
 *     description: Creates a new transaction entry
 *     tags:
 *       - Transaction
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Transaction'
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Invalid input
 */
router.post("/create-transaction", authMiddleware, createTransaction);

/**
 * @swagger
 * /api/transaction/{id}:
 *   put:
 *     summary: Update a transaction
 *     description: Updates the specified transaction by ID
 *     tags:
 *       - Transaction
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           description: The ID of the transaction to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Transaction'
 *     responses:
 *       200:
 *         description: Transaction updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       404:
 *         description: Transaction not found
 */
router.put("/:id", authMiddleware, updateTransaction);

/**
 * @swagger
 * /api/transaction/{id}:
 *   delete:
 *     summary: Delete a transaction
 *     description: Deletes the specified transaction by ID
 *     tags:
 *       - Transaction
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           description: The ID of the transaction to delete
 *     responses:
 *       200:
 *         description: Transaction deleted successfully
 *       404:
 *         description: Transaction not found
 */
router.delete("/:id", authMiddleware, deleteTransaction);

/**
 * @swagger
 * /api/transaction/all-transactions:
 *   get:
 *     summary: Get all transactions
 *     description: Retrieves a list of all transactions
 *     tags:
 *       - Transaction
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transaction'
 *       404:
 *         description: No transactions found
 */
router.get("/all-transactions", authMiddleware, getAllTransaction);

/**
 * @swagger
 * /api/transaction/all-transactions/{ownerId}:
 *   get:
 *     summary: Get all transactions by ownerId
 *     description: Retrieves a list of all transactions by ownerId
 *     tags:
 *       - Transaction
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ownerId
 *         required: true
 *         schema:
 *           type: string
 *           description: The ID of the transaction to retrieve by ownerId
 *     responses:
 *       200:
 *         description: Successfully retrieved all transactions by ownerId
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transaction'
 *       404:
 *         description: No transactions found
 */
router.get("/all-transactions/:ownerId", authMiddleware, getAllTransactionByOwnerId);

/**
 * @swagger
 * /api/transaction/{id}:
 *   get:
 *     summary: Get a transaction by ID
 *     description: Retrieves a specific transaction by ID
 *     tags:
 *       - Transaction
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           description: The ID of the transaction to retrieve
 *     responses:
 *       200:
 *         description: Successfully retrieved transaction
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       404:
 *         description: Transaction not found
 */
router.get("/:id", authMiddleware, getTransaction);

module.exports = router;