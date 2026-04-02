import { Response } from "express";
import * as userService from "../services/user.service";
import { AuthRequest } from "../types";
import { sendSuccess } from "../utils/http";
import { updateUserRoleSchema, updateUserStatusSchema } from "../validators/user.validator";

const getRouteId = (value: string | string[]) => (Array.isArray(value) ? value[0] : value);

export const listUsers = async (_req: AuthRequest, res: Response) => {
  const users = await userService.listUsers();
  sendSuccess(res, 200, users);
};

export const updateRole = async (req: AuthRequest, res: Response) => {
  const payload = updateUserRoleSchema.parse(req.body);
  const user = await userService.updateRole(getRouteId(req.params.id), payload, req.user!.userId);
  sendSuccess(res, 200, user);
};

export const updateStatus = async (req: AuthRequest, res: Response) => {
  const payload = updateUserStatusSchema.parse(req.body);
  const user = await userService.updateStatus(getRouteId(req.params.id), payload, req.user!.userId);
  sendSuccess(res, 200, user);
};
