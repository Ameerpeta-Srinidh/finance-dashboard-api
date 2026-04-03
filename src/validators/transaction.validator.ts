import { z } from "zod";

const transactionTypeSchema = z.enum(["INCOME", "EXPENSE"]);

export const createTransactionSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  type: transactionTypeSchema,
  category: z.string().trim().min(1, "Category is required"),
  date: z.coerce.date(),
  description: z.string().trim().min(1).optional(),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export const filterSchema = z.object({
  type: transactionTypeSchema.optional(),
  category: z.string().trim().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionFilters = z.infer<typeof filterSchema>;
