'use server'

import { unstable_cache, revalidateTag, revalidatePath } from 'next/cache';
import { BudgetService } from '../services/budgets';

export const getCachedGlobalBudgets = unstable_cache(
  async () => {
    return await BudgetService.getGlobalValues();
  },
  ['global_budgets'],
  { tags: ['global_budgets'], revalidate: 3600 }
);

export async function getGlobalBudgets() {
  return await getCachedGlobalBudgets();
}

export async function getBudgets(period: string) {
  return await BudgetService.getByPeriod(period);
}

export async function upsertBudget(data: {
  categoryId: string;
  amountLimit: number;
  period: string;
  isOverride?: boolean;
}) {
  const result = await BudgetService.upsert(data);

  revalidatePath('/', 'layout');
  revalidatePath('/settings', 'page');
  return result;
}

export async function setGlobalBudget(categoryId: string, amountLimit: number) {
  const result = await BudgetService.setGlobal(categoryId, amountLimit);

  revalidateTag('global_budgets', 'max');
  revalidatePath('/', 'layout');
  revalidatePath('/settings', 'page');
  return result;
}
