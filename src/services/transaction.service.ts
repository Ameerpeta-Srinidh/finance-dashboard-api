import { Prisma } from "@prisma/client";
import { prisma } from "../utils/prisma";
import { AppError } from "../utils/errors";
import { logAction } from "./audit.service";
import {
  CreateTransactionInput,
  TransactionFilters,
  UpdateTransactionInput,
} from "../validators/transaction.validator";

const transactionSelect = {
  id: true,
  amount: true,
  type: true,
  category: true,
  date: true,
  description: true,
  isDeleted: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} as const;

const buildWhereClause = (filters: TransactionFilters): Prisma.TransactionWhereInput => {
  const where: Prisma.TransactionWhereInput = {
    isDeleted: false,
  };

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.category) {
    where.category = {
      contains: filters.category,
    };
  }

  if (filters.startDate || filters.endDate) {
    where.date = {};

    if (filters.startDate) {
      where.date.gte = filters.startDate;
    }

    if (filters.endDate) {
      where.date.lte = filters.endDate;
    }
  }

  return where;
};

export const getAll = async (filters: TransactionFilters) => {
  const { page, limit } = filters;
  const where = buildWhereClause(filters);

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { date: "desc" },
      select: transactionSelect,
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    data: transactions,
    pagination: {
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
};

export const getOne = async (id: string) => {
  const transaction = await prisma.transaction.findFirst({
    where: {
      id,
      isDeleted: false,
    },
    select: transactionSelect,
  });

  if (!transaction) {
    throw new AppError("Transaction not found", 404);
  }

  return transaction;
};

export const create = async (payload: CreateTransactionInput, userId: string) => {
  const transaction = await prisma.transaction.create({
    data: {
      ...payload,
      userId,
    },
    select: transactionSelect,
  });

  await logAction(userId, "CREATE", transaction.id, payload);

  return transaction;
};

export const update = async (id: string, payload: UpdateTransactionInput, userId: string) => {
  await getOne(id);

  const updatedTransaction = await prisma.transaction.update({
    where: { id },
    data: payload,
    select: transactionSelect,
  });

  await logAction(userId, "UPDATE", id, payload);

  return updatedTransaction;
};

export const remove = async (id: string, userId: string) => {
  await getOne(id);

  const deletedTransaction = await prisma.transaction.update({
    where: { id },
    data: { isDeleted: true },
    select: transactionSelect,
  });

  await logAction(userId, "DELETE", id, { isDeleted: true });

  return deletedTransaction;
};
