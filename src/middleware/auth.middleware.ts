import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { AuthPayload, AuthRequest } from "../types";
import { sendError } from "../utils/http";

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    sendError(res, 401, "No token provided");
    return;
  }

  const token = header.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as AuthPayload;
    req.user = payload;
    next();
  } catch {
    sendError(res, 401, "Invalid or expired token");
  }
};
