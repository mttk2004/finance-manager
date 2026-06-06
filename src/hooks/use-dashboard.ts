"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDashboardData, resetData } from "@/server/actions/dashboard";
import { toast } from "sonner";
import { handleError } from "@/lib/error-handler";

export function useDashboard(initialData?: any) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => getDashboardData(),
    initialData,
    staleTime: 30000,
  });

  const resetMutation = useMutation({
    mutationFn: resetData,
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success("Đã xóa toàn bộ dữ liệu và thiết lập lại mặc định!");
    },
    onError: (err) => handleError(err, "Không thể xóa dữ liệu")
  });

  return {
    dashboardData: query.data || initialData,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    resetData: resetMutation.mutate,
    isResetting: resetMutation.isPending
  };
}
