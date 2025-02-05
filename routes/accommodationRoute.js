const express = require("express");
const router = express.Router();
const { authMiddleware, isCustomer } = require("../middlewares/authMiddleware");
const {
  createAccommodation,
  updateAccommodation,
  deleteAccommodation,
  getAccommodation,
  getAllAccommodation,
} = require("../controller/accommodationCtrl");

/**
 * @swagger
 * components:
 *   schemas:
 *     Accommodation:
 *       type: object
 *       required:
 *         - rentalLocationId
 *         - accommodationTypeId
 *         - description
 *         - image
 *         - status
 *       properties:
 *         rentalLocationId:
 *           type: string
 *           description: The ID of the rental location associated with the accommodation
 *         accommodationTypeId:
 *           type: string
 *           description: The ID of the accommodation type
 *         description:
 *           type: string
 *           description: A detailed description of the accommodation
 *         image:
 *           type: string
 *           description: A URL or path to the accommodation's image
 *         status:
 *           type: boolean
 *           description: The status of the accommodation (active/inactive)
 *       example:
 *         rentalLocationId: "63b92f4e17d7b3c2a4e4f3d2"
 *         accommodationTypeId: "63b92f4e17d7b3c2a4e4f3e3"
 *         description: "A luxurious room with all modern amenities."
 *         image: "/uploads/images/accommodation1.jpg"
 *         status: true
 */

/**
 * @swagger
 * /api/accommodation/create-accommodation:
 *   post:
 *     summary: Create a new accommodation
 *     description: Creates a new accommodation record
 *     tags:
 *       - Accommodation
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Accommodation'
 *     responses:
 *       201:
 *         description: Accommodation created successfully
 *       400:
 *         description: Bad request
 */
router.post("/create-accommodation", authMiddleware, isCustomer, createAccommodation);

/**
 * @swagger
 * /api/accommodation/{id}:
 *   put:
 *     summary: Update an accommodation
 *     description: Updates an existing accommodation record by ID
 *     tags:
 *       - Accommodation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the accommodation to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Accommodation'
 *     responses:
 *       200:
 *         description: Accommodation updated successfully
 *       404:
 *         description: Accommodation not found
 */
router.put("/:id", authMiddleware, updateAccommodation);

/**
 * @swagger
 * /api/accommodation/{id}:
 *   delete:
 *     summary: Delete an accommodation
 *     description: Deletes a specific accommodation record by its ID
 *     tags:
 *       - Accommodation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the accommodation to delete
 *     responses:
 *       200:
 *         description: Accommodation deleted successfully
 *       404:
 *         description: Accommodation not found
 */
router.delete("/:id", authMiddleware, deleteAccommodation);

/**
 * @swagger
 * /api/accommodation/{id}:
 *   get:
 *     summary: Get an accommodation
 *     description: Retrieves a specific accommodation by ID
 *     tags:
 *       - Accommodation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the accommodation to retrieve
 *     responses:
 *       200:
 *         description: Successfully retrieved accommodation
 *       404:
 *         description: Accommodation not found
 */
router.get("/:id", authMiddleware, getAccommodation);

/**
 * @swagger
 * /api/accommodation/all-accommodations:
 *   get:
 *     summary: Get all accommodations
 *     description: Retrieves a list of all accommodations
 *     tags:
 *       - Accommodation
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all accommodations
 *       404:
 *         description: No accommodations found
 */
router.get("/all-accommodations", authMiddleware, getAllAccommodation);
module.exports = router;