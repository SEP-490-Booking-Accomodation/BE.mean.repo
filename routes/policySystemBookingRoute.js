// const express = require("express");
// const router = express.Router();
// const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
// const {
//   createPolicySystemBooking,
//   updatePolicySystemBooking,
//   deletePolicySystemBooking,
//   getPolicySystemBooking,
//   getAllPolicySystemBooking,
// } = require("../controller/policySystemBookingCtrl");

// /**
//  * @swagger
//  * components:
//  *   schemas:
//  *     PolicySystemBooking:
//  *       type: object
//  *       required:
//  *         - value
//  *         - unit
//  *       properties:
//  *         value:
//  *           type: string
//  *           description: The value of the policy system Booking
//  *         unit:
//  *           type: string
//  *           description: The unit of the policy system Booking
//  */

// /**
//  * @swagger
//  * /api/policy-system-booking/create-policy-system-booking:
//  *   post:
//  *     summary: Create a new policy system Booking
//  *     description: Adds a new policy system Booking to the database
//  *     tags:
//  *       - PolicySystemBooking
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/x-www-form-urlencoded:
//  *           schema:
//  *             $ref: '#/components/schemas/PolicySystemBooking'
//  *     responses:
//  *       201:
//  *         description: Policy system booking created successfully
//  *       400:
//  *         description: Invalid input data
//  *       401:
//  *         description: Unauthorized access
//  *       403:
//  *         description: Forbidden, requires admin privileges
//  */
// router.post(
//   "/create-policy-system-booking",
//   authMiddleware,
//   isAdmin,
//   createPolicySystemBooking
// );

// /**
//  * @swagger
//  * /api/policy-system-booking/{id}:
//  *   put:
//  *     summary: Update an existing policy system Booking
//  *     description: Updates a policy system Booking by its ID
//  *     tags:
//  *       - PolicySystemBooking
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         description: The ID of the policy system Booking to update
//  *         schema:
//  *           type: string
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/x-www-form-urlencoded:
//  *           schema:
//  *             $ref: '#/components/schemas/PolicySystemBooking'
//  *     responses:
//  *       200:
//  *         description: Policy system Booking updated successfully
//  *       400:
//  *         description: Invalid input data
//  *       404:
//  *         description: Policy system Booking not found
//  *       401:
//  *         description: Unauthorized access
//  *       403:
//  *         description: Forbidden, requires admin privileges
//  */
// router.put("/:id", authMiddleware, isAdmin, updatePolicySystemBooking);

// // /**
// //  * @swagger
// //  * /api/policy-system-categories/{id}:
// //  *   delete:
// //  *     summary: Delete a policy system Booking
// //  *     description: Deletes a policy system Booking by its ID
// //  *     tags:
// //  *       - PolicySystemBooking
// //  *     parameters:
// //  *       - in: path
// //  *         name: id
// //  *         required: true
// //  *         description: The ID of the policy system Booking to delete
// //  *         schema:
// //  *           type: string
// //  *     responses:
// //  *       200:
// //  *         description: Policy system Booking deleted successfully
// //  *       404:
// //  *         description: Policy system Booking not found
// //  *       401:
// //  *         description: Unauthorized access
// //  *       403:
// //  *         description: Forbidden, requires admin privileges
// //  */
// // router.delete("/:id", authMiddleware, isAdmin, deletePolicySystemBooking);

// /**
//  * @swagger
//  * /api/policy-system-booking/all-policy-system-bookings:
//  *   get:
//  *     summary: Get all policy system categories
//  *     description: Retrieves a list of all policy system categories
//  *     tags:
//  *       - PolicySystemBooking
//  *     responses:
//  *       200:
//  *         description: A list of policy system categories
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: array
//  *               items:
//  *                 $ref: '#/components/schemas/PolicySystemBooking'
//  *       401:
//  *         description: Unauthorized access
//  *       403:
//  *         description: Forbidden, requires admin privileges
//  */
// router.get(
//   "/all-policy-system-bookings",
//   authMiddleware,
//   isAdmin,
//   getAllPolicySystemBooking
// );

// /**
//  * @swagger
//  * /api/policy-system-booking/{id}:
//  *   get:
//  *     summary: Get a specific policy system Booking by ID
//  *     description: Retrieves a single policy system Booking by its ID
//  *     tags:
//  *       - PolicySystemBooking
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         description: The ID of the policy system Booking to retrieve
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: The policy system Booking data
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/PolicySystemBooking'
//  *       404:
//  *         description: Policy system Booking not found
//  *       401:
//  *         description: Unauthorized access
//  *       403:
//  *         description: Forbidden, requires admin privileges
//  */
// router.get("/:id", authMiddleware, isAdmin, getPolicySystemBooking);

// module.exports = router;
