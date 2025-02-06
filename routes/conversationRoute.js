const express = require("express");
const router = express.Router();
const { authMiddleware, isCustomer } = require("../middlewares/authMiddleware");
const {
  createConversation,
  updateConversation,
  deleteConversation,
  getConversation,
  getAllConversation,
} = require("../controller/conversationCtrl");

/**
 * @swagger
 * components:
 *   schemas:
 *     Conversation:
 *       type: object
 *       required:
 *         - userId
 *         - startedDate
 *         - lastMessage
 *         - lastMessageDate
 *       properties:
 *         userId:
 *           type: string
 *           description: The ID of the user associated with the conversation
 *         startedDate:
 *           type: string
 *           format: date-time
 *           description: The date when the conversation started
 *         lastMessage:
 *           type: string
 *           description: The last message sent in the conversation
 *         lastMessageDate:
 *           type: string
 *           format: date-time
 *           description: The date when the last message was sent
 *         status:
 *           type: boolean
 *           description: The status of the conversation (e.g., active or inactive)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the conversation was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the conversation was last updated
 *       example:
 *         userId: "63b92f4e17d7b3c2a4e4f3d3"
 *         startedDate: "06/02/2025 10:30:00"
 *         lastMessage: "Hello, how are you?"
 *         lastMessageDate: "06/02/2025 11:00:00"
 *         status: true
 */

/**
 * @swagger
 * /api/conversation/create-conversation:
 *   post:
 *     summary: Create a new conversation
 *     description: Creates a new conversation and returns the newly created object
 *     tags:
 *       - Conversation
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Conversation'
 *     responses:
 *       201:
 *         description: Conversation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Conversation'
 *       400:
 *         description: Invalid input
 */
router.post("/create-conversation", authMiddleware, createConversation);

/**
 * @swagger
 * /api/conversation/{id}:
 *   put:
 *     summary: Update a conversation
 *     description: Updates the specified conversation by ID
 *     tags:
 *       - Conversation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           description: The ID of the conversation to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Conversation'
 *     responses:
 *       200:
 *         description: Conversation updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Conversation'
 *       404:
 *         description: Conversation not found
 */
router.put("/:id", authMiddleware, updateConversation);

/**
 * @swagger
 * /api/conversation/{id}:
 *   delete:
 *     summary: Delete a conversation
 *     description: Deletes the specified conversation by ID
 *     tags:
 *       - Conversation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           description: The ID of the conversation to delete
 *     responses:
 *       200:
 *         description: Conversation deleted successfully
 *       404:
 *         description: Conversation not found
 */
router.delete("/:id", authMiddleware, deleteConversation);

/**
 * @swagger
 * /api/conversation/all-conversations:
 *   get:
 *     summary: Get all conversations
 *     description: Retrieves a list of all conversations
 *     tags:
 *       - Conversation
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all conversations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Conversation'
 *       404:
 *         description: No conversations found
 */
router.get("/all-conversations", authMiddleware, getAllConversation);

/**
 * @swagger
 * /api/conversation/{id}:
 *   get:
 *     summary: Get a conversation by ID
 *     description: Retrieves a specific conversation by ID
 *     tags:
 *       - Conversation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           description: The ID of the conversation to retrieve
 *     responses:
 *       200:
 *         description: Successfully retrieved conversation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Conversation'
 *       404:
 *         description: Conversation not found
 */
router.get("/:id", authMiddleware, getConversation);
module.exports = router;

