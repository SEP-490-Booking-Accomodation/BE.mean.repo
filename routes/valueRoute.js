const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  isAdmin,
  isOwner,
} = require("../middlewares/authMiddleware");

const {
  createValue,
  updateValue,
  deleteValue,
  getAllValue,
  getValue,
} = require("../controller/valueCtrl");

/**
 * @swagger
 * components:
 *   schemas:
 *     Value:
 *       type: object
 *       properties:
 *         policyOwnerId:
 *           type: string
 *           description: The ID of the policy owner
 *         val:
 *           type: string
 *           description: The first value field
 *         description:
 *           type: string
 *           description: Description of the value
 *         unit:
 *           type: string
 *           description: Unit of the value
 *         valueType:
 *           type: string
 *           description: Type of the value
 *         hashTag:
 *           type: string
 *           description: Hashtag for categorization
 *         note:
 *           type: string
 *           description: note for this value
 *       example:
 *         policyOwnerId: "60f7c2b8d1c5f514d8e7b123"
 *         val1: "Value 1"
 *         val2: "Value 2"
 *         description: "This is a test value"
 *         unit: "kg"
 *         valueType: "numeric"
 *         hashTag: "#test"
 *         note: "abc"
 */

/**
 * @swagger
 * /api/value/create-value:
 *   post:
 *     summary: Create a new value
 *     tags: [Value]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             $ref: '#/components/schemas/Value'
 *     responses:
 *       201:
 *         description: Value created successfully
 *       400:
 *         description: Bad request
 */
router.post("/create-value", authMiddleware, isOwner, createValue);

/**
 * @swagger
 * /api/value/{id}:
 *   put:
 *     summary: Update an existing value
 *     tags: [Value]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The value ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             $ref: '#/components/schemas/Value'
 *     responses:
 *       200:
 *         description: Value updated successfully
 *       404:
 *         description: Value not found
 */
router.put("/:id", authMiddleware, isOwner, updateValue);

/**
 * @swagger
 * /api/value/{id}:
 *   delete:
 *     summary: Delete a value
 *     tags: [Value]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The value ID
 *     responses:
 *       200:
 *         description: Value deleted successfully
 *       404:
 *         description: Value not found
 */
router.delete("/:id", authMiddleware, isOwner, deleteValue);

/**
 * @swagger
 * /api/value/all-values:
 *   get:
 *     summary: Get all values
 *     tags: [Value]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of values
 */
router.get("/all-values", authMiddleware, getAllValue);

/**
 * @swagger
 * /api/value/{id}:
 *   get:
 *     summary: Get a value by ID
 *     tags: [Value]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The value ID
 *     responses:
 *       200:
 *         description: Value details
 *       404:
 *         description: Value not found
 */
router.get("/:id", authMiddleware, getValue);

module.exports = router;
