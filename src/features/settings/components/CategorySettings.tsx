"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CustomSelect } from "@/components/ui/custom-select";
import { Category } from "@/types";
import { useCategories } from "@/hooks/use-categories";

interface CategorySettingsProps {
  categories: Category[];
  isLoading: boolean;
}

export function CategorySettings({ categories: initialCategories, isLoading: parentIsLoading }: CategorySettingsProps) {
  const { 
    categories, 
    createCategory, 
    updateCategory, 
    deleteCategory, 
    isSubmitting 
  } = useCategories(initialCategories);

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [catName, setCatName] = useState("");
  const [catType, setCatType] = useState<'INCOME' | 'EXPENSE'>("EXPENSE");
  const [catIcon, setCatIcon] = useState("");
  const [catHashtags, setCatHashtags] = useState("");

  const isLoading = parentIsLoading || isSubmitting;

  const resetCategoryForm = () => {
    setCatName("");
    setCatType("EXPENSE");
    setCatIcon("");
    setCatHashtags("");
    setIsAddingCategory(false);
    setEditingCategoryId(null);
  };

  const handleAddCategory = () => {
    if (!catName || !catIcon || isSubmitting) return;
    const hashtagsArray = catHashtags.split(',').map(s => s.trim()).filter(s => s.length > 0);
    createCategory({ name: catName, type: catType, icon: catIcon, hashtags: hashtagsArray }, {
      onSuccess: resetCategoryForm
    });
  };

  const handleUpdateCategory = () => {
    if (!catName || !editingCategoryId || isSubmitting) return;
    const hashtagsArray = catHashtags.split(',').map(s => s.trim()).filter(s => s.length > 0);
    updateCategory({ id: editingCategoryId, data: { name: catName, type: catType, icon: catIcon, hashtags: hashtagsArray } }, {
      onSuccess: resetCategoryForm
    });
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa danh mục này?") && !isSubmitting) {
      deleteCategory(id);
    }
  };

  const startEditCategory = (cat: Category) => {
    setEditingCategoryId(cat.id);
    setCatName(cat.name);
    setCatType(cat.type || "EXPENSE");
    setCatIcon(cat.icon || "");
    setCatHashtags(cat.hashtags?.join(", ") || "");
    setIsAddingCategory(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-foreground">Quản lý Danh mục (Categories)</h3>
        <button 
          onClick={() => {
            if (isAddingCategory || editingCategoryId) {
              resetCategoryForm();
            } else {
              setIsAddingCategory(true);
            }
          }} 
          disabled={isLoading}
          className="text-xs bg-foreground text-background font-medium px-3 py-1.5 rounded-lg hover:bg-neutral-200 transition-colors cursor-pointer"
        >
          {isAddingCategory || editingCategoryId ? "Hủy" : "+ Thêm danh mục mới"}
        </button>
      </div>
      
      {(isAddingCategory || editingCategoryId) && (
        <div className="space-y-4 mb-6 bg-secondary p-4 rounded-xl border border-border">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <CustomSelect 
              value={catType} 
              onChange={(e) => setCatType(e.target.value as 'INCOME' | 'EXPENSE')}
              options={[
                { value: "EXPENSE", label: "Chi tiêu" },
                { value: "INCOME", label: "Thu nhập" }
              ]}
              className="w-full sm:w-auto"
            />
            <input 
              type="text" 
              value={catIcon}
              onChange={(e) => setCatIcon(e.target.value)}
              placeholder="Icon (VD: 🍜)" 
              className="w-full sm:w-20 bg-card border border-border rounded-lg px-3 py-1.5 text-sm text-center text-foreground focus:outline-none placeholder:text-muted-foreground/60" 
            />
            <input 
              type="text" 
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              placeholder="Tên danh mục (VD: Ăn uống)" 
              className="flex-1 bg-transparent text-sm text-foreground focus:outline-none placeholder:text-muted-foreground/60 px-2 w-full" 
            />
          </div>
          <div>
            <input 
              type="text" 
              value={catHashtags}
              onChange={(e) => setCatHashtags(e.target.value)}
              placeholder="Hashtags (VD: #an_uong, #cafe)" 
              className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none placeholder:text-muted-foreground/60" 
            />
            <p className="text-[10px] text-muted-foreground mt-1 px-1">Phân tách bằng dấu phẩy, bắt đầu bằng dấu #</p>
          </div>
          <button 
            onClick={editingCategoryId ? handleUpdateCategory : handleAddCategory}
            disabled={isSubmitting}
            className="w-full py-2 rounded-lg bg-blue-500 text-white font-semibold text-sm hover:bg-blue-400 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? "Đang lưu..." : "Lưu danh mục"}
          </button>
        </div>
      )}
      
      <div className="space-y-3">
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Chưa có danh mục nào</p>
        ) : (
          categories.map(cat => (
            <div key={cat.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${editingCategoryId === cat.id ? 'bg-blue-500/5 border-blue-500/20' : 'bg-secondary border-white/[0.02]'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${cat.type === 'INCOME' ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                  {cat.icon || "📝"}
                </div>
                <div>
                  <span className="font-medium text-foreground block">{cat.name}</span>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    <span className={`text-[9px] uppercase font-mono tracking-tight mr-1 ${cat.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {cat.type === 'INCOME' ? 'Thu nhập' : 'Chi tiêu'}
                    </span>
                    {(cat.hashtags || []).map(tag => (
                      <span key={tag} className="text-[9px] text-muted-foreground bg-white/5 px-1.5 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <button 
                   onClick={() => startEditCategory(cat)}
                   className={`p-2 transition-colors cursor-pointer rounded-lg ${editingCategoryId === cat.id ? 'text-blue-400 bg-blue-500/10' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`}
                 >
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                 </button>
                 <button 
                   onClick={() => handleDeleteCategory(cat.id)}
                   className="p-2 transition-colors cursor-pointer rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10"
                 >
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                 </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
