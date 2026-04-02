import { NextFunction, Request, Response } from "express";
import { PaginationMeta } from "../types";

export const sendSuccess = (
  res: Response,
  statusCode: number,
  data: unknown,
  pagination?: PaginationMeta,
) => {
  res.status(statusCode).json({
    success: true,
    data,
    ...(pagination ? { pagination } : {}),
  });
};

export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  errors?: unknown,
) => {
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
  });
};

export const asyncHandler =
  <TRequest extends Request = Request>(
    handler: (req: TRequest, res: Response, next: NextFunction) => Promise<void>,
  ) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(handler(req as TRequest, res, next)).catch(next);
