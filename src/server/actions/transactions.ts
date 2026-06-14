'use server'

import { revalidatePath } from 'next/cache';
import { transactionSchema, TransactionFilter } from '@/lib/validations';
import { z } from 'zod';
import { TransactionService } from '../services/transactions';

export async function createTransaction(rawData: z.infer<typeof transactionSchema>) {
  const data = transactionSchema.parse(rawData);
  const result = await TransactionService.create(data);

  revalidatePath('/', 'layout');
  revalidatePath('/transactions', 'page');
  revalidatePath('/charts', 'page');
  return result;
}

export async function updateTransaction(id: string, rawData: z.infer<typeof transactionSchema>) {
  const data = transactionSchema.parse(rawData);
  const result = await TransactionService.update(id, data);

  revalidatePath('/', 'layout');
  revalidatePath('/transactions', 'page');
  revalidatePath('/charts', 'page');
  return result;
}

export async function deleteTransaction(id: string) {
  const result = await TransactionService.delete(id);

  revalidatePath('/', 'layout');
  revalidatePath('/transactions', 'page');
  revalidatePath('/charts', 'page');
  return result;
}

export async function getAllTransactions(rawFilters?: TransactionFilter) {
  return await TransactionService.getAll(rawFilters);
}

export async function importTransactions(csvText: string) {
  const result = await TransactionService.import(csvText);

  revalidatePath('/', 'layout');
  revalidatePath('/transactions', 'page');
  revalidatePath('/charts', 'page');

  return result;
}

export async function checkTransactionsYesterday() {
  return await TransactionService.checkYesterday();
}
