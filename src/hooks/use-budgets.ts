"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBudgets, upsertBudget } from "@/server/actions/budgets";
import { Budget } from "@/types";
import { toast } from "sonner";
import { handleError } from "@/lib/error-handler";
import { QUERY_KEYS } from "@/lib/constants";
import { budgetSchema } from "@/lib/validations";

export function useBudgets(period: string, initialData?: Budget[]) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEYS.BUDGETS(period),
    queryFn: () => getBudgets(period),
    initialData,
  });

  const upsertMutation = useMutation({
    mutationFn: (data: any) => upsertBudget(budgetSchema.parse(data)),
    onMutate: async (data) => {
      const queryKey = QUERY_KEYS.BUDGETS(period);
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Budget[]>(queryKey);
      if (previous) {
        queryClient.setQueryData(queryKey, [
          ...previous.filter(b => b.categoryId !== data.categoryId), 
          data as any
        ]);
      }
      return { previous, queryKey };
    },
    onSuccess: () => {
      toast.success("Đã cập nhật ngân sách");
      queryClient.invalidateQueries({ queryKey: ['budgets'] }); // This matches the key prefix
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD });
    },
    onError: (err, newV, context) => {
      if (context?.previous) queryClient.setQueryData(context.queryKey, context.previous);
      handleError(err, "Không thể cập nhật ngân sách");
    },
  });

  return {
    budgets: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    upsertBudget: upsertMutation.mutate,
    isSubmitting: upsertMutation.isPending
  };
}
