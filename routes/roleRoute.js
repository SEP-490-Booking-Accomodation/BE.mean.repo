const express = require("express");
const router = express.Router();
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const {
  createRole,
  updateRole,
  deleteRole,
  getAllRole,
  getRole,
} = require("../controller/roleCtrl");

/**
 * @swagger
 * tags:
 *   name: Role
 *   description: Role management
 */

/**
 * @swagger
 * /api/role/createrole:
 *   post:
 *     summary: Create a new role
 *     tags: [Role]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               roleName:
 *                 type: string
 *                 description: The name of the role
 *     responses:
 *       201:
 *         description: Role created successfully
 *       400:
 *         description: Invalid input
 */
router.post("/createrole", authMiddleware, isAdmin, createRole);

/**
 * @swagger
 * /api/role/{id}:
 *   put:
 *     summary: Update a role
 *     tags: [Role]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The role ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               roleName:
 *                 type: string
 *                 description: The name of the role
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       400:
 *         description: Invalid input
 */
router.put("/:id", authMiddleware, isAdmin, updateRole);

/**
 * @swagger
 * /api/role/{id}:
 *   delete:
 *     summary: Delete a role
 *     tags: [Role]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The role ID
 *     responses:
 *       200:
 *         description: Role deleted successfully
 *       400:
 *         description: Invalid input
 */
router.delete("/:id", authMiddleware, isAdmin, deleteRole);

/**
 * @swagger
 * /api/role/allrole:
 *   get:
 *     summary: Get all roles
 *     tags: [Role]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of roles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   roleName:
 *                     type: string
 *                     description: The name of the role
 */
router.get("/allrole", authMiddleware, isAdmin, getAllRole);

/**
 * @swagger
 * /api/role/{id}:
 *   get:
 *     summary: Get a role by ID
 *     tags: [Role]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The role ID
 *     responses:
 *       200:
 *         description: Role details
 *         content:
 *           application/x-www-form-urlencoded:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 roleName:
 *                   type: string
 *                   description: The name of the role
 */
router.get("/:id", authMiddleware, isAdmin, getRole);

module.exports = router;
