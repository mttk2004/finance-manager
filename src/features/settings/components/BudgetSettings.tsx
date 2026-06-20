"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CustomSelect } from "@/components/ui/custom-select";
import { AmountInput } from "@/components/amount-input";
import { Category, Budget } from "@/types";
import { useBudgets } from "@/hooks/use-budgets";

interface BudgetSettingsProps {
  categories: Category[];
  budgets: Budget[];
  currentMonthPeriod: string;
  isLoading: boolean;
}

export function BudgetSettings({ categories, budgets: initialBudgets, currentMonthPeriod, isLoading: parentIsLoading }: BudgetSettingsProps) {
  const { 
    budgets, 
    upsertBudget, 
    isSubmitting 
  } = useBudgets(currentMonthPeriod, initialBudgets);

  const [isAddingBudget, setIsAddingBudget] = useState(false);
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [budgetCategoryId, setBudgetCategoryId] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");

  const isLoading = parentIsLoading || isSubmitting;

  const resetBudgetForm = () => {
    setBudgetCategoryId("");
    setBudgetAmount("");
    setIsAddingBudget(false);
    setEditingBudgetId(null);
  };

  const handleUpsertBudget = () => {
    if (!budgetCategoryId || !budgetAmount || isSubmitting) return;
    upsertBudget({
      categoryId: budgetCategoryId,
      amountLimit: parseInt(budgetAmount) || 0,
      period: currentMonthPeriod,
    }, {
      onSuccess: resetBudgetForm
    });
  };

  const startEditBudget = (budget: Budget) => {
    setEditingBudgetId(budget.id);
    setBudgetCategoryId(budget.categoryId);
    setBudgetAmount(budget.amountLimit.toString());
    setIsAddingBudget(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-foreground">Ngân sách Tháng {new Date().getMonth() + 1}</h3>
        <button 
          onClick={() => {
            if (isAddingBudget || editingBudgetId) {
              resetBudgetForm();
            } else {
              setIsAddingBudget(true);
            }
          }} 
          disabled={isLoading}
          className="text-xs bg-primary-accent text-white font-semibold px-4 py-2 rounded-xl hover:bg-primary-accent/90 active:scale-[0.97] transition-all cursor-pointer disabled:opacity-50 shadow-md shadow-primary-accent/10"
        >
          {isAddingBudget || editingBudgetId ? "Hủy" : "+ Thiết lập ngân sách"}
        </button>
      </div>
      
      {(isAddingBudget || editingBudgetId) && (
        <div className="flex flex-col sm:flex-row gap-3 mb-4 items-center bg-white/[0.02] p-3 rounded-2xl border border-border">
          <CustomSelect 
            value={budgetCategoryId} 
            onChange={(e) => setBudgetCategoryId(e.target.value)}
            options={[
              { value: "", label: "-- Chọn danh mục chi tiêu --" },
              ...categories.filter(c => c.type === 'EXPENSE').map(c => ({
                value: c.id,
                label: `${c.icon} ${c.name}`
              }))
            ]}
            className="w-full sm:flex-1"
          />
          <div className="w-full sm:w-40">
            <AmountInput 
              value={budgetAmount}
              onChange={(val) => setBudgetAmount(val)}
              placeholder="Hạn mức" 
              className="bg-card border border-border rounded-xl px-3 py-2 text-sm focus-within:border-primary-accent/30" 
            />
          </div>
          <button 
            onClick={handleUpsertBudget}
            disabled={isSubmitting || !budgetCategoryId || !budgetAmount}
            className="px-5 py-2.5 rounded-xl bg-primary-accent text-white font-bold text-sm hover:bg-primary-accent/90 active:scale-[0.98] transition-all cursor-pointer w-full sm:w-auto disabled:opacity-50 shadow-md shadow-primary-accent/10"
          >
            {isSubmitting ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      )}
      
      <div className="space-y-3">
        {budgets.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Chưa có ngân sách nào được thiết lập cho tháng này.</p>
        ) : (
          budgets.map(budget => (
            <div key={budget.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${editingBudgetId === budget.id ? 'bg-primary-accent/5 border-primary-accent/20' : 'bg-white/[0.01] border-border hover:bg-white/[0.03]'}`}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg bg-primary-accent/10 text-primary-accent">
                  {budget.category?.icon || "📝"}
                </div>
                <div>
                  <span className="font-semibold text-foreground block text-sm">{budget.category?.name || "Danh mục không xác định"}</span>
                  <span className="text-[9px] uppercase font-mono tracking-wider text-muted-foreground/60">
                    Hạn mức tháng này
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                 <span className="font-mono text-foreground font-bold text-sm">{(budget.amountLimit || 0).toLocaleString('vi-VN')}đ</span>
                 <button 
                   onClick={() => startEditBudget(budget)}
                   className={`p-2 transition-all cursor-pointer rounded-lg active:scale-90 ${editingBudgetId === budget.id ? 'text-primary-accent bg-primary-accent/15' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`}
                 >
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                 </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
