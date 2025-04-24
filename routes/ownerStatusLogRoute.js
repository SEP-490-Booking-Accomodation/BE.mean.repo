const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  isAdminAndOwner,
} = require("../middlewares/authMiddleware");
const {
  getOwnerStatusLogByOwnerId,
} = require("../controller/ownerStatusLogCtrl.js");

/**
 * @swagger
 * /api/owner-status-log/owner/{id}:
 *   get:
 *     summary: Get status logs by owner ID
 *     tags: [OwnerStatusLog]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The owner ID
 *     responses:
 *       200:
 *         description: Status logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OwnerStatusLog'
 *       404:
 *         description: Status logs not found for this owner
 */

router.get(
  "/owner/:id",
  authMiddleware,
  isAdminAndOwner,
  getOwnerStatusLogByOwnerId
);
module.exports = router;
