'use server'

import { db } from './index';
import { funds, transactions, categories, budgets, globalSettings, templates } from './schema';
import { desc, eq, sql, and, gte, lt } from 'drizzle-orm';
import { revalidatePath, unstable_cache } from 'next/cache';
import { Category } from '@/types';

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

export const getCachedGlobalBudgets = unstable_cache(
  async () => {
    const setting = await db.query.globalSettings.findFirst({
      where: eq(globalSettings.key, 'global_budgets'),
    });
    return (setting?.value as Record<string, number>) || {};
  },
  ['global_budgets'],
  { tags: ['global_budgets'], revalidate: 3600 }
);

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
  return updatedTemplate;
}

export async function deleteTemplate(id: string) {
  const result = await db.delete(templates).where(eq(templates.id, id)).returning();
  revalidatePath('/', 'layout');
  return result;
}

export async function importTransactions(csvText: string) {
  const lines = csvText.split('\n');
  if (lines.length <= 1) return { success: false, count: 0 };

  const allFunds = await db.select().from(funds);
  const allCategories = await db.select().from(categories);

  const typeMap: Record<string, 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'LEND' | 'BORROW'> = {
    'Thu nhập': 'INCOME',
    'Chi tiêu': 'EXPENSE',
    'Chuyển tiền': 'TRANSFER',
    'Vay': 'BORROW',
    'Cho vay': 'LEND',
    'INCOME': 'INCOME',
    'EXPENSE': 'EXPENSE',
    'TRANSFER': 'TRANSFER',
    'LEND': 'LEND',
    'BORROW': 'BORROW'
  };

  const results = await db.transaction(async (tx) => {
    let importedCount = 0;
    
    // Skip header
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Simple CSV split that handles quotes
      const parts = [];
      let current = '';
      let inQuotes = false;
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          parts.push(current);
          current = '';
        } else {
          current += char;
        }
      }
      parts.push(current);

      // Expected order from export: ID, Ngày giờ, Loại, Danh mục, Quỹ, Số tiền, Ghi chú
      // Or at least try to match headers if possible, but for now we follow export format
      // Header: ['ID', 'Ngày giờ', 'Loại', 'Danh mục', 'Quỹ', 'Số tiền', 'Ghi chú']
      if (parts.length < 6) continue;

      const dateStr = parts[1];
      const typeStr = parts[2];
      const categoryName = parts[3];
      const fundName = parts[4];
      const amount = parseInt(parts[5]);
      const note = parts[6]?.replace(/^"|"$/g, '').replace(/""/g, '"');

      const fund = allFunds.find(f => f.name === fundName);
      if (!fund) continue;

      const category = allCategories.find(c => c.name === categoryName);
      const type = typeMap[typeStr] || 'EXPENSE';

      // Insert transaction
      await tx.insert(transactions).values({
        fundId: fund.id,
        categoryId: category?.id,
        amount,
        type,
        note,
        date: dateStr ? new Date(dateStr) : new Date(),
      });

      // Update fund balance
      let newBalance = fund.balance || 0;
      if (type === 'INCOME' || type === 'BORROW') {
        newBalance += amount;
      } else if (type === 'EXPENSE' || type === 'LEND' || type === 'TRANSFER') {
        newBalance -= amount;
      }
      
      await tx.update(funds)
        .set({ balance: newBalance, updatedAt: new Date() })
        .where(eq(funds.id, fund.id));
      
      // Update fund in local list so subsequent rows use updated balance
      fund.balance = newBalance;

      importedCount++;
    }

    return importedCount;
  });

  revalidatePath('/', 'layout');
  return { success: true, count: results };
}

export async function getDashboardData() {
  const now = new Date();
  const currentMonthPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // 1. Optimized parallel queries
  const [
    allFunds,
    recentTransactions,
    monthAggregates,
    lastMonthAggregates,
    monthBudgets,
    expenseCategories,
    hasTransactionsYesterday,
    allCategories,
    initialCashFlow,
    allTemplates,
    globalBudgets
  ] = await Promise.all([
    db.select({ id: funds.id, name: funds.name, balance: funds.balance, isDefault: funds.isDefault }).from(funds),
    db.query.transactions.findMany({
      columns: { id: true, amount: true, type: true, date: true, note: true },
      with: {
        category: { columns: { id: true, name: true, icon: true } },
        fund: { columns: { name: true } },
        toFund: { columns: { name: true } },
      },
      orderBy: [desc(transactions.date)],
      limit: 5,
    }),
    // Current month spent by category
    db.select({ 
      categoryId: transactions.categoryId, 
      total: sql<number>`sum(${transactions.amount})::int` 
    })
    .from(transactions)
    .where(and(
      gte(transactions.date, startOfMonth),
      lt(transactions.date, startOfNextMonth),
      eq(transactions.type, 'EXPENSE')
    ))
    .groupBy(transactions.categoryId),
    // Last month total spent
    db.select({ 
      total: sql<number>`sum(${transactions.amount})::int` 
    })
    .from(transactions)
    .where(and(
      gte(transactions.date, startOfLastMonth),
      lt(transactions.date, new Date(endOfLastMonth.getTime() + 86400000)),
      eq(transactions.type, 'EXPENSE')
    )),
    db.query.budgets.findMany({
      where: eq(budgets.period, currentMonthPeriod),
      columns: { id: true, amountLimit: true, categoryId: true }
    }),
    db.query.categories.findMany({
      where: eq(categories.type, 'EXPENSE'),
      columns: { id: true, name: true, icon: true }
    }),
    checkTransactionsYesterday(),
    getCachedCategories(),
    getCashFlowData('this-month'),
    getTemplates(),
    getCachedGlobalBudgets()
  ]);

  const spendingByCategory = monthAggregates.reduce((acc, curr) => {
    if (curr.categoryId) acc[curr.categoryId] = curr.total;
    return acc;
  }, {} as Record<string, number>);

  const budgetTracking = expenseCategories.map(cat => {
    const override = monthBudgets.find(b => b.categoryId === cat.id);
    const limit = override ? override.amountLimit : (globalBudgets[cat.id] || 0);
    
    if (limit === 0 && !override) return null;

    return {
      id: override?.id || cat.id,
      categoryId: cat.id,
      amountLimit: limit,
      period: currentMonthPeriod,
      spent: spendingByCategory[cat.id] || 0,
      category: cat,
      isOverride: !!override
    };
  }).filter((b): b is NonNullable<typeof b> => b !== null);

  const totalSpentMonth = Object.values(spendingByCategory).reduce((acc, val) => acc + val, 0);
  const totalBudgetMonth = budgetTracking.reduce((acc, b) => acc + b.amountLimit, 0);
  const totalSpentLastMonth = lastMonthAggregates[0]?.total || 0;
  const totalBalance = allFunds.reduce((acc, fund) => acc + (fund.balance || 0), 0);
  
  return {
    allFunds,
    recentTransactions,
    totalBalance,
    showReminder: !hasTransactionsYesterday && recentTransactions.length > 0,
    budgetTracking,
    totalSpentMonth,
    totalSpentLastMonth,
    totalBudgetMonth,
    currentMonthPeriod,
    allCategories,
    initialCashFlow,
    allTemplates,
  };
}

export async function createTransaction(data: {
  fundId: string;
  toFundId?: string;
  categoryId?: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'LEND' | 'BORROW';
  note?: string;
}) {
  return await db.transaction(async (tx) => {
    let finalCategoryId = data.categoryId;

    // Automatic category detection from hashtag if not explicitly provided
    if (!finalCategoryId && data.note) {
      const foundHashtags = data.note.match(/#\w+/g);
      if (foundHashtags) {
        const lowerHashtags = foundHashtags.map(t => t.toLowerCase());
        
        // Use SQL to find matching categories efficiently
        const matchedCategories = await tx.select({ id: categories.id, name: categories.name, hashtags: categories.hashtags })
          .from(categories)
          .where(sql`${categories.hashtags} && ${lowerHashtags}::text[]`);

        if (matchedCategories.length > 0) {
          finalCategoryId = matchedCategories[0].id;
        } else {
          // Fallback to hardcoded priority mapping if needed, but fetch only relevant category
          const tagMap: Record<string, string> = {
            '#mua_sam': 'Mua sắm',
            '#an_sang': 'Ăn uống',
            '#cafe': 'Ăn uống',
            '#di_chuyen': 'Di chuyển',
            '#vui_ve': 'Giải trí',
            '#lam_viec': 'Học tập',
            '#luong': 'Lương',
            '#thuong': 'Tiền thưởng',
            '#kinh_doanh': 'Kinh doanh',
            '#qua_tang': 'Quà tặng',
          };

          for (const tag of lowerHashtags) {
            const categoryName = tagMap[tag];
            if (categoryName) {
              const matched = await tx.query.categories.findFirst({
                where: eq(categories.name, categoryName),
                columns: { id: true }
              });
              if (matched) {
                finalCategoryId = matched.id;
                break;
              }
            }
          }
        }
      }
    }

    // Insert transaction
    const [newTx] = await tx.insert(transactions).values({
      fundId: data.fundId,
      toFundId: data.toFundId,
      categoryId: finalCategoryId,
      amount: data.amount,
      type: data.type,
      note: data.note,
      date: new Date(),
    }).returning();

    // Update main fund balance
    const fund = await tx.query.funds.findFirst({
      where: eq(funds.id, data.fundId),
    });

    if (fund) {
      let newBalance = fund.balance || 0;
      if (data.type === 'INCOME' || data.type === 'BORROW') {
        newBalance += data.amount;
      } else if (data.type === 'EXPENSE' || data.type === 'LEND' || data.type === 'TRANSFER') {
        newBalance -= data.amount;
      }
      
      await tx.update(funds)
        .set({ balance: newBalance, updatedAt: new Date() })
        .where(eq(funds.id, data.fundId));
    }

    // Update destination fund balance if it's a transfer
    if (data.type === 'TRANSFER' && data.toFundId) {
      const toFund = await tx.query.funds.findFirst({
        where: eq(funds.id, data.toFundId),
      });

      if (toFund) {
        await tx.update(funds)
          .set({ balance: (toFund.balance || 0) + data.amount, updatedAt: new Date() })
          .where(eq(funds.id, data.toFundId));
      }
    }

    revalidatePath('/', 'layout');
    return newTx;
  });
}

export async function deleteTransaction(id: string) {
  return await db.transaction(async (tx) => {
    const transaction = await tx.query.transactions.findFirst({
      where: eq(transactions.id, id),
    });

    if (!transaction) throw new Error("Transaction not found");

    // Revert balance changes
    const fund = await tx.query.funds.findFirst({
      where: eq(funds.id, transaction.fundId),
    });

    if (fund) {
      let newBalance = fund.balance || 0;
      // Reverse the logic of createTransaction
      if (transaction.type === 'INCOME' || transaction.type === 'BORROW') {
        newBalance -= transaction.amount;
      } else if (transaction.type === 'EXPENSE' || transaction.type === 'LEND' || transaction.type === 'TRANSFER') {
        newBalance += transaction.amount;
      }

      await tx.update(funds)
        .set({ balance: newBalance, updatedAt: new Date() })
        .where(eq(funds.id, transaction.fundId));
    }

    if (transaction.type === 'TRANSFER' && transaction.toFundId) {
      const toFund = await tx.query.funds.findFirst({
        where: eq(funds.id, transaction.toFundId),
      });

      if (toFund) {
        await tx.update(funds)
          .set({ balance: (toFund.balance || 0) - transaction.amount, updatedAt: new Date() })
          .where(eq(funds.id, transaction.toFundId));
      }
    }

    await tx.delete(transactions).where(eq(transactions.id, id));
    
    revalidatePath('/', 'layout');
    return true;
  });
}

export async function updateFund(id: string, data: {
  name?: string;
  balance?: number;
}) {
  const [updatedFund] = await db.update(funds)
    .set({ 
      ...data,
      updatedAt: new Date() 
    })
    .where(eq(funds.id, id))
    .returning();
  
  revalidatePath('/', 'layout');
  return updatedFund;
}

export async function createFund(data: {
  name: string;
  balance: number;
}) {
  const [newFund] = await db.insert(funds).values({
    name: data.name,
    balance: data.balance,
    isDefault: false,
  }).returning();

  revalidatePath('/', 'layout');
  return newFund;
}

export async function deleteFund(id: string) {
  // Prevent deleting the default fund
  const fund = await db.query.funds.findFirst({
    where: eq(funds.id, id),
  });
  
  if (fund?.isDefault) {
    throw new Error("Cannot delete the default fund");
  }

  const result = await db.delete(funds).where(eq(funds.id, id)).returning();
  revalidatePath('/', 'layout');
  return result;
}

export async function getFunds() {
  return await db.select({
    id: funds.id,
    name: funds.name,
    balance: funds.balance,
    isDefault: funds.isDefault
  }).from(funds).orderBy(funds.name);
}

export async function getCategories() {
  return await db.select({
    id: categories.id,
    name: categories.name,
    type: categories.type,
    icon: categories.icon,
    hashtags: categories.hashtags
  }).from(categories).orderBy(categories.name);
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

export async function getAllTransactions() {
  return await db.query.transactions.findMany({
    with: {
      category: true,
      fund: true,
    },
    orderBy: [desc(transactions.date)],
  });
}

export async function getBudgets(period: string) {
  const [monthBudgets, globalBudgets, allCategories] = await Promise.all([
    db.query.budgets.findMany({
      where: eq(budgets.period, period),
      with: {
        category: true,
      }
    }),
    getGlobalBudgets(),
    db.query.categories.findMany({
      where: eq(categories.type, 'EXPENSE'),
      orderBy: [categories.name],
    })
  ]);
  
  // Return combined view for settings
  return allCategories.map(cat => {
    const override = monthBudgets.find(b => b.categoryId === cat.id);
    const limit = override ? override.amountLimit : (globalBudgets[cat.id] || 0);
    
    if (limit === 0 && !override) return null;

    return {
      id: override?.id || `global-${cat.id}`,
      categoryId: cat.id,
      amountLimit: limit,
      period: period,
      isOverride: !!override,
      category: cat
    };
  }).filter((b): b is NonNullable<typeof b> => b !== null);
}

export async function upsertBudget(data: {
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
      .set({ 
        amountLimit: data.amountLimit,
        isOverride: data.isOverride ?? true
      })
      .where(eq(budgets.id, existing.id))
      .returning();
    revalidatePath('/', 'layout');
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
    revalidatePath('/', 'layout');
    return created;
  }
}

export async function getGlobalBudgets() {
  const setting = await db.query.globalSettings.findFirst({
    where: eq(globalSettings.key, 'global_budgets'),
  });
  return (setting?.value as Record<string, number>) || {};
}

export async function setGlobalBudget(categoryId: string, amountLimit: number) {
  const existing = await db.query.globalSettings.findFirst({
    where: eq(globalSettings.key, 'global_budgets'),
  });

  const currentValues = (existing?.value as Record<string, number>) || {};
  const newValues = { ...currentValues, [categoryId]: amountLimit };

  if (existing) {
    const result = await db.update(globalSettings)
      .set({ value: newValues, updatedAt: new Date() })
      .where(eq(globalSettings.id, existing.id))
      .returning();
    revalidatePath('/', 'layout');
    return result;
  } else {
    const result = await db.insert(globalSettings)
      .values({
        key: 'global_budgets',
        value: newValues,
      })
      .returning();
    revalidatePath('/', 'layout');
    return result;
  }
}

export async function getCashFlowData(range: 'this-month' | 'last-month' | 'last-3-months' | 'last-6-months' | 'last-12-months' | 'all-time') {
  const now = new Date();
  let startDate = new Date();
  let aggregateBy: 'day' | 'month' = 'day';

  if (range === 'this-month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    aggregateBy = 'day';
  } else if (range === 'last-month') {
    startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endDate = new Date(now.getFullYear(), now.getMonth(), 0);
    return await aggregateTransactions(startDate, endDate, 'day');
  } else if (range === 'last-3-months') {
    startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    aggregateBy = 'day';
  } else if (range === 'last-6-months') {
    startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    aggregateBy = 'month';
  } else if (range === 'last-12-months') {
    startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    aggregateBy = 'month';
  } else if (range === 'all-time') {
    const firstTx = await db.query.transactions.findFirst({
      orderBy: [transactions.date],
    });
    startDate = firstTx?.date ? new Date(firstTx.date) : new Date(now.getFullYear(), 0, 1);
    aggregateBy = 'month';
  }

  return await aggregateTransactions(startDate, now, aggregateBy);
}

export async function getCategorySpendingData(range: 'this-month' | 'last-month' | 'last-3-months' | 'last-6-months' | 'last-12-months' | 'all-time') {
  const now = new Date();
  let startDate = new Date();

  if (range === 'this-month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (range === 'last-month') {
    startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endDate = new Date(now.getFullYear(), now.getMonth(), 0);
    return await calculateCategorySpending(startDate, endDate);
  } else if (range === 'last-3-months') {
    startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  } else if (range === 'last-6-months') {
    startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  } else if (range === 'last-12-months') {
    startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  } else {
    const firstTx = await db.query.transactions.findFirst({
      orderBy: [transactions.date],
    });
    startDate = firstTx?.date ? new Date(firstTx.date) : new Date(now.getFullYear(), 0, 1);
  }

  return await calculateCategorySpending(startDate, now);
}

async function calculateCategorySpending(startDate: Date, endDate: Date) {
  const txs = await db.query.transactions.findMany({
    where: and(
      gte(transactions.date, startDate),
      lt(transactions.date, new Date(endDate.getTime() + 86400000)),
      eq(transactions.type, 'EXPENSE')
    ),
    with: {
      category: true,
    }
  });

  const spendingMap: Record<string, { id: string, name: string, icon: string | null, spent: number, category: Category | null | undefined }> = {};

  txs.forEach(tx => {
    const catId = tx.categoryId || 'other';
    if (!spendingMap[catId]) {
      spendingMap[catId] = {
        id: catId,
        name: tx.category?.name || 'Khác',
        icon: tx.category?.icon || null,
        spent: 0,
        category: tx.category
      };
    }
    spendingMap[catId].spent += tx.amount;
  });

  return Object.values(spendingMap);
}

async function aggregateTransactions(startDate: Date, endDate: Date, by: 'day' | 'month') {
  const txs = await db.query.transactions.findMany({
    where: and(
      gte(transactions.date, startDate),
      lt(transactions.date, new Date(endDate.getTime() + 86400000))
    ),
  });

  const groups: Record<string, { name: string, income: number, expense: number }> = {};

  // Initialize groups to ensure all periods are represented
  let current = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  
  while (current <= end) {
    const key = by === 'day' 
      ? current.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
      : `T${current.getMonth() + 1}`;
    
    if (!groups[key]) {
      groups[key] = { name: key, income: 0, expense: 0 };
    }
    
    if (by === 'day') {
      current.setDate(current.getDate() + 1);
    } else {
      // Move to first day of next month to avoid day 31 issues
      current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    }
  }

  txs.forEach(tx => {
    if (!tx.date) return;
    const date = new Date(tx.date);
    const key = by === 'day'
      ? date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
      : `T${date.getMonth() + 1}`;
    
    if (groups[key]) {
      if (tx.type === 'INCOME') groups[key].income += tx.amount;
      else if (tx.type === 'EXPENSE') groups[key].expense += tx.amount;
    }
  });

  return Object.values(groups);
}

export async function getReportData(startDate: Date, endDate: Date) {
  const txs = await db.query.transactions.findMany({
    where: and(
      gte(transactions.date, startDate),
      lt(transactions.date, new Date(endDate.getTime() + 86400000))
    ),
    with: {
      category: true,
      fund: true,
    }
  });

  const income = txs.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
  const expense = txs.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);
  
  // Aggregate by category
  const categoryMap: Record<string, { id: string, name: string, icon: string | null, spent: number }> = {};
  txs.filter(t => t.type === 'EXPENSE').forEach(t => {
    const catId = t.categoryId || 'other';
    const catName = t.category?.name || 'Khác';
    if (!categoryMap[catId]) {
      categoryMap[catId] = { id: catId, name: catName, icon: t.category?.icon || null, spent: 0 };
    }
    categoryMap[catId].spent += t.amount;
  });

  // Aggregate by day for chart
  const cashFlow = await aggregateTransactions(startDate, endDate, 'day');

  return {
    summary: {
      income,
      expense,
      net: income - expense,
      transactionCount: txs.length
    },
    categorySpending: Object.values(categoryMap).sort((a, b) => b.spent - a.spent),
    cashFlow,
    topTransactions: [...txs].sort((a, b) => b.amount - a.amount).slice(0, 5)
  };
}

export async function getBalanceHistory(range: 'this-month' | 'last-month' | 'last-3-months' | 'last-6-months' | 'last-12-months' | 'all-time') {
  const allFunds = await db.select().from(funds);
  const currentTotalBalance = allFunds.reduce((acc, fund) => acc + (fund.balance || 0), 0);
  
  const now = new Date();
  let startDate = new Date();
  let by: 'day' | 'month' = 'month';

  if (range === 'this-month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    by = 'day';
  } else if (range === 'last-month') {
    startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    by = 'day';
  } else if (range === 'last-3-months') {
    startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    by = 'day';
  } else if (range === 'last-6-months') {
    startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    by = 'month';
  } else if (range === 'last-12-months') {
    startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    by = 'month';
  } else {
    const firstTx = await db.query.transactions.findFirst({
      orderBy: [transactions.date],
    });
    startDate = firstTx?.date ? new Date(firstTx.date) : new Date(now.getFullYear(), 0, 1);
    by = 'month';
  }

  // Get all transactions from startDate to now to calculate history backwards
  const txs = await db.query.transactions.findMany({
    where: gte(transactions.date, startDate),
    orderBy: [desc(transactions.date)],
  });

  const history: { name: string, balance: number }[] = [];
  let runningBalance = currentTotalBalance;

  if (by === 'day') {
    const current = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());

    while (current >= end) {
      const key = current.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      history.unshift({ name: key, balance: runningBalance });

      const nextDay = new Date(current);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const dayTxs = txs.filter(tx => tx.date && tx.date >= current && tx.date < nextDay);
      dayTxs.forEach(tx => {
        if (tx.type === 'INCOME' || tx.type === 'BORROW') runningBalance -= tx.amount;
        else if (tx.type === 'EXPENSE' || tx.type === 'LEND' || tx.type === 'TRANSFER') {
          if (tx.type !== 'TRANSFER') runningBalance += tx.amount;
        }
      });
      current.setDate(current.getDate() - 1);
    }
  } else {
    const current = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

    while (current >= end) {
      const key = `T${current.getMonth() + 1}`;
      history.unshift({ name: key, balance: runningBalance });

      const nextMonth = new Date(current.getFullYear(), current.getMonth() + 1, 1);
      const monthTxs = txs.filter(tx => tx.date && tx.date >= current && tx.date < nextMonth);
      
      monthTxs.forEach(tx => {
        if (tx.type === 'INCOME' || tx.type === 'BORROW') runningBalance -= tx.amount;
        else if (tx.type === 'EXPENSE' || tx.type === 'LEND' || tx.type === 'TRANSFER') {
          if (tx.type !== 'TRANSFER') runningBalance += tx.amount;
        }
      });
      current.setMonth(current.getMonth() - 1);
    }
  }

  return history;
}

export async function setDefaultFund(id: string) {
  return await db.transaction(async (tx) => {
    await tx.update(funds).set({ isDefault: false });
    const [updated] = await tx.update(funds).set({ isDefault: true }).where(eq(funds.id, id)).returning();
    revalidatePath('/', 'layout');
    return updated;
  });
}

export async function checkTransactionsYesterday() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(yesterday);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const yesterdayTx = await db.select().from(transactions).where(
    sql`${transactions.date} >= ${yesterday} AND ${transactions.date} < ${tomorrow}`
  );

  return yesterdayTx.length > 0;
}

export async function resetData() {
  return await db.transaction(async (tx) => {
    // 1. Clean existing data
    await tx.delete(transactions);
    await tx.delete(budgets);
    await tx.delete(templates);
    await tx.delete(globalSettings);
    await tx.delete(categories);
    await tx.delete(funds);

    // 2. Seed Default Funds
    const fundData = [
      { name: 'Quỹ chính', isDefault: true, balance: 0 },
      { name: 'Tiết kiệm', isDefault: false, balance: 0 },
      { name: 'Đầu tư', isDefault: false, balance: 0 },
    ];
    await tx.insert(funds).values(fundData);

    // 3. Seed Default Categories
    const categoryData = [
      { name: 'Ăn uống', type: 'EXPENSE' as const, icon: '🍜', hashtags: ['#an_sang', '#cafe', '#an_trua', '#an_toi'] },
      { name: 'Lương', type: 'INCOME' as const, icon: '💰', hashtags: ['#luong', '#salary'] },
      { name: 'Di chuyển', type: 'EXPENSE' as const, icon: '🚌', hashtags: ['#di_chuyen', '#xang', '#grab'] },
      { name: 'Mua sắm', type: 'EXPENSE' as const, icon: '🛒', hashtags: ['#mua_sam', '#shopee', '#lazada'] },
      { name: 'Giải trí', type: 'EXPENSE' as const, icon: '🎮', hashtags: ['#vui_ve', '#netflix', '#game'] },
      { name: 'Học tập', type: 'EXPENSE' as const, icon: '📚', hashtags: ['#lam_viec', '#hoc_tap', '#book'] },
      { name: 'Tiền thưởng', type: 'INCOME' as const, icon: '🧧', hashtags: ['#thuong', '#bonus'] },
      { name: 'Kinh doanh', type: 'INCOME' as const, icon: '📈', hashtags: ['#kinh_doanh', '#business'] },
    ];
    await tx.insert(categories).values(categoryData);

    revalidatePath('/', 'layout');
    return { success: true };
  });
}
