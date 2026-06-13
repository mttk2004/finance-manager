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
    <section className="px-4 md:px-0">
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground">Chào Kiệt 👋</h1>
            <span className="text-[10px] md:text-xs font-medium text-muted-foreground font-mono hidden sm:inline-block border border-white/10 px-2 py-0.5 rounded">
              {new Date().toLocaleDateString('vi-VN')}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Hôm nay bạn đã chi tiêu thế nào?</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-card border border-white/10 flex items-center justify-center cursor-pointer hover:bg-neutral-800 transition-colors shrink-0">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        <div 
          onClick={onOpenDistributionModal}
          className="md:col-span-2 bg-card p-4 md:p-5 rounded-2xl border border-border flex flex-col justify-center relative overflow-hidden group cursor-pointer hover:border-emerald-500/30 transition-all min-h-[100px]"
        >
           <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
              <svg width="80" height="80" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="60" cy="60" r="59.5" stroke="currentColor" strokeDasharray="4 4" className="text-emerald-500"/>
                <circle cx="60" cy="60" r="40" stroke="currentColor" strokeOpacity="0.5" className="text-emerald-500"/>
              </svg>
           </div>
           <div className="flex justify-between items-end">
             <div>
               <span className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 block font-medium">Tổng số dư</span>
               <div className="text-2xl md:text-3xl font-mono text-emerald-400 font-bold tracking-tighter">
                  {totalBalance.toLocaleString('vi-VN')}<span className="text-emerald-700">đ</span>
               </div>
             </div>
             <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full text-[10px] font-medium mb-1 relative z-10">
               <span>↑</span>
               <span>-</span>
             </div>
           </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 md:p-5 flex flex-col justify-center min-h-[100px]">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Ngân sách T{new Date().getMonth() + 1}</h3>
            <span className="text-[9px] text-muted-foreground">
              {totalBudgetMonth > 0 
                ? `Còn ${formatMoney(totalBudgetMonth - totalSpentMonth)}` 
                : 'Chưa lập'}
            </span>
          </div>
          <div className="text-lg font-mono text-foreground mb-2">
            {formatBudget(totalSpentMonth)}<span className="text-muted-foreground text-xs"> / {formatBudget(totalBudgetMonth)}</span>
          </div>
          
          <div className="h-1 w-full bg-neutral-900 rounded-full overflow-hidden relative">
            <div 
              className={`absolute top-0 left-0 h-full rounded-full ${totalSpentMonth > totalBudgetMonth ? 'bg-rose-500' : 'bg-white'}`} 
              style={{ width: `${Math.min((totalSpentMonth / (totalBudgetMonth || 1)) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </section>
  );
}
