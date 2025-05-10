const express = require("express");
const router = express.Router();
const { authMiddleware, isCustomer, isOwner} = require("../middlewares/authMiddleware");
const {
  createAccommodationType,
  updateAccommodationType,
  deleteAccommodationType,
  getAccommodationType,
  getAllAccommodationType,
  getAccommodationTypeByOwnerId
} = require("../controller/accommodationTypeCtrl");

/**
 * @swagger
 * components:
 *   schemas:
 *     AccommodationType:
 *       type: object
 *       required:
 *         - ownerId
 *         - serviceIds
 *         - name
 *         - description
 *         - maxPeopleNumber
 *         - basePrice
 *         - overtimeHourlyPrice
 *       properties:
 *         ownerId:
 *           type: string
 *           description: TThe ID of the owner associated with this accommodation type
 *         serviceIds:
 *           type: array
 *           items:
 *             type: string
 *           description: The IDs of services associated with this accommodation type
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
 *         numberOfPasswordRoom:
 *           type: integer
 *           enum: [0, 1, 2, 3, 4]
 *           description: The number of password for room
 *             0 - 0 number
 *             1 - 2 numbers
 *             2 - 4 numbers
 *             3 - 6 numbers
 *             4 - 8 numbers
 *         image:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of image URLs for the accommodation type
 *       example:
 *         ownerId: "63b92f4e17d7b3c2a4d4f6h1"
 *         serviceIds: ["63b92f4e17d7b3c2a4e4f3e3", "63b92f4e17d7b3c2a4e4f3e4"]
 *         name: "Deluxe Room"
 *         description: "A spacious room with premium amenities."
 *         maxPeopleNumber: 4
 *         basePrice: 200
 *         overtimeHourlyPrice: 20
 *         numberOfPasswordRoom: 0
 *         image: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
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
router.post(
  "/create-accommodation-type",
  authMiddleware,
  isOwner,
  createAccommodationType
);

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
router.put("/:id", authMiddleware, isOwner, updateAccommodationType);

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
router.delete("/:id", authMiddleware, isOwner, deleteAccommodationType);

/**
 * @swagger
 * /api/accommodation-type/all-accommodation-types:
 *   get:
 *     summary: Get all accommodation types
 *     description: Retrieves a list of all accommodation types, optionally filtered by owner or rental location
 *     tags:
 *       - AccommodationType
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: ownerId
 *         schema:
 *           type: string
 *         description: ID of the owner to filter accommodation types
 *       - in: query
 *         name: rentalLocationId
 *         schema:
 *           type: string
 *         description: ID of the rental location to filter accommodation types
 *     responses:
 *       200:
 *         description: Successfully retrieved accommodation types
 *       404:
 *         description: No accommodation types found
 */

router.get("/all-accommodation-types", getAllAccommodationType);


/**
 * @swagger
 * /api/accommodation-type/by-owner:
 *   get:
 *     summary: Get accommodation types by owner ID
 *     description: Retrieves a list of all accommodation types associated with a specific owner
 *     tags:
 *       - AccommodationType
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: ownerId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the owner to filter accommodation types
 *     responses:
 *       200:
 *         description: Successfully retrieved accommodation types
 *       400:
 *         description: ownerId is required
 *       500:
 *         description: Internal Server Error
 */

router.get("/by-owner", getAccommodationTypeByOwnerId);

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
router.get("/:id", getAccommodationType);

module.exports = router;
