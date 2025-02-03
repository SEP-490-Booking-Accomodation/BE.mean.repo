const express = require("express");
const router = express.Router();
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const {
  createPolicySystemCategory,
  updatePolicySystemCategory,
  deletePolicySystemCategory,
  getPolicySystemCategory,
  getAllPolicySystemCategory,
} = require("../controller/policySystemCategoryCtrl");

/**
 * @swagger
 * components:
 *   schemas:
 *     PolicySystemCategory:
 *       type: object
 *       required:
 *         - categoryKey
 *         - categoryName
 *       properties:
 *         categoryKey:
 *           type: string
 *           description: The key for the policy system category
 *         categoryName:
 *           type: string
 *           description: The name of the policy system category
 *         categoryDescription:
 *           type: string
 *           description: A description for the policy system category
 */

/**
 * @swagger
 * /api/policy-system-categories/create-policysystemcategory:
 *   post:
 *     summary: Create a new policy system category
 *     description: Adds a new policy system category to the database
 *     tags:
 *       - PolicySystemCategory
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             $ref: '#/components/schemas/PolicySystemCategory'
 *     responses:
 *       201:
 *         description: Policy system category created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Forbidden, requires admin privileges
 */
router.post(
  "/create-policysystemcategory",
  authMiddleware,
  isAdmin,
  createPolicySystemCategory
);

/**
 * @swagger
 * /api/policy-system-categories/{id}:
 *   put:
 *     summary: Update an existing policy system category
 *     description: Updates a policy system category by its ID
 *     tags:
 *       - PolicySystemCategory
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the policy system category to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             $ref: '#/components/schemas/PolicySystemCategory'
 *     responses:
 *       200:
 *         description: Policy system category updated successfully
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Policy system category not found
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Forbidden, requires admin privileges
 */
router.put("/:id", authMiddleware, isAdmin, updatePolicySystemCategory);

/**
 * @swagger
 * /api/policy-system-categories/{id}:
 *   delete:
 *     summary: Delete a policy system category
 *     description: Deletes a policy system category by its ID
 *     tags:
 *       - PolicySystemCategory
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the policy system category to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Policy system category deleted successfully
 *       404:
 *         description: Policy system category not found
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Forbidden, requires admin privileges
 */
router.delete("/:id", authMiddleware, isAdmin, deletePolicySystemCategory);

/**
 * @swagger
 * /api/policy-system-categories/all-policysystemcategories:
 *   get:
 *     summary: Get all policy system categories
 *     description: Retrieves a list of all policy system categories
 *     tags:
 *       - PolicySystemCategory
 *     responses:
 *       200:
 *         description: A list of policy system categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PolicySystemCategory'
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Forbidden, requires admin privileges
 */
router.get(
  "/all-policysystemcategories",
  authMiddleware,
  isAdmin,
  getAllPolicySystemCategory
);

/**
 * @swagger
 * /api/policy-system-categories/{id}:
 *   get:
 *     summary: Get a specific policy system category by ID
 *     description: Retrieves a single policy system category by its ID
 *     tags:
 *       - PolicySystemCategory
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the policy system category to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The policy system category data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PolicySystemCategory'
 *       404:
 *         description: Policy system category not found
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Forbidden, requires admin privileges
 */
router.get("/:id", authMiddleware, isAdmin, getPolicySystemCategory);

module.exports = router;
