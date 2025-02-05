const express = require("express");
const router = express.Router();
const { authMiddleware, isCustomer } = require("../middlewares/authMiddleware");
const {
  createAccommodationType,
  updateAccommodationType,
  deleteAccommodationType,
  getAccommodationType,
  getAllAccommodationType,
} = require("../controller/accommodationTypeCtrl");

/**
 * @swagger
 * components:
 *   schemas:
 *     AccommodationType:
 *       type: object
 *       required:
 *         - rentalLocationId
 *         - serviceId
 *         - name
 *         - description
 *         - maxPeopleNumber
 *         - basePrice
 *         - overtimeHourlyPrice
 *       properties:
 *         rentalLocationId:
 *           type: string
 *           description: The ID of the rental location associated with this accommodation type
 *         serviceId:
 *           type: string
 *           description: The ID of the service associated with this accommodation type
 *         name:
 *           type: string
 *           description: The name of the accommodation type
 *         description:
 *           type: string
 *           description: A detailed description of the accommodation type
 *         maxPeopleNumber:
 *           type: number
 *           description: The maximum number of people allowed for this accommodation type
 *         basePrice:
 *           type: number
 *           description: The base price for this accommodation type
 *         overtimeHourlyPrice:
 *           type: number
 *           description: The hourly price for overtime stay
 *       example:
 *         rentalLocationId: "63b92f4e17d7b3c2a4e4f3d2"
 *         serviceId: "63b92f4e17d7b3c2a4e4f3e3"
 *         name: "Deluxe Room"
 *         description: "A spacious room with premium amenities."
 *         maxPeopleNumber: 4
 *         basePrice: 200
 *         overtimeHourlyPrice: 20
 */

/**
 * @swagger
 * /api/accommodation-type/create-accommodation-type:
 *   post:
 *     summary: Create a new accommodation type
 *     description: Creates a new accommodation type record
 *     tags:
 *       - AccommodationType
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AccommodationType'
 *     responses:
 *       201:
 *         description: Accommodation type created successfully
 *       400:
 *         description: Bad request
 */
router.post("/create-accommodation-type", authMiddleware, isCustomer, createAccommodationType);

/**
 * @swagger
 * /api/accommodation-type/{id}:
 *   put:
 *     summary: Update an accommodation type
 *     description: Updates an existing accommodation type record by ID
 *     tags:
 *       - AccommodationType
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the accommodation type to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AccommodationType'
 *     responses:
 *       200:
 *         description: Accommodation type updated successfully
 *       404:
 *         description: Accommodation type not found
 */
router.put("/:id", authMiddleware, updateAccommodationType);

/**
 * @swagger
 * /api/accommodation-type/{id}:
 *   delete:
 *     summary: Delete an accommodation type
 *     description: Deletes a specific accommodation type record by its ID
 *     tags:
 *       - AccommodationType
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the accommodation type to delete
 *     responses:
 *       200:
 *         description: Accommodation type deleted successfully
 *       404:
 *         description: Accommodation type not found
 */
router.delete("/:id", authMiddleware, deleteAccommodationType);

/**
 * @swagger
 * /api/accommodation-type/{id}:
 *   get:
 *     summary: Get an accommodation type
 *     description: Retrieves a specific accommodation type by ID
 *     tags:
 *       - AccommodationType
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the accommodation type to retrieve
 *     responses:
 *       200:
 *         description: Successfully retrieved accommodation type
 *       404:
 *         description: Accommodation type not found
 */
router.get("/:id", authMiddleware, getAccommodationType);

/**
 * @swagger
 * /api/accommodation-type/all-accommodation-types:
 *   get:
 *     summary: Get all accommodation types
 *     description: Retrieves a list of all accommodation types
 *     tags:
 *       - AccommodationType
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all accommodation types
 *       404:
 *         description: No accommodation types found
 */

router.get("/all-accommodation-types", authMiddleware, getAllAccommodationType);

module.exports = router;
