import { useRouter } from "next/navigation";

interface FinancialInsightsProps {
  totalSpentMonth: number;
  totalSpentLastMonth: number;
  totalBudgetMonth: number;
  totalBalance: number;
  fundCount: number;
}

export function FinancialInsights({ 
  totalSpentMonth, 
  totalSpentLastMonth, 
  totalBudgetMonth, 
  totalBalance, 
  fundCount 
}: FinancialInsightsProps) {
  const router = useRouter();

  const diff = totalSpentMonth - totalSpentLastMonth;
  const percentageDiff = totalSpentLastMonth > 0 
    ? (Math.abs(diff / totalSpentLastMonth) * 100).toFixed(1)
    : "0";
  
  const budgetRemaining = totalBudgetMonth - totalSpentMonth;
  const budgetPercentage = totalBudgetMonth > 0
    ? (totalSpentMonth / totalBudgetMonth * 100).toFixed(1)
    : "0";

  return (
    <section className="space-y-4">
      <div className="flex justify-between items-center px-2">
        <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Nhận định tài chính</h3>
        <button 
          onClick={() => router.push('/charts')}
          className="text-[10px] text-blue-500 font-medium hover:underline flex items-center gap-1 cursor-pointer"
        >
          Xem chi tiết biểu đồ
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-6 relative overflow-hidden group hover:border-white/10 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${diff <= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {diff <= 0 
                  ? <><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></>
                  : <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></>
                }
              </svg>
            </div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">So với tháng trước</h4>
          </div>
          <p className="text-sm text-neutral-300 leading-relaxed">
            Tháng này bạn đã tiêu <strong className="text-foreground">{totalSpentMonth.toLocaleString('vi-VN')}đ</strong>. 
            {diff <= 0 
              ? ` Tiết kiệm được ${Math.abs(diff).toLocaleString('vi-VN')}đ (${percentageDiff}%) so với tháng trước.`
              : ` Tăng ${diff.toLocaleString('vi-VN')}đ (${percentageDiff}%) so với tháng trước.`
            }
          </p>
          <div className={`absolute bottom-0 left-0 h-1 transition-all duration-500 ${diff <= 0 ? 'bg-emerald-500 w-full opacity-20' : 'bg-rose-500 w-full opacity-20'}`}></div>
        </div>

        <div className="glass-card p-6 relative overflow-hidden group hover:border-white/10 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${parseFloat(budgetPercentage) <= 80 ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="6" x2="12" y2="12"></line><line x1="16" y1="14" x2="12" y2="12"></line></svg>
            </div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ngân sách còn lại</h4>
          </div>
          {totalBudgetMonth > 0 ? (
            <>
              <p className="text-sm text-neutral-300 leading-relaxed mb-4">
                Bạn còn <strong className="text-foreground">{budgetRemaining > 0 ? budgetRemaining.toLocaleString('vi-VN') : '0'}đ</strong> trong tổng hạn mức. Đã sử dụng {budgetPercentage}% ngân sách.
              </p>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${parseFloat(budgetPercentage) > 90 ? 'bg-rose-500' : parseFloat(budgetPercentage) > 70 ? 'bg-orange-500' : 'bg-blue-500'}`}
                  style={{ width: `${Math.min(parseFloat(budgetPercentage), 100)}%` }}
                ></div>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground italic">Bạn chưa thiết lập hạn mức chi tiêu tổng cho tháng này.</p>
          )}
        </div>

        <div className="glass-card p-6 relative overflow-hidden group hover:border-white/10 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Số dư & Tài sản</h4>
          </div>
          <p className="text-sm text-neutral-300 leading-relaxed">
            Tổng tài sản hiện tại là <strong className="text-foreground">{totalBalance.toLocaleString('vi-VN')}đ</strong> phân bổ trên {fundCount} quỹ. 
            {totalBalance > 10000000 ? " Tình hình tài chính của bạn đang rất ổn định." : " Hãy tiếp tục duy trì thói quen ghi chép nhé."}
          </p>
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
          </div>
        </div>
      </div>
    </section>
  );
}
