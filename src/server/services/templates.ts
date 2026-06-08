import { db } from '@/lib/db';
import { templates } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';

export class TemplateService {
  static async getAll() {
    return await db.query.templates.findMany({
      with: {
        category: true,
      },
      orderBy: [desc(templates.createdAt)],
    });
  }

  static async create(data: {
    title: string;
    type: 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'LEND' | 'BORROW';
    categoryId?: string;
    amount?: number;
    notePreset?: string;
  }) {
    const [newTemplate] = await db.insert(templates).values({
      ...data,
    }).returning();
    return newTemplate;
  }

  static async update(id: string, data: {
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
    return updatedTemplate;
  }

  static async delete(id: string) {
    return await db.delete(templates).where(eq(templates.id, id)).returning();
  }
}
