import { Request, Response } from "express";
import * as dashboardService from "../services/dashboard.service";
import { sendSuccess } from "../utils/http";
import {
  monthlyTrendsSchema,
  recentActivitySchema,
} from "../validators/dashboard.validator";

export const getSummary = async (_req: Request, res: Response) => {
  const summary = await dashboardService.getSummary();
  sendSuccess(res, 200, summary);
};

export const getCategoryBreakdown = async (_req: Request, res: Response) => {
  const breakdown = await dashboardService.getCategoryBreakdown();
  sendSuccess(res, 200, breakdown);
};

export const getMonthlyTrends = async (req: Request, res: Response) => {
  const { year } = monthlyTrendsSchema.parse(req.query);
  const trends = await dashboardService.getMonthlyTrends(year);
  sendSuccess(res, 200, trends);
};

export const getRecentActivity = async (req: Request, res: Response) => {
  const { limit } = recentActivitySchema.parse(req.query);
  const activity = await dashboardService.getRecentActivity(limit);
  sendSuccess(res, 200, activity);
};
