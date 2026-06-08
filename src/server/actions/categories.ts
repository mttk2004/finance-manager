'use server'

import { unstable_cache, revalidateTag, revalidatePath } from 'next/cache';
import { CategoryService } from '../services/categories';

export const getCachedCategories = unstable_cache(
  async () => {
    return await CategoryService.getAll();
  },
  ['categories'],
  { tags: ['categories'], revalidate: 3600 }
);

export async function getCategories() {
  return await getCachedCategories();
}

export async function createCategory(data: {
  name: string;
  type: 'INCOME' | 'EXPENSE';
  icon: string;
  hashtags?: string[];
}) {
  const newCat = await CategoryService.create(data);

  revalidateTag('categories', 'max');
  revalidatePath('/', 'layout');
  revalidatePath('/settings', 'page');
  
  return newCat;
}

export async function updateCategory(id: string, data: {
  name?: string;
  type?: 'INCOME' | 'EXPENSE';
  icon?: string;
  hashtags?: string[];
}) {
  const updatedCat = await CategoryService.update(id, data);

  revalidateTag('categories', 'max');
  revalidatePath('/', 'layout');
  revalidatePath('/settings', 'page');

  return updatedCat;
}

export async function deleteCategory(id: string) {
  const result = await CategoryService.delete(id);
  
  revalidateTag('categories', 'max');
  revalidatePath('/', 'layout');
  revalidatePath('/settings', 'page');

  return result;
}
