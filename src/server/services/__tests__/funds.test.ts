import { vi, describe, it, expect, beforeEach } from 'vitest';
import { FundService } from '../funds';
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
    },
  };
  return { db: mockDb };
});

describe('FundService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should retrieve all funds ordered by name', async () => {
      const mockFundsList = [
        { id: '1', name: 'Fund A', balance: 100, isDefault: true },
        { id: '2', name: 'Fund B', balance: 200, isDefault: false },
      ];

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue(mockFundsList),
        }),
      } as any);

      const result = await FundService.getAll();
      expect(result).toEqual(mockFundsList);
      expect(db.select).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should insert a new fund and return it', async () => {
      const newFundData = { name: 'New Fund', balance: 500 };
      const createdFund = { id: '3', name: 'New Fund', balance: 500, isDefault: false };

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([createdFund]),
        }),
      } as any);

      const result = await FundService.create(newFundData);
      expect(result).toEqual(createdFund);
      expect(db.insert).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should throw BusinessError when trying to delete default fund', async () => {
      vi.mocked(db.query.funds.findFirst).mockResolvedValue({
        id: '1',
        name: 'Default Fund',
        balance: 1000,
        isDefault: true,
      } as any);

      await expect(FundService.delete('1')).rejects.toThrow(
        new BusinessError(ErrorCode.CANNOT_DELETE_DEFAULT_FUND)
      );
    });

    it('should perform delete when fund is not default', async () => {
      vi.mocked(db.query.funds.findFirst).mockResolvedValue({
        id: '2',
        name: 'Normal Fund',
        balance: 500,
        isDefault: false,
      } as any);

      vi.mocked(db.delete).mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: '2' }]),
        }),
      } as any);

      const result = await FundService.delete('2');
      expect(result).toEqual([{ id: '2' }]);
    });
  });
});
