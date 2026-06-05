import { db } from '@/lib/db';
import { transactions } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const allTransactions = await db.query.transactions.findMany({
      with: {
        category: true,
        fund: true,
      },
      orderBy: [desc(transactions.date)],
    });

    // Create CSV content
    const header = ['ID', 'Ngày giờ', 'Loại', 'Danh mục', 'Quỹ', 'Số tiền', 'Ghi chú'];
    const rows = allTransactions.map(tx => {
      const type = tx.type === 'INCOME' ? 'Thu nhập' : tx.type === 'EXPENSE' ? 'Chi tiêu' : tx.type;
      const date = tx.date ? new Date(tx.date).toLocaleString('vi-VN') : '';
      // Escape notes with quotes to handle commas
      const note = `"${(tx.note || '').replace(/"/g, '""')}"`;
      
      return [
        tx.id,
        date,
        type,
        tx.category?.name || '',
        tx.fund?.name || '',
        tx.amount.toString(),
        note
      ].join(',');
    });

    const csvContent = [header.join(','), ...rows].join('\n');

    // Return as downloadable file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="transactions.csv"',
      },
    });
  } catch (error) {
    console.error('Failed to export CSV:', error);
    return NextResponse.json({ error: 'Failed to export CSV' }, { status: 500 });
  }
}
