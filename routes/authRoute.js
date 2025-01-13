const express = require("express");
const {
  createUser,
  loginUserCtrl,
  getAllUser,
  getUser,
  deleteUser,
  updateUser,
  blockUser,
  unblockUser,
  handleRefreshToken,
  logout,
  getAllBrandUser,
  getAllContentUser,
  getAllMediaUser,
} = require("../controller/userCtrl");

const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         fullName:
 *           type: string
 *           description: Full name of the user
 *         email:
 *           type: string
 *           description: Email address of the user
 *         password:
 *           type: string
 *           description: Password of the user
 *         phone:
 *           type: string
 *           description: Phone number of the user
 *         doB:
 *           type: string
 *           format: date
 *           pattern: "^\\d{2}-\\d{2}-\\d{4}$"
 *           description: Date of birth of the user
 *           example: "12-02-2001"
 *         roleID:
 *           type: string
 *           description: Role ID of the user
 *         isActive:
 *           type: boolean
 *           description: Indicates if the user is active
 *         isVerifiedEmail:
 *           type: boolean
 *           description: Indicates if the user's email is verified
 *         isVerifiedPhone:
 *           type: boolean
 *           description: Indicates if the user's phone is verified
 */

/**
 * @swagger
 * /api/user/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 description: Full name of the user
 *               email:
 *                 type: string
 *                 description: Email address of the user
 *               password:
 *                 type: string
 *                 description: Password of the user
 *               phone:
 *                 type: string
 *                 description: Phone number of the user
 *               doB:
 *                 type: string
 *                 format: date
 *                 pattern: "^\\d{2}-\\d{2}-\\d{4}$"
 *                 description: Date of birth of the user
 *                 example: "12-02-2001"
 *               roleID:
 *                 type: string
 *                 description: Role ID of the user
 *               isActive:
 *                 type: boolean
 *                 description: Indicates if the user is active
 *               isVerifiedEmail:
 *                 type: boolean
 *                 description: Indicates if the user's email is verified
 *               isVerifiedPhone:
 *                 type: boolean
 *                 description: Indicates if the user's phone is verified
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input
 */
router.post("/register", createUser);

/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: User email
 *               password:
 *                 type: string
 *                 description: User password
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", loginUserCtrl);

/**
 * @swagger
 * /api/user/all-users:
 *   get:
 *     summary: Get all users
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: List of all users
 */

/**
 * @swagger
 * /api/user/refresh:
 *   get:
 *     summary: Refresh user token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 */
router.get("/refresh", handleRefreshToken);

/**
 * @swagger
 * /api/user/logout:
 *   get:
 *     summary: Logout a user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: User logged out successfully
 */
router.get("/logout", logout);

/**
 * @swagger
 * /api/user/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 */
router.get("/:id", authMiddleware, getUser);

/**
 * @swagger
 * /api/user/edit-user/{id}:
 *   put:
 *     summary: Update user details
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Invalid input
 */

router.put("/edit-user/:id", authMiddleware, updateUser);

/**
 * @swagger
 * /api/user/block-user/{id}:
 *   put:
 *     summary: Block a user
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User blocked successfully
 *       404:
 *         description: User not found
 */
router.put("/block-user/:id", authMiddleware, isAdmin, blockUser);

/**
 * @swagger
 * /api/user/unblock-user/{id}:
 *   put:
 *     summary: Unblock a user
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User unblocked successfully
 *       404:
 *         description: User not found
 */
router.put("/unblock-user/:id", authMiddleware, isAdmin, unblockUser);
router.delete("/:id", deleteUser);

module.exports = router;
