interface DashboardHeaderProps {
  totalBalance: number;
  totalSpentMonth: number;
  totalBudgetMonth: number;
  onOpenDistributionModal: () => void;
}

export function DashboardHeader({ totalBalance, totalSpentMonth, totalBudgetMonth, onOpenDistributionModal }: DashboardHeaderProps) {
  const formatMoney = (amount: number) => amount.toLocaleString('vi-VN') + "đ";
  
  const formatBudget = (amount: number) => {
    if (amount >= 1000000) {
      const triệu = amount / 1000000;
      if (triệu % 1 === 0) return triệu + "tr";
      return triệu.toFixed(1) + "tr";
    }
    return amount.toLocaleString('vi-VN') + "đ";
  };

  return (
    <section className="px-4 lg:px-0">
      {/* Mobile Header: Minimalist and Compact */}
      <div className="md:hidden space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            </div>
            <h1 className="text-lg font-bold tracking-tight text-foreground">Chào Kiệt 👋</h1>
          </div>
          <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-medium opacity-50">
            {new Date().toLocaleDateString('vi-VN')}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div 
            className="bg-card border border-border rounded-2xl p-4 active:scale-[0.98] transition-all"
            onClick={onOpenDistributionModal}
          >
            <span className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground block mb-1 font-bold">Số dư</span>
            <div className="text-lg font-mono text-emerald-400 font-bold leading-none">
              {totalBalance.toLocaleString('vi-VN')}<span className="text-[10px] ml-0.5 opacity-60">đ</span>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex justify-between items-start mb-1">
              <span className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground font-bold">Chi tiêu</span>
              {totalBudgetMonth > 0 && (
                 <span className={`text-[8px] font-bold ${totalSpentMonth > totalBudgetMonth ? 'text-rose-500' : 'text-emerald-500/60'}`}>
                   {Math.round((totalSpentMonth / totalBudgetMonth) * 100)}%
                 </span>
              )}
            </div>
            <div className="text-lg font-mono text-foreground font-bold leading-none">
              {formatBudget(totalSpentMonth)}
              <span className="text-[10px] text-muted-foreground font-normal ml-1">/ {formatBudget(totalBudgetMonth)}</span>
            </div>
            <div className="h-1 w-full bg-neutral-900 rounded-full overflow-hidden mt-2.5">
              <div 
                className={`h-full rounded-full ${totalSpentMonth > totalBudgetMonth ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                style={{ width: `${Math.min((totalSpentMonth / (totalBudgetMonth || 1)) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Header: Wide and Professional */}
      <div className="hidden md:flex items-center justify-between bg-card border border-border rounded-[2.5rem] p-5 mb-8 gap-8 shadow-xl shadow-black/20">
        <div className="flex items-center gap-5 shrink-0 pl-2">
          <div className="w-14 h-14 rounded-full bg-secondary border border-white/5 flex items-center justify-center shrink-0 shadow-inner">
            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)]"></div>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Chào Kiệt 👋</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold mt-1 opacity-40">{new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
        </div>

        <div className="flex items-center gap-12 shrink-0 pr-4">
          <div className="flex flex-col cursor-pointer group px-4 py-2 rounded-2xl hover:bg-white/[0.02] transition-colors" onClick={onOpenDistributionModal}>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5 font-bold group-hover:text-emerald-400 transition-colors">Tổng số dư</span>
            <div className="text-3xl font-mono text-emerald-400 font-bold tracking-tighter">
               {totalBalance.toLocaleString('vi-VN')}<span className="text-emerald-700 ml-1 text-xl">đ</span>
            </div>
          </div>

          <div className="w-px h-12 bg-white/10 opacity-50"></div>

          <div className="flex flex-col min-w-[240px]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Ngân sách tháng {new Date().getMonth() + 1}</span>
              <span className={`text-[9px] font-bold uppercase tracking-tighter px-1.5 py-0.5 rounded ${totalSpentMonth > totalBudgetMonth ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500/60'}`}>
                {totalBudgetMonth > 0 ? (totalSpentMonth > totalBudgetMonth ? 'Vượt hạn mức' : `Còn ${formatMoney(totalBudgetMonth - totalSpentMonth)}`) : 'Chưa lập'}
              </span>
            </div>
            <div className="text-2xl font-mono text-foreground font-medium flex items-baseline gap-2">
              <span className="font-bold">{formatBudget(totalSpentMonth)}</span>
              <span className="text-muted-foreground text-sm opacity-40">/ {formatBudget(totalBudgetMonth)}</span>
            </div>
            <div className="h-2 w-full bg-neutral-900 rounded-full overflow-hidden mt-3 shadow-inner">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${totalSpentMonth > totalBudgetMonth ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]' : 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.2)]'}`} 
                style={{ width: `${Math.min((totalSpentMonth / (totalBudgetMonth || 1)) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
