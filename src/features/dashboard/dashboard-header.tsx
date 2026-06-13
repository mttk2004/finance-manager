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
      <div className="flex items-center justify-between bg-card border border-border rounded-3xl p-4 md:p-5 mb-6 md:mb-8 overflow-x-auto scrollbar-hide gap-8">
        <div className="flex items-center gap-4 shrink-0">
          <div className="w-12 h-12 rounded-full bg-secondary border border-white/10 flex items-center justify-center shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]"></div>
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground whitespace-nowrap">Chào Kiệt 👋</h1>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground whitespace-nowrap mt-0.5">{new Date().toLocaleDateString('vi-VN')}</p>
          </div>
        </div>

        <div className="flex items-center gap-8 md:gap-12 shrink-0 pr-2">
          <div className="flex flex-col cursor-pointer group" onClick={onOpenDistributionModal}>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 font-medium group-hover:text-emerald-400 transition-colors">Tổng số dư</span>
            <div className="text-2xl font-mono text-emerald-400 font-bold tracking-tighter">
               {totalBalance.toLocaleString('vi-VN')}<span className="text-emerald-700">đ</span>
            </div>
          </div>

          <div className="w-px h-10 bg-white/10"></div>

          <div className="flex flex-col min-w-[200px]">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Ngân sách T{new Date().getMonth() + 1}</span>
              <span className="text-[9px] text-muted-foreground">
                {totalBudgetMonth > 0 ? `(Còn ${formatMoney(totalBudgetMonth - totalSpentMonth)})` : '(Chưa lập)'}
              </span>
            </div>
            <div className="text-xl font-mono text-foreground">
              {formatBudget(totalSpentMonth)}<span className="text-muted-foreground text-sm"> / {formatBudget(totalBudgetMonth)}</span>
            </div>
            <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden mt-1.5">
              <div 
                className={`h-full rounded-full ${totalSpentMonth > totalBudgetMonth ? 'bg-rose-500' : 'bg-white'}`} 
                style={{ width: `${Math.min((totalSpentMonth / (totalBudgetMonth || 1)) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
