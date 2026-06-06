import { z } from 'zod';

export const transactionSchema = z.object({
  fundId: z.string().uuid(),
  toFundId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  amount: z.number().positive(),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER', 'LEND', 'BORROW']),
  note: z.string().optional(),
  date: z.date().optional(),
});

export const fundSchema = z.object({
  name: z.string().min(1, "Tên quỹ không được để trống"),
  balance: z.number().default(0),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Tên danh mục không được để trống"),
  type: z.enum(['INCOME', 'EXPENSE']),
  icon: z.string().min(1, "Icon không được để trống"),
  hashtags: z.array(z.string()).optional(),
});

export const budgetSchema = z.object({
  categoryId: z.string().uuid(),
  amountLimit: z.number().nonnegative(),
  period: z.string().regex(/^\d{4}-\d{2}$/),
});

export const transactionFilterSchema = z.object({
  type: z.string().optional(),
  fundId: z.string().optional(),
  categoryId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
  searchTerm: z.string().optional(),
  sortField: z.string().optional().default('date'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().optional().default(15),
});

export type TransactionFilter = z.infer<typeof transactionFilterSchema>;
