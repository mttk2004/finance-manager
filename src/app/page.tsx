"use client";

import { useState } from "react";
import { CashFlowChart } from "@/components/cash-flow-chart";
import { CategoryDonutChart } from "@/components/category-donut-chart";
import { DailyReminderModal } from "@/components/daily-reminder-modal";
import { IncomeDistributionModal } from "@/components/income-distribution-modal";
import { AmountInput } from "@/components/amount-input";
import { FundSelectorModal } from "@/components/fund-selector-modal";

export default function DashboardPage() {
  const [isDistributionModalOpen, setDistributionModalOpen] = useState(false);
  const [isFundSelectorOpen, setFundSelectorOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [activeFund, setActiveFund] = useState("Quỹ chính");

  return (
    <>
      <DailyReminderModal />
      <IncomeDistributionModal isOpen={isDistributionModalOpen} onClose={() => setDistributionModalOpen(false)} />
      <FundSelectorModal isOpen={isFundSelectorOpen} onClose={() => setFundSelectorOpen(false)} currentFund={activeFund} onSelectFund={setActiveFund} />
      <div className="flex flex-col w-full h-full pb-20 md:pb-8 space-y-8 md:space-y-12 max-w-5xl mx-auto mt-4 md:mt-8">
      {/* 1. Header & Summary */}
      <section className="px-4 md:px-0">
        <div className="flex justify-between items-end mb-8 md:mb-12">
          <div>
            <p className="text-xs md:text-sm font-medium text-neutral-500 mb-2 font-mono uppercase tracking-wider">Thứ Ba, 24/10/2023</p>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-1">Chào Sơn 👋</h1>
            <p className="text-neutral-400">Hôm nay bạn đã chi tiêu thế nào?</p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#121212] border border-white/10 flex items-center justify-center cursor-pointer hover:bg-neutral-800 transition-colors">
            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="md:col-span-2 bg-[#121212] p-6 md:p-8 rounded-3xl border border-white/[0.04] flex flex-col justify-between relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
                {/* Decorative element */}
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="60" cy="60" r="59.5" stroke="currentColor" strokeDasharray="4 4" className="text-emerald-500"/>
                  <circle cx="60" cy="60" r="40" stroke="currentColor" strokeOpacity="0.5" className="text-emerald-500"/>
                </svg>
             </div>
             <div>
               <span className="text-xs uppercase tracking-widest text-neutral-500 mb-2 block font-medium">Tổng số dư</span>
               <div className="text-4xl md:text-5xl lg:text-6xl font-mono text-emerald-400 font-bold tracking-tighter">
                  45.500<span className="text-emerald-700">.000đ</span>
               </div>
             </div>
             <div className="mt-8 flex gap-4 text-sm font-medium">
               <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full">
                 <span>↑</span>
                 <span>+2.5M tháng này</span>
               </div>
             </div>
          </div>

          <div className="bg-[#121212] border border-white/[0.04] rounded-3xl p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-end mb-4">
                <h3 className="text-sm font-medium text-neutral-400">Ngân sách tháng 10</h3>
              </div>
              <div className="text-2xl font-mono text-white mb-1 flex items-baseline">
                4.000<span className="text-neutral-500 text-sm ml-1">.000đ</span>
              </div>
              <div className="text-xs text-neutral-500 font-mono">/ 10.000.000đ</div>
            </div>
            
            <div className="mt-6 md:mt-8">
              <div className="h-2 w-full bg-neutral-900 rounded-full overflow-hidden relative">
                <div className="absolute top-0 left-0 h-full bg-white rounded-full w-[40%]"></div>
              </div>
              <div className="flex justify-between mt-3 text-xs font-mono text-neutral-500">
                <span>Đã chi 40%</span>
                <span className="text-neutral-300">Còn lại 6M</span>
              </div>
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
                  {activeFund}
                </button>
              </div>
              {/* Quick Templates integrated here */}
              <div className="hidden md:flex gap-2">
                {["☕ Cà phê 30k", "⛽ Đổ xăng 50k", "🍜 Ăn sáng 40k", "🚌 Di chuyển 25k"].map((t) => (
                   <button key={t} className="px-4 py-2 border border-white/5 rounded-full bg-[#1A1A1A] hover:bg-[#222222] active:scale-95 transition-all text-xs font-medium text-neutral-400 hover:text-neutral-200 cursor-pointer">
                      {t}
                   </button>
                ))}
              </div>
            </div>

            {/* Mobile quick templates */}
            <div className="flex md:hidden overflow-x-auto pb-4 gap-2 snap-x scrollbar-hide -mx-2 px-2 mb-2">
               {["☕ Cà phê 30k", "⛽ Đổ xăng 50k", "🍜 Ăn sáng 40k", "🚌 Di chuyển 25k"].map((t) => (
                 <button key={t} className="snap-start shrink-0 px-4 py-3 border border-white/5 rounded-full bg-[#1A1A1A] hover:bg-[#222222] active:scale-95 transition-all text-xs font-medium text-neutral-400 cursor-pointer">
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
                  placeholder="Ví dụ: Ăn trưa #vui_ve" 
                  className="w-full bg-[#161616] border border-white/[0.03] rounded-2xl px-4 md:px-6 py-4 md:py-5 text-sm text-neutral-300 focus:outline-none focus:border-white/20 placeholder:text-neutral-600 transition-colors" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4">
                <button className="py-4 md:py-5 rounded-2xl bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 font-medium text-sm md:text-base border border-rose-500/10 hover:border-rose-500/20 active:scale-[0.98] transition-all cursor-pointer">
                  CHI TIỀN
                </button>
                <button 
                  onClick={() => setDistributionModalOpen(true)}
                  className="py-4 md:py-5 rounded-2xl bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-500 font-medium text-sm md:text-base border border-emerald-500/10 hover:border-emerald-500/20 active:scale-[0.98] transition-all cursor-pointer"
                >
                  THU VÀO
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <button className="py-2 rounded-xl text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.02] font-medium text-xs border border-transparent hover:border-white/[0.05] transition-all cursor-pointer">
                  Đi vay (Borrow)
                </button>
                <button className="py-2 rounded-xl text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.02] font-medium text-xs border border-transparent hover:border-white/[0.05] transition-all cursor-pointer">
                  Cho vay (Lend)
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
              {[
                { name: "🍔 Ăn uống", current: 3500000, max: 5000000, color: "bg-blue-500" },
                { name: "🛍️ Mua sắm", current: 1800000, max: 2000000, color: "bg-orange-500" },
                { name: "🎮 Giải trí", current: 500000, max: 1000000, color: "bg-purple-500" },
              ].map((budget, i) => {
                const percent = Math.min((budget.current / budget.max) * 100, 100);
                const isNearingLimit = percent > 80;
                return (
                 <div key={i}>
                   <div className="flex justify-between text-sm mb-2">
                     <span className="font-medium text-neutral-300">{budget.name}</span>
                     <span className="font-mono text-neutral-500">
                       <span className={isNearingLimit ? "text-rose-400" : "text-white"}>{(budget.current / 1000000).toFixed(1)}M</span> / {(budget.max / 1000000).toFixed(1)}M
                     </span>
                   </div>
                   <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden relative">
                     <div className={`absolute top-0 left-0 h-full rounded-full ${isNearingLimit ? 'bg-rose-500' : budget.color}`} style={{ width: `${percent}%` }}></div>
                   </div>
                 </div>
              )})}
            </div>
          </section>
        </div>

        {/* Recent Transactions Sidebar */}
        <section className="lg:pl-4 mt-8 lg:mt-0">
          <div className="sticky top-32">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-medium">Giao dịch gần đây</h3>
              <button className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer">Xem tất cả</button>
            </div>
            
            <div className="space-y-2">
              {[
                { icon: "☕", name: "Cà phê Highland", desc: "Hôm nay • #lam_viec", amount: "-35.000", type: "expense" },
                { icon: "⛽", name: "Đổ xăng", desc: "Hôm qua • #di_chuyen", amount: "-50.000", type: "expense" },
                { icon: "💰", name: "Lương tháng 10", desc: "22/10 • #thu_nhap", amount: "+15.000.000", type: "income" },
                { icon: "🍜", name: "Bún chả Obamall", desc: "21/10 • #an_uong", amount: "-55.000", type: "expense" },
                { icon: "🛒", name: "Đi siêu thị Lotte", desc: "20/10 • #sinh_hoat", amount: "-530.000", type: "expense" },
              ].map((tx, i) => (
                <div key={i} className="p-4 rounded-3xl bg-[#121212] border border-white/[0.02] flex items-center justify-between hover:bg-[#161616] cursor-pointer transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#1A1A1A] group-hover:bg-[#222222] transition-colors flex items-center justify-center text-lg shrink-0 shadow-inner">
                      {tx.icon}
                    </div>
                    <div>
                      <p className="text-sm text-neutral-200 font-medium mb-1">{tx.name}</p>
                      <p className="text-[11px] text-neutral-500 font-mono tracking-tight">{tx.desc}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-mono font-medium ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {tx.amount}đ
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
    </>
  );
}
