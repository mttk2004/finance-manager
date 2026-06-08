"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFunds, createFund, updateFund, deleteFund, setDefaultFund } from "@/server/actions/funds";
import { Fund } from "@/types";
import { toast } from "sonner";
import { handleError } from "@/lib/error-handler";
import { QUERY_KEYS } from "@/lib/constants";
import { fundSchema } from "@/lib/validations";

import { z } from "zod";

export function useFunds(initialData?: Fund[]) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEYS.FUNDS,
    queryFn: () => getFunds(),
    initialData,
  });

  const createMutation = useMutation({
    mutationFn: (data: z.infer<typeof fundSchema>) => createFund(fundSchema.parse(data)),
    onMutate: async (newFund) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.FUNDS });
      const previousFunds = queryClient.getQueryData<Fund[]>(QUERY_KEYS.FUNDS);
      if (previousFunds) {
        queryClient.setQueryData(QUERY_KEYS.FUNDS, [
          ...previousFunds, 
          { id: 'temp-' + Date.now(), ...newFund, isDefault: previousFunds.length === 0 } as Fund
        ]);
      }
      return { previousFunds };
    },
    onSuccess: () => {
      toast.success("Đã thêm quỹ mới");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FUNDS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD });
    },
    onError: (err, newV, context) => {
      if (context?.previousFunds) queryClient.setQueryData(QUERY_KEYS.FUNDS, context.previousFunds);
      handleError(err, "Không thể thêm quỹ mới");
    }
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { id: string, data: Partial<z.infer<typeof fundSchema>> }) => updateFund(vars.id, fundSchema.partial().parse(vars.data)),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.FUNDS });
      const previousFunds = queryClient.getQueryData<Fund[]>(QUERY_KEYS.FUNDS);
      if (previousFunds) {
        queryClient.setQueryData(QUERY_KEYS.FUNDS, previousFunds.map(f => 
          f.id === id ? { ...f, ...data } as Fund : f
        ));
      }
      return { previousFunds };
    },
    onSuccess: () => {
      toast.success("Đã cập nhật quỹ");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FUNDS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD });
    },
    onError: (err, newV, context) => {
      if (context?.previousFunds) queryClient.setQueryData(QUERY_KEYS.FUNDS, context.previousFunds);
      handleError(err, "Không thể cập nhật quỹ");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFund,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.FUNDS });
      const previousFunds = queryClient.getQueryData<Fund[]>(QUERY_KEYS.FUNDS);
      if (previousFunds) {
        queryClient.setQueryData(QUERY_KEYS.FUNDS, previousFunds.filter(f => f.id !== id));
      }
      return { previousFunds };
    },
    onSuccess: () => {
      toast.success("Đã xóa quỹ");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FUNDS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD });
    },
    onError: (err, newV, context) => {
      if (context?.previousFunds) queryClient.setQueryData(QUERY_KEYS.FUNDS, context.previousFunds);
      handleError(err, "Không thể xóa quỹ");
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: setDefaultFund,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.FUNDS });
      const previousFunds = queryClient.getQueryData<Fund[]>(QUERY_KEYS.FUNDS);
      if (previousFunds) {
        queryClient.setQueryData(QUERY_KEYS.FUNDS, previousFunds.map(f => ({
          ...f,
          isDefault: f.id === id
        })));
      }
      return { previousFunds };
    },
    onSuccess: () => {
      toast.success("Đã thay đổi quỹ mặc định");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FUNDS });
    },
    onError: (err, newV, context) => {
      if (context?.previousFunds) queryClient.setQueryData(QUERY_KEYS.FUNDS, context.previousFunds);
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
