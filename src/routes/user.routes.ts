import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { authenticate } from "../middleware/auth.middleware";
import { adminOnly } from "../middleware/role.middleware";
import { asyncHandler } from "../utils/http";

const router = Router();

router.use(authenticate, adminOnly);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: List all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users fetched successfully
 *       403:
 *         description: Admin only
 */
router.get("/", asyncHandler(userController.listUsers));

/**
 * @swagger
 * /api/users/{id}/role:
 *   patch:
 *     summary: Change a user's role
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [VIEWER, ANALYST, ADMIN]
 *     responses:
 *       200:
 *         description: Role updated
 */
router.patch("/:id/role", asyncHandler(userController.updateRole));

/**
 * @swagger
 * /api/users/{id}/status:
 *   patch:
 *     summary: Change a user's status
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch("/:id/status", asyncHandler(userController.updateStatus));

export default router;
