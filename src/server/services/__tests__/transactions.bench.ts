import { bench, describe } from 'vitest';
import { TransactionService } from '../transactions';
import { vi } from 'vitest';

vi.mock('@/lib/db', () => {
  const mockDb = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    transaction: vi.fn((cb) => cb(mockDb)),
    query: {
      funds: {
        findFirst: vi.fn().mockResolvedValue({ id: 'fund-1', balance: 1000 }),
      },
    },
  };
  return { db: mockDb };
});

describe('TransactionService Performance Benchmark', () => {
  const txData = {
    fundId: 'fund-1',
    amount: 100,
    type: 'EXPENSE' as const,
    note: 'Coffee',
    date: new Date(),
  };

  // Mock standard db mock behaviors for speed
  vi.mocked(TransactionService.create);

  bench('TransactionService.create logic parsing and execution', async () => {
    // Re-mock return values inside loop
    const mockInsert = vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 'tx-1' }]),
      }),
    });
    const mockUpdate = vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{ id: 'fund-1' }]),
      }),
    });
    
    // We overwrite db mocked operations
    const { db } = await import('@/lib/db');
    db.insert = mockInsert as any;
    db.update = mockUpdate as any;

    await TransactionService.create(txData);
  });
});
