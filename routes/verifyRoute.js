const express = require("express");
const router = express.Router();
const { sendVerification, verifyCode } = require("../controller/verifyPhoneCtrl");

// Routes for Twilio Verify

/**
 * @swagger
 * /api/send-verification:
 *   post:
 *     summary: Send a verification code to a phone number
 *     tags: [Phone Verification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 description: The phone number in E.164 format (e.g., +84912345678)
 *                 example: "+84912345678"
 *     responses:
 *       200:
 *         description: Verification code sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Verification code sent"
 *                 referenceId:
 *                   type: string
 *                   example: "some_reference_id"
 *       400:
 *         description: Phone number is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Phone number is required"
 *       403:
 *         description: Phone number is unverified or country is restricted (trial account restriction)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Cannot send verification code"
 *                 details:
 *                   type: string
 *                   example: "This country is restricted for SMS verification in trial mode. Try verifying the number via a voice call in the Telesign Console, or upgrade your account."
 *                 code:
 *                   type: integer
 *                   example: 21608
 *                 status:
 *                   type: integer
 *                   example: 403
 *       500:
 *         description: Failed to send verification code
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to send verification code"
 *                 details:
 *                   type: string
 *                   example: "Invalid phone number"
 *                 code:
 *                   type: integer
 *                 status:
 *                   type: integer
 */
router.post("/send-verification", sendVerification);

/**
 * @swagger
 * /api/send-verification:
 *   post:
 *     summary: Send a verification code to a phone number
 *     tags: [Phone Verification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 description: The phone number in E.164 format (e.g., +12345678901)
 *                 example: "+12345678901"
 *     responses:
 *       200:
 *         description: Verification code sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Verification code sent"
 *                 sid:
 *                   type: string
 *                   example: "VE1234567890abcdef1234567890abcdef"
 *       400:
 *         description: Phone number is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Phone number is required"
 *       500:
 *         description: Failed to send verification code
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to send verification code"
 */
router.post("/verify-code", verifyCode);

module.exports = router;