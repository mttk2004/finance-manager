import { db } from '@/lib/db';
import { transactions, funds } from '@/lib/db/schema';
import { desc, eq, and, gte, lt } from 'drizzle-orm';
import { Category, Transaction } from '@/types';

export class ChartService {
  static async getCashFlow(range: 'this-month' | 'last-month' | 'last-3-months' | 'last-6-months' | 'last-12-months' | 'all-time') {
    const now = new Date();
    let startDate = new Date();
    let aggregateBy: 'day' | 'month' = 'day';

    if (range === 'this-month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      aggregateBy = 'day';
    } else if (range === 'last-month') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      return await this.aggregateTransactions(startDate, endDate, 'day');
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

    return await this.aggregateTransactions(startDate, now, aggregateBy);
  }

  static async getCategorySpending(range: 'this-month' | 'last-month' | 'last-3-months' | 'last-6-months' | 'last-12-months' | 'all-time') {
    const now = new Date();
    let startDate = new Date();

    if (range === 'this-month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (range === 'last-month') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      return await this.calculateCategorySpending(startDate, endDate);
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

    return await this.calculateCategorySpending(startDate, now);
  }

  static async calculateCategorySpending(startDate: Date, endDate: Date) {
    const txs = await db.query.transactions.findMany({
      where: and(
        gte(transactions.date, startDate),
        lt(transactions.date, new Date(endDate.getTime() + 86400000)),
        eq(transactions.type, 'EXPENSE')
      ),
      with: { category: true }
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
          category: tx.category as Category
        };
      }
      spendingMap[catId].spent += tx.amount;
    });

    return Object.values(spendingMap);
  }

  static async aggregateTransactions(startDate: Date, endDate: Date, by: 'day' | 'month') {
    const txs = await db.query.transactions.findMany({
      where: and(
        gte(transactions.date, startDate),
        lt(transactions.date, new Date(endDate.getTime() + 86400000))
      ),
    });

    const groups: Record<string, { name: string, income: number, expense: number }> = {};
    let current = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    
    while (current <= end) {
      const key = by === 'day' 
        ? current.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
        : `T${current.getMonth() + 1}`;
      if (!groups[key]) groups[key] = { name: key, income: 0, expense: 0 };
      if (by === 'day') current.setDate(current.getDate() + 1);
      else current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
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

  static async getReportData(startDate: Date, endDate: Date) {
    const txs = await db.query.transactions.findMany({
      where: and(
        gte(transactions.date, startDate),
        lt(transactions.date, new Date(endDate.getTime() + 86400000))
      ),
      with: { category: true, fund: true }
    });

    const income = txs.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
    const expense = txs.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);
    
    const categoryMap: Record<string, { id: string, name: string, icon: string | null, spent: number }> = {};
    txs.filter(t => t.type === 'EXPENSE').forEach(t => {
      const catId = t.categoryId || 'other';
      if (!categoryMap[catId]) {
        categoryMap[catId] = { id: catId, name: t.category?.name || 'Khác', icon: t.category?.icon || null, spent: 0 };
      }
      categoryMap[catId].spent += t.amount;
    });

    const cashFlow = await this.aggregateTransactions(startDate, endDate, 'day');

    return {
      summary: { income, expense, net: income - expense, transactionCount: txs.length },
      categorySpending: Object.values(categoryMap).sort((a, b) => b.spent - a.spent),
      cashFlow,
      topTransactions: [...txs].sort((a, b) => b.amount - a.amount).slice(0, 5) as Transaction[]
    };
  }

  static async getBalanceHistory(range: 'this-month' | 'last-month' | 'last-3-months' | 'last-6-months' | 'last-12-months' | 'all-time') {
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
}
