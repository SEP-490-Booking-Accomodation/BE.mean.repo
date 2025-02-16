const express = require("express");
const router = express.Router();
const { authMiddleware, isCustomer } = require("../middlewares/authMiddleware");
const {
  createBusinessInformation,
  updateBusinessInformation,
  deleteBusinessInformation,
  getBusinessInformation,
  getAllBusinessInformation,
} = require("../controller/businessInformationCtrl");

/**
 * @swagger
 * components:
 *   schemas:
 *     BusinessInformation:
 *       type: object
 *       required:
 *         - companyName
 *         - representativeName
 *         - citizenIdentification
 *         - companyAddress
 *         - taxID
 *         - businessLicensesFile
 *       properties:
 *         companyName:
 *           type: string
 *           description: The name of the company
 *         representativeName:
 *           type: string
 *           description: The name of the representative
 *         citizenIdentification:
 *           type: string
 *           description: The citizen identification number
 *         companyAddress:
 *           type: string
 *           description: The company's address
 *         taxID:
 *           type: string
 *           description: The company's tax identification number
 *         businessLicensesFile:
 *           type: string
 *           description: A file path or URL to the business license file
 *       example:
 *         companyName: "Example Corp"
 *         representativeName: "John Doe"
 *         citizenIdentification: "123456789"
 *         companyAddress: "123 Business St, Ho Chi Minh City"
 *         taxID: "TAX123456789"
 *         businessLicensesFile: "/uploads/licenses/license123.pdf"
 */


/**
 * @swagger
 * /api/business-information/create-business-information:
 *   post:
 *     summary: Create new business information
 *     description: Creates a new record for business information
 *     tags:
 *       - BusinessInformation
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BusinessInformation'
 *     responses:
 *       201:
 *         description: Business information created successfully
 *       400:
 *         description: Bad request
 */
router.post("/create-business-information", authMiddleware, isCustomer, createBusinessInformation);

/**
 * @swagger
 * /api/business-information/{id}:
 *   put:
 *     summary: Update business information
 *     description: Updates an existing business information record by ID
 *     tags:
 *       - BusinessInformation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the business information to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BusinessInformation'
 *     responses:
 *       200:
 *         description: Business information updated successfully
 *       404:
 *         description: Business information not found
 */
router.put("/:id", authMiddleware, updateBusinessInformation);

/**
 * @swagger
 * /api/business-information/{id}:
 *   delete:
 *     summary: Delete business information
 *     description: Deletes a specific business information record by its ID
 *     tags:
 *       - BusinessInformation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the business information record to delete
 *     responses:
 *       200:
 *         description: Business information deleted successfully
 *       404:
 *         description: Business information not found
 */
router.delete("/:id", authMiddleware, deleteBusinessInformation);

/**
 * @swagger
 * /api/business-information/all-business-information:
 *   get:
 *     summary: Get all business information
 *     description: Retrieves a list of all business information records
 *     tags:
 *       - BusinessInformation
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all business information
 *       404:
 *         description: No business information records found
 */
router.get("/all-business-information", authMiddleware, getAllBusinessInformation);

/**
 * @swagger
 * /api/business-information/{id}:
 *   get:
 *     summary: Get business information
 *     description: Retrieves business information by ID
 *     tags:
 *       - BusinessInformation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the business information
 *     responses:
 *       200:
 *         description: Successfully retrieved business information
 *       404:
 *         description: Business information not found
 */
router.get("/:id", authMiddleware, getBusinessInformation);

module.exports = router;