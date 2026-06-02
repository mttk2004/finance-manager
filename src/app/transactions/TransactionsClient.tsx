"use client";

import { useState, useRef } from "react";
import { importTransactions } from "@/lib/db/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filter, setFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE' | 'TRANSFER'>('ALL');
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isImporting, setIsImporting] = useState(false);
  const itemsPerPage = 15;

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      try {
        const result = await importTransactions(text);
        if (result.success) {
          toast.success(`Nhập dữ liệu thành công!`, {
            description: `Đã nhập ${result.count} giao dịch mới.`
          });
          router.refresh();
        } else {
          toast.error("Lỗi khi nhập dữ liệu CSV.");
        }
      } catch (err) {
        console.error("Import failed:", err);
        toast.error("Lỗi khi nhập dữ liệu CSV.");
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  const filteredTransactions = initialTransactions.filter(tx => {
    // Note search filter
    if (searchTerm && !(tx.note || '').toLowerCase().includes(searchTerm.toLowerCase()) && !(tx.category?.name || '').toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Type filter
    if (filter === 'ALL') return true;
    return tx.type === filter;
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFilterChange = (newFilter: 'ALL' | 'INCOME' | 'EXPENSE' | 'TRANSFER') => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

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
        <div className="flex gap-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImportCSV} 
            accept=".csv" 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="flex items-center gap-2 bg-white/[0.05] hover:bg-white/[0.1] text-white font-medium px-4 py-2 rounded-xl transition-colors border border-white/[0.05] hover:border-white/[0.1] cursor-pointer shrink-0 disabled:opacity-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            {isImporting ? "Đang nhập..." : "Nhập CSV"}
          </button>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 font-medium px-4 py-2 rounded-xl transition-colors border border-emerald-500/20 hover:border-emerald-500/40 cursor-pointer shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Xuất CSV
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide w-full md:w-auto">
          {['ALL', 'EXPENSE', 'INCOME', 'TRANSFER'].map((type) => (
            <button
              key={type}
              onClick={() => handleFilterChange(type as 'ALL' | 'INCOME' | 'EXPENSE' | 'TRANSFER')}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors border cursor-pointer ${
                filter === type 
                  ? 'bg-white text-black border-white' 
                  : 'bg-[#121212] text-neutral-400 border-white/[0.05] hover:border-white/20'
              }`}
            >
              {type === 'ALL' ? 'Tất cả' : type === 'INCOME' ? 'Thu nhập' : type === 'EXPENSE' ? 'Chi tiêu' : 'Chuyển tiền'}
            </button>
          ))}
        </div>
        
        <div className="w-full md:w-64">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Tìm kiếm giao dịch..." 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#121212] border border-white/[0.05] rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-white/20 transition-colors"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
        </div>
      </div>

      <div className="bg-[#121212] border border-white/[0.04] rounded-3xl p-4 md:p-6 overflow-hidden">
        {paginatedTransactions.length === 0 ? (
          <p className="text-sm text-neutral-500 text-center py-12">Không có giao dịch nào phù hợp.</p>
        ) : (
          <>
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
                  {paginatedTransactions.map(tx => (
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
            
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/[0.05]">
                <p className="text-xs text-neutral-500">
                  Trang {currentPage} / {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg bg-white/5 text-neutral-300 text-xs font-medium hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Trước
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-lg bg-white/5 text-neutral-300 text-xs font-medium hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
