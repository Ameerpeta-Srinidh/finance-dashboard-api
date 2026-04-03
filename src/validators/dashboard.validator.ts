import { z } from "zod";

export const monthlyTrendsSchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100).default(new Date().getFullYear()),
});

export const recentActivitySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
});
