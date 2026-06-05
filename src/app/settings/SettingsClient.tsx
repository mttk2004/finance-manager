"use client";

import { useState, useEffect, useTransition } from "react";
import { 
  createFund, updateFund, deleteFund, 
  createCategory, updateCategory, deleteCategory, 
  upsertBudget,
  createTemplate, updateTemplate, deleteTemplate,
  resetData,
  setDefaultFund
} from "@/lib/db/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CustomSelect } from "@/components/ui/custom-select";

interface Fund {
  id: string;
  name: string;
  balance: number | null;
  isDefault: boolean | null;
  attributes: unknown;
  createdAt: Date | null;
  updatedAt: Date | null;
}

interface Category {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  icon: string | null;
  hashtags: string[] | null;
}

interface Budget {
  id: string;
  categoryId: string;
  amountLimit: number;
  period: string;
  isOverride: boolean;
  category?: Category | null;
}

interface Template {
  id: string;
  title: string;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'LEND' | 'BORROW';
  categoryId: string | null;
  amount: number | null;
  notePreset: string | null;
  category?: Category | null;
}

interface SettingsClientProps {
  initialFunds: Fund[];
  initialCategories: Category[];
  initialBudgets: Budget[];
  initialTemplates: Template[];
  currentMonthPeriod: string;
}

export default function SettingsClient({ initialFunds, initialCategories, initialBudgets, initialTemplates, currentMonthPeriod }: SettingsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState("funds");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab && ["funds", "categories", "shortcuts", "budget", "general"].includes(tab)) {
        setActiveTab(tab);
      }
    }
  }, []);
  
  // --- Fund States ---
  const [isAddingFund, setIsAddingFund] = useState(false);
  const [editingFundId, setEditingFundId] = useState<string | null>(null);
  const [fundToDelete, setFundToDelete] = useState<Fund | null>(null);
  const [fundName, setFundName] = useState("");
  const [fundBalance, setFundBalance] = useState("");

  // --- Category States ---
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [catName, setCatName] = useState("");
  const [catType, setCatType] = useState<'INCOME' | 'EXPENSE'>("EXPENSE");
  const [catIcon, setCatIcon] = useState("");
  const [catHashtags, setCatHashtags] = useState("");
  
  // --- Budget States ---
  const [isAddingBudget, setIsAddingBudget] = useState(false);
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [budgetCategoryId, setBudgetCategoryId] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");

  // --- Shortcut (Template) States ---
  const [isAddingTemplate, setIsAddingTemplate] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [templateTitle, setTemplateTitle] = useState("");
  const [templateType, setTemplateType] = useState<'INCOME' | 'EXPENSE' | 'TRANSFER' | 'LEND' | 'BORROW'>('EXPENSE');
  const [templateCategoryId, setTemplateCategoryId] = useState("");
  const [templateAmount, setTemplateAmount] = useState("");
  const [templateNote, setTemplateNote] = useState("");
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // --- Reset Handler ---
  const handleResetData = async () => {
    setIsSubmitting(true);
    try {
      await resetData();
      toast.success("Đã xóa toàn bộ dữ liệu và thiết lập lại mặc định!");
      setIsResetConfirmOpen(false);
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error("Failed to reset data:", error);
      toast.error("Không thể xóa dữ liệu");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Fund Handlers ---
  const handleAddFund = async () => {
    if (!fundName || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await createFund({ name: fundName, balance: parseInt(fundBalance) || 0 });
      resetFundForm();
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error("Failed to create fund:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateFund = async () => {
    if (!fundName || !editingFundId || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await updateFund(editingFundId, { name: fundName, balance: parseInt(fundBalance) || 0 });
      resetFundForm();
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error("Failed to update fund:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFund = async () => {
    if (!fundToDelete || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await deleteFund(fundToDelete.id);
      setFundToDelete(null);
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error("Failed to delete fund:", error);
      alert(error instanceof Error ? error.message : "Không thể xóa quỹ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetDefaultFund = async (id: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await setDefaultFund(id);
      toast.success("Đã thay đổi quỹ mặc định");
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error("Failed to set default fund:", error);
      toast.error("Lỗi khi thay đổi quỹ mặc định");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetFundForm = () => {
    setFundName("");
    setFundBalance("");
    setIsAddingFund(false);
    setEditingFundId(null);
  };

  const startEditFund = (fund: Fund) => {
    setEditingFundId(fund.id);
    setFundName(fund.name);
    setFundBalance((fund.balance || 0).toString());
    setIsAddingFund(false);
  };

  // --- Category Handlers ---
  const handleAddCategory = async () => {
    if (!catName || !catIcon || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const hashtagsArray = catHashtags.split(',').map(s => s.trim()).filter(s => s.length > 0);
      await createCategory({ name: catName, type: catType, icon: catIcon, hashtags: hashtagsArray });
      resetCategoryForm();
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error("Failed to create category:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!catName || !editingCategoryId || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const hashtagsArray = catHashtags.split(',').map(s => s.trim()).filter(s => s.length > 0);
      await updateCategory(editingCategoryId, { name: catName, type: catType, icon: catIcon, hashtags: hashtagsArray });
      resetCategoryForm();
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error("Failed to update category:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa danh mục này?") && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await deleteCategory(id);
        startTransition(() => {
        router.refresh();
      });
      } catch (error) {
        console.error("Failed to delete category:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const resetCategoryForm = () => {
    setCatName("");
    setCatType("EXPENSE");
    setCatIcon("");
    setCatHashtags("");
    setIsAddingCategory(false);
    setEditingCategoryId(null);
  };

  const startEditCategory = (cat: Category) => {
    setEditingCategoryId(cat.id);
    setCatName(cat.name);
    setCatType(cat.type);
    setCatIcon(cat.icon || "");
    setCatHashtags(cat.hashtags?.join(", ") || "");
    setIsAddingCategory(false);
  };

  // --- Budget Handlers ---
  const handleUpsertBudget = async () => {
    if (!budgetCategoryId || !budgetAmount || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await upsertBudget({
        categoryId: budgetCategoryId,
        amountLimit: parseInt(budgetAmount) || 0,
        period: currentMonthPeriod,
      });
      resetBudgetForm();
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error("Failed to save budget:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetBudgetForm = () => {
    setBudgetCategoryId("");
    setBudgetAmount("");
    setIsAddingBudget(false);
    setEditingBudgetId(null);
  };

  const startEditBudget = (budget: Budget) => {
    setEditingBudgetId(budget.id);
    setBudgetCategoryId(budget.categoryId);
    setBudgetAmount(budget.amountLimit.toString());
    setIsAddingBudget(false);
  };

  // --- Shortcut (Template) Handlers ---
  const handleAddTemplate = async () => {
    if (!templateTitle || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await createTemplate({
        title: templateTitle,
        type: templateType,
        categoryId: templateCategoryId || undefined,
        amount: parseInt(templateAmount) || undefined,
        notePreset: templateNote || undefined,
      });
      resetTemplateForm();
      toast.success("Đã thêm lối tắt mới");
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error("Failed to add template:", error);
      toast.error("Lỗi khi thêm lối tắt");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplateId || !templateTitle || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await updateTemplate(editingTemplateId, {
        title: templateTitle,
        type: templateType,
        categoryId: templateCategoryId || undefined,
        amount: parseInt(templateAmount) || undefined,
        notePreset: templateNote || undefined,
      });
      resetTemplateForm();
      toast.success("Đã cập nhật lối tắt");
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error("Failed to update template:", error);
      toast.error("Lỗi khi cập nhật lối tắt");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!templateToDelete || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await deleteTemplate(templateToDelete.id);
      setTemplateToDelete(null);
      toast.success("Đã xóa lối tắt");
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error("Failed to delete template:", error);
      toast.error("Lỗi khi xóa lối tắt");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetTemplateForm = () => {
    setTemplateTitle("");
    setTemplateType("EXPENSE");
    setTemplateCategoryId("");
    setTemplateAmount("");
    setTemplateNote("");
    setIsAddingTemplate(false);
    setEditingTemplateId(null);
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
    <div className="flex flex-col w-full h-full pb-20 md:pb-8 max-w-3xl mx-auto mt-4 md:mt-8 px-4 md:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2">Cài đặt</h1>
        <p className="text-muted-foreground">Quản lý các quỹ, danh mục và lối tắt của bạn.</p>
      </div>

      <div className="flex gap-4 border-b border-border mb-8 overflow-x-auto scrollbar-hide pb-2">
        {[
          { id: "funds", name: "Quỹ" },
          { id: "categories", name: "Danh mục" },
          { id: "shortcuts", name: "Lối tắt nhanh" },
          { id: "budget", name: "Ngân sách" },
          { id: "general", name: "Chung" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              resetFundForm();
              resetCategoryForm();
              resetBudgetForm();
            }}
            className={`pb-2 px-1 text-sm font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
              activeTab === tab.id ? "text-foreground border-foreground" : "text-muted-foreground border-transparent hover:text-neutral-300"
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-3xl p-6">
        {activeTab === "funds" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-foreground">Quản lý Quỹ (Funds)</h3>
              <button 
                onClick={() => {
                  if (isAddingFund || editingFundId) {
                    resetFundForm();
                  } else {
                    setIsAddingFund(true);
                  }
                }} 
                className="text-xs bg-foreground text-background font-medium px-3 py-1.5 rounded-lg hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                {isAddingFund || editingFundId ? "Hủy" : "+ Thêm quỹ mới"}
              </button>
            </div>
            
            {(isAddingFund || editingFundId) && (
              <div className="flex flex-col sm:flex-row gap-3 mb-4 items-center bg-secondary p-3 rounded-xl border border-border">
                <input 
                  type="text" 
                  value={fundName}
                  onChange={(e) => setFundName(e.target.value)}
                  placeholder="Tên quỹ (VD: Tiết kiệm)" 
                  className="flex-1 bg-transparent text-sm text-foreground focus:outline-none placeholder:text-muted-foreground/60 px-2 w-full" 
                />
                <input 
                  type="number" 
                  value={fundBalance}
                  onChange={(e) => setFundBalance(e.target.value)}
                  placeholder="Số dư" 
                  className="sm:w-32 bg-card border border-border rounded-lg px-3 py-1.5 text-sm font-mono text-foreground focus:outline-none placeholder:text-muted-foreground/60 w-full" 
                />
                <button 
                  onClick={editingFundId ? handleUpdateFund : handleAddFund}
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 text-black font-semibold text-sm hover:bg-emerald-400 cursor-pointer w-full sm:w-auto disabled:opacity-50"
                >
                  {isSubmitting ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {initialFunds.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8 col-span-2">Chưa có quỹ nào</p>
              ) : (
                initialFunds.map((fund, idx) => {
                  const gradients = [
                    'from-emerald-500/20 to-teal-500/5',
                    'from-blue-500/20 to-indigo-500/5',
                    'from-purple-500/20 to-pink-500/5',
                    'from-orange-500/20 to-amber-500/5',
                  ];
                  const borderGradients = [
                    'border-emerald-500/30',
                    'border-blue-500/30',
                    'border-purple-500/30',
                    'border-orange-500/30',
                  ];
                  const grad = gradients[idx % gradients.length];
                  const borderGrad = borderGradients[idx % borderGradients.length];

                  return (
                    <div 
                      key={fund.id} 
                      className={`relative overflow-hidden group p-6 rounded-[2rem] border transition-all duration-300 bg-gradient-to-br ${grad} ${editingFundId === fund.id ? 'ring-2 ring-white/20 border-white/20' : `${borderGrad} hover:border-white/10`}`}
                    >
                      <div className="relative z-10 flex flex-col h-full justify-between min-h-[140px]">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-foreground font-bold text-lg mb-1">{fund.name}</h4>
                            {fund.isDefault && (
                              <span className="text-[9px] uppercase tracking-widest font-bold bg-white/10 text-white/70 px-2 py-0.5 rounded-full border border-white/5">
                                Mặc định
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {!fund.isDefault && (
                              <>
                                <button 
                                  onClick={() => handleSetDefaultFund(fund.id)}
                                  className="p-2 rounded-full transition-colors cursor-pointer bg-white/5 text-white/40 hover:bg-emerald-500/20 hover:text-emerald-400"
                                  title="Đặt làm mặc định"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                                </button>
                                <button 
                                  onClick={() => setFundToDelete(fund)}
                                  className={`p-2 rounded-full transition-colors cursor-pointer bg-white/5 text-white/40 hover:bg-rose-500/20 hover:text-rose-400`}
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                                </button>
                              </>
                            )}
                            <button 
                              onClick={() => startEditFund(fund)}
                              className={`p-2 rounded-full transition-colors cursor-pointer ${editingFundId === fund.id ? 'bg-foreground text-background' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'}`}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                            </button>
                          </div>
                        </div>

                        <div className="mt-6">
                          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold mb-1">Số dư hiện tại</p>
                          <div className="text-2xl font-mono text-foreground font-bold tracking-tighter">
                            {(fund.balance || 0).toLocaleString('vi-VN')}<span className="text-white/20 ml-1">đ</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Decorative background element */}
                      <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
                         <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-foreground"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {activeTab === "categories" && (
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
              {initialCategories.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Chưa có danh mục nào</p>
              ) : (
                initialCategories.map(cat => (
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
        )}

        {activeTab === "budget" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-foreground">Ngân sách Tháng {new Date().getMonth() + 1}</h3>
              <button 
                onClick={() => {
                  if (isAddingBudget || editingBudgetId) {
                    resetBudgetForm();
                  } else {
                    setIsAddingBudget(true);
                  }
                }} 
                className="text-xs bg-foreground text-background font-medium px-3 py-1.5 rounded-lg hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                {isAddingBudget || editingBudgetId ? "Hủy" : "+ Thiết lập ngân sách"}
              </button>
            </div>
            
            {(isAddingBudget || editingBudgetId) && (
              <div className="flex flex-col sm:flex-row gap-3 mb-4 items-center bg-secondary p-3 rounded-xl border border-border">
                <CustomSelect 
                  value={budgetCategoryId} 
                  onChange={(e) => setBudgetCategoryId(e.target.value)}
                  options={[
                    { value: "", label: "-- Chọn danh mục chi tiêu --" },
                    ...initialCategories.filter(c => c.type === 'EXPENSE').map(c => ({
                      value: c.id,
                      label: `${c.icon} ${c.name}`
                    }))
                  ]}
                  className="w-full sm:flex-1"
                />
                <input 
                  type="number" 
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  placeholder="Hạn mức (VND)" 
                  className="w-full sm:w-40 bg-card border border-border rounded-lg px-3 py-1.5 text-sm font-mono text-foreground focus:outline-none placeholder:text-muted-foreground/60" 
                />
                <button 
                  onClick={handleUpsertBudget}
                  disabled={isSubmitting || !budgetCategoryId || !budgetAmount}
                  className="px-4 py-1.5 rounded-lg bg-orange-500 text-white font-semibold text-sm hover:bg-orange-400 cursor-pointer w-full sm:w-auto disabled:opacity-50"
                >
                  {isSubmitting ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            )}
            
            <div className="space-y-3">
              {initialBudgets.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Chưa có ngân sách nào được thiết lập cho tháng này.</p>
              ) : (
                initialBudgets.map(budget => (
                  <div key={budget.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${editingBudgetId === budget.id ? 'bg-orange-500/5 border-orange-500/20' : 'bg-secondary border-white/[0.02]'}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg bg-orange-500/10">
                        {budget.category?.icon || "📝"}
                      </div>
                      <div>
                        <span className="font-medium text-foreground block">{budget.category?.name || "Danh mục không xác định"}</span>
                        <span className="text-[10px] uppercase font-mono tracking-tight text-muted-foreground">
                          Hạn mức
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <span className="font-mono text-muted-foreground font-medium">{(budget.amountLimit || 0).toLocaleString('vi-VN')}đ</span>
                       <button 
                         onClick={() => startEditBudget(budget)}
                         className={`p-2 transition-colors cursor-pointer rounded-lg ${editingBudgetId === budget.id ? 'text-orange-400 bg-orange-500/10' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`}
                       >
                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                       </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "shortcuts" && (
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
                className="text-xs bg-foreground text-background font-medium px-3 py-1.5 rounded-lg hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                {isAddingTemplate || editingTemplateId ? "Hủy" : "+ Thêm lối tắt mới"}
              </button>
            </div>
            
            {(isAddingTemplate || editingTemplateId) && (
              <div className="space-y-4 bg-secondary p-4 rounded-2xl border border-border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground font-medium ml-1">Tên lối tắt</label>
                    <input 
                      type="text" 
                      value={templateTitle}
                      onChange={(e) => setTemplateTitle(e.target.value)}
                      placeholder="VD: Mua cafe sáng" 
                      className="w-full bg-card border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none placeholder:text-muted-foreground/60" 
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
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground font-medium ml-1">Danh mục (tùy chọn)</label>
                    <CustomSelect 
                      value={templateCategoryId} 
                      onChange={(e) => setTemplateCategoryId(e.target.value)}
                      options={[
                        { value: "", label: "-- Tự động theo hashtag --" },
                        ...initialCategories.filter(c => c.type === (templateType === 'INCOME' ? 'INCOME' : 'EXPENSE')).map(c => ({
                          value: c.id,
                          label: `${c.icon} ${c.name}`
                        }))
                      ]}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground font-medium ml-1">Số tiền (tùy chọn)</label>
                    <input 
                      type="number" 
                      value={templateAmount}
                      onChange={(e) => setTemplateAmount(e.target.value)}
                      placeholder="VD: 30000" 
                      className="w-full bg-card border border-border rounded-xl px-4 py-2 text-sm font-mono text-foreground focus:outline-none placeholder:text-muted-foreground/60" 
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
                    className="w-full bg-card border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none placeholder:text-muted-foreground/60" 
                  />
                </div>
                <button 
                  onClick={editingTemplateId ? handleUpdateTemplate : handleAddTemplate}
                  disabled={isSubmitting || !templateTitle}
                  className="w-full py-2.5 rounded-xl bg-blue-500 text-white font-semibold text-sm hover:bg-blue-400 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Đang lưu..." : "Lưu lối tắt"}
                </button>
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {initialTemplates.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8 col-span-2">Chưa có lối tắt nào</p>
              ) : (
                initialTemplates.map((template) => (
                  <div key={template.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${editingTemplateId === template.id ? 'bg-blue-500/5 border-blue-500/20' : 'bg-secondary border-white/[0.02]'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg bg-blue-500/10">
                        {template.category?.icon || "⚡"}
                      </div>
                      <div>
                        <span className="font-medium text-foreground block">{template.title}</span>
                        <div className="flex gap-2 items-center">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-tight ${template.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                            {template.type === 'INCOME' ? 'Thu' : 'Chi'}
                          </span>
                          {template.amount && (
                            <span className="text-[10px] font-mono text-muted-foreground">{template.amount.toLocaleString('vi-VN')}đ</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                       <button 
                         onClick={() => startEditTemplate(template)}
                         className={`p-2 transition-colors cursor-pointer rounded-lg ${editingTemplateId === template.id ? 'text-blue-400 bg-blue-500/10' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`}
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
          </div>
        )}
        {activeTab === "general" && (
          <div className="space-y-6">
            <h3 className="font-medium text-foreground">Cài đặt chung</h3>
            <div className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/10">
              <h4 className="text-rose-500 font-semibold mb-2 flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                Vùng nguy hiểm
              </h4>
              <p className="text-sm text-muted-foreground mb-6">
                Hành động này sẽ xóa vĩnh viễn toàn bộ giao dịch, ngân sách, lối tắt và các quỹ bạn đã tạo. Ứng dụng sẽ được đưa về trạng thái mặc định ban đầu.
              </p>
              <button 
                onClick={() => setIsResetConfirmOpen(true)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-rose-500 text-white font-bold text-sm hover:bg-rose-400 active:scale-[0.98] transition-all cursor-pointer"
              >
                XÓA TẤT CẢ DỮ LIỆU
              </button>
            </div>
          </div>
        )}
      </div>

      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-card border border-border rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative">
            <div className="mb-6">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
              </div>
              <h2 className="text-xl font-semibold text-foreground tracking-tight mb-2">Xác nhận reset?</h2>
              <p className="text-sm text-muted-foreground">
                Bạn có chắc chắn muốn xóa <strong className="text-foreground">TOÀN BỘ</strong> dữ liệu không? Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsResetConfirmOpen(false)}
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 rounded-xl text-muted-foreground font-medium text-sm hover:bg-white/[0.03] transition-colors cursor-pointer disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleResetData}
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-500 text-white font-semibold text-sm hover:bg-rose-400 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Đang xóa..." : "Xác nhận xóa"}
              </button>
            </div>
          </div>
        </div>
      )}

      {fundToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-card border border-border rounded-3xl p-6 md:p-8 max-sm w-full shadow-2xl relative">
            <div className="mb-6">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
              </div>
              <h2 className="text-xl font-semibold text-foreground tracking-tight mb-2">Xóa quỹ?</h2>
              <p className="text-sm text-muted-foreground">
                Bạn có chắc chắn muốn xóa quỹ <strong className="text-foreground">{fundToDelete.name}</strong> không? Các giao dịch liên quan đến quỹ này có thể bị mất. Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setFundToDelete(null)}
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 rounded-xl text-muted-foreground font-medium text-sm hover:bg-white/[0.03] transition-colors cursor-pointer disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleDeleteFund}
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-500 text-white font-semibold text-sm hover:bg-rose-400 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Đang xóa..." : "Xóa quỹ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {templateToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-card border border-border rounded-3xl p-6 md:p-8 max-sm w-full shadow-2xl relative">
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
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 rounded-xl text-muted-foreground font-medium text-sm hover:bg-white/[0.03] transition-colors cursor-pointer disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleDeleteTemplate}
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-500 text-white font-semibold text-sm hover:bg-rose-400 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Đang xóa..." : "Xóa lối tắt"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
