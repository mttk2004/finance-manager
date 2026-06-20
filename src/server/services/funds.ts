import { db } from '@/lib/db';
import { funds } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { BusinessError, ErrorCode } from '@/lib/errors';

export class FundService {
  static async getAll() {
    return await db.select({
      id: funds.id,
      name: funds.name,
      balance: funds.balance,
      isDefault: funds.isDefault
    }).from(funds).orderBy(funds.name);
  }

  static async create(data: { name: string; balance: number }) {
    const [newFund] = await db.insert(funds).values({
      name: data.name,
      balance: data.balance,
      isDefault: false,
    }).returning();
    return newFund;
  }

  static async update(id: string, data: { name?: string; balance?: number }) {
    const [updatedFund] = await db.update(funds)
      .set({ 
        ...data,
        updatedAt: new Date() 
      })
      .where(eq(funds.id, id))
      .returning();
    return updatedFund;
  }

  static async delete(id: string, options?: { transferToFundId?: string }) {
    const fund = await db.query.funds.findFirst({
      where: eq(funds.id, id),
    });
    
    if (fund?.isDefault) {
      throw new BusinessError(ErrorCode.CANNOT_DELETE_DEFAULT_FUND);
    }

    return await db.transaction(async (tx) => {
      if (options?.transferToFundId) {
        const targetFund = await tx.query.funds.findFirst({
          where: eq(funds.id, options.transferToFundId),
        });

        if (!targetFund) throw new BusinessError(ErrorCode.FUND_NOT_FOUND);

        // Update target fund balance
        await tx.update(funds)
          .set({ balance: (targetFund.balance || 0) + (fund?.balance || 0) })
          .where(eq(funds.id, options.transferToFundId));

        // Move transactions to the target fund
        const { transactions } = await import('@/lib/db/schema');
        await tx.update(transactions)
          .set({ fundId: options.transferToFundId })
          .where(eq(transactions.fundId, id));
        
        await tx.update(transactions)
          .set({ toFundId: options.transferToFundId })
          .where(eq(transactions.toFundId, id));
      }

      return await tx.delete(funds).where(eq(funds.id, id)).returning();
    });
  }

  static async setDefault(id: string) {
    return await db.transaction(async (tx) => {
      await tx.update(funds).set({ isDefault: false });
      const [updated] = await tx.update(funds).set({ isDefault: true }).where(eq(funds.id, id)).returning();
      return updated;
    });
  }
}
