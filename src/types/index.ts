import { Request } from "express";
import { Role } from "./enums";

export interface AuthPayload {
  userId: string;
  role: Role;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export interface PaginationMeta {
  total: number;
  page: number;
  totalPages: number;
}
