'use server'

import { revalidatePath, revalidateTag } from 'next/cache';
import { DashboardService } from '../services/dashboard';

export async function getDashboardData() {
  return await DashboardService.getData();
}

export async function resetData() {
  const result = await DashboardService.resetAll();

  revalidatePath('/', 'layout');
  revalidatePath('/transactions', 'page');
  revalidatePath('/charts', 'page');
  revalidatePath('/settings', 'page');
  revalidateTag('categories', 'max');
  revalidateTag('global_budgets', 'max');

  return result;
}
