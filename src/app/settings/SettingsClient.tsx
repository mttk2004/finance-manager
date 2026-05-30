"use client";

import { useState } from "react";
import { createFund, updateFund, deleteFund, createCategory, updateCategory, deleteCategory } from "@/lib/db/actions";
import { useRouter } from "next/navigation";

interface Fund {
  id: string;
  name: string;
  isDefault: boolean | null;
  balance: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

interface Category {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  icon: string | null;
  createdAt: Date | null;
}

interface SettingsClientProps {
  initialFunds: Fund[];
  initialCategories: Category[];
}

export default function SettingsClient({ initialFunds, initialCategories }: SettingsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("funds");
  
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
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Fund Handlers ---
  const handleAddFund = async () => {
    if (!fundName || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await createFund({ name: fundName, balance: parseInt(fundBalance) || 0 });
      resetFundForm();
      router.refresh();
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
      router.refresh();
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
      router.refresh();
    } catch (error) {
      console.error("Failed to delete fund:", error);
      alert(error instanceof Error ? error.message : "Không thể xóa quỹ");
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
      await createCategory({ name: catName, type: catType, icon: catIcon });
      resetCategoryForm();
      router.refresh();
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
      await updateCategory(editingCategoryId, { name: catName, type: catType, icon: catIcon });
      resetCategoryForm();
      router.refresh();
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
        router.refresh();
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
    setIsAddingCategory(false);
    setEditingCategoryId(null);
  };

  const startEditCategory = (cat: Category) => {
    setEditingCategoryId(cat.id);
    setCatName(cat.name);
    setCatType(cat.type);
    setCatIcon(cat.icon || "");
    setIsAddingCategory(false);
  };

  return (
    <div className="flex flex-col w-full h-full pb-20 md:pb-8 max-w-3xl mx-auto mt-4 md:mt-8 px-4 md:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Cài đặt</h1>
        <p className="text-neutral-400">Quản lý các quỹ, danh mục và lối tắt của bạn.</p>
      </div>

      <div className="flex gap-4 border-b border-white/[0.04] mb-8 overflow-x-auto scrollbar-hide pb-2">
        {[
          { id: "funds", name: "Quỹ" },
          { id: "categories", name: "Danh mục" },
          { id: "shortcuts", name: "Lối tắt nhanh" },
          { id: "budget", name: "Ngân sách" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              resetFundForm();
              resetCategoryForm();
            }}
            className={`pb-2 px-1 text-sm font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
              activeTab === tab.id ? "text-white border-white" : "text-neutral-500 border-transparent hover:text-neutral-300"
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      <div className="bg-[#121212] border border-white/[0.04] rounded-3xl p-6">
        {activeTab === "funds" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-white">Quản lý Quỹ (Funds)</h3>
              <button 
                onClick={() => {
                  if (isAddingFund || editingFundId) {
                    resetFundForm();
                  } else {
                    setIsAddingFund(true);
                  }
                }} 
                className="text-xs bg-white text-black font-medium px-3 py-1.5 rounded-lg hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                {isAddingFund || editingFundId ? "Hủy" : "+ Thêm quỹ mới"}
              </button>
            </div>
            
            {(isAddingFund || editingFundId) && (
              <div className="flex flex-col sm:flex-row gap-3 mb-4 items-center bg-[#1A1A1A] p-3 rounded-xl border border-white/[0.05]">
                <input 
                  type="text" 
                  value={fundName}
                  onChange={(e) => setFundName(e.target.value)}
                  placeholder="Tên quỹ (VD: Tiết kiệm)" 
                  className="flex-1 bg-transparent text-sm text-white focus:outline-none placeholder:text-neutral-600 px-2 w-full" 
                />
                <input 
                  type="number" 
                  value={fundBalance}
                  onChange={(e) => setFundBalance(e.target.value)}
                  placeholder="Số dư" 
                  className="sm:w-32 bg-[#121212] border border-white/[0.05] rounded-lg px-3 py-1.5 text-sm font-mono text-white focus:outline-none placeholder:text-neutral-600 w-full" 
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
                <p className="text-sm text-neutral-500 text-center py-8 col-span-2">Chưa có quỹ nào</p>
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
                            <h4 className="text-white font-bold text-lg mb-1">{fund.name}</h4>
                            {fund.isDefault && (
                              <span className="text-[9px] uppercase tracking-widest font-bold bg-white/10 text-white/70 px-2 py-0.5 rounded-full border border-white/5">
                                Mặc định
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {!fund.isDefault && (
                              <button 
                                onClick={() => setFundToDelete(fund)}
                                className={`p-2 rounded-full transition-colors cursor-pointer bg-white/5 text-white/40 hover:bg-rose-500/20 hover:text-rose-400`}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                              </button>
                            )}
                            <button 
                              onClick={() => startEditFund(fund)}
                              className={`p-2 rounded-full transition-colors cursor-pointer ${editingFundId === fund.id ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'}`}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                            </button>
                          </div>
                        </div>

                        <div className="mt-6">
                          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold mb-1">Số dư hiện tại</p>
                          <div className="text-2xl font-mono text-white font-bold tracking-tighter">
                            {(fund.balance || 0).toLocaleString('vi-VN')}<span className="text-white/20 ml-1">đ</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Decorative background element */}
                      <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
                         <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-white"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
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
              <h3 className="font-medium text-white">Quản lý Danh mục (Categories)</h3>
              <button 
                onClick={() => {
                  if (isAddingCategory || editingCategoryId) {
                    resetCategoryForm();
                  } else {
                    setIsAddingCategory(true);
                  }
                }} 
                className="text-xs bg-white text-black font-medium px-3 py-1.5 rounded-lg hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                {isAddingCategory || editingCategoryId ? "Hủy" : "+ Thêm danh mục mới"}
              </button>
            </div>
            
            {(isAddingCategory || editingCategoryId) && (
              <div className="flex flex-col sm:flex-row gap-3 mb-4 items-center bg-[#1A1A1A] p-3 rounded-xl border border-white/[0.05]">
                <select 
                  value={catType} 
                  onChange={(e) => setCatType(e.target.value as 'INCOME' | 'EXPENSE')}
                  className="bg-[#121212] border border-white/[0.05] rounded-lg px-3 py-2 text-sm text-white focus:outline-none w-full sm:w-auto"
                >
                  <option value="EXPENSE">Chi tiêu</option>
                  <option value="INCOME">Thu nhập</option>
                </select>
                <input 
                  type="text" 
                  value={catIcon}
                  onChange={(e) => setCatIcon(e.target.value)}
                  placeholder="Icon (VD: 🍜)" 
                  className="w-full sm:w-20 bg-[#121212] border border-white/[0.05] rounded-lg px-3 py-1.5 text-sm text-center text-white focus:outline-none placeholder:text-neutral-600" 
                />
                <input 
                  type="text" 
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Tên danh mục (VD: Ăn uống)" 
                  className="flex-1 bg-transparent text-sm text-white focus:outline-none placeholder:text-neutral-600 px-2 w-full" 
                />
                <button 
                  onClick={editingCategoryId ? handleUpdateCategory : handleAddCategory}
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-lg bg-blue-500 text-white font-semibold text-sm hover:bg-blue-400 cursor-pointer w-full sm:w-auto disabled:opacity-50"
                >
                  {isSubmitting ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            )}
            
            <div className="space-y-3">
              {initialCategories.length === 0 ? (
                <p className="text-sm text-neutral-500 text-center py-8">Chưa có danh mục nào</p>
              ) : (
                initialCategories.map(cat => (
                  <div key={cat.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${editingCategoryId === cat.id ? 'bg-blue-500/5 border-blue-500/20' : 'bg-[#1A1A1A] border-white/[0.02]'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${cat.type === 'INCOME' ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                        {cat.icon || "📝"}
                      </div>
                      <div>
                        <span className="font-medium text-neutral-200 block">{cat.name}</span>
                        <span className={`text-[10px] uppercase font-mono tracking-tight ${cat.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {cat.type === 'INCOME' ? 'Thu nhập' : 'Chi tiêu'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <button 
                         onClick={() => startEditCategory(cat)}
                         className={`p-2 transition-colors cursor-pointer rounded-lg ${editingCategoryId === cat.id ? 'text-blue-400 bg-blue-500/10' : 'text-neutral-500 hover:text-white hover:bg-white/5'}`}
                       >
                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                       </button>
                       <button 
                         onClick={() => handleDeleteCategory(cat.id)}
                         className="p-2 transition-colors cursor-pointer rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10"
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

        {/* Similar tabs for other sections but kept minimal for mockup */}
        {(activeTab !== "funds" && activeTab !== "categories") && (
          <div className="py-12 text-center text-neutral-500 text-sm">
            Nội dung {activeTab} sẽ được mở rộng trong tương lai...
          </div>
        )}
      </div>

      {fundToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#121212] border border-white/[0.04] rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative">
            <div className="mb-6">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
              </div>
              <h2 className="text-xl font-semibold text-white tracking-tight mb-2">Xóa quỹ?</h2>
              <p className="text-sm text-neutral-400">
                Bạn có chắc chắn muốn xóa quỹ <strong className="text-white">{fundToDelete.name}</strong> không? Các giao dịch liên quan đến quỹ này có thể bị mất. Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setFundToDelete(null)}
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 rounded-xl text-neutral-400 font-medium text-sm hover:bg-white/[0.03] transition-colors cursor-pointer disabled:opacity-50"
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
    </div>
  );
}
