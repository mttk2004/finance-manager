"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CustomSelect } from "@/components/ui/custom-select";
import { AmountInput } from "@/components/amount-input";
import { Category, Budget } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { upsertBudget } from "@/server/actions/budgets";

interface BudgetSettingsProps {
  categories: Category[];
  budgets: Budget[];
  currentMonthPeriod: string;
  isLoading: boolean;
}

export function BudgetSettings({ categories, budgets, currentMonthPeriod, isLoading: parentIsLoading }: BudgetSettingsProps) {
  const queryClient = useQueryClient();

  const [isAddingBudget, setIsAddingBudget] = useState(false);
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [budgetCategoryId, setBudgetCategoryId] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");

  const resetBudgetForm = () => {
    setBudgetCategoryId("");
    setBudgetAmount("");
    setIsAddingBudget(false);
    setEditingBudgetId(null);
  };

  const budgetMutation = useMutation({
    mutationFn: upsertBudget,
    onMutate: async (data) => {
      resetBudgetForm();
      toast.success("Đã cập nhật ngân sách");
      const queryKey = ['budgets', currentMonthPeriod];
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Budget[]>(queryKey);
      if (previous) {
        queryClient.setQueryData(queryKey, [...previous.filter(b => b.categoryId !== data.categoryId), data as any]);
      }
      return { previous, queryKey };
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['budgets'] }),
    onError: (err, newV, context) => {
      if (context?.previous) queryClient.setQueryData(context.queryKey, context.previous);
      toast.error("Lỗi khi cập nhật ngân sách");
    },
  });

  const isSubmitting = budgetMutation.isPending;
  const isLoading = parentIsLoading || isSubmitting;

  const handleUpsertBudget = () => {
    if (!budgetCategoryId || !budgetAmount || budgetMutation.isPending) return;
    budgetMutation.mutate({
      categoryId: budgetCategoryId,
      amountLimit: parseInt(budgetAmount) || 0,
      period: currentMonthPeriod,
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
          className="text-xs bg-foreground text-background font-medium px-3 py-1.5 rounded-lg hover:bg-neutral-200 transition-colors cursor-pointer"
        >
          {isAddingBudget || editingBudgetId ? "Hủy" : "+ Thiết lập ngân sách"}
        </button>
      </div>
      
      {(isAddingBudget || editingBudgetId) && (
        <div className="flex flex-col sm:flex-row gap-3 mb-4 items-center bg-secondary p-3 rounded-xl border border-border">
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
              className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm" 
            />
          </div>
          <button 
            onClick={handleUpsertBudget}
            disabled={isSubmitting || !budgetCategoryId || !budgetAmount}
            className="px-4 py-1.5 rounded-lg bg-orange-500 text-white font-semibold text-sm hover:bg-orange-400 cursor-pointer w-full sm:w-auto disabled:opacity-50"
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
            <div key={budget.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${editingBudgetId === budget.id ? 'bg-orange-500/5 border-orange-500/20' : 'bg-secondary border-white/[0.02]'}`}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg bg-orange-500/10">
                  {budget.category?.icon || "📝"}
                </div>
                <div>
                  <span className="font-medium text-foreground block">{budget.category?.name || "Danh mục không xác định"}</span>
                  <span className="text-[10px] uppercase font-mono tracking-tight text-muted-foreground">
                    Hạn mức
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                 <span className="font-mono text-muted-foreground font-medium">{(budget.amountLimit || 0).toLocaleString('vi-VN')}đ</span>
                 <button 
                   onClick={() => startEditBudget(budget)}
                   className={`p-2 transition-colors cursor-pointer rounded-lg ${editingBudgetId === budget.id ? 'text-orange-400 bg-orange-500/10' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`}
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
