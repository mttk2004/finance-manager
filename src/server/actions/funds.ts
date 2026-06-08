'use server'

import { revalidatePath } from 'next/cache';
import { FundService } from '../services/funds';

export async function getFunds() {
  return await FundService.getAll();
}

export async function createFund(data: {
  name: string;
  balance: number;
}) {
  const newFund = await FundService.create(data);

  revalidatePath('/', 'layout');
  revalidatePath('/settings', 'page');
  return newFund;
}

export async function updateFund(id: string, data: {
  name?: string;
  balance?: number;
}) {
  const updatedFund = await FundService.update(id, data);
  
  revalidatePath('/', 'layout');
  revalidatePath('/settings', 'page');
  return updatedFund;
}

export async function deleteFund(id: string) {
  const result = await FundService.delete(id);
  
  revalidatePath('/', 'layout');
  revalidatePath('/settings', 'page');
  return result;
}

export async function setDefaultFund(id: string) {
  const result = await FundService.setDefault(id);

  revalidatePath('/', 'layout');
  revalidatePath('/settings', 'page');
  return result;
}
