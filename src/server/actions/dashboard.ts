'use server'

import { db } from '@/lib/db';
import { transactions, funds, categories, budgets, globalSettings, templates } from '@/lib/db/schema';
import { desc, eq, sql, and, gte, lt } from 'drizzle-orm';
import { revalidatePath, revalidateTag } from 'next/cache';
import { getCachedCategories } from './categories';
import { getCachedGlobalBudgets } from './budgets';
import { getCashFlowData } from './charts';
import { getTemplates } from './templates';
import { checkTransactionsYesterday } from './transactions';

export async function getDashboardData() {
  const now = new Date();
  const currentMonthPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

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
    db.select({ categoryId: transactions.categoryId, total: sql<number>`sum(${transactions.amount})::int` })
      .from(transactions)
      .where(and(gte(transactions.date, startOfMonth), lt(transactions.date, startOfNextMonth), eq(transactions.type, 'EXPENSE')))
      .groupBy(transactions.categoryId),
    db.select({ total: sql<number>`sum(${transactions.amount})::int` })
      .from(transactions)
      .where(and(gte(transactions.date, startOfLastMonth), lt(transactions.date, new Date(endOfLastMonth.getTime() + 86400000)), eq(transactions.type, 'EXPENSE'))),
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

export async function resetData() {
  await db.transaction(async (tx) => {
    await tx.delete(transactions);
    await tx.delete(budgets);
    await tx.delete(templates);
    await tx.delete(globalSettings);
    await tx.delete(categories);
    await tx.delete(funds);

    await tx.insert(funds).values([
      { name: 'Quỹ chính', isDefault: true, balance: 0 },
      { name: 'Tiết kiệm', isDefault: false, balance: 0 },
      { name: 'Đầu tư', isDefault: false, balance: 0 },
    ]);

    await tx.insert(categories).values([
      { name: 'Ăn uống', type: 'EXPENSE' as const, icon: '🍜', hashtags: ['#an_sang', '#cafe', '#an_trua', '#an_toi'] },
      { name: 'Lương', type: 'INCOME' as const, icon: '💰', hashtags: ['#luong', '#salary'] },
      { name: 'Di chuyển', type: 'EXPENSE' as const, icon: '🚌', hashtags: ['#di_chuyen', '#xang', '#grab'] },
      { name: 'Mua sắm', type: 'EXPENSE' as const, icon: '🛒', hashtags: ['#mua_sam', '#shopee', '#lazada'] },
      { name: 'Giải trí', type: 'EXPENSE' as const, icon: '🎮', hashtags: ['#vui_ve', '#netflix', '#game'] },
      { name: 'Học tập', type: 'EXPENSE' as const, icon: '📚', hashtags: ['#lam_viec', '#hoc_tap', '#book'] },
      { name: 'Tiền thưởng', type: 'INCOME' as const, icon: '🧧', hashtags: ['#thuong', '#bonus'] },
      { name: 'Kinh doanh', type: 'INCOME' as const, icon: '📈', hashtags: ['#kinh_doanh', '#business'] },
    ]);
  });

  revalidatePath('/', 'layout');
  revalidatePath('/transactions', 'page');
  revalidatePath('/charts', 'page');
  revalidatePath('/settings', 'page');
  revalidateTag('categories', 'max');
  revalidateTag('global_budgets', 'max');

  return { success: true };
}
