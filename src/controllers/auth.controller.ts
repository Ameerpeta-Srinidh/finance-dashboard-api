import { Request, Response } from "express";
import * as authService from "../services/auth.service";
import { loginSchema, registerSchema } from "../validators/auth.validator";
import { sendSuccess } from "../utils/http";

export const register = async (req: Request, res: Response) => {
  const payload = registerSchema.parse(req.body);
  const user = await authService.register(payload);
  sendSuccess(res, 201, user);
};

export const login = async (req: Request, res: Response) => {
  const payload = loginSchema.parse(req.body);
  const result = await authService.login(payload);
  sendSuccess(res, 200, result);
};
