import { Router } from "express";
import * as dashboardController from "../controllers/dashboard.controller";
import { authenticate } from "../middleware/auth.middleware";
import { analystAndAbove } from "../middleware/role.middleware";
import { asyncHandler } from "../utils/http";

const router = Router();

router.use(authenticate, analystAndAbove);

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: Get overall financial summary
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Summary fetched successfully
 */
router.get("/summary", asyncHandler(dashboardController.getSummary));

/**
 * @swagger
 * /api/dashboard/category-breakdown:
 *   get:
 *     summary: Get category-wise income and expense totals
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Category breakdown fetched successfully
 */
router.get(
  "/category-breakdown",
  asyncHandler(dashboardController.getCategoryBreakdown),
);

/**
 * @swagger
 * /api/dashboard/monthly-trends:
 *   get:
 *     summary: Get monthly income and expense trends for a year
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Monthly trends fetched successfully
 */
router.get("/monthly-trends", asyncHandler(dashboardController.getMonthlyTrends));

/**
 * @swagger
 * /api/dashboard/recent-activity:
 *   get:
 *     summary: Get recent transaction activity
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Recent activity fetched successfully
 */
router.get("/recent-activity", asyncHandler(dashboardController.getRecentActivity));

export default router;
