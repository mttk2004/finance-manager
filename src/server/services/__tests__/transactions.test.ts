import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TransactionService } from '../transactions';
import { db } from '@/lib/db';
import { BusinessError, ErrorCode } from '@/lib/errors';

vi.mock('@/lib/db', () => {
  const mockDb = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    transaction: vi.fn((cb) => cb(mockDb)),
    query: {
      funds: {
        findFirst: vi.fn(),
      },
      transactions: {
        findFirst: vi.fn(),
      },
      categories: {
        findFirst: vi.fn(),
      },
    },
  };
  return { db: mockDb };
});

describe('TransactionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create an income transaction and add balance to fund', async () => {
      const txData = {
        fundId: 'fund-1',
        amount: 200,
        type: 'INCOME' as const,
        note: 'Bonus',
        date: new Date(),
      };

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 'tx-1', ...txData }]),
        }),
      } as any);

      vi.mocked(db.query.funds.findFirst).mockResolvedValue({
        id: 'fund-1',
        balance: 1000,
      } as any);

      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ id: 'fund-1' }]),
        }),
      } as any);

      const result = await TransactionService.create(txData);

      expect(result).toBeDefined();
      expect(db.insert).toHaveBeenCalled();
      expect(db.update).toHaveBeenCalled();
    });

    it('should throw BusinessError if expense transaction exceeds balance', async () => {
      const txData = {
        fundId: 'fund-1',
        amount: 1500,
        type: 'EXPENSE' as const,
        note: 'Big Purchase',
        date: new Date(),
      };

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 'tx-2', ...txData }]),
        }),
      } as any);

      vi.mocked(db.query.funds.findFirst).mockResolvedValue({
        id: 'fund-1',
        balance: 1000, // Balance is less than expense
      } as any);

      await expect(TransactionService.create(txData)).rejects.toThrow(
        new BusinessError(ErrorCode.INSUFFICIENT_BALANCE)
      );
    });
  });

  describe('delete', () => {
    it('should throw BusinessError if transaction not found', async () => {
      vi.mocked(db.query.transactions.findFirst).mockResolvedValue(null as any);

      await expect(TransactionService.delete('invalid-id')).rejects.toThrow(
        new BusinessError(ErrorCode.TRANSACTION_NOT_FOUND)
      );
    });

    it('should revert balance and delete transaction', async () => {
      const mockTx = {
        id: 'tx-1',
        fundId: 'fund-1',
        amount: 200,
        type: 'INCOME' as const,
      };

      vi.mocked(db.query.transactions.findFirst).mockResolvedValue(mockTx as any);
      vi.mocked(db.query.funds.findFirst).mockResolvedValue({
        id: 'fund-1',
        balance: 1000,
      } as any);

      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ id: 'fund-1' }]),
        }),
      } as any);

      vi.mocked(db.delete).mockReturnValue({
        where: vi.fn().mockResolvedValue([{ id: 'tx-1' }]),
      } as any);

      const result = await TransactionService.delete('tx-1');
      expect(result).toBeDefined();
      expect(db.delete).toHaveBeenCalled();
    });
  });
});
