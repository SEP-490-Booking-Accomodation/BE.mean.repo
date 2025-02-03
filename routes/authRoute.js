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
  updatePassword,
  forgotPasswordToken,
  resetPassword,
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
 *         avatarUrl:
 *           type: array
 *           items:
 *             type: string
 *           description: List of user's avatar URLs
 *         roleID:
 *           type: string
 *           description: Role ID of the user
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
 *               avatarUrl:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of user's avatar URLs
 *                 nullable: true
 *               roleID:
 *                 type: string
 *                 description: Role ID of the user
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
 * /api/user/forgot-password-token:
 *   post:
 *     summary: Generate a forgot password token
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
 *                 description: User email address
 *     responses:
 *       200:
 *         description: Token generated successfully
 *       404:
 *         description: User not found
 */
router.post("/forgot-password-token", forgotPasswordToken);

/**
 * @swagger
 * /api/user/reset-password/{token}:
 *   put:
 *     summary: Reset user password
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         description: Reset password token
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 description: New password for the user
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid token or input
 */
router.put("/reset-password/:token", resetPassword);

/**
 * @swagger
 * /api/user/password:
 *   put:
 *     summary: Update user password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: Current password
 *               newPassword:
 *                 type: string
 *                 description: New password
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       401:
 *         description: Unauthorized or invalid credentials
 */
router.put("/password", authMiddleware, updatePassword);


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
 * /api/user/all-users:
 *   get:
 *     summary: Get all users
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: List of all users
 */
router.get("/all-users", authMiddleware, isAdmin, getAllUser);

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
router.get("/:id", authMiddleware, isAdmin, getUser);

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
 *         application/x-www-form-urlencoded:
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
 * /api/user/active/{id}:
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
router.put("/active/:id", authMiddleware, isAdmin, unblockUser);
//router.delete("/:id", deleteUser);

module.exports = router;
