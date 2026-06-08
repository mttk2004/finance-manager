import { db } from '@/lib/db';
import { budgets, categories, globalSettings } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export class BudgetService {
  static async getGlobalValues() {
    const setting = await db.query.globalSettings.findFirst({
      where: eq(globalSettings.key, 'global_budgets'),
    });
    return (setting?.value as Record<string, number>) || {};
  }

  static async getByPeriod(period: string) {
    const [monthBudgets, globalBudgets, allCategories] = await Promise.all([
      db.query.budgets.findMany({
        where: eq(budgets.period, period),
        with: { category: true }
      }),
      this.getGlobalValues(),
      db.query.categories.findMany({
        where: eq(categories.type, 'EXPENSE'),
        orderBy: [categories.name],
      })
    ]);
    
    return allCategories.map(cat => {
      const override = monthBudgets.find(b => b.categoryId === cat.id);
      const limit = override ? override.amountLimit : (globalBudgets[cat.id] || 0);
      if (limit === 0 && !override) return null;

      return {
        id: override?.id || `global-${cat.id}`,
        categoryId: cat.id,
        amountLimit: limit,
        period,
        isOverride: !!override,
        category: cat
      };
    }).filter((b): b is NonNullable<typeof b> => b !== null);
  }

  static async upsert(data: {
    categoryId: string;
    amountLimit: number;
    period: string;
    isOverride?: boolean;
  }) {
    const existing = await db.query.budgets.findFirst({
      where: and(eq(budgets.categoryId, data.categoryId), eq(budgets.period, data.period)),
    });

    if (existing) {
      const [updated] = await db.update(budgets)
        .set({ amountLimit: data.amountLimit, isOverride: data.isOverride ?? true })
        .where(eq(budgets.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(budgets)
        .values({
          categoryId: data.categoryId,
          amountLimit: data.amountLimit,
          period: data.period,
          isOverride: data.isOverride ?? true
        })
        .returning();
      return created;
    }
  }

  static async setGlobal(categoryId: string, amountLimit: number) {
    const existing = await db.query.globalSettings.findFirst({
      where: eq(globalSettings.key, 'global_budgets'),
    });

    const currentValues = (existing?.value as Record<string, number>) || {};
    const newValues = { ...currentValues, [categoryId]: amountLimit };

    if (existing) {
      const [updated] = await db.update(globalSettings)
        .set({ value: newValues, updatedAt: new Date() })
        .where(eq(globalSettings.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(globalSettings)
        .values({ key: 'global_budgets', value: newValues })
        .returning();
      return created;
    }
  }
}
