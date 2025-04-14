const express = require("express");
const router = express.Router();
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const {
  createLandUsesRight,
  updateLandUsesRight,
  deleteLandUsesRight,
  getAllLandUsesRight,
  getLandUsesRight,
  getLandUsesRightByRentalLocationId
} = require("../controller/landUsesRightCtrl");

/**
 * @swagger
 * components:
 *   schemas:
 *     LandUsesRight:
 *       type: object
 *       properties:
 *         adminId:
 *           type: string
 *           description: Reference to the admin object ID
 *         rentalLocationId:
 *           type: string
 *           description: Reference to the RentalLocation object ID
 *         documentName:
 *           type: string
 *           description: Name of the document
 *         documentType:
 *           type: string
 *           description: Type of the document
 *         documentStatus:
 *           type: boolean
 *           description: Status of the document (approved/not approved)
 *           default: false
 *         documentFile:
 *           type: array
 *           description: Array of document files
 *           items:
 *             type: string
 *         uploadDate:
 *           type: string
 *           format: date-time
 *           pattern: "^\\d{2}/\\d{2}/\\d{4} \\d{2}:\\d{2}:\\d{2}$"
 *           description: Date when the document was uploaded
 *           example: "24/02/2025 15:30:45"
 *         approvedDate:
 *           type: string
 *           format: date-time
 *           pattern: "^\\d{2}/\\d{2}/\\d{4} \\d{2}:\\d{2}:\\d{2}$"
 *           description: Date when the document was approved
 *           example: "24/02/2025 15:30:45"
 *         refuseDate:
 *           type: string
 *           format: date-time
 *           pattern: "^\\d{2}/\\d{2}/\\d{4} \\d{2}:\\d{2}:\\d{2}$"
 *           description: Date when the document was refused
 *           example: "24/02/2025 15:30:45"
 *         note:
 *           type: string
 *           description: Additional notes about the document
 *         isDelete:
 *           type: boolean
 *           description: Flag indicating if the document is deleted
 *           default: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           pattern: "^\\d{2}/\\d{2}/\\d{4} \\d{2}:\\d{2}:\\d{2}$"
 *           description: Document creation timestamp
 *           example: "24/02/2025 15:30:45"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           pattern: "^\\d{2}/\\d{2}/\\d{4} \\d{2}:\\d{2}:\\d{2}$"
 *           description: Document last update timestamp
 *           example: "24/02/2025 15:30:45"
 *       required:
 *         - rentalLocationId
 *       example:
 *         adminId: "60d0fe4f5311236168a109cb"
 *         rentalLocationId: "60d0fe4f5311236168a109cc"
 *         documentName: "Land Certificate"
 *         documentType: "Certificate"
 *         documentStatus: false
 *         documentFile: ["file1.pdf", "file2.jpg"]
 *         uploadDate: "24/02/2025 15:30:45"
 *         approvedDate: null
 *         refuseDate: null
 *         note: "Pending review"
 *         isDelete: false
 *         createdAt: "24/02/2025 15:30:45"
 *         updatedAt: "24/02/2025 15:30:45"
 */


/**
 * @swagger
 * /api/land-uses-right/create-land-uses-right:
 *   post:
 *     summary: Create a new land uses right document
 *     description: Creates a new land uses right document
 *     tags:
 *       - LandUsesRight
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LandUsesRight'
 *     responses:
 *       201:
 *         description: Land uses right document created successfully
 *       400:
 *         description: Bad request
 */

router.post("/create-land-uses-right", authMiddleware, createLandUsesRight);

/**
 * @swagger
 * /api/land-uses-right/{id}:
 *   put:
 *     summary: Update a land uses right document
 *     description: Updates an existing land uses right document
 *     tags:
 *       - LandUsesRight
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Land uses right document ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LandUsesRight'
 *     responses:
 *       200:
 *         description: Land uses right document updated successfully
 *       404:
 *         description: Land uses right document not found
 */
router.put("/:id", authMiddleware, updateLandUsesRight);


/**
 * @swagger
 * /api/land-uses-right/{id}:
 *   delete:
 *     summary: Delete a land uses right document
 *     description: Soft deletes a land uses right document
 *     tags:
 *       - LandUsesRight
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Land uses right document ID
 *     responses:
 *       200:
 *         description: Land uses right document deleted successfully
 *       404:
 *         description: Land uses right document not found
 */
router.delete("/:id", authMiddleware, deleteLandUsesRight);

/**
 * @swagger
 * /api/land-uses-right/all-land-uses-right:
 *   get:
 *     summary: Get all land uses right documents
 *     description: Retrieves all land uses right documents
 *     tags:
 *       - LandUsesRight
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of land uses right documents retrieved successfully
 */
router.get("/all-land-uses-right", getAllLandUsesRight);

/**
 * @swagger
 * /api/land-uses-right/{id}:
 *   get:
 *     summary: Get a land uses right document
 *     description: Retrieves a specific land uses right document by ID
 *     tags:
 *       - LandUsesRight
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Land uses right document ID
 *     responses:
 *       200:
 *         description: Land uses right document retrieved successfully
 *       404:
 *         description: Land uses right document not found
 */
router.get("/:id", getLandUsesRight);

/**
 * @swagger
 * /api/land-uses-right/rental/{rentalLocationId}:
 *   get:
 *     summary: Get a land uses right document by rentalLocationId
 *     description: Retrieves a specific land uses right document associated with the provided rentalLocationId
 *     tags:
 *       - LandUsesRight
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rentalLocationId
 *         required: true
 *         schema:
 *           type: string
 *         description: RentalLocationId to find associated land uses right document
 *     responses:
 *       200:
 *         description: Land uses right document retrieved successfully
 *       404:
 *         description: No land uses right document found for this RentalLocationId
 */
router.get("/rental/:rentalLocationId", getLandUsesRightByRentalLocationId);

module.exports = router;