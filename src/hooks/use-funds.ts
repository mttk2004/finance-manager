"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFunds, createFund, updateFund, deleteFund, setDefaultFund } from "@/server/actions/funds";
import { Fund } from "@/types";
import { toast } from "sonner";
import { handleError } from "@/lib/error-handler";

export function useFunds(initialData?: Fund[]) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['funds'],
    queryFn: () => getFunds(),
    initialData,
  });

  const createMutation = useMutation({
    mutationFn: createFund,
    onMutate: async (newFund) => {
      await queryClient.cancelQueries({ queryKey: ['funds'] });
      const previousFunds = queryClient.getQueryData<Fund[]>(['funds']);
      if (previousFunds) {
        queryClient.setQueryData(['funds'], [
          ...previousFunds, 
          { id: 'temp-' + Date.now(), ...newFund, isDefault: previousFunds.length === 0, createdAt: new Date(), updatedAt: new Date(), userId: '' } as unknown as Fund
        ]);
      }
      return { previousFunds };
    },
    onSuccess: () => {
      toast.success("Đã thêm quỹ mới");
      queryClient.invalidateQueries({ queryKey: ['funds'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (err, newV, context) => {
      if (context?.previousFunds) queryClient.setQueryData(['funds'], context.previousFunds);
      handleError(err, "Không thể thêm quỹ mới");
    }
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { id: string, data: any }) => updateFund(vars.id, vars.data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['funds'] });
      const previousFunds = queryClient.getQueryData<Fund[]>(['funds']);
      if (previousFunds) {
        queryClient.setQueryData(['funds'], previousFunds.map(f => 
          f.id === id ? { ...f, ...data } : f
        ));
      }
      return { previousFunds };
    },
    onSuccess: () => {
      toast.success("Đã cập nhật quỹ");
      queryClient.invalidateQueries({ queryKey: ['funds'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (err, newV, context) => {
      if (context?.previousFunds) queryClient.setQueryData(['funds'], context.previousFunds);
      handleError(err, "Không thể cập nhật quỹ");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFund,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['funds'] });
      const previousFunds = queryClient.getQueryData<Fund[]>(['funds']);
      if (previousFunds) {
        queryClient.setQueryData(['funds'], previousFunds.filter(f => f.id !== id));
      }
      return { previousFunds };
    },
    onSuccess: () => {
      toast.success("Đã xóa quỹ");
      queryClient.invalidateQueries({ queryKey: ['funds'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (err, newV, context) => {
      if (context?.previousFunds) queryClient.setQueryData(['funds'], context.previousFunds);
      handleError(err, "Không thể xóa quỹ");
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: setDefaultFund,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['funds'] });
      const previousFunds = queryClient.getQueryData<Fund[]>(['funds']);
      if (previousFunds) {
        queryClient.setQueryData(['funds'], previousFunds.map(f => ({
          ...f,
          isDefault: f.id === id
        })));
      }
      return { previousFunds };
    },
    onSuccess: () => {
      toast.success("Đã thay đổi quỹ mặc định");
      queryClient.invalidateQueries({ queryKey: ['funds'] });
    },
    onError: (err, newV, context) => {
      if (context?.previousFunds) queryClient.setQueryData(['funds'], context.previousFunds);
      handleError(err, "Không thể thay đổi quỹ mặc định");
    },
  });

  return {
    funds: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    createFund: createMutation.mutate,
    updateFund: updateMutation.mutate,
    deleteFund: deleteMutation.mutate,
    setDefaultFund: setDefaultMutation.mutate,
    isSubmitting: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending || setDefaultMutation.isPending
  };
}
