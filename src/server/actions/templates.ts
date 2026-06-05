'use server'

import { db } from '@/lib/db';
import { templates } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getTemplates() {
  return await db.query.templates.findMany({
    with: {
      category: true,
    },
    orderBy: [desc(templates.createdAt)],
  });
}

export async function createTemplate(data: {
  title: string;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'LEND' | 'BORROW';
  categoryId?: string;
  amount?: number;
  notePreset?: string;
}) {
  const [newTemplate] = await db.insert(templates).values({
    ...data,
  }).returning();
  
  revalidatePath('/', 'layout');
  revalidatePath('/settings', 'page');
  return newTemplate;
}

export async function updateTemplate(id: string, data: {
  title?: string;
  type?: 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'LEND' | 'BORROW';
  categoryId?: string;
  amount?: number;
  notePreset?: string;
}) {
  const [updatedTemplate] = await db.update(templates)
    .set({
      ...data,
    })
    .where(eq(templates.id, id))
    .returning();
  
  revalidatePath('/', 'layout');
  revalidatePath('/settings', 'page');
  return updatedTemplate;
}

export async function deleteTemplate(id: string) {
  const result = await db.delete(templates).where(eq(templates.id, id)).returning();
  
  revalidatePath('/', 'layout');
  revalidatePath('/settings', 'page');
  return result;
}
