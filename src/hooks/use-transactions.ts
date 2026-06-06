"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllTransactions, createTransaction, deleteTransaction } from "@/server/actions/transactions";
import { toast } from "sonner";
import { handleError } from "@/lib/error-handler";
import { TransactionType } from "@/types";

export function useTransactions(filters?: any, initialData?: any) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => getAllTransactions(),
    initialData,
  });

  const createMutation = useMutation({
    mutationFn: createTransaction,
    onMutate: async (newTxData) => {
      await queryClient.cancelQueries({ queryKey: ['dashboard'] });
      const previousDashboard = queryClient.getQueryData<any>(['dashboard']);
      
      if (previousDashboard) {
        // Optimistic update for dashboard could be complex, let's keep it simple or detailed as before
        // For now, let's just invalidate on settle
      }
      return { previousDashboard };
    },
    onSuccess: (newTx, variables) => {
      toast.success(
        variables.type === 'INCOME' ? "Đã ghi nhận thu nhập" :
        variables.type === 'EXPENSE' ? "Đã ghi nhận chi tiêu" : "Đã ghi nhận giao dịch",
        {
          description: `${variables.amount.toLocaleString('vi-VN')}đ`,
          duration: 5000,
          action: {
            label: "Hoàn tác",
            onClick: () => deleteMutation.mutate(newTx.id)
          }
        }
      );
    },
    onError: (err) => handleError(err, "Lỗi khi thực hiện giao dịch"),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['balanceHistory'] });
      queryClient.invalidateQueries({ queryKey: ['cashFlowTrend'] });
      queryClient.invalidateQueries({ queryKey: ['cashFlowBar'] });
      queryClient.invalidateQueries({ queryKey: ['categorySpending'] });
      queryClient.invalidateQueries({ queryKey: ['topSpending'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      toast.success("Đã xóa giao dịch");
    },
    onError: (err) => handleError(err, "Không thể xóa giao dịch"),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    }
  });

  return {
    transactions: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    createTransaction: createMutation.mutateAsync,
    deleteTransaction: deleteMutation.mutate,
    isSubmitting: createMutation.isPending || deleteMutation.isPending
  };
}
