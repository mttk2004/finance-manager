'use server'

import { db } from '@/lib/db';
import { transactions, funds, categories } from '@/lib/db/schema';
import { desc, eq, sql, and, gte, lt } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

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
        
        const matchedCategories = await tx.select({ id: categories.id })
          .from(categories)
          .where(sql`${categories.hashtags} && ${lowerHashtags}::text[]`);

        if (matchedCategories.length > 0) {
          finalCategoryId = matchedCategories[0].id;
        }
      }
    }

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

    const fund = await tx.query.funds.findFirst({
      where: eq(funds.id, transaction.fundId),
    });

    if (fund) {
      let newBalance = fund.balance || 0;
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

export async function getAllTransactions() {
  return await db.query.transactions.findMany({
    with: {
      category: true,
      fund: true,
    },
    orderBy: [desc(transactions.date)],
  });
}

export async function importTransactions(csvText: string) {
  const lines = csvText.split('\n');
  if (lines.length <= 1) return { success: false, count: 0 };

  const allFunds = await db.select().from(funds);
  const allCategories = await db.select().from(categories);

  const typeMap: Record<string, 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'LEND' | 'BORROW'> = {
    'Thu nhập': 'INCOME', 'Chi tiêu': 'EXPENSE', 'Chuyển tiền': 'TRANSFER', 'Vay': 'BORROW', 'Cho vay': 'LEND',
    'INCOME': 'INCOME', 'EXPENSE': 'EXPENSE', 'TRANSFER': 'TRANSFER', 'LEND': 'LEND', 'BORROW': 'BORROW'
  };

  const results = await db.transaction(async (tx) => {
    let importedCount = 0;
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = line.split(',').map(s => s.replace(/^"|"$/g, '').trim());
      if (parts.length < 6) continue;

      const dateStr = parts[1];
      const typeStr = parts[2];
      const categoryName = parts[3];
      const fundName = parts[4];
      const amount = parseInt(parts[5]);
      const note = parts[6];

      const fund = allFunds.find(f => f.name === fundName);
      if (!fund) continue;

      const category = allCategories.find(c => c.name === categoryName);
      const type = typeMap[typeStr] || 'EXPENSE';

      await tx.insert(transactions).values({
        fundId: fund.id,
        categoryId: category?.id,
        amount,
        type,
        note,
        date: dateStr ? new Date(dateStr) : new Date(),
      });

      let newBalance = fund.balance || 0;
      if (type === 'INCOME' || type === 'BORROW') newBalance += amount;
      else if (type === 'EXPENSE' || type === 'LEND' || type === 'TRANSFER') newBalance -= amount;
      
      await tx.update(funds).set({ balance: newBalance, updatedAt: new Date() }).where(eq(funds.id, fund.id));
      fund.balance = newBalance;
      importedCount++;
    }
    return importedCount;
  });

  revalidatePath('/', 'layout');
  return { success: true, count: results };
}

export async function checkTransactionsYesterday() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  const tomorrow = new Date(yesterday);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const yesterdayTx = await db.select().from(transactions).where(
    and(gte(transactions.date, yesterday), lt(transactions.date, tomorrow))
  );

  return yesterdayTx.length > 0;
}
