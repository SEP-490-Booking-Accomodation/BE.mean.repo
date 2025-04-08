const express = require("express");
const router = express.Router();
const { authMiddleware, isCustomer, isOwner } = require("../middlewares/authMiddleware");
const {
  createAccommodation,
  updateAccommodation,
  deleteAccommodation,
  getAccommodation,
  getAccommodationsByLocationId,
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
 *         - roomNo
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
 *         roomNo:
 *           type: string
 *           description: Room number of Accommodation
 *         description:
 *           type: string
 *           description: A detailed description of the accommodation
 *         image:
 *           type: string
 *           description: A URL or path to the accommodation's image
 *         status:
 *           type: integer
 *           enum: [1, 2, 3, 4, 5, 6, 7]
 *           description: |
 *             Status code of the rental location:
 *             1 - AVAILABLE
 *             2 - BOOKED
 *             3 - CLEANING
 *             4 - PREPARING
 *             5 - MAINTENANCE
 *             6 - CLOSED
 *             7 - INUSE
 *       example:
 *         rentalLocationId: "63b92f4e17d7b3c2a4e4f3d2"
 *         accommodationTypeId: "63b92f4e17d7b3c2a4e4f3e3"
 *         roomNo: "001"
 *         description: "A luxurious room with all modern amenities."
 *         image: "/uploads/images/accommodation1.jpg"
 *         status: 1
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
router.post(
  "/create-accommodation",
  authMiddleware,
  isOwner,
  createAccommodation
);

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
 * /api/accommodation/all-accommodations:
 *   get:
 *     summary: Get all accommodations
 *     description: Retrieves a list of all accommodations
 *     parameters:
 *       - in: query
 *         name: rentalLocationId
 *         schema:
 *           type: string
 *         required: false
 *         description: The ID of the rental location to filter accommodation
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
router.get("/all-accommodations", getAllAccommodation);

/**
 * @swagger
 * /api/accommodation/{id}:
 *   get:
 *     summary: Get an accommodation
 *     description: Retrieves specific accommodation by ID
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
router.get("/:id", getAccommodation);

/**
 * @swagger
 * /api/accommodation/rental-location/{rentalLocationId}:
 *   get:
 *     summary: Get accommodations by rental location ID
 *     description: Retrieves a list of all accommodations for a specific rental location
 *     parameters:
 *       - in: path
 *         name: rentalLocationId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the rental location to filter accommodations
 *     tags:
 *       - Accommodation
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved accommodations for the specified rental location
 *       404:
 *         description: No accommodations found for this rental location
 *       500:
 *         description: Internal server error
 */
router.get("/rental-location/:rentalLocationId", getAccommodationsByLocationId);
module.exports = router;