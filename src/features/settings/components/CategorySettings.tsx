"use client";

import { useState } from "react";
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
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [catName, setCatName] = useState("");
  const [catType, setCatType] = useState<'INCOME' | 'EXPENSE'>("EXPENSE");
  const [catIcon, setCatIcon] = useState("");
  const [catHashtags, setCatHashtags] = useState("");

  const [transferTargetId, setTransferTargetId] = useState<string>("");

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

  const handleDeleteCategory = () => {
    if (!categoryToDelete || isSubmitting) return;
    deleteCategory({
      id: categoryToDelete.id,
      options: transferTargetId ? { transferToCategoryId: transferTargetId } : undefined
    }, {
      onSuccess: () => {
        setCategoryToDelete(null);
        setTransferTargetId("");
      }
    });
  };

  const otherCategories = categories.filter(c => categoryToDelete && c.id !== categoryToDelete.id && c.type === categoryToDelete.type);

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
          className="text-xs bg-primary-accent text-white font-semibold px-4 py-2 rounded-xl hover:bg-primary-accent/90 active:scale-[0.97] transition-all cursor-pointer disabled:opacity-50 shadow-md shadow-primary-accent/10"
        >
          {isAddingCategory || editingCategoryId ? "Hủy" : "+ Thêm danh mục mới"}
        </button>
      </div>
      
      {(isAddingCategory || editingCategoryId) && (
        <div 
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm px-0 md:px-4 py-0 md:py-6 animate-in fade-in duration-200"
          onClick={resetCategoryForm}
        >
          <div 
            className="bg-background border-t md:border border-border rounded-t-[32px] md:rounded-[32px] p-6 md:p-10 max-w-lg w-full shadow-2xl relative z-10 bottom-0 md:bottom-auto fixed md:relative transition-all duration-300 md:animate-in md:zoom-in-95 animate-in slide-in-from-bottom duration-300 overflow-y-auto max-h-[92vh] md:max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header dragging handle for mobile */}
            <div className="md:hidden flex justify-center py-2 bg-card border-b border-border/10 -mt-6 -mx-6 mb-4">
              <div className="w-12 h-1.5 rounded-full bg-neutral-800" />
            </div>
            
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-foreground tracking-tight">
                {editingCategoryId ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
              </h2>
              <button onClick={resetCategoryForm} className="p-2 hover:bg-white/5 rounded-full transition-colors text-muted-foreground cursor-pointer">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-1">
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-2 block">Loại</label>
                  <CustomSelect 
                    value={catType} 
                    onChange={(e) => setCatType(e.target.value as 'INCOME' | 'EXPENSE')}
                    options={[
                      { value: "EXPENSE", label: "Chi" },
                      { value: "INCOME", label: "Thu" }
                    ]}
                    className="w-full bg-white/[0.03] border-border rounded-xl focus:border-primary-accent/30"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-2 block">Icon</label>
                  <input 
                    type="text" 
                    value={catIcon}
                    onChange={(e) => setCatIcon(e.target.value)}
                    placeholder="🍔" 
                    maxLength={2}
                    className="w-full bg-white/[0.03] border border-border rounded-xl px-4 py-2.5 text-center text-2xl focus:outline-none focus:border-primary-accent/30 focus:bg-white/[0.05]" 
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-2 block">Tên danh mục</label>
                  <input 
                    type="text" 
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    placeholder="VD: Ăn uống, Di chuyển..." 
                    className="w-full bg-white/[0.03] border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary-accent/30 focus:bg-white/[0.05]" 
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-2 block">Hashtags (Tự động nhận diện)</label>
                <input 
                  type="text" 
                  value={catHashtags}
                  onChange={(e) => setCatHashtags(e.target.value)}
                  placeholder="VD: #an_uong, #cafe" 
                  className="w-full bg-white/[0.03] border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary-accent/30 focus:bg-white/[0.05]" 
                />
                <p className="text-[10px] text-muted-foreground mt-2 px-1">Phân tách bằng dấu phẩy. Dùng hashtag này trong ghi chú để tự động chọn danh mục.</p>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  onClick={resetCategoryForm}
                  className="flex-1 py-4 rounded-2xl text-muted-foreground font-medium text-sm hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button 
                  onClick={editingCategoryId ? handleUpdateCategory : handleAddCategory}
                  disabled={isSubmitting || !catName || !catIcon}
                  className="flex-[2] py-4 rounded-2xl bg-primary-accent text-white font-bold text-sm hover:bg-primary-accent/90 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 shadow-md shadow-primary-accent/10"
                >
                  {isSubmitting ? "Đang lưu..." : (editingCategoryId ? "Cập nhật danh mục" : "Lưu danh mục")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Chưa có danh mục nào</p>
        ) : (
          categories.map(cat => (
            <div key={cat.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${editingCategoryId === cat.id ? 'bg-primary-accent/5 border-primary-accent/20' : 'bg-white/[0.01] border-border hover:bg-white/[0.03]'}`}>
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
                   onClick={() => setCategoryToDelete(cat)}
                   className="p-2 transition-colors cursor-pointer rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10"
                 >
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                 </button>
              </div>
            </div>
          ))
        )}
      </div>

      {categoryToDelete && (
        <div 
          className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm px-0 md:px-4 py-0 md:py-6 animate-in fade-in duration-200"
          onClick={() => {
            setCategoryToDelete(null);
            setTransferTargetId("");
          }}
        >
          <div 
            className="bg-background border-t md:border border-border rounded-t-[32px] md:rounded-[32px] p-8 md:p-10 max-w-lg w-full shadow-2xl relative z-10 bottom-0 md:bottom-auto fixed md:relative transition-all duration-300 md:animate-in md:zoom-in-95 animate-in slide-in-from-bottom duration-300 overflow-y-auto max-h-[92vh] md:max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header dragging handle for mobile */}
            <div className="md:hidden flex justify-center py-2 bg-card border-b border-border/10 -mt-8 -mx-8 mb-6">
              <div className="w-12 h-1.5 rounded-full bg-neutral-800" />
            </div>

            <div className="mb-8">
              <div className="w-16 h-16 rounded-3xl bg-rose-500/10 flex items-center justify-center text-rose-500 mb-6 border border-rose-500/20">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground tracking-tight mb-3">Xác nhận xóa danh mục?</h2>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Bạn sắp xóa danh mục <strong className="text-foreground">{categoryToDelete.name}</strong>. Hãy chọn cách xử lý với các giao dịch thuộc danh mục này.
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-2 block">Tùy chọn an toàn (Tùy chọn)</label>
              <div className="bg-white/[0.02] border border-border rounded-2xl p-4">
                <p className="text-xs text-muted-foreground mb-3">Chuyển tất cả giao dịch sang danh mục {categoryToDelete.type === 'INCOME' ? 'thu' : 'chi'} khác:</p>
                <select 
                  value={transferTargetId}
                  onChange={(e) => setTransferTargetId(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary-accent/30 transition-all cursor-pointer"
                >
                  <option value="">-- Không chuyển (Xóa sạch) --</option>
                  {otherCategories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <p className="text-[10px] text-rose-400/60 px-2 italic">
                * Nếu không chọn, tất cả lịch sử giao dịch gắn liền với danh mục này sẽ bị xóa vĩnh viễn.
              </p>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setCategoryToDelete(null);
                  setTransferTargetId("");
                }}
                disabled={isSubmitting}
                className="flex-1 py-4 rounded-2xl text-muted-foreground font-medium text-sm hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleDeleteCategory}
                disabled={isSubmitting}
                className="flex-[2] py-4 rounded-2xl bg-rose-500 text-white font-bold text-sm hover:bg-rose-400 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 shadow-[0_0_20px_rgba(244,63,94,0.2)]"
              >
                {isSubmitting ? "Đang xử lý..." : (transferTargetId ? "Chuyển & Xóa" : "Xóa vĩnh viễn")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
