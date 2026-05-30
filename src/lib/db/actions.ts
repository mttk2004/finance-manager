'use server'

import { db } from './index';
import { funds, transactions, categories } from './schema';
import { desc, eq, sql } from 'drizzle-orm';

export async function getDashboardData() {
  const allFunds = await db.select().from(funds);
  const recentTransactions = await db.query.transactions.findMany({
    with: {
      category: true,
    },
    orderBy: [desc(transactions.date)],
    limit: 5,
  });

  const totalBalance = allFunds.reduce((acc, fund) => acc + (fund.balance || 0), 0);
  const hasTransactionsYesterday = await checkTransactionsYesterday();
  
  return {
    allFunds,
    recentTransactions,
    totalBalance,
    showReminder: !hasTransactionsYesterday && recentTransactions.length > 0, // Show reminder if no tx yesterday but has at least some tx history
  };
}

export async function createTransaction(data: {
  fundId: string;
  categoryId?: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'LEND' | 'BORROW';
  note?: string;
}) {
  return await db.transaction(async (tx) => {
    // Insert transaction
    const [newTx] = await tx.insert(transactions).values({
      fundId: data.fundId,
      categoryId: data.categoryId,
      amount: data.amount,
      type: data.type,
      note: data.note,
      date: new Date(),
    }).returning();

    // Update fund balance
    const fund = await tx.query.funds.findFirst({
      where: eq(funds.id, data.fundId),
    });

    if (fund) {
      let newBalance = fund.balance || 0;
      if (data.type === 'INCOME' || data.type === 'BORROW') {
        newBalance += data.amount;
      } else if (data.type === 'EXPENSE' || data.type === 'LEND') {
        newBalance -= data.amount;
      }
      
      await tx.update(funds)
        .set({ balance: newBalance, updatedAt: new Date() })
        .where(eq(funds.id, data.fundId));
    }

    return newTx;
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
