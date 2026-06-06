"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/server/actions/categories";
import { Category } from "@/types";
import { toast } from "sonner";
import { handleError } from "@/lib/error-handler";

export function useCategories(initialData?: Category[]) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories(),
    initialData,
  });

  const createMutation = useMutation({
    mutationFn: createCategory,
    onMutate: async (newCat) => {
      await queryClient.cancelQueries({ queryKey: ['categories'] });
      const previous = queryClient.getQueryData<Category[]>(['categories']);
      if (previous) {
        queryClient.setQueryData(['categories'], [
          ...previous, 
          { id: 'temp-' + Date.now(), ...newCat, createdAt: new Date(), updatedAt: new Date(), userId: '' } as unknown as Category
        ]);
      }
      return { previous };
    },
    onSuccess: () => {
      toast.success("Đã thêm danh mục mới");
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (err, newV, context) => {
      if (context?.previous) queryClient.setQueryData(['categories'], context.previous);
      handleError(err, "Không thể thêm danh mục mới");
    }
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { id: string, data: any }) => updateCategory(vars.id, vars.data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['categories'] });
      const previous = queryClient.getQueryData<Category[]>(['categories']);
      if (previous) {
        queryClient.setQueryData(['categories'], previous.map(c => 
          c.id === id ? { ...c, ...data } : c
        ));
      }
      return { previous };
    },
    onSuccess: () => {
      toast.success("Đã cập nhật danh mục");
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (err, newV, context) => {
      if (context?.previous) queryClient.setQueryData(['categories'], context.previous);
      handleError(err, "Không thể cập nhật danh mục");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['categories'] });
      const previous = queryClient.getQueryData<Category[]>(['categories']);
      if (previous) {
        queryClient.setQueryData(['categories'], previous.filter(c => c.id !== id));
      }
      return { previous };
    },
    onSuccess: () => {
      toast.success("Đã xóa danh mục");
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (err, newV, context) => {
      if (context?.previous) queryClient.setQueryData(['categories'], context.previous);
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
