"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/server/actions/categories";
import { Category } from "@/types";
import { toast } from "sonner";
import { handleError } from "@/lib/error-handler";
import { QUERY_KEYS } from "@/lib/constants";
import { categorySchema } from "@/lib/validations";

import { z } from "zod";

export function useCategories(initialData?: Category[]) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEYS.CATEGORIES,
    queryFn: () => getCategories(),
    initialData,
  });

  const createMutation = useMutation({
    mutationFn: (data: z.infer<typeof categorySchema>) => createCategory(categorySchema.parse(data)),
    onMutate: async (newCat) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.CATEGORIES });
      const previous = queryClient.getQueryData<Category[]>(QUERY_KEYS.CATEGORIES);
      if (previous) {
        queryClient.setQueryData(QUERY_KEYS.CATEGORIES, [
          ...previous, 
          { id: 'temp-' + Date.now(), ...newCat } as Category
        ]);
      }
      return { previous };
    },
    onSuccess: () => {
      toast.success("Đã thêm danh mục mới");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD });
    },
    onError: (err, newV, context) => {
      if (context?.previous) queryClient.setQueryData(QUERY_KEYS.CATEGORIES, context.previous);
      handleError(err, "Không thể thêm danh mục mới");
    }
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { id: string, data: Partial<z.infer<typeof categorySchema>> }) => updateCategory(vars.id, categorySchema.partial().parse(vars.data)),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.CATEGORIES });
      const previous = queryClient.getQueryData<Category[]>(QUERY_KEYS.CATEGORIES);
      if (previous) {
        queryClient.setQueryData(QUERY_KEYS.CATEGORIES, previous.map(c => 
          c.id === id ? { ...c, ...data } as Category : c
        ));
      }
      return { previous };
    },
    onSuccess: () => {
      toast.success("Đã cập nhật danh mục");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD });
    },
    onError: (err, newV, context) => {
      if (context?.previous) queryClient.setQueryData(QUERY_KEYS.CATEGORIES, context.previous);
      handleError(err, "Không thể cập nhật danh mục");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.CATEGORIES });
      const previous = queryClient.getQueryData<Category[]>(QUERY_KEYS.CATEGORIES);
      if (previous) {
        queryClient.setQueryData(QUERY_KEYS.CATEGORIES, previous.filter(c => c.id !== id));
      }
      return { previous };
    },
    onSuccess: () => {
      toast.success("Đã xóa danh mục");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD });
    },
    onError: (err, newV, context) => {
      if (context?.previous) queryClient.setQueryData(QUERY_KEYS.CATEGORIES, context.previous);
      handleError(err, "Không thể xóa danh mục");
    },
  });

  return {
    categories: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    createCategory: createMutation.mutate,
    updateCategory: updateMutation.mutate,
    deleteCategory: deleteMutation.mutate,
    isSubmitting: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending
  };
}
