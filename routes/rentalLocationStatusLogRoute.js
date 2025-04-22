const express = require("express");
const router = express.Router();
const {
    authMiddleware,
    isAdminAndOwner,
} = require("../middlewares/authMiddleware");
const {
    getRentalLocationStatusLogById,
} = require("../controller/rentalLocationStatusLogCtrl.js");

/**
 * @swagger
 * /api/rental-location-status-log/rental/{id}:
 *   get:
 *     summary: Get status logs by rentalLocation ID
 *     tags: [RentalLocationStatusLog]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The rentalLocation ID
 *     responses:
 *       200:
 *         description: Status logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RentalLocationStatusLog'
 *       404:
 *         description: Status logs not found for this rental location
 */

router.get(
    "/rental/:id",
    authMiddleware,
    isAdminAndOwner,
    getRentalLocationStatusLogById
);
module.exports = router;
