'use server'

import { db } from '@/lib/db';
import { categories } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath, unstable_cache } from 'next/cache';

export const getCachedCategories = unstable_cache(
  async () => {
    return await db.select({
      id: categories.id,
      name: categories.name,
      type: categories.type,
      icon: categories.icon,
      hashtags: categories.hashtags
    }).from(categories).orderBy(categories.name);
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
  const [newCat] = await db.insert(categories).values({
    ...data,
    hashtags: data.hashtags || [],
  }).returning();

  revalidatePath('/', 'layout');
  return newCat;
}

export async function updateCategory(id: string, data: {
  name?: string;
  type?: 'INCOME' | 'EXPENSE';
  icon?: string;
  hashtags?: string[];
}) {
  const [updatedCat] = await db.update(categories)
    .set({
      ...data,
      hashtags: data.hashtags,
    })
    .where(eq(categories.id, id))
    .returning();

  revalidatePath('/', 'layout');
  return updatedCat;
}

export async function deleteCategory(id: string) {
  const result = await db.delete(categories).where(eq(categories.id, id)).returning();
  revalidatePath('/', 'layout');
  return result;
}
