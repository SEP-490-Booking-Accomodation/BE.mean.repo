const express = require("express");
const router = express.Router();
const { authMiddleware, isCustomer } = require("../middlewares/authMiddleware");
const {
  createRentalLocation,
  updateRentalLocation,
  deleteRentalLocation,
  getRentalLocation,
  getAllRentalLocation,
  updateRentalLocationStatus,
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
 *         - landUsesRightsFile
 *         - address
 *         - longtitude
 *         - altitude
 *         - openHour
 *         - closeHour
 *         - isOverNight
 *       properties:
 *         ownerId:
 *           type: string
 *           description: The ID of the owner associated with the rental location
 *         name:
 *           type: string
 *           description: The name of the rental location
 *         status:
 *           type: integer
 *           enum: [1, 2, 3, 4]
 *           description: |
 *             Status code of the rental location:
 *             1 - Pending
 *             2 - Inactive
 *             3 - Active
 *             4 - Pause
 *         image:
 *           type: string
 *           description: A URL or path to the rental location's image
 *         description:
 *           type: string
 *           description: A detailed description of the rental location
 *         landUsesRightsFile:
 *           type: string
 *           description: File path for the land usage rights document
 *         address:
 *           type: string
 *           description: The address of the rental location
 *         longtitude:
 *           type: string
 *           description: The longitude coordinate of the rental location
 *         altitude:
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
 *       example:
 *         ownerId: "63b92f4e17d7b3c2a4e4f3d2"
 *         name: "Cozy Rental Space"
 *         status: 1
 *         image: "/uploads/images/rental1.jpg"
 *         description: "A cozy space ideal for short-term stays."
 *         landUsesRightsFile: "/uploads/files/landrights1.pdf"
 *         address: "123 Rental Lane, Ho Chi Minh City, Vietnam"
 *         longtitude: "106.6899"
 *         altitude: "10.7629"
 *         openHour: "08:00"
 *         closeHour: "22:00"
 *         isOverNight: true
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
router.post("/create-rental-location", authMiddleware, isCustomer, createRentalLocation);

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
router.put("/:id", authMiddleware, updateRentalLocation);

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
 *                 enum: [1, 2, 3, 4]
 *                 description: Status code (1-Pending, 2-Inactive, 3-Active, 4-Pause)
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
router.put("/:id/status", authMiddleware, updateRentalLocationStatus);

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
router.delete("/:id", authMiddleware, deleteRentalLocation);

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