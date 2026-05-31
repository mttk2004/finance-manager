'use server'

import { db } from './index';
import { funds, transactions, categories, budgets } from './schema';
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

  const monthBudgets = await db.query.budgets.findMany({
    where: eq(budgets.period, currentMonthPeriod),
    with: {
      category: true,
    }
  });

  // Calculate total spent for the month
  const totalSpentMonth = monthTransactions.reduce((acc, tx) => acc + tx.amount, 0);

  // Calculate budget tracking
  const budgetTracking = monthBudgets.map(budget => {
    const spent = monthTransactions
      .filter(tx => tx.categoryId === budget.categoryId)
      .reduce((acc, tx) => acc + tx.amount, 0);
    return {
      ...budget,
      spent
    };
  });

  const totalBudgetMonth = monthBudgets.reduce((acc, b) => acc + b.amountLimit, 0);

  const totalBalance = allFunds.reduce((acc, fund) => acc + (fund.balance || 0), 0);
  const hasTransactionsYesterday = await checkTransactionsYesterday();
  
  return {
    allFunds,
    recentTransactions,
    totalBalance,
    showReminder: !hasTransactionsYesterday && recentTransactions.length > 0,
    budgetTracking,
    totalSpentMonth,
    totalBudgetMonth,
    currentMonthPeriod,
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
}) {
  const [newCat] = await db.insert(categories).values(data).returning();
  return newCat;
}

export async function updateCategory(id: string, data: {
  name?: string;
  type?: 'INCOME' | 'EXPENSE';
  icon?: string;
}) {
  const [updatedCat] = await db.update(categories)
    .set(data)
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
  return await db.query.budgets.findMany({
    where: eq(budgets.period, period),
    with: {
      category: true,
    }
  });
}

export async function upsertBudget(data: {
  categoryId: string;
  amountLimit: number;
  period: string;
}) {
  const existing = await db.query.budgets.findFirst({
    where: and(eq(budgets.categoryId, data.categoryId), eq(budgets.period, data.period)),
  });

  if (existing) {
    const [updated] = await db.update(budgets)
      .set({ amountLimit: data.amountLimit })
      .where(eq(budgets.id, existing.id))
      .returning();
    return updated;
  } else {
    const [created] = await db.insert(budgets)
      .values({
        categoryId: data.categoryId,
        amountLimit: data.amountLimit,
        period: data.period,
      })
      .returning();
    return created;
  }
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
