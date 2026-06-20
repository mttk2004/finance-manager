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
        toFund: true,
      },
      orderBy: [desc(transactions.date)],
    });

    // Create CSV content
    const header = ['ID', 'Ngày giờ', 'Loại', 'Danh mục', 'Quỹ gửi', 'Quỹ nhận', 'Số tiền', 'Ghi chú'];
    const rows = allTransactions.map(tx => {
      let type = tx.type as string;
      if (tx.type === 'INCOME') type = 'Thu nhập';
      else if (tx.type === 'EXPENSE') type = 'Chi tiêu';
      else if (tx.type === 'TRANSFER') type = 'Chuyển tiền';
      else if (tx.type === 'BORROW') type = 'Vay';
      else if (tx.type === 'LEND') type = 'Cho vay';

      const date = tx.date ? new Date(tx.date).toLocaleString('vi-VN') : '';
      // Escape notes with quotes to handle commas
      const note = `"${(tx.note || '').replace(/"/g, '""')}"`;
      
      return [
        tx.id,
        date,
        type,
        tx.category?.name || '',
        tx.fund?.name || '',
        tx.toFund?.name || '',
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
