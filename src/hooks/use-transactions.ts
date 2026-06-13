"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllTransactions, createTransaction, deleteTransaction } from "@/server/actions/transactions";
import { toast } from "sonner";
import { handleError } from "@/lib/error-handler";
import { TransactionType, TransactionsResponse, DashboardData } from "@/types";
import { QUERY_KEYS } from "@/lib/constants";
import { TransactionFilter } from "@/lib/validations";

export function useTransactions(filters?: TransactionFilter, initialData?: TransactionsResponse) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEYS.TRANSACTIONS(filters),
    queryFn: () => getAllTransactions(filters) as Promise<TransactionsResponse>,
    initialData,
  });

  const createMutation = useMutation({
    mutationFn: createTransaction,
    onMutate: async (newTxData) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.DASHBOARD });
      const previousDashboard = queryClient.getQueryData<DashboardData>(QUERY_KEYS.DASHBOARD);
      
      return { previousDashboard };
    },
    onSuccess: (newTx, variables) => {
      const typeLabel = 
        variables.type === 'INCOME' ? "thu nhập" :
        variables.type === 'EXPENSE' ? "chi tiêu" :
        variables.type === 'TRANSFER' ? "chuyển quỹ" : "giao dịch";

      toast.success(`Đã ghi nhận ${typeLabel}`, {
        description: `${variables.amount.toLocaleString('vi-VN')}đ${variables.note ? ` - ${variables.note}` : ''}`,
        duration: 8000,
        action: {
          label: "Hoàn tác",
          onClick: () => {
            deleteMutation.mutate(newTx.id, {
              onSuccess: () => toast.success("Đã hoàn tác giao dịch")
            });
          }
        }
      });
    },
    onError: (err) => handleError(err, "Lỗi khi thực hiện giao dịch"),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD });
      queryClient.invalidateQueries({ queryKey: ['transactions'] }); // Invalidate all transaction lists
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
