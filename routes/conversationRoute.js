const express = require("express");
const router = express.Router();
const { authMiddleware, isCustomer } = require("../middlewares/authMiddleware");
const {
  createConversation,
  updateConversation,
  deleteConversation,
  getConversation,
  getAllConversation,
  getUserConversations,
  getConversationBetweenUsers,
} = require("../controller/conversationCtrl");

/**
 * @swagger
 * components:
 *   schemas:
 *     Conversation:
 *       type: object
 *       required:
 *         - participants
 *       properties:
 *         participants:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of user IDs participating in the conversation (exactly 2)
 *         lastMessage:
 *           type: string
 *           description: Reference to the last message in the conversation
 *         joinDate:
 *           type: string
 *           format: date-time
 *           description: The date when the conversation started
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
 *         participants: ["63b92f4e17d7b3c2a4e4f3d3", "63b92f4e17d7b3c2a4e4f3d4"]
 *         joinDate: "06/02/2025 10:30:00"
 *         status: true
 */

/**
 * @swagger
 * /api/conversation/create-conversation:
 *   post:
 *     summary: Create a new conversation between two users
 *     description: Creates a new conversation with exactly 2 participants and returns the newly created object
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
 *       200:
 *         description: Conversation already exists
 *       400:
 *         description: Invalid input (must have exactly 2 participants)
 */
router.post("/create-conversation", createConversation);

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
 *       404:
 *         description: Conversation not found
 */
router.put("/:id", updateConversation);

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
router.delete("/:id", deleteConversation);

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
 *       404:
 *         description: No conversations found
 */
router.get("/all-conversations", getAllConversation);

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
 *       404:
 *         description: Conversation not found
 */
router.get("/:id", getConversation);

/**
 * @swagger
 * /api/conversation/user/{userId}:
 *   get:
 *     summary: Get all conversations for a user
 *     description: Retrieves all conversations where the specified user is a participant
 *     tags:
 *       - Conversation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           description: The ID of the user to get conversations for
 *     responses:
 *       200:
 *         description: Successfully retrieved user conversations
 *       404:
 *         description: No conversations found for this user
 */
router.get("/user/:userId", getUserConversations);

/**
 * @swagger
 * /api/conversation/between/{userId1}/{userId2}:
 *   get:
 *     summary: Get conversation between two users
 *     description: Retrieves the conversation between two specific users
 *     tags:
 *       - Conversation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId1
 *         required: true
 *         schema:
 *           type: string
 *           description: The ID of the first user
 *       - in: path
 *         name: userId2
 *         required: true
 *         schema:
 *           type: string
 *           description: The ID of the second user
 *     responses:
 *       200:
 *         description: Successfully retrieved conversation
 *       404:
 *         description: No conversation found between these users
 */
router.get("/between/:userId1/:userId2", getConversationBetweenUsers);

module.exports = router;