"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CustomSelect } from "@/components/ui/custom-select";
import { AmountInput } from "@/components/amount-input";
import { Category, Template } from "@/types";
import { useTemplates } from "@/hooks/use-templates";

interface ShortcutSettingsProps {
  categories: Category[];
  templates: Template[];
  isLoading: boolean;
}

export function ShortcutSettings({ categories, templates: initialTemplates, isLoading: parentIsLoading }: ShortcutSettingsProps) {
  const { 
    templates, 
    createTemplate, 
    updateTemplate, 
    deleteTemplate, 
    isSubmitting 
  } = useTemplates(initialTemplates);

  const [isAddingTemplate, setIsAddingTemplate] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [templateTitle, setTemplateTitle] = useState("");
  const [templateType, setTemplateType] = useState<'INCOME' | 'EXPENSE' | 'TRANSFER' | 'LEND' | 'BORROW'>('EXPENSE');
  const [templateCategoryId, setTemplateCategoryId] = useState("");
  const [templateAmount, setTemplateAmount] = useState("");
  const [templateNote, setTemplateNote] = useState("");
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);

  const isLoading = parentIsLoading || isSubmitting;

  const resetTemplateForm = () => {
    setTemplateTitle("");
    setTemplateType("EXPENSE");
    setTemplateCategoryId("");
    setTemplateAmount("");
    setTemplateNote("");
    setIsAddingTemplate(false);
    setEditingTemplateId(null);
  };

  const handleAddTemplate = () => {
    if (!templateTitle || isSubmitting) return;
    createTemplate({
      title: templateTitle,
      type: templateType,
      categoryId: templateCategoryId || undefined,
      amount: parseInt(templateAmount) || undefined,
      notePreset: templateNote || undefined,
    }, {
      onSuccess: resetTemplateForm
    });
  };

  const handleUpdateTemplate = () => {
    if (!editingTemplateId || !templateTitle || isSubmitting) return;
    updateTemplate({
      id: editingTemplateId,
      data: {
        title: templateTitle,
        type: templateType,
        categoryId: templateCategoryId || undefined,
        amount: parseInt(templateAmount) || undefined,
        notePreset: templateNote || undefined,
      }
    }, {
      onSuccess: resetTemplateForm
    });
  };

  const handleDeleteTemplate = () => {
    if (!templateToDelete || isSubmitting) return;
    deleteTemplate(templateToDelete.id, {
      onSuccess: () => setTemplateToDelete(null)
    });
  };

  const startEditTemplate = (template: Template) => {
    setEditingTemplateId(template.id);
    setTemplateTitle(template.title);
    setTemplateType(template.type);
    setTemplateCategoryId(template.categoryId || "");
    setTemplateAmount(template.amount?.toString() || "");
    setTemplateNote(template.notePreset || "");
    setIsAddingTemplate(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-foreground">Quản lý Lối tắt nhanh</h3>
        <button 
          onClick={() => {
            if (isAddingTemplate || editingTemplateId) {
              resetTemplateForm();
            } else {
              setIsAddingTemplate(true);
            }
          }} 
          disabled={isLoading}
          className="text-xs bg-primary-accent text-white font-semibold px-4 py-2 rounded-xl hover:bg-primary-accent/90 active:scale-[0.97] transition-all cursor-pointer disabled:opacity-50 shadow-md shadow-primary-accent/10"
        >
          {isAddingTemplate || editingTemplateId ? "Hủy" : "+ Thêm lối tắt mới"}
        </button>
      </div>
      
      {(isAddingTemplate || editingTemplateId) && (
        <div className="space-y-4 bg-white/[0.02] p-4 rounded-2xl border border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground font-medium ml-1">Tên lối tắt</label>
              <input 
                type="text" 
                value={templateTitle}
                onChange={(e) => setTemplateTitle(e.target.value)}
                placeholder="VD: Mua cafe sáng" 
                className="w-full bg-white/[0.03] border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary-accent/30 placeholder:text-muted-foreground/30" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground font-medium ml-1">Loại giao dịch</label>
              <CustomSelect 
                value={templateType} 
                onChange={(e) => setTemplateType(e.target.value as 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'LEND' | 'BORROW')}
                options={[
                  { value: "EXPENSE", label: "Chi tiêu" },
                  { value: "INCOME", label: "Thu nhập" },
                  { value: "TRANSFER", label: "Chuyển tiền" },
                  { value: "LEND", label: "Cho vay" },
                  { value: "BORROW", label: "Vay nợ" }
                ]}
                className="w-full bg-white/[0.03] border-border rounded-xl focus:border-primary-accent/30"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground font-medium ml-1">Danh mục (tùy chọn)</label>
              <CustomSelect 
                value={templateCategoryId} 
                onChange={(e) => setTemplateCategoryId(e.target.value)}
                options={[
                  { value: "", label: "-- Tự động theo hashtag --" },
                  ...categories.filter(c => c.type === (templateType === 'INCOME' ? 'INCOME' : 'EXPENSE')).map(c => ({
                    value: c.id,
                    label: `${c.icon} ${c.name}`
                  }))
                ]}
                className="w-full bg-white/[0.03] border-border rounded-xl focus:border-primary-accent/30"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground font-medium ml-1">Số tiền (tùy chọn)</label>
              <AmountInput 
                value={templateAmount}
                onChange={(val) => setTemplateAmount(val)}
                placeholder="VD: 30000" 
                className="bg-white/[0.03] border border-border rounded-xl px-4 py-2 text-sm focus-within:border-primary-accent/30" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground font-medium ml-1">Ghi chú / Hashtag (VD: #cafe)</label>
            <input 
              type="text" 
              value={templateNote}
              onChange={(e) => setTemplateNote(e.target.value)}
              placeholder="Ghi chú mặc định..." 
              className="w-full bg-white/[0.03] border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary-accent/30 placeholder:text-muted-foreground/30" 
            />
          </div>
          <button 
            onClick={editingTemplateId ? handleUpdateTemplate : handleAddTemplate}
            disabled={isSubmitting || !templateTitle}
            className="w-full py-3 rounded-xl bg-primary-accent text-white font-bold text-sm hover:bg-primary-accent/90 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 shadow-md shadow-primary-accent/10"
          >
            {isSubmitting ? "Đang lưu..." : "Lưu lối tắt"}
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {templates.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8 col-span-2">Chưa có lối tắt nào</p>
        ) : (
          templates.map((template) => (
            <div key={template.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${editingTemplateId === template.id ? 'bg-primary-accent/5 border-primary-accent/20' : 'bg-white/[0.01] border-border hover:bg-white/[0.03]'}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg bg-primary-accent/10 text-primary-accent">
                  {template.category?.icon || "⚡"}
                </div>
                <div>
                  <span className="font-semibold text-foreground text-sm block">{template.title}</span>
                  <div className="flex gap-2 items-center mt-0.5">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold tracking-wider uppercase ${template.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      {template.type === 'INCOME' ? 'Thu' : 'Chi'}
                    </span>
                    {template.amount && (
                      <span className="text-[10px] font-mono text-muted-foreground/80 font-medium">{template.amount.toLocaleString('vi-VN')}đ</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                 <button 
                   onClick={() => startEditTemplate(template)}
                   className={`p-2 transition-all cursor-pointer rounded-lg active:scale-90 ${editingTemplateId === template.id ? 'text-primary-accent bg-primary-accent/15' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`}
                 >
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                 </button>
                 <button 
                   onClick={() => setTemplateToDelete(template)}
                   className="p-2 transition-colors cursor-pointer rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10"
                 >
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                 </button>
              </div>
            </div>
          ))
        )}
      </div>

      {templateToDelete && (
        <div 
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm px-0 md:px-4 py-0 md:py-6 animate-in fade-in duration-200"
          onClick={() => setTemplateToDelete(null)}
        >
          <div 
            className="bg-background border-t md:border border-border rounded-t-[32px] md:rounded-[32px] p-6 md:p-8 max-w-sm w-full shadow-2xl relative z-10 bottom-0 md:bottom-auto fixed md:relative transition-all duration-300 md:animate-in md:zoom-in-95 animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header dragging handle for mobile */}
            <div className="md:hidden flex justify-center py-2 bg-card border-b border-border/10 -mt-6 -mx-6 mb-4">
              <div className="w-12 h-1.5 rounded-full bg-neutral-800" />
            </div>

            <div className="mb-6">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
              </div>
              <h2 className="text-xl font-semibold text-foreground tracking-tight mb-2">Xóa lối tắt?</h2>
              <p className="text-sm text-muted-foreground">
                Bạn có chắc chắn muốn xóa lối tắt <strong className="text-foreground">{templateToDelete.title}</strong> không? Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setTemplateToDelete(null)}
                disabled={isLoading}
                className="flex-1 py-3 px-4 rounded-xl text-muted-foreground font-medium text-sm hover:bg-white/[0.03] transition-colors cursor-pointer disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleDeleteTemplate}
                disabled={isLoading}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-500 text-white font-semibold text-sm hover:bg-rose-400 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? "Đang xóa..." : "Xóa lối tắt"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
