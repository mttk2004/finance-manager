"use client";

import { useState } from "react";

interface Transaction {
  id: string;
  fundId: string;
  categoryId: string | null;
  amount: number;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'LEND' | 'BORROW';
  date: Date | null;
  note: string | null;
  createdAt: Date | null;
  category?: {
    id: string;
    name: string;
    icon: string | null;
  } | null;
  fund?: {
    id: string;
    name: string;
  } | null;
}

interface TransactionsClientProps {
  initialTransactions: Transaction[];
}

export default function TransactionsClient({ initialTransactions }: TransactionsClientProps) {
  const [filter, setFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');

  const filteredTransactions = initialTransactions.filter(tx => {
    if (filter === 'ALL') return true;
    return tx.type === filter;
  });

  const handleExportCSV = () => {
    window.open('/api/export', '_blank');
  };

  return (
    <div className="flex flex-col w-full h-full pb-20 md:pb-8 max-w-5xl mx-auto mt-4 md:mt-8 px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Tất cả giao dịch</h1>
          <p className="text-neutral-400">Xem và xuất lịch sử thu chi chi tiết của bạn.</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 font-medium px-4 py-2 rounded-xl transition-colors border border-emerald-500/20 hover:border-emerald-500/40 cursor-pointer shrink-0"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Xuất CSV
        </button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-2">
        {['ALL', 'EXPENSE', 'INCOME'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type as 'ALL' | 'INCOME' | 'EXPENSE')}
            className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors border cursor-pointer ${
              filter === type 
                ? 'bg-white text-black border-white' 
                : 'bg-[#121212] text-neutral-400 border-white/[0.05] hover:border-white/20'
            }`}
          >
            {type === 'ALL' ? 'Tất cả' : type === 'INCOME' ? 'Thu nhập' : 'Chi tiêu'}
          </button>
        ))}
      </div>

      <div className="bg-[#121212] border border-white/[0.04] rounded-3xl p-4 md:p-6 overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <p className="text-sm text-neutral-500 text-center py-12">Không có giao dịch nào phù hợp.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-neutral-500 border-b border-white/[0.05]">
                  <th className="font-medium px-4 py-3 whitespace-nowrap">Thời gian</th>
                  <th className="font-medium px-4 py-3 whitespace-nowrap">Danh mục</th>
                  <th className="font-medium px-4 py-3 whitespace-nowrap">Quỹ</th>
                  <th className="font-medium px-4 py-3 whitespace-nowrap">Ghi chú</th>
                  <th className="font-medium px-4 py-3 text-right whitespace-nowrap">Số tiền</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map(tx => (
                  <tr key={tx.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors group">
                    <td className="px-4 py-4 whitespace-nowrap text-neutral-400">
                      {new Date(tx.date!).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span>{tx.category?.icon || "📝"}</span>
                        <span className="text-neutral-200">{tx.category?.name || "Khác"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-neutral-400">
                      {tx.fund?.name || "Khác"}
                    </td>
                    <td className="px-4 py-4 text-neutral-300 max-w-[200px] truncate">
                      {tx.note || "-"}
                    </td>
                    <td className={`px-4 py-4 whitespace-nowrap text-right font-mono font-medium ${tx.type === 'INCOME' || tx.type === 'BORROW' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {tx.type === 'INCOME' || tx.type === 'BORROW' ? '+' : '-'}{tx.amount.toLocaleString('vi-VN')}đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
