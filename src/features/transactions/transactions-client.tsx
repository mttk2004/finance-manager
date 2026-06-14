"use client";

import { useState, useRef, useMemo } from "react";
import { importTransactions } from "@/server/actions/transactions";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { EmptyState } from "@/components/empty-state";
import { AmountInput } from "@/components/amount-input";
import { CustomSelect } from "@/components/ui/custom-select";
import { ReceiptText, Trash2, Calendar, Tag, Wallet, Search, Filter, FileText, Download, Upload, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useTransactions } from "@/hooks/use-transactions";
import { useMutation } from "@tanstack/react-query";
import { Transaction, Fund, Category, TransactionsResponse } from "@/types";
import { TransactionFilter } from "@/lib/validations";

interface TransactionsClientProps {
  initialTransactions: TransactionsResponse;
  funds: Fund[];
  categories: Category[];
}

const ExportReportModal = dynamic(() => import("@/components/export-report-modal"), {
  ssr: false,
});

export default function TransactionsClient({ initialTransactions, funds, categories }: TransactionsClientProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Basic States
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  
  // Advanced Filter States
  const [fundId, setFundId] = useState<string>('ALL');
  const [categoryId, setCategoryId] = useState<string>('ALL');
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  
  // Sorting States
  const [sortField, setSortField] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filters = useMemo((): TransactionFilter => {
    const f: TransactionFilter = {
      page: currentPage,
      limit: 15,
      sortField,
      sortOrder,
    };
    if (filterType !== 'ALL') f.type = filterType;
    if (fundId !== 'ALL') f.fundId = fundId;
    if (categoryId !== 'ALL') f.categoryId = categoryId;
    if (searchTerm) f.searchTerm = searchTerm;
    if (startDate) f.startDate = startDate;
    if (endDate) f.endDate = endDate;
    if (minAmount) f.minAmount = parseInt(minAmount);
    if (maxAmount) f.maxAmount = parseInt(maxAmount);
    return f;
  }, [filterType, fundId, categoryId, searchTerm, startDate, endDate, minAmount, maxAmount, sortField, sortOrder, currentPage]);

  // Only use initialTransactions if it's the first page with no filters
  const isDefaultFilters = useMemo(() => (
    filterType === 'ALL' && fundId === 'ALL' && categoryId === 'ALL' && 
    !searchTerm && !startDate && !endDate && !minAmount && !maxAmount && 
    currentPage === 1 && sortField === 'date' && sortOrder === 'desc'
  ), [filterType, fundId, categoryId, searchTerm, startDate, endDate, minAmount, maxAmount, currentPage, sortField, sortOrder]);

  const { transactions: data, isLoading, deleteTransaction } = useTransactions(
    filters, 
    isDefaultFilters ? initialTransactions : undefined
  );

  const transactions = (data as TransactionsResponse)?.transactions || [];
  const totalPages = (data as TransactionsResponse)?.totalPages || 1;

  const importMutation = useMutation({
    mutationFn: importTransactions,
    onSuccess: (result) => {
      if (result.success && result.count > 0) {
        toast.success(`Nhập dữ liệu thành công!`, {
          description: `Đã nhập ${result.count} giao dịch mới.`
        });
      } else if (result.errors && result.errors.length > 0) {
        toast.error("Nhập dữ liệu có lỗi", {
          description: result.errors.slice(0, 3).join('\n') + (result.errors.length > 3 ? `\n... và ${result.errors.length - 3} lỗi khác` : '')
        });
      } else {
        toast.info("Không có giao dịch nào được nhập.");
      }
    },
    onError: (err) => {
      console.error("Import failed:", err);
      toast.error("Lỗi khi kết nối hệ thống để nhập CSV.");
    },
    onSettled: () => {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  });

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

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilterType('ALL');
    setFundId('ALL');
    setCategoryId('ALL');
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setMinAmount("");
    setMaxAmount("");
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilter: string) => {
    setFilterType(newFilter);
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    window.open('/api/export', '_blank');
  };

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa giao dịch này?")) {
      deleteTransaction(id);
    }
  };

  return (
    <div className="flex flex-col w-full h-full pb-20 md:pb-8 max-w-5xl mx-auto mt-4 md:mt-8 px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2">Tất cả giao dịch</h1>
          <p className="text-muted-foreground">Xem và quản lý lịch sử thu chi của bạn.</p>
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
            <Upload className="w-4 h-4" />
            {importMutation.isPending ? "Đang xử lý..." : "Nhập CSV"}
          </button>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 font-medium px-4 py-2 rounded-xl transition-colors border border-emerald-500/20 hover:border-emerald-500/40 cursor-pointer shrink-0"
          >
            <Download className="w-4 h-4" />
            Xuất CSV
          </button>
          <button 
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-medium px-4 py-2 rounded-xl transition-colors border border-rose-500/20 hover:border-rose-500/40 cursor-pointer shrink-0"
          >
            <FileText className="w-4 h-4" />
            Báo cáo PDF
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide w-full md:w-auto">
          {['ALL', 'EXPENSE', 'INCOME', 'TRANSFER'].map((t) => (
            <button
              key={t}
              onClick={() => handleFilterChange(t)}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors border cursor-pointer ${
                filterType === t 
                  ? 'bg-white text-black border-white' 
                  : 'bg-secondary border border-border hover:border-white/20'
              }`}
            >
              {t === 'ALL' ? 'Tất cả' : t === 'INCOME' ? 'Thu nhập' : t === 'EXPENSE' ? 'Chi tiêu' : 'Chuyển tiền'}
            </button>
          ))}
          <button 
            onClick={() => setIsAdvancedFilterOpen(!isAdvancedFilterOpen)}
            className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors border border-dashed cursor-pointer flex items-center gap-2 ${
              isAdvancedFilterOpen || fundId !== 'ALL' || categoryId !== 'ALL' || startDate || endDate || minAmount || maxAmount ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-transparent border-border text-muted-foreground hover:text-white'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            Bộ lọc
          </button>
        </div>
        
        <div className="w-full md:w-64">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Tìm kiếm..." 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-white/20 transition-colors"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {(fundId !== 'ALL' || categoryId !== 'ALL' || startDate || endDate || minAmount || maxAmount) && !isAdvancedFilterOpen && (
        <div className="flex flex-wrap gap-2 mb-6 animate-in fade-in">
          <span className="text-[10px] uppercase font-bold text-muted-foreground py-1.5 px-1">Đang lọc:</span>
          {fundId !== 'ALL' && (
            <div className="flex items-center gap-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-lg text-xs">
              <span className="opacity-70">Quỹ:</span> {funds.find(f => f.id === fundId)?.name}
              <button onClick={() => { setFundId('ALL'); setCurrentPage(1); }} className="hover:text-white ml-1 cursor-pointer"><X className="w-3 h-3" /></button>
            </div>
          )}
          {categoryId !== 'ALL' && (
            <div className="flex items-center gap-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-lg text-xs">
              <span className="opacity-70">DM:</span> {categories.find(c => c.id === categoryId)?.name}
              <button onClick={() => { setCategoryId('ALL'); setCurrentPage(1); }} className="hover:text-white ml-1 cursor-pointer"><X className="w-3 h-3" /></button>
            </div>
          )}
          {(startDate || endDate) && (
            <div className="flex items-center gap-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-lg text-xs">
              <span className="opacity-70">TG:</span> {startDate ? new Date(startDate).toLocaleDateString('vi-VN') : 'Bắt đầu'} - {endDate ? new Date(endDate).toLocaleDateString('vi-VN') : 'Hiện tại'}
              <button onClick={() => { setStartDate(''); setEndDate(''); setCurrentPage(1); }} className="hover:text-white ml-1 cursor-pointer"><X className="w-3 h-3" /></button>
            </div>
          )}
          {(minAmount || maxAmount) && (
            <div className="flex items-center gap-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-lg text-xs">
              <span className="opacity-70">Tiền:</span> {minAmount ? `${parseInt(minAmount).toLocaleString()}đ` : '0đ'} - {maxAmount ? `${parseInt(maxAmount).toLocaleString()}đ` : 'Max'}
              <button onClick={() => { setMinAmount(''); setMaxAmount(''); setCurrentPage(1); }} className="hover:text-white ml-1 cursor-pointer"><X className="w-3 h-3" /></button>
            </div>
          )}
        </div>
      )}

      {isAdvancedFilterOpen && (
        <div className="bg-secondary border border-border rounded-[2rem] p-6 mb-8 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Bộ lọc nâng cao
            </h3>
            <button onClick={() => setIsAdvancedFilterOpen(false)} className="text-muted-foreground hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold ml-1">Khoản chi từ Quỹ</label>
              <CustomSelect 
                value={fundId}
                onChange={(e) => { setFundId(e.target.value); setCurrentPage(1); }}
                options={[
                  { value: 'ALL', label: 'Tất cả các quỹ' },
                  ...funds.map(f => ({ value: f.id, label: f.name }))
                ]}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold ml-1">Theo Danh mục</label>
              <CustomSelect 
                value={categoryId}
                onChange={(e) => { setCategoryId(e.target.value); setCurrentPage(1); }}
                options={[
                  { value: 'ALL', label: 'Tất cả danh mục' },
                  ...categories.map(c => ({ value: c.id, label: `${c.icon} ${c.name}` }))
                ]}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold ml-1">Từ ngày</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                className="w-full bg-card border border-border rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold ml-1">Đến ngày</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                className="w-full bg-card border border-border rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold ml-1">Số tiền tối thiểu</label>
              <AmountInput 
                placeholder="VD: 50.000"
                value={minAmount}
                onChange={(val) => { setMinAmount(val); setCurrentPage(1); }}
                className="w-full bg-card border border-border rounded-xl px-4 py-2 text-sm text-white" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold ml-1">Số tiền tối đa</label>
              <AmountInput 
                placeholder="VD: 1.000.000"
                value={maxAmount}
                onChange={(val) => { setMaxAmount(val); setCurrentPage(1); }}
                className="w-full bg-card border border-border rounded-xl px-4 py-2 text-sm text-white" 
              />
            </div>
            <div className="lg:col-span-2 flex items-end gap-3">
              <button 
                onClick={resetFilters}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-colors border border-border flex items-center justify-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Xóa tất cả bộ lọc
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-3xl p-4 md:p-6 overflow-hidden relative min-h-[400px]">
        {isLoading && (
          <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          </div>
        )}
        
        {transactions.length === 0 ? (
          <EmptyState 
            icon={ReceiptText}
            title="Không tìm thấy giao dịch"
            description="Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc của bạn."
            className="py-20"
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
                        <Calendar className="w-3.5 h-3.5 opacity-40" />
                        Thời gian
                        <span className={`transition-opacity ${sortField === 'date' ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`}>
                          {sortField === 'date' && sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      </div>
                    </th>
                    <th 
                      className="font-medium px-4 py-3 whitespace-nowrap cursor-pointer hover:text-white transition-colors group"
                      onClick={() => toggleSort('categoryId')}
                    >
                      <div className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5 opacity-40" />
                        Danh mục
                        <span className={`transition-opacity ${sortField === 'categoryId' ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`}>
                          {sortField === 'categoryId' && sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      </div>
                    </th>
                    <th 
                      className="font-medium px-4 py-3 whitespace-nowrap cursor-pointer hover:text-white transition-colors group"
                      onClick={() => toggleSort('fundId')}
                    >
                      <div className="flex items-center gap-1">
                        <Wallet className="w-3.5 h-3.5 opacity-40" />
                        Quỹ
                        <span className={`transition-opacity ${sortField === 'fundId' ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`}>
                          {sortField === 'fundId' && sortOrder === 'asc' ? '↑' : '↓'}
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
                    <th className="px-4 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className={isLoading ? 'opacity-50' : ''}>
                  {transactions.map((tx: Transaction) => (
                    <tr key={tx.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors group">
                      <td className="px-4 py-4 whitespace-nowrap text-muted-foreground text-xs">
                        {tx.date ? new Date(tx.date).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "-"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-sm">{tx.category?.icon || "📝"}</span>
                          <span className="text-foreground font-medium">{tx.category?.name || "Khác"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-muted-foreground">
                        {tx.type === 'TRANSFER' ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-foreground font-medium">{tx.fund?.name}</span>
                            <span className="text-[10px] opacity-40">→</span>
                            <span className="text-foreground font-medium">{tx.toFund?.name}</span>
                          </div>
                        ) : (
                          tx.fund?.name || "Khác"
                        )}
                      </td>
                      <td className="px-4 py-4 text-neutral-300 max-w-[200px] truncate italic" title={tx.note || ""}>
                        {tx.note || "-"}
                      </td>
                      <td className={`px-4 py-4 whitespace-nowrap text-right font-mono font-bold ${
                        tx.type === 'INCOME' || tx.type === 'BORROW' ? 'text-emerald-400' : 
                        tx.type === 'TRANSFER' ? 'text-blue-400' :
                        'text-rose-400'
                      }`}>
                        {tx.type === 'INCOME' || tx.type === 'BORROW' ? '+' : tx.type === 'TRANSFER' ? '' : '-'}{tx.amount.toLocaleString('vi-VN')}đ
                      </td>
                      <td className="px-4 py-4">
                         <button 
                           onClick={() => handleDelete(tx.id)}
                           className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-400 transition-all cursor-pointer"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Hiển thị <span className="text-foreground font-medium">{transactions.length}</span> giao dịch (Trang {currentPage}/{totalPages})
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1 || isLoading}
                    className="p-2 rounded-lg bg-secondary text-neutral-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors border border-border"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || isLoading}
                    className="p-2 rounded-lg bg-secondary text-neutral-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors border border-border"
                  >
                    <ChevronRight className="w-4 h-4" />
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
