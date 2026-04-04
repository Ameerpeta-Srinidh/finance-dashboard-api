import { Request, Response } from "express";
import * as transactionService from "../services/transaction.service";
import { AuthRequest } from "../types";
import { sendSuccess } from "../utils/http";
import {
  createTransactionSchema,
  filterSchema,
  updateTransactionSchema,
} from "../validators/transaction.validator";

const getRouteId = (value: string | string[]) => (Array.isArray(value) ? value[0] : value);

export const getAll = async (req: Request, res: Response) => {
  const filters = filterSchema.parse(req.query);
  const result = await transactionService.getAll(filters);

  sendSuccess(res, 200, result.data, result.pagination);
};

export const getOne = async (req: Request, res: Response) => {
  const transaction = await transactionService.getOne(getRouteId(req.params.id));
  sendSuccess(res, 200, transaction);
};

export const create = async (req: AuthRequest, res: Response) => {
  const payload = createTransactionSchema.parse(req.body);
  const transaction = await transactionService.create(payload, req.user!.userId);
  sendSuccess(res, 201, transaction);
};

export const update = async (req: AuthRequest, res: Response) => {
  const payload = updateTransactionSchema.parse(req.body);
  const transaction = await transactionService.update(getRouteId(req.params.id), payload, req.user!.userId);
  sendSuccess(res, 200, transaction);
};

export const remove = async (req: AuthRequest, res: Response) => {
  const transaction = await transactionService.remove(getRouteId(req.params.id), req.user!.userId);
  sendSuccess(res, 200, transaction);
};
