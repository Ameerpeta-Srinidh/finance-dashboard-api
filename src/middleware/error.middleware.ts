import { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { AppError } from "../utils/errors";
import { sendError } from "../utils/http";

export const notFoundHandler = (_req: Request, res: Response) => {
  sendError(res, 404, "Route not found");
};

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (error instanceof ZodError) {
    sendError(res, 400, "Validation failed", error.flatten());
    return;
  }

  if (error instanceof AppError) {
    sendError(res, error.statusCode, error.message, error.details);
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    sendError(res, 400, "Database request failed", {
      code: error.code,
      meta: error.meta,
    });
    return;
  }

  sendError(res, 500, "Internal server error");
};
