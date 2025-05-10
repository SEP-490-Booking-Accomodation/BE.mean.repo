const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  isOwner,
  isAdminAndOwner,
} = require("../middlewares/authMiddleware");
const {
  createRentalLocation,
  updateRentalLocation,
  deleteRentalLocation,
  getRentalLocation,
  getAllRentalLocation,
  updateRentalLocationStatus,
  getAllAccommodationTypeOfRentalLocation,
  getAllRentalLocationHaveRating,
} = require("../controller/rentalLocationCtrl");

/**
 * @swagger
 * components:
 *   schemas:
 *     RentalLocation:
 *       type: object
 *       required:
 *         - name
 *         - status
 *         - image
 *         - description
 *         - landUsesRightId
 *         - address
 *         - ward
 *         - district
 *         - city
 *         - province
 *         - longitude
 *         - latitude
 *         - openHour
 *         - closeHour
 *         - isOverNight
 *         - note
 *       properties:
 *         ownerId:
 *           type: string
 *           description: The ID of the owner associated with the rental location
 *         landUsesRightsId:
 *           type: string
 *           description: The ID of the land use rights associated with the rental location
 *         accommodationTypeIds:
 *           type: array
 *           items:
 *             type: string
 *             description: Array of accommodation type IDs associated with the rental location
 *         name:
 *           type: string
 *           description: The name of the rental location
 *         status:
 *           type: integer
 *           enum: [1, 2, 3, 4, 5, 6]
 *           description: |
 *             Status code of the rental location:
 *             1 - Pending
 *             2 - Inactive
 *             3 - Active
 *             4 - Pause
 *             5 - Deleted
 *             6 - Needs_Update
 *         image:
 *           type: array
 *           items:
 *             type: string
 *             description: A URL or path to the rental location's image
 *         description:
 *           type: string
 *           description: A detailed description of the rental location
 *         address:
 *           type: string
 *           description: The full address of the rental location
 *         ward:
 *           type: string
 *           description: The ward of the rental location
 *         district:
 *           type: string
 *           description: The district of the rental location
 *         city:
 *           type: string
 *           description: The city where the rental location is situated
 *         province:
 *           type: string
 *           description: The province where the rental location is situated (if different from the city)
 *         longitude:
 *           type: string
 *           description: The longitude coordinate of the rental location
 *         latitude:
 *           type: string
 *           description: The latitude coordinate of the rental location
 *         openHour:
 *           type: string
 *           description: The opening hour of the rental location (HH:mm format)
 *         closeHour:
 *           type: string
 *           description: The closing hour of the rental location (HH:mm format)
 *         isOverNight:
 *           type: boolean
 *           description: Whether overnight stay is allowed
 *         note:
 *           type: string
 *           description: note of rental location
 *       example:
 *         ownerId: "63b92f4e17d7b3c2a4e4f3d2"
 *         landUsesRightId: "63b92f4e1722b3c2a4e4f3f2"
 *         accommodationTypeIds: ["67f8937365532b4157a80116", "67f8933e65532b4157a800ad"]
 *         name: "Cozy Rental Space"
 *         status: 1
 *         image: ["/uploads/images/rental1.jpg"]
 *         description: "A cozy space ideal for short-term stays."
 *         address: "123 Rental Lane"
 *         ward: "Ward 5"
 *         district: "District 3"
 *         city: "Ho Chi Minh City"
 *         province: "Ho Chi Minh"
 *         longitude: "106.6899"
 *         latitude: "10.7629"
 *         openHour: "08:00"
 *         closeHour: "22:00"
 *         isOverNight: true
 *         note: "Additional notes for the owner"
 */

/**
 * @swagger
 * /api/rental-location/create-rental-location:
 *   post:
 *     summary: Create a new rental location
 *     description: Creates a new rental location record
 *     tags:
 *       - RentalLocation
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RentalLocation'
 *     responses:
 *       201:
 *         description: Rental location created successfully
 *       400:
 *         description: Bad request
 */
router.post(
  "/create-rental-location",
  authMiddleware,
  isOwner,
  createRentalLocation
);

/**
 * @swagger
 * /api/rental-location/{id}:
 *   put:
 *     summary: Update a rental location
 *     description: Updates an existing rental location record by ID
 *     tags:
 *       - RentalLocation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the rental location to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RentalLocation'
 *     responses:
 *       200:
 *         description: Rental location updated successfully
 *       404:
 *         description: Rental location not found
 */
router.put("/:id", authMiddleware, isAdminAndOwner, updateRentalLocation);

/**
 * @swagger
 * /api/rental-location/{id}/status:
 *   put:
 *     summary: Update rental location status
 *     description: Updates only the status field of a rental location
 *     tags:
 *       - RentalLocation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the rental location to update status
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: integer
 *                 enum: [1, 2, 3, 4, 5, 6]
 *                 description: Status code (1-Pending, 2-Inactive, 3-Active, 4-Pause, 5-Deleted, 6-Needs_Update)
 *           example:
 *             status: 3
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       400:
 *         description: Invalid status value
 *       404:
 *         description: Rental location not found
 */
router.put(
  "/:id/status",
  authMiddleware,
  isAdminAndOwner,
  updateRentalLocationStatus
);

/**
 * @swagger
 * /api/rental-location/{id}:
 *   delete:
 *     summary: Delete a rental location
 *     description: Deletes a specific rental location record by its ID
 *     tags:
 *       - RentalLocation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the rental location to delete
 *     responses:
 *       200:
 *         description: Rental location deleted successfully
 *       404:
 *         description: Rental location not found
 */
router.delete("/:id", authMiddleware, isOwner, deleteRentalLocation);

/**
 * @swagger
 * /api/rental-location/all-rental-location:
 *   get:
 *     summary: Get all rental locations
 *     description: Retrieves a list of all rental locations
 *     parameters:
 *       - in: query
 *         name: ownerId
 *         schema:
 *           type: string
 *         required: false
 *         description: The ID of the owner to filter rental locations
 *     tags:
 *       - RentalLocation
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all rental locations
 *       404:
 *         description: No rental locations found
 */

router.get("/all-rental-location", getAllRentalLocation);

/**
 * @swagger
 * /api/rental-location/all-rental-location-with-rating:
 *   get:
 *     summary: Get all rental locations
 *     description: Retrieves a list of all rental locations
 *     parameters:
 *       - in: query
 *         name: ownerId
 *         schema:
 *           type: string
 *         required: false
 *         description: The ID of the owner to filter rental locations
 *     tags:
 *       - RentalLocation
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all rental locations
 *       404:
 *         description: No rental locations found
 */

router.get("/all-rental-location-with-rating", getAllRentalLocationHaveRating);

/**
 * @swagger
 * /api/rental-location/all-accommodation-type-of-rental-location/{id}:
 *   get:
 *     summary: Get all accommodation Type of rental location
 *     description: Get all accommodation Type of rental location record by its ID
 *     tags:
 *       - RentalLocation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the rental location to find
 *     responses:
 *       200:
 *         description: Successfully retrieved all accommodation Type of rental location
 *       404:
 *         description: Rental location not found
 */
router.get(
  "/all-accommodation-type-of-rental-location/:id",
  getAllAccommodationTypeOfRentalLocation
);

/**
 * @swagger
 * /api/rental-location/{id}:
 *   get:
 *     summary: Get a rental location
 *     description: Retrieves a specific rental location by ID
 *     tags:
 *       - RentalLocation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the rental location to retrieve
 *     responses:
 *       200:
 *         description: Successfully retrieved rental location
 *       404:
 *         description: Rental location not found
 */
router.get("/:id", getRentalLocation);

module.exports = router;
