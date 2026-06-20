import { db } from '@/lib/db';
import { transactions, funds, categories } from '@/lib/db/schema';
import { desc, eq, sql, and, gte, lt, asc, exists, ilike, or } from 'drizzle-orm';
import { transactionSchema, transactionFilterSchema, TransactionFilter } from '@/lib/validations';
import { z } from 'zod';
import { TransactionType } from '@/types';

export class TransactionService {
  static async create(data: z.infer<typeof transactionSchema>) {
    return await db.transaction(async (tx) => {
      let finalCategoryId = data.categoryId;

      // Automatic category detection from hashtag if not explicitly provided
      if (!finalCategoryId && data.note) {
        const foundHashtags = data.note.match(/#\w+/g);
        if (foundHashtags) {
          const lowerHashtags = foundHashtags.map(t => t.toLowerCase());
          
          const allCategories = await tx.select({ id: categories.id, hashtags: categories.hashtags }).from(categories);
          const match = allCategories.find(c => 
            c.hashtags?.some(h => lowerHashtags.includes(h.toLowerCase()))
          );

          if (match) {
            finalCategoryId = match.id;
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
        date: data.date || new Date(),
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

        if (newBalance < 0) {
          throw new Error("Số dư tài khoản không đủ!");
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

      return newTx;
    });
  }

  static async update(id: string, data: z.infer<typeof transactionSchema>) {
    return await db.transaction(async (tx) => {
      const oldTx = await tx.query.transactions.findFirst({
        where: eq(transactions.id, id),
      });

      if (!oldTx) throw new Error("Transaction not found");

      // 1. Revert old transaction effects on balances
      const oldFund = await tx.query.funds.findFirst({
        where: eq(funds.id, oldTx.fundId),
      });

      if (oldFund) {
        let revertedBalance = oldFund.balance || 0;
        if (oldTx.type === 'INCOME' || oldTx.type === 'BORROW') {
          revertedBalance -= oldTx.amount;
        } else if (oldTx.type === 'EXPENSE' || oldTx.type === 'LEND' || oldTx.type === 'TRANSFER') {
          revertedBalance += oldTx.amount;
        }

        if (data.fundId !== oldTx.fundId && data.toFundId !== oldTx.fundId && revertedBalance < 0) {
          throw new Error("Số dư tài khoản không đủ!");
        }

        await tx.update(funds).set({ balance: revertedBalance }).where(eq(funds.id, oldTx.fundId));
      }

      if (oldTx.type === 'TRANSFER' && oldTx.toFundId) {
        const oldToFund = await tx.query.funds.findFirst({
          where: eq(funds.id, oldTx.toFundId),
        });
        if (oldToFund) {
          const revertedToBalance = (oldToFund.balance || 0) - oldTx.amount;

          if (data.fundId !== oldTx.toFundId && data.toFundId !== oldTx.toFundId && revertedToBalance < 0) {
            throw new Error("Số dư tài khoản không đủ!");
          }

          await tx.update(funds).set({ balance: revertedToBalance }).where(eq(funds.id, oldTx.toFundId));
        }
      }

      // 2. Apply new transaction effects on balances
      const newFund = await tx.query.funds.findFirst({
        where: eq(funds.id, data.fundId),
      });

      if (newFund) {
        // We need to re-fetch or calculate based on potential changes above if fund is same
        let currentBalance = newFund.balance || 0;
        // If it's the same fund, we must use the reverted balance calculated above
        if (data.fundId === oldTx.fundId) {
           // Re-fetch to be safe within the same transaction
           const refetched = await tx.query.funds.findFirst({ where: eq(funds.id, data.fundId) });
           currentBalance = refetched?.balance || 0;
        }

        if (data.type === 'INCOME' || data.type === 'BORROW') {
          currentBalance += data.amount;
        } else if (data.type === 'EXPENSE' || data.type === 'LEND' || data.type === 'TRANSFER') {
          currentBalance -= data.amount;
        }

        if (data.toFundId !== data.fundId && currentBalance < 0) {
          throw new Error("Số dư tài khoản không đủ!");
        }

        await tx.update(funds).set({ balance: currentBalance }).where(eq(funds.id, data.fundId));
      }

      if (data.type === 'TRANSFER' && data.toFundId) {
        const newToFund = await tx.query.funds.findFirst({
          where: eq(funds.id, data.toFundId),
        });
        if (newToFund) {
          let currentToBalance = newToFund.balance || 0;
          // Again, check if it was affected by previous steps
          if (data.toFundId === oldTx.fundId || data.toFundId === oldTx.toFundId || data.toFundId === data.fundId) {
            const refetchedTo = await tx.query.funds.findFirst({ where: eq(funds.id, data.toFundId) });
            currentToBalance = refetchedTo?.balance || 0;
          }

          const finalToBalance = currentToBalance + data.amount;
          if (finalToBalance < 0) {
            throw new Error("Số dư tài khoản không đủ!");
          }

          await tx.update(funds).set({ balance: finalToBalance }).where(eq(funds.id, data.toFundId));
        }
      }

      // 3. Update the transaction record
      const [updated] = await tx.update(transactions)
        .set({
          fundId: data.fundId,
          toFundId: data.toFundId,
          categoryId: data.categoryId,
          amount: data.amount,
          type: data.type,
          note: data.note,
          date: data.date || new Date(),
        })
        .where(eq(transactions.id, id))
        .returning();

      return updated;
    });
  }

  static async delete(id: string) {
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

        if (newBalance < 0) {
          throw new Error("Số dư tài khoản không đủ!");
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
          const finalToBalance = (toFund.balance || 0) - transaction.amount;

          if (finalToBalance < 0) {
            throw new Error("Số dư tài khoản không đủ!");
          }

          await tx.update(funds)
            .set({ balance: finalToBalance, updatedAt: new Date() })
            .where(eq(funds.id, transaction.toFundId));
        }
      }

      await tx.delete(transactions).where(eq(transactions.id, id));
      
      return true;
    });
  }

  static async getAll(filters?: TransactionFilter) {
    const validatedFilters = transactionFilterSchema.parse(filters || {});
    const { 
      type, fundId, categoryId, startDate, endDate, minAmount, maxAmount, searchTerm, 
      sortField, sortOrder, page = 1, limit = 15 
    } = validatedFilters;

    const conditions = [];

    if (type && type !== 'ALL') conditions.push(eq(transactions.type, type as TransactionType));
    if (fundId && fundId !== 'ALL') conditions.push(eq(transactions.fundId, fundId));
    if (categoryId && categoryId !== 'ALL') conditions.push(eq(transactions.categoryId, categoryId));
    if (startDate) conditions.push(gte(transactions.date, new Date(startDate)));
    if (endDate) conditions.push(lt(transactions.date, new Date(new Date(endDate).setHours(23, 59, 59, 999))));
    if (minAmount) conditions.push(gte(transactions.amount, minAmount));
    if (maxAmount) conditions.push(lt(transactions.amount, maxAmount));
    if (searchTerm) {
      conditions.push(or(
        ilike(transactions.note, `%${searchTerm}%`),
        exists(
          db.select()
            .from(categories)
            .where(and(
              eq(categories.id, transactions.categoryId),
              ilike(categories.name, `%${searchTerm}%`)
            ))
        )
      ));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const totalCountResult = await db.select({ count: sql<number>`count(*)` }).from(transactions).where(where);
    const totalCount = Number(totalCountResult[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    const getOrderBy = () => {
      const col = (transactions as Record<string, any>)[sortField];
      if (!col) return desc(transactions.date);
      return sortOrder === 'asc' ? asc(col) : desc(col);
    };

    const data = await db.query.transactions.findMany({
      where,
      with: {
        category: true,
        fund: true,
        toFund: true,
      },
      orderBy: [getOrderBy()],
      limit,
      offset: (page - 1) * limit,
    });

    return {
      transactions: data,
      totalPages,
      totalCount
    };
  }

  static async import(csvText: string) {
    const lines = csvText.split('\n');
    if (lines.length <= 1) return { success: false, count: 0, errors: ["File CSV trống hoặc không đúng định dạng"] };

    const allFunds = await db.select().from(funds);
    const allCategories = await db.select().from(categories);

    const typeMap: Record<string, 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'LEND' | 'BORROW'> = {
      'Thu nhập': 'INCOME', 'Chi tiêu': 'EXPENSE', 'Chuyển tiền': 'TRANSFER', 'Vay': 'BORROW', 'Cho vay': 'LEND',
      'INCOME': 'INCOME', 'EXPENSE': 'EXPENSE', 'TRANSFER': 'TRANSFER', 'LEND': 'LEND', 'BORROW': 'BORROW'
    };

    const errors: string[] = [];

    const results = await db.transaction(async (tx) => {
      let importedCount = 0;
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const parts = line.split(',').map(s => s.replace(/^"|"$/g, '').trim());
        if (parts.length < 6) {
          errors.push(`Dòng ${i + 1}: Thiếu cột dữ liệu`);
          continue;
        }

        const dateStr = parts[1];
        const typeStr = parts[2];
        const categoryName = parts[3];
        const fundName = parts[4];
        const amount = parseInt(parts[5]);
        const note = parts[6];

        const fund = allFunds.find(f => f.name === fundName);
        if (!fund) {
          errors.push(`Dòng ${i + 1}: Không tìm thấy quỹ "${fundName}"`);
          continue;
        }

        const category = allCategories.find(c => c.name === categoryName);
        const type = typeMap[typeStr] || 'EXPENSE';

        if (isNaN(amount) || amount <= 0) {
          errors.push(`Dòng ${i + 1}: Số tiền không hợp lệ ("${parts[5]}")`);
          continue;
        }

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

    return { success: results > 0 || errors.length === 0, count: results, errors };
  }

  static async checkYesterday() {
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
}
