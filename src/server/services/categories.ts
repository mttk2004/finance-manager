import { db } from '@/lib/db';
import { categories } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export class CategoryService {
  static async getAll() {
    return await db.select({
      id: categories.id,
      name: categories.name,
      type: categories.type,
      icon: categories.icon,
      hashtags: categories.hashtags
    }).from(categories).orderBy(categories.name);
  }

  static async create(data: {
    name: string;
    type: 'INCOME' | 'EXPENSE';
    icon: string;
    hashtags?: string[];
  }) {
    const [newCat] = await db.insert(categories).values({
      ...data,
      hashtags: data.hashtags || [],
    }).returning();
    return newCat;
  }

  static async update(id: string, data: {
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
    return updatedCat;
  }

  static async delete(id: string, options?: { transferToCategoryId?: string }) {
    return await db.transaction(async (tx) => {
      if (options?.transferToCategoryId) {
        const { transactions } = await import('@/lib/db/schema');
        await tx.update(transactions)
          .set({ categoryId: options.transferToCategoryId })
          .where(eq(transactions.categoryId, id));
      }
      return await tx.delete(categories).where(eq(categories.id, id)).returning();
    });
  }
}
