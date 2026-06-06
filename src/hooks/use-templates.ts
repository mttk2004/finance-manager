"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTemplates, createTemplate, updateTemplate, deleteTemplate } from "@/server/actions/templates";
import { Template } from "@/types";
import { toast } from "sonner";
import { handleError } from "@/lib/error-handler";

export function useTemplates(initialData?: Template[]) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['templates'],
    queryFn: () => getTemplates(),
    initialData,
  });

  const createMutation = useMutation({
    mutationFn: createTemplate,
    onMutate: async (newTpl) => {
      await queryClient.cancelQueries({ queryKey: ['templates'] });
      const previous = queryClient.getQueryData<Template[]>(['templates']);
      if (previous) {
        queryClient.setQueryData(['templates'], [
          ...previous, 
          { id: 'temp-' + Date.now(), ...newTpl, createdAt: new Date() } as unknown as Template
        ]);
      }
      return { previous };
    },
    onSuccess: () => {
      toast.success("Đã thêm lối tắt mới");
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (err, newV, context) => {
      if (context?.previous) queryClient.setQueryData(['templates'], context.previous);
      handleError(err, "Không thể thêm lối tắt mới");
    }
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { id: string, data: any }) => updateTemplate(vars.id, vars.data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['templates'] });
      const previous = queryClient.getQueryData<Template[]>(['templates']);
      if (previous) {
        queryClient.setQueryData(['templates'], previous.map(t => 
          t.id === id ? { ...t, ...data } : t
        ));
      }
      return { previous };
    },
    onSuccess: () => {
      toast.success("Đã cập nhật lối tắt");
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (err, newV, context) => {
      if (context?.previous) queryClient.setQueryData(['templates'], context.previous);
      handleError(err, "Không thể cập nhật lối tắt");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTemplate,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['templates'] });
      const previous = queryClient.getQueryData<Template[]>(['templates']);
      if (previous) {
        queryClient.setQueryData(['templates'], previous.filter(t => t.id !== id));
      }
      return { previous };
    },
    onSuccess: () => {
      toast.success("Đã xóa lối tắt");
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (err, newV, context) => {
      if (context?.previous) queryClient.setQueryData(['templates'], context.previous);
      handleError(err, "Không thể xóa lối tắt");
    },
  });

  return {
    templates: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    createTemplate: createMutation.mutate,
    updateTemplate: updateMutation.mutate,
    deleteTemplate: deleteMutation.mutate,
    isSubmitting: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending
  };
}
