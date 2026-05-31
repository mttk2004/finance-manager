'use server'

import { db } from './index';
import { funds, transactions, categories, budgets, globalSettings } from './schema';
import { desc, eq, sql, and, gte, lt } from 'drizzle-orm';

export async function getDashboardData() {
  const allFunds = await db.select().from(funds);
  
  const now = new Date();
  const currentMonthPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const recentTransactions = await db.query.transactions.findMany({
    with: {
      category: true,
      fund: true,
      toFund: true,
    },
    orderBy: [desc(transactions.date)],
    limit: 5,
  });

  const monthTransactions = await db.query.transactions.findMany({
    where: and(
      gte(transactions.date, startOfMonth),
      lt(transactions.date, startOfNextMonth),
      eq(transactions.type, 'EXPENSE')
    ),
    with: {
      category: true,
    }
  });

  // Get month-specific budgets
  const monthBudgets = await db.query.budgets.findMany({
    where: eq(budgets.period, currentMonthPeriod),
    with: {
      category: true,
    }
  });

  // Get global budgets from settings
  const globalBudgetsSetting = await db.query.globalSettings.findFirst({
    where: eq(globalSettings.key, 'global_budgets'),
  });
  const globalBudgets = (globalBudgetsSetting?.value as Record<string, number>) || {};

  // Combine global budgets with overrides
  const expenseCategories = await db.query.categories.findMany({
    where: eq(categories.type, 'EXPENSE'),
  });

  const budgetTracking = expenseCategories.map(cat => {
    const override = monthBudgets.find(b => b.categoryId === cat.id);
    const limit = override ? override.amountLimit : (globalBudgets[cat.id] || 0);
    
    if (limit === 0 && !override) return null; // Skip categories with no budget set

    const spent = monthTransactions
      .filter(tx => tx.categoryId === cat.id)
      .reduce((acc, tx) => acc + tx.amount, 0);

    return {
      id: override?.id || cat.id,
      categoryId: cat.id,
      amountLimit: limit,
      period: currentMonthPeriod,
      spent,
      category: cat,
      isOverride: !!override
    };
  }).filter((b): b is NonNullable<typeof b> => b !== null);

  const totalSpentMonth = monthTransactions.reduce((acc, tx) => acc + tx.amount, 0);
  const totalBudgetMonth = budgetTracking.reduce((acc, b) => acc + b.amountLimit, 0);

  const totalBalance = allFunds.reduce((acc, fund) => acc + (fund.balance || 0), 0);
  const hasTransactionsYesterday = await checkTransactionsYesterday();
  const allCategories = await db.query.categories.findMany();
  const initialCashFlow = await getCashFlowData('this-month');
  
  return {
    allFunds,
    recentTransactions,
    totalBalance,
    showReminder: !hasTransactionsYesterday && recentTransactions.length > 0,
    budgetTracking,
    totalSpentMonth,
    totalBudgetMonth,
    currentMonthPeriod,
    allCategories,
    initialCashFlow,
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
        
        // 1. Check database for categories with these hashtags
        const allCategories = await tx.query.categories.findMany();
        const matchedCategory = allCategories.find(cat => 
          cat.hashtags?.some(h => lowerHashtags.includes(h.toLowerCase()))
        );

        if (matchedCategory) {
          finalCategoryId = matchedCategory.id;
        } else {
          // 2. Fallback to hardcoded priority mapping
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
              const matchedByLocal = allCategories.find(c => c.name === categoryName);
              if (matchedByLocal) {
                finalCategoryId = matchedByLocal.id;
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

    return await tx.delete(transactions).where(eq(transactions.id, id)).returning();
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

  return await db.delete(funds).where(eq(funds.id, id)).returning();
}

export async function getFunds() {
  return await db.select().from(funds);
}

export async function getCategories() {
  return await db.select().from(categories);
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
  return updatedCat;
}

export async function deleteCategory(id: string) {
  return await db.delete(categories).where(eq(categories.id, id)).returning();
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
  const monthBudgets = await db.query.budgets.findMany({
    where: eq(budgets.period, period),
    with: {
      category: true,
    }
  });

  const globalBudgets = await getGlobalBudgets();
  const allCategories = await db.query.categories.findMany({
    where: eq(categories.type, 'EXPENSE'),
  });
  
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
    return await db.update(globalSettings)
      .set({ value: newValues, updatedAt: new Date() })
      .where(eq(globalSettings.id, existing.id))
      .returning();
  } else {
    return await db.insert(globalSettings)
      .values({
        key: 'global_budgets',
        value: newValues,
      })
      .returning();
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

  const spendingMap: Record<string, { category: { name: string }, spent: number }> = {};

  txs.forEach(tx => {
    const catId = tx.categoryId || 'other';
    if (!spendingMap[catId]) {
      spendingMap[catId] = {
        category: { name: tx.category?.name || 'Khác' },
        spent: 0
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

export async function getBalanceHistory(range: 'this-month' | 'last-month' | 'last-3-months' | 'last-6-months' | 'last-12-months' | 'all-time') {
  const allFunds = await db.select().from(funds);
  const currentTotalBalance = allFunds.reduce((acc, fund) => acc + (fund.balance || 0), 0);
  
  const now = new Date();
  let startDate = new Date();

  if (range === 'this-month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (range === 'last-month') {
    startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  } else if (range === 'last-3-months') {
    startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  } else if (range === 'last-6-months') {
    startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  } else if (range === 'last-12-months') {
    startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  } else {
    // all-time: find oldest transaction
    const firstTx = await db.query.transactions.findFirst({
      orderBy: [transactions.date],
    });
    startDate = firstTx?.date ? new Date(firstTx.date) : new Date(now.getFullYear(), 0, 1);
  }

  // Get all transactions from startDate to now to calculate history backwards
  const txs = await db.query.transactions.findMany({
    where: gte(transactions.date, startDate),
    orderBy: [desc(transactions.date)],
  });

  const history: { name: string, balance: number }[] = [];
  let runningBalance = currentTotalBalance;

  // We'll iterate backwards through months
  let current = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

  while (current >= end) {
    const key = `T${current.getMonth() + 1}`;
    
    // Add current month's end-of-month balance
    history.unshift({ name: key, balance: runningBalance });

    // Subtract transactions that happened in this month to get balance at the start of this month
    const nextMonth = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    const monthTxs = txs.filter(tx => tx.date && tx.date >= current && tx.date < nextMonth);
    
    monthTxs.forEach(tx => {
      if (tx.type === 'INCOME' || tx.type === 'BORROW') runningBalance -= tx.amount;
      else if (tx.type === 'EXPENSE' || tx.type === 'LEND' || tx.type === 'TRANSFER') {
        // TRANSFER doesn't change total balance, but our createTransaction logic updates fund balances.
        // Actually, internal TRANSFER shouldn't change the TOTAL balance.
        if (tx.type !== 'TRANSFER') runningBalance += tx.amount;
      }
    });

    current.setMonth(current.getMonth() - 1);
  }

  return history;
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
