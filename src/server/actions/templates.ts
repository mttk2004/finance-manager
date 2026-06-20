'use server'

import { revalidatePath } from 'next/cache';
import { TemplateService } from '../services/templates';

export async function getTemplates() {
  return await TemplateService.getAll();
}

export async function createTemplate(data: {
  title: string;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'LEND' | 'BORROW';
  categoryId?: string;
  amount?: number;
  notePreset?: string;
}) {
  const newTemplate = await TemplateService.create(data);
  
  revalidatePath('/', 'layout');
  return newTemplate;
}

export async function updateTemplate(id: string, data: {
  title?: string;
  type?: 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'LEND' | 'BORROW';
  categoryId?: string;
  amount?: number;
  notePreset?: string;
}) {
  const updatedTemplate = await TemplateService.update(id, data);
  
  revalidatePath('/', 'layout');
  return updatedTemplate;
}

export async function deleteTemplate(id: string) {
  const result = await TemplateService.delete(id);
  
  revalidatePath('/', 'layout');
  return result;
}
