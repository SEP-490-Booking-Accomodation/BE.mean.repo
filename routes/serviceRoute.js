const express = require("express");
const router = express.Router();
const { authMiddleware, isOwner } = require("../middlewares/authMiddleware");
const {
  createService,
  updateService,
  deleteService,
  getService,
  getAllService,
} = require("../controller/serviceCtrl");

/**
 * @swagger
 * components:
 *   schemas:
 *     Service:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - status
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the service
 *         description:
 *           type: string
 *           description: A detailed description of the service
 *         status:
 *           type: boolean
 *           description: The status of the service (active/inactive)
 *       example:
 *         name: "Cleaning Service"
 *         description: "A service to clean and prepare the accommodation for the next guests."
 *         status: true
 */

/**
 * @swagger
 * /api/service/create-service:
 *   post:
 *     summary: Create a new service
 *     description: Creates a new service record
 *     tags:
 *       - Service
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Service'
 *     responses:
 *       201:
 *         description: Service created successfully
 *       400:
 *         description: Bad request
 */
router.post("/create-service", authMiddleware, createService);

/**
 * @swagger
 * /api/service/{id}:
 *   put:
 *     summary: Update a service
 *     description: Updates an existing service record by ID
 *     tags:
 *       - Service
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the service to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Service'
 *     responses:
 *       200:
 *         description: Service updated successfully
 *       404:
 *         description: Service not found
 */
router.put("/:id", authMiddleware, updateService);

/**
 * @swagger
 * /api/service/{id}:
 *   delete:
 *     summary: Delete a service
 *     description: Deletes a specific service record by its ID
 *     tags:
 *       - Service
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the service to delete
 *     responses:
 *       200:
 *         description: Service deleted successfully
 *       404:
 *         description: Service not found
 */
router.delete("/:id", authMiddleware, deleteService);

/**
 * @swagger
 * /api/service/all-services:
 *   get:
 *     summary: Get all services
 *     description: Retrieves a list of all services. Can be filtered by rentalLocationId or ownerId.
 *     parameters:
 *       - in: query
 *         name: rentalLocationId
 *         required: false
 *         schema:
 *           type: string
 *         description: ID of the rental location
 *       - in: query
 *         name: ownerId
 *         required: false
 *         schema:
 *           type: string
 *         description: ID of the owner to filter services by
 *     tags:
 *       - Service
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved services
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: No services found with the specified criteria
 *       500:
 *         description: Internal server error
 */
router.get("/all-services", authMiddleware, getAllService);

/**
 * @swagger
 * /api/service/{id}:
 *   get:
 *     summary: Get a service
 *     description: Retrieves a specific service by ID
 *     tags:
 *       - Service
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the service to retrieve
 *     responses:
 *       200:
 *         description: Successfully retrieved service
 *       404:
 *         description: Service not found
 */
router.get("/:id", authMiddleware, getService);

module.exports = router;  