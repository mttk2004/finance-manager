export function DashboardHeader({ totalBalance, totalSpentMonth, totalBudgetMonth }: DashboardHeaderProps) {
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
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">Chào Kiệt 👋</h1>
            <span className="text-[10px] md:text-xs font-medium text-muted-foreground font-mono hidden sm:inline-block border border-white/10 px-2 py-0.5 rounded text-muted-foreground">
              {new Date().toLocaleDateString('vi-VN')}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Hôm nay bạn đã chi tiêu thế nào?</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-card border border-white/10 flex items-center justify-center cursor-pointer hover:bg-neutral-800 transition-colors shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-card p-5 md:p-6 rounded-3xl border border-border flex flex-col justify-center relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
              <svg width="100" height="100" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="60" cy="60" r="59.5" stroke="currentColor" strokeDasharray="4 4" className="text-emerald-500"/>
                <circle cx="60" cy="60" r="40" stroke="currentColor" strokeOpacity="0.5" className="text-emerald-500"/>
              </svg>
           </div>
           <div className="flex justify-between items-end">
             <div>
               <span className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 block font-medium">Tổng số dư</span>
               <div className="text-3xl md:text-4xl font-mono text-emerald-400 font-bold tracking-tighter">
                  {totalBalance.toLocaleString('vi-VN')}<span className="text-emerald-700">đ</span>
               </div>
             </div>
             <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full text-xs font-medium mb-1 relative z-10">
               <span>↑</span>
               <span>-</span>
             </div>
           </div>
        </div>

        <div className="bg-card border border-border rounded-3xl p-5 md:p-6 flex flex-col justify-center">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Ngân sách T{new Date().getMonth() + 1}</h3>
            <span className="text-[10px] text-muted-foreground">
              {totalBudgetMonth > 0 
                ? `Còn lại ${formatMoney(totalBudgetMonth - totalSpentMonth)}` 
                : 'Chưa thiết lập'}
            </span>
          </div>
          <div className="text-xl font-mono text-foreground mb-3">
            {formatBudget(totalSpentMonth)}<span className="text-muted-foreground text-sm"> / {formatBudget(totalBudgetMonth)}</span>
          </div>
          
          <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden relative">
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
