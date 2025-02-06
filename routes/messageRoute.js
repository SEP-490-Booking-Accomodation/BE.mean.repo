const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/authMiddleware");
const {
  createMessage,
  getMessagesByConversation,
  updateMessage,
  deleteMessage,
} = require("../controller/messageCtrl");
/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       required:
 *         - conversationId
 *         - content
 *       properties:
 *         conversationId:
 *           type: string
 *           description: The ID of the conversation this message belongs to
 *         content:
 *           type: string
 *           description: The content of the message
 *         status:
 *           type: boolean
 *           description: The status of the message (e.g., read or unread)
 *           default: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the message was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the message was last updated
 *       example:
 *         conversationId: "63b92f4e17d7b3c2a4e4f3d2"
 *         content: "Hello, how are you?"
 *         status: false
 */

/**
 * @swagger
 * /api/message/create-message:
 *   post:
 *     summary: Create a new message
 *     description: Creates a new message in a conversation and updates the conversation's lastMessage and lastMessageDate
 *     tags:
 *       - Message
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Message'
 *     responses:
 *       201:
 *         description: Message created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       400:
 *         description: Missing required fields or invalid input
 */
router.post("/create-message", authMiddleware, createMessage);

/**
 * @swagger
 * /api/message/{conversationId}:
 *   get:
 *     summary: Get all messages in a conversation
 *     description: Retrieves all messages for a specific conversation by its ID
 *     tags:
 *       - Message
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *           description: The ID of the conversation to retrieve messages for
 *     responses:
 *       200:
 *         description: Successfully retrieved all messages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *       404:
 *         description: No messages found for the specified conversation
 */
router.get("/:conversationId", authMiddleware, getMessagesByConversation);

/**
 * @swagger
 * /api/message/{id}:
 *   put:
 *     summary: Update a message
 *     description: Updates the content or status of a specific message
 *     tags:
 *       - Message
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           description: The ID of the message to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Message'
 *     responses:
 *       200:
 *         description: Message updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       404:
 *         description: Message not found
 */
router.put("/:id", authMiddleware, updateMessage);

/**
 * @swagger
 * /api/message/{id}:
 *   delete:
 *     summary: Delete a message
 *     description: Deletes a message by its ID
 *     tags:
 *       - Message
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           description: The ID of the message to delete
 *     responses:
 *       200:
 *         description: Message deleted successfully
 *       404:
 *         description: Message not found
 */
router.delete("/:id", authMiddleware, deleteMessage);

module.exports = router;