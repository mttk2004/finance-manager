"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTemplates, createTemplate, updateTemplate, deleteTemplate } from "@/server/actions/templates";
import { Template } from "@/types";
import { toast } from "sonner";
import { handleError } from "@/lib/error-handler";
import { QUERY_KEYS } from "@/lib/constants";

export function useTemplates(initialData?: Template[]) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEYS.TEMPLATES,
    queryFn: () => getTemplates(),
    initialData,
  });

  const createMutation = useMutation({
    mutationFn: createTemplate,
    onMutate: async (newTpl) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.TEMPLATES });
      const previous = queryClient.getQueryData<Template[]>(QUERY_KEYS.TEMPLATES);
      if (previous) {
        queryClient.setQueryData(QUERY_KEYS.TEMPLATES, [
          ...previous, 
          { id: 'temp-' + Date.now(), ...newTpl, createdAt: new Date() } as unknown as Template
        ]);
      }
      return { previous };
    },
    onSuccess: () => {
      toast.success("Đã thêm lối tắt mới");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TEMPLATES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD });
    },
    onError: (err, newV, context) => {
      if (context?.previous) queryClient.setQueryData(QUERY_KEYS.TEMPLATES, context.previous);
      handleError(err, "Không thể thêm lối tắt mới");
    }
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { id: string, data: any }) => updateTemplate(vars.id, vars.data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.TEMPLATES });
      const previous = queryClient.getQueryData<Template[]>(QUERY_KEYS.TEMPLATES);
      if (previous) {
        queryClient.setQueryData(QUERY_KEYS.TEMPLATES, previous.map(t => 
          t.id === id ? { ...t, ...data } : t
        ));
      }
      return { previous };
    },
    onSuccess: () => {
      toast.success("Đã cập nhật lối tắt");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TEMPLATES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD });
    },
    onError: (err, newV, context) => {
      if (context?.previous) queryClient.setQueryData(QUERY_KEYS.TEMPLATES, context.previous);
      handleError(err, "Không thể cập nhật lối tắt");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTemplate,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.TEMPLATES });
      const previous = queryClient.getQueryData<Template[]>(QUERY_KEYS.TEMPLATES);
      if (previous) {
        queryClient.setQueryData(QUERY_KEYS.TEMPLATES, previous.filter(t => t.id !== id));
      }
      return { previous };
    },
    onSuccess: () => {
      toast.success("Đã xóa lối tắt");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TEMPLATES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD });
    },
    onError: (err, newV, context) => {
      if (context?.previous) queryClient.setQueryData(QUERY_KEYS.TEMPLATES, context.previous);
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
