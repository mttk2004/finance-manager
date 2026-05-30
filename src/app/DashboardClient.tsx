"use client";

import { useState } from "react";
import { CashFlowChart } from "@/components/cash-flow-chart";
import { CategoryDonutChart } from "@/components/category-donut-chart";
import { DailyReminderModal } from "@/components/daily-reminder-modal";
import { IncomeDistributionModal } from "@/components/income-distribution-modal";
import { AmountInput } from "@/components/amount-input";
import { FundSelectorModal, type Fund } from "@/components/fund-selector-modal";
import { createTransaction } from "@/lib/db/actions";
import { useRouter } from "next/navigation";

interface DashboardFund extends Fund {
  isDefault: boolean | null;
  attributes: unknown;
  createdAt: Date | null;
  updatedAt: Date | null;
}

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
}

interface BudgetTracking {
  id: string;
  categoryId: string;
  amountLimit: number;
  period: string;
  spent: number;
  category?: {
    id: string;
    name: string;
    icon: string | null;
  } | null;
}

interface DashboardClientProps {
  initialData: {
    allFunds: DashboardFund[];
    recentTransactions: Transaction[];
    totalBalance: number;
    showReminder: boolean;
    budgetTracking: BudgetTracking[];
    totalSpentMonth: number;
    totalBudgetMonth: number;
    currentMonthPeriod: string;
  };
}

export default function DashboardClient({ initialData }: DashboardClientProps) {
  const router = useRouter();
  const [isDistributionModalOpen, setDistributionModalOpen] = useState(false);
  const [isFundSelectorOpen, setFundSelectorOpen] = useState(false);
  const [isTransferModalOpen, setTransferModalOpen] = useState(false);
  const [transferToFund, setTransferToFund] = useState<DashboardFund | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [activeFund, setActiveFund] = useState<DashboardFund>(
    initialData.allFunds.find(f => f.isDefault) || initialData.allFunds[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Group transactions by date
  const groupedTransactions = initialData.recentTransactions.reduce((acc: Record<string, Transaction[]>, tx) => {
    const date = new Date(tx.date!);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    let dateStr = date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long' });
    if (date.toDateString() === today.toDateString()) dateStr = 'Hôm nay';
    else if (date.toDateString() === yesterday.toDateString()) dateStr = 'Hôm qua';

    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(tx);
    return acc;
  }, {});

  const hashtags = ['#an_sang', '#cafe', '#di_chuyen', '#mua_sam', '#vui_ve', '#lam_viec'];

  const handleTransaction = async (type: 'INCOME' | 'EXPENSE' | 'LEND' | 'BORROW' | 'TRANSFER') => {
    if (!amount || amount === '0' || isSubmitting) return;
    if (type === 'TRANSFER' && (!transferToFund || transferToFund.id === activeFund.id)) {
      alert("Vui lòng chọn quỹ đích khác với quỹ nguồn.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await createTransaction({
        fundId: activeFund.id,
        toFundId: type === 'TRANSFER' ? transferToFund?.id : undefined,
        amount: parseInt(amount),
        type,
        note,
      });
      setAmount("");
      setNote("");
      if (type === 'TRANSFER') setTransferModalOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to create transaction:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DailyReminderModal show={initialData.showReminder} />
      <IncomeDistributionModal isOpen={isDistributionModalOpen} onClose={() => setDistributionModalOpen(false)} />
      <FundSelectorModal 
        isOpen={isFundSelectorOpen} 
        onClose={() => setFundSelectorOpen(false)} 
        currentFund={activeFund.name} 
        funds={initialData.allFunds}
        onSelectFund={(fundName) => {
          const fund = initialData.allFunds.find(f => f.name === fundName);
          if (fund) setActiveFund(fund);
        }} 
      />
      {/* Transfer Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#121212] border border-white/[0.04] rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white tracking-tight">Chuyển tiền</h2>
              <button onClick={() => setTransferModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-neutral-400">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-xs text-neutral-500 mb-2 font-medium">Từ quỹ</p>
                <div className="w-full bg-[#1A1A1A] border border-white/[0.05] rounded-xl px-4 py-3 text-neutral-300">
                  {activeFund.name}
                </div>
              </div>
              
              <div className="flex justify-center -my-2 relative z-10">
                <div className="w-8 h-8 rounded-full bg-[#121212] border border-white/[0.05] flex items-center justify-center text-neutral-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
                </div>
              </div>
              
              <div>
                <p className="text-xs text-neutral-500 mb-2 font-medium">Đến quỹ</p>
                <select 
                  value={transferToFund?.id || ''} 
                  onChange={(e) => {
                    const fund = initialData.allFunds.find(f => f.id === e.target.value);
                    if (fund) setTransferToFund(fund);
                  }}
                  className="w-full bg-[#1A1A1A] border border-white/[0.05] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/20 transition-colors"
                >
                  <option value="" disabled>-- Chọn quỹ đích --</option>
                  {initialData.allFunds.filter(f => f.id !== activeFund.id).map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <p className="text-xs text-neutral-500 mb-2 font-medium">Số tiền chuyển</p>
                <div className="text-2xl font-mono text-white tracking-tight bg-[#1A1A1A] border border-white/[0.05] rounded-xl px-4 py-3">
                  {parseInt(amount || '0').toLocaleString('vi-VN')}đ
                </div>
              </div>
            </div>

            <button 
              onClick={() => handleTransaction('TRANSFER')}
              disabled={isSubmitting || !transferToFund}
              className="w-full py-4 rounded-xl bg-blue-500 text-white font-bold text-sm hover:bg-blue-400 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "ĐANG CHUYỂN..." : "XÁC NHẬN CHUYỂN"}
            </button>
          </div>
        </div>
      )}
      <div className="flex flex-col w-full h-full pb-20 md:pb-8 space-y-8 md:space-y-12 max-w-5xl mx-auto mt-4 md:mt-8">
      {/* 1. Header & Summary */}
      <section className="px-4 md:px-0">
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">Chào Kiệt 👋</h1>
              <span className="text-[10px] md:text-xs font-medium text-neutral-400 font-mono hidden sm:inline-block border border-white/10 px-2 py-0.5 rounded text-neutral-500">
                {new Date().toLocaleDateString('vi-VN')}
              </span>
            </div>
            <p className="text-sm text-neutral-400">Hôm nay bạn đã chi tiêu thế nào?</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#121212] border border-white/10 flex items-center justify-center cursor-pointer hover:bg-neutral-800 transition-colors shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-[#121212] p-5 md:p-6 rounded-3xl border border-white/[0.04] flex flex-col justify-center relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
                {/* Decorative element */}
                <svg width="100" height="100" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="60" cy="60" r="59.5" stroke="currentColor" strokeDasharray="4 4" className="text-emerald-500"/>
                  <circle cx="60" cy="60" r="40" stroke="currentColor" strokeOpacity="0.5" className="text-emerald-500"/>
                </svg>
             </div>
             <div className="flex justify-between items-end">
               <div>
                 <span className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1 block font-medium">Tổng số dư</span>
                 <div className="text-3xl md:text-4xl font-mono text-emerald-400 font-bold tracking-tighter">
                    {initialData.totalBalance.toLocaleString('vi-VN')}<span className="text-emerald-700">đ</span>
                 </div>
               </div>
               <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full text-xs font-medium mb-1 relative z-10">
                 <span>↑</span>
                 <span>-</span>
               </div>
             </div>
          </div>

          <div className="bg-[#121212] border border-white/[0.04] rounded-3xl p-5 md:p-6 flex flex-col justify-center">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Ngân sách T{new Date().getMonth() + 1}</h3>
              <span className="text-[10px] text-neutral-500">
                {initialData.totalBudgetMonth > 0 
                  ? `Còn lại ${((initialData.totalBudgetMonth - initialData.totalSpentMonth) / 1000000).toFixed(1)}M` 
                  : 'Chưa thiết lập'}
              </span>
            </div>
            <div className="text-xl font-mono text-white mb-3">
              {(initialData.totalSpentMonth / 1000000).toFixed(1)}M<span className="text-neutral-500 text-sm"> / {(initialData.totalBudgetMonth / 1000000).toFixed(1)}M</span>
            </div>
            
            <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden relative">
              <div 
                className={`absolute top-0 left-0 h-full rounded-full ${initialData.totalSpentMonth > initialData.totalBudgetMonth ? 'bg-rose-500' : 'bg-white'}`} 
                style={{ width: `${Math.min((initialData.totalSpentMonth / (initialData.totalBudgetMonth || 1)) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 md:px-0">
        <div className="lg:col-span-2 space-y-8">
          {/* Action Zone - Minimalist */}
          <section className="bg-[#121212] border border-white/[0.04] rounded-3xl p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-medium">Nhập nhanh (One-Tap)</h3>
                <button 
                  onClick={() => setFundSelectorOpen(true)}
                  className="text-[10px] uppercase font-mono font-medium tracking-tight bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded flex items-center gap-1 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  {activeFund.name}
                </button>
              </div>
              {/* Quick Templates integrated here */}
              <div className="hidden md:flex gap-2">
                {["☕ 30k", "⛽ 50k", "🍜 40k", "🚌 25k"].map((t) => (
                   <button 
                    key={t} 
                    onClick={() => {
                      const val = t.split(' ')[1].replace('k', '');
                      setAmount((parseInt(val) * 1000).toString());
                    }}
                    className="px-4 py-2 border border-white/5 rounded-full bg-[#1A1A1A] hover:bg-[#222222] active:scale-95 transition-all text-xs font-medium text-neutral-400 hover:text-neutral-200 cursor-pointer"
                  >
                      {t}
                   </button>
                ))}
              </div>
            </div>

            {/* Mobile quick templates */}
            <div className="flex md:hidden overflow-x-auto pb-4 gap-2 snap-x scrollbar-hide -mx-2 px-2 mb-2">
               {["☕ 30k", "⛽ 50k", "🍜 40k", "🚌 25k"].map((t) => (
                 <button 
                  key={t} 
                  onClick={() => {
                    const val = t.split(' ')[1].replace('k', '');
                    setAmount((parseInt(val) * 1000).toString());
                  }}
                  className="snap-start shrink-0 px-4 py-3 border border-white/5 rounded-full bg-[#1A1A1A] hover:bg-[#222222] active:scale-95 transition-all text-xs font-medium text-neutral-400 cursor-pointer"
                 >
                    {t}
                 </button>
               ))}
            </div>
            
            <div className="space-y-6 md:space-y-8 mt-4 md:mt-8">
              <div className="relative group">
                <label className="text-[10px] uppercase tracking-widest text-neutral-600 mb-2 block">Số tiền (VND)</label>
                <AmountInput 
                  value={amount}
                  onChange={setAmount}
                  placeholder="0" 
                  className="w-full bg-transparent text-5xl md:text-7xl font-mono text-white py-2 focus:outline-none placeholder:text-neutral-800 text-center md:text-left border-b border-white/5 focus:border-white transition-colors pb-4" 
                />
                <span className="absolute right-0 bottom-6 text-neutral-600 text-xl font-mono hidden md:block">đ</span>
              </div>
              
              <div className="relative">
                <label className="text-[10px] uppercase tracking-widest text-neutral-600 mb-2 block">Ghi chú & Hashtag</label>
                <input 
                  type="text" 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: Ăn trưa #vui_ve" 
                  className="w-full bg-[#161616] border border-white/[0.03] rounded-2xl px-4 md:px-6 py-4 md:py-5 text-sm text-neutral-300 focus:outline-none focus:border-white/20 placeholder:text-neutral-600 transition-colors" 
                />
                <div className="flex flex-wrap gap-2 mt-3">
                  {hashtags.map(tag => (
                    <button 
                      key={tag}
                      onClick={() => setNote(prev => prev.includes(tag) ? prev : (prev ? `${prev} ${tag}` : tag))}
                      className="text-[10px] px-2 py-1 rounded-full bg-white/[0.03] border border-white/[0.05] text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.08] transition-all cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4">
                <button 
                  onClick={() => handleTransaction('EXPENSE')}
                  disabled={!amount || amount === '0' || isSubmitting}
                  className="group relative py-4 md:py-5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold text-sm md:text-base border border-rose-500/20 hover:border-rose-500/40 active:scale-[0.95] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden shadow-[0_0_20px_rgba(244,63,94,0.1)] hover:shadow-[0_0_30px_rgba(244,63,94,0.2)]"
                >
                  <span className="relative z-10">{isSubmitting ? 'ĐANG XỬ LÝ...' : 'CHI TIỀN'}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </button>
                <button 
                  onClick={() => handleTransaction('INCOME')}
                  disabled={!amount || amount === '0' || isSubmitting}
                  className="group relative py-4 md:py-5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 font-bold text-sm md:text-base border border-emerald-500/20 hover:border-emerald-500/40 active:scale-[0.95] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.1)] hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                >
                  <span className="relative z-10">{isSubmitting ? 'ĐANG XỬ LÝ...' : 'THU VÀO'}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-2">
                <button 
                  onClick={() => handleTransaction('BORROW')}
                  disabled={!amount || amount === '0' || isSubmitting}
                  className="py-2 rounded-xl text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.02] font-medium text-xs border border-transparent hover:border-white/[0.05] transition-all cursor-pointer disabled:opacity-40"
                >
                  Đi vay
                </button>
                <button 
                  onClick={() => handleTransaction('LEND')}
                  disabled={!amount || amount === '0' || isSubmitting}
                  className="py-2 rounded-xl text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.02] font-medium text-xs border border-transparent hover:border-white/[0.05] transition-all cursor-pointer disabled:opacity-40"
                >
                  Cho vay
                </button>
                <button 
                  onClick={() => setTransferModalOpen(true)}
                  disabled={!amount || amount === '0' || isSubmitting}
                  className="py-2 rounded-xl text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 font-medium text-xs border border-transparent hover:border-blue-500/20 transition-all cursor-pointer disabled:opacity-40"
                >
                  Chuyển quỹ
                </button>
              </div>
            </div>
          </section>

          {/* Charts */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="bg-[#121212] border border-white/[0.04] p-6 rounded-3xl flex flex-col justify-between aspect-square md:aspect-auto md:h-80">
              <h3 className="text-xs uppercase tracking-widest text-neutral-500 mb-4 font-medium">So sánh Thu/Chi (MoM)</h3>
              <div className="flex-1 w-full relative -ml-2">
                 <CashFlowChart />
              </div>
            </div>
            <div className="bg-[#121212] border border-white/[0.04] p-6 rounded-3xl flex flex-col justify-between aspect-square md:aspect-auto md:h-80">
              <h3 className="text-xs uppercase tracking-widest text-neutral-500 mb-4 font-medium">Phân bổ chi tiêu tháng</h3>
              <div className="flex-1 w-full relative">
                 <CategoryDonutChart />
              </div>
            </div>
          </section>

          {/* Category Budgets tracking */}
          <section className="bg-[#121212] border border-white/[0.04] rounded-3xl p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-medium">Ngân sách con đang theo dõi</h3>
            </div>
            <div className="space-y-6">
              {initialData.budgetTracking.length === 0 ? (
                <p className="text-xs text-neutral-600 text-center py-4">Chưa có ngân sách nào được thiết lập</p>
              ) : (
                initialData.budgetTracking.map((budget, i) => {
                  const percent = Math.min((budget.spent / budget.amountLimit) * 100, 100);
                  const isNearingLimit = percent > 80;
                  const colorClass = ['bg-blue-500', 'bg-orange-500', 'bg-purple-500', 'bg-emerald-500'][i % 4];
                  return (
                   <div key={budget.id}>
                     <div className="flex justify-between text-sm mb-2">
                       <span className="font-medium text-neutral-300 flex items-center gap-2">
                         <span>{budget.category?.icon || "📝"}</span> {budget.category?.name}
                       </span>
                       <span className="font-mono text-neutral-500">
                         <span className={isNearingLimit ? "text-rose-400 font-bold" : "text-white"}>
                           {(budget.spent / 1000000).toFixed(1)}M
                         </span> / {(budget.amountLimit / 1000000).toFixed(1)}M
                       </span>
                     </div>
                     <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden relative">
                       <div 
                         className={`absolute top-0 left-0 h-full rounded-full ${isNearingLimit ? 'bg-rose-500' : colorClass}`} 
                         style={{ width: `${percent}%` }}
                       ></div>
                     </div>
                   </div>
                )})
              )}
            </div>
          </section>
        </div>

        {/* Recent Transactions Sidebar */}
        <section className="lg:pl-4 mt-8 lg:mt-0">
          <div className="sticky top-32">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-medium">Giao dịch gần đây</h3>
              <button onClick={() => router.push('/transactions')} className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer">Xem tất cả</button>
            </div>
            
            <div className="space-y-8">
              {Object.keys(groupedTransactions).length === 0 ? (
                <p className="text-xs text-neutral-600 text-center py-8">Chưa có giao dịch nào</p>
              ) : (
                Object.entries(groupedTransactions).map(([date, txs]) => (
                  <div key={date} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-600 font-bold">{date}</span>
                      <div className="h-[1px] flex-1 bg-white/[0.03]"></div>
                    </div>
                    <div className="space-y-2">
                      {txs.map((tx) => (
                        <div key={tx.id} className="p-4 rounded-3xl bg-[#121212] border border-white/[0.02] flex items-center justify-between hover:bg-[#161616] cursor-pointer transition-all hover:translate-x-1 group">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg shrink-0 shadow-inner transition-colors ${
                              tx.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-400' : 
                              tx.type === 'EXPENSE' ? 'bg-rose-500/10 text-rose-400' : 
                              'bg-blue-500/10 text-blue-400'
                            }`}>
                              {tx.category?.icon || (tx.type === 'INCOME' ? "💰" : "💸")}
                            </div>
                            <div>
                              <p className="text-sm text-neutral-200 font-medium mb-0.5">{tx.note || tx.category?.name || "Giao dịch"}</p>
                              <p className="text-[10px] text-neutral-500 font-mono tracking-tight uppercase">
                                {tx.category?.name || (tx.type === 'INCOME' ? 'Thu nhập' : 'Chi tiêu')}
                              </p>
                            </div>
                          </div>
                          <span className={`text-sm font-mono font-bold ${tx.type === 'INCOME' || tx.type === 'BORROW' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {tx.type === 'INCOME' || tx.type === 'BORROW' ? '+' : '-'}{tx.amount.toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
    </>
  );
}
