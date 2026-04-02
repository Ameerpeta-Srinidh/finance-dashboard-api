import { NextFunction, Response } from "express";
import { Role } from "../types/enums";
import { AuthRequest } from "../types";
import { sendError } from "../utils/http";

export const requireRole =
  (...roles: Role[]) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      sendError(res, 401, "Unauthorized");
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendError(res, 403, "Forbidden: insufficient permissions");
      return;
    }

    next();
  };

export const adminOnly = requireRole(Role.ADMIN);
export const analystAndAbove = requireRole(Role.ANALYST, Role.ADMIN);
export const allRoles = requireRole(Role.VIEWER, Role.ANALYST, Role.ADMIN);
