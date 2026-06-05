"use client";

import { useState, useRef } from "react";
import { importTransactions, getAllTransactions } from "@/server/actions/transactions";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { EmptyState } from "@/components/empty-state";
import { ReceiptText } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const ExportReportModal = dynamic(() => import("@/components/export-report-modal"), {
  ssr: false,
});

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
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filter, setFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE' | 'TRANSFER'>('ALL');
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  
  // Advanced Filter States
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  
  // Sorting States
  const [sortField, setSortField] = useState<keyof Transaction | 'category' | 'fund'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { data: transactions = initialTransactions } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => getAllTransactions(),
    initialData: initialTransactions,
  });

  const importMutation = useMutation({
    mutationFn: importTransactions,
    onSuccess: (result) => {
      if (result.success) {
        toast.success(`Nhập dữ liệu thành công!`, {
          description: `Đã nhập ${result.count} giao dịch mới.`
        });
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      } else {
        toast.error("Lỗi khi nhập dữ liệu CSV.");
      }
    },
    onError: (err) => {
      console.error("Import failed:", err);
      toast.error("Lỗi khi nhập dữ liệu CSV.");
    },
    onSettled: () => {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  });

  const itemsPerPage = 15;

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      importMutation.mutate(text);
    };
    reader.readAsText(file);
  };

  const filteredTransactions = transactions.filter(tx => {
    // Note search filter
    if (searchTerm && !(tx.note || '').toLowerCase().includes(searchTerm.toLowerCase()) && !(tx.category?.name || '').toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Type filter
    if (filter !== 'ALL' && tx.type !== filter) return false;

    // Date range filter
    if (startDate && tx.date && new Date(tx.date) < new Date(startDate)) return false;
    if (endDate && tx.date && new Date(tx.date) > new Date(new Date(endDate).setHours(23, 59, 59, 999))) return false;

    // Amount range filter
    if (minAmount && tx.amount < parseInt(minAmount)) return false;
    if (maxAmount && tx.amount > parseInt(maxAmount)) return false;

    return true;
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    let valA: string | number | Date = a[sortField as keyof Transaction] as string | number | Date;
    let valB: string | number | Date = b[sortField as keyof Transaction] as string | number | Date;

    if (sortField === 'category') {
      valA = a.category?.name || "";
      valB = b.category?.name || "";
    } else if (sortField === 'fund') {
      valA = a.fund?.name || "";
      valB = b.fund?.name || "";
    }

    if (valA === null || valA === undefined) valA = "";
    if (valB === null || valB === undefined) valB = "";

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
  const paginatedTransactions = sortedTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSort = (field: keyof Transaction | 'category' | 'fund') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilter('ALL');
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setMinAmount("");
    setMaxAmount("");
    setCurrentPage(1);
  };

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
          <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2">Tất cả giao dịch</h1>
          <p className="text-muted-foreground">Xem và xuất lịch sử thu chi chi tiết của bạn.</p>
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
            disabled={importMutation.isPending}
            className="flex items-center gap-2 bg-white/[0.05] hover:bg-white/[0.1] text-foreground font-medium px-4 py-2 rounded-xl transition-colors border border-border hover:border-white/[0.1] cursor-pointer shrink-0 disabled:opacity-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            {importMutation.isPending ? "Đang xử lý..." : "Nhập CSV"}
          </button>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 font-medium px-4 py-2 rounded-xl transition-colors border border-emerald-500/20 hover:border-emerald-500/40 cursor-pointer shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Xuất CSV
          </button>
          <button 
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-medium px-4 py-2 rounded-xl transition-colors border border-rose-500/20 hover:border-rose-500/40 cursor-pointer shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            Báo cáo PDF
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
                  : 'bg-secondary border border-border hover:border-white/20'
              }`}
            >
              {type === 'ALL' ? 'Tất cả' : type === 'INCOME' ? 'Thu nhập' : type === 'EXPENSE' ? 'Chi tiêu' : 'Chuyển tiền'}
            </button>
          ))}
          <button 
            onClick={() => setIsAdvancedFilterOpen(!isAdvancedFilterOpen)}
            className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors border cursor-pointer flex items-center gap-2 ${
              isAdvancedFilterOpen ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-secondary border-border hover:border-white/20'
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
            Bộ lọc nâng cao
          </button>
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
              className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-white/20 transition-colors"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
        </div>
      </div>

      {isAdvancedFilterOpen && (
        <div className="bg-secondary border border-border rounded-3xl p-6 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold ml-1">Từ ngày</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
              className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold ml-1">Đến ngày</label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
              className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold ml-1">Số tiền từ</label>
            <input 
              type="number" 
              placeholder="VD: 50000"
              value={minAmount}
              onChange={(e) => { setMinAmount(e.target.value); setCurrentPage(1); }}
              className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold ml-1">Đến số tiền</label>
            <div className="flex gap-2">
              <input 
                type="number" 
                placeholder="VD: 1000000"
                value={maxAmount}
                onChange={(e) => { setMaxAmount(e.target.value); setCurrentPage(1); }}
                className="flex-1 bg-card border border-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white/20 transition-colors"
              />
              <button 
                onClick={resetFilters}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-colors border border-border"
                title="Xóa bộ lọc"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-3xl p-4 md:p-6 overflow-hidden">
        {paginatedTransactions.length === 0 ? (
          <EmptyState 
            icon={ReceiptText}
            title="Không tìm thấy giao dịch"
            description="Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc của bạn."
            className="py-12"
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-muted-foreground border-b border-border">
                    <th 
                      className="font-medium px-4 py-3 whitespace-nowrap cursor-pointer hover:text-white transition-colors group"
                      onClick={() => toggleSort('date')}
                    >
                      <div className="flex items-center gap-1">
                        Thời gian
                        <span className={`transition-opacity ${sortField === 'date' ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`}>
                          {sortField === 'date' && sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      </div>
                    </th>
                    <th 
                      className="font-medium px-4 py-3 whitespace-nowrap cursor-pointer hover:text-white transition-colors group"
                      onClick={() => toggleSort('category')}
                    >
                      <div className="flex items-center gap-1">
                        Danh mục
                        <span className={`transition-opacity ${sortField === 'category' ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`}>
                          {sortField === 'category' && sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      </div>
                    </th>
                    <th 
                      className="font-medium px-4 py-3 whitespace-nowrap cursor-pointer hover:text-white transition-colors group"
                      onClick={() => toggleSort('fund')}
                    >
                      <div className="flex items-center gap-1">
                        Quỹ
                        <span className={`transition-opacity ${sortField === 'fund' ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`}>
                          {sortField === 'fund' && sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      </div>
                    </th>
                    <th className="font-medium px-4 py-3 whitespace-nowrap">Ghi chú</th>
                    <th 
                      className="font-medium px-4 py-3 text-right whitespace-nowrap cursor-pointer hover:text-white transition-colors group"
                      onClick={() => toggleSort('amount')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Số tiền
                        <span className={`transition-opacity ${sortField === 'amount' ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`}>
                          {sortField === 'amount' && sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTransactions.map(tx => (
                    <tr key={tx.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors group">
                      <td className="px-4 py-4 whitespace-nowrap text-muted-foreground">
                        {new Date(tx.date!).toLocaleString('vi-VN')}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span>{tx.category?.icon || "📝"}</span>
                          <span className="text-foreground">{tx.category?.name || "Khác"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-muted-foreground">
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
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
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

      <ExportReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} />
    </div>
  );
}
