import { EmptyState } from "@/components/empty-state";
import { PieChart } from "lucide-react";
import { Budget } from "@/types";

interface CategoryBudgetsProps {
  budgetTracking: (Budget & { spent: number })[];
}

export function CategoryBudgets({ budgetTracking }: CategoryBudgetsProps) {
  const formatBudget = (amount: number) => {
    if (amount >= 1000000) {
      const triệu = amount / 1000000;
      if (triệu % 1 === 0) return triệu + "tr";
      return triệu.toFixed(1) + "tr";
    }
    return amount.toLocaleString('vi-VN') + "đ";
  };

  return (
    <section className="bg-card border border-border rounded-3xl p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Ngân sách con đang theo dõi</h3>
      </div>
      <div className="space-y-6">
        {budgetTracking.length === 0 ? (
          <EmptyState 
            icon={PieChart}
            title="Chưa có ngân sách"
            description="Thiết lập ngân sách để theo dõi chi tiêu của bạn tốt hơn."
            className="py-4"
          />
        ) : (
          budgetTracking.map((budget, i) => {
            const percent = Math.min((budget.spent / budget.amountLimit) * 100, 100);
            const isNearingLimit = percent > 80;
            const colorClass = ['bg-blue-500', 'bg-orange-500', 'bg-purple-500', 'bg-emerald-500'][i % 4];
            return (
             <div key={budget.id}>
               <div className="flex justify-between text-sm mb-2">
                 <span className="font-medium text-neutral-300 flex items-center gap-2">
                   <span>{budget.category?.icon || "📝"}</span> {budget.category?.name}
                 </span>
                 <span className="font-mono text-muted-foreground">
                   <span className={isNearingLimit ? "text-rose-400 font-bold" : "text-foreground"}>
                     {formatBudget(budget.spent)}
                   </span> / {formatBudget(budget.amountLimit)}
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
  );
}
