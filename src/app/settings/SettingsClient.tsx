"use client";

import { useState } from "react";
import { createFund, updateFund } from "@/lib/db/actions";
import { useRouter } from "next/navigation";

interface Fund {
  id: string;
  name: string;
  isDefault: boolean | null;
  balance: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

interface SettingsClientProps {
  initialFunds: Fund[];
}

export default function SettingsClient({ initialFunds }: SettingsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("funds");
  const [isAddingFund, setIsAddingFund] = useState(false);
  const [editingFundId, setEditingFundId] = useState<string | null>(null);
  
  // States for new/edit fund
  const [fundName, setFundName] = useState("");
  const [fundBalance, setFundBalance] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddFund = async () => {
    if (!fundName || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await createFund({
        name: fundName,
        balance: parseInt(fundBalance) || 0,
      });
      resetForm();
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
      await updateFund(editingFundId, {
        name: fundName,
        balance: parseInt(fundBalance) || 0,
      });
      resetForm();
      router.refresh();
    } catch (error) {
      console.error("Failed to update fund:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFundName("");
    setFundBalance("");
    setIsAddingFund(false);
    setEditingFundId(null);
  };

  const startEdit = (fund: Fund) => {
    setEditingFundId(fund.id);
    setFundName(fund.name);
    setFundBalance((fund.balance || 0).toString());
    setIsAddingFund(false);
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
              resetForm();
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
                    resetForm();
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
            
            <div className="space-y-3">
              {initialFunds.length === 0 ? (
                <p className="text-sm text-neutral-500 text-center py-8">Chưa có quỹ nào</p>
              ) : (
                initialFunds.map(fund => (
                  <div key={fund.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${editingFundId === fund.id ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-[#1A1A1A] border-white/[0.02]'}`}>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-neutral-200">{fund.name}</span>
                      {fund.isDefault && (
                        <span className="text-[10px] uppercase font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                       <span className="font-mono text-neutral-400 text-sm">{(fund.balance || 0).toLocaleString('vi-VN')}đ</span>
                       <button 
                         onClick={() => startEdit(fund)}
                         className={`transition-colors cursor-pointer ${editingFundId === fund.id ? 'text-emerald-400' : 'text-neutral-500 hover:text-white'}`}
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

        {/* Similar tabs for other sections but kept minimal for mockup */}
        {activeTab !== "funds" && (
          <div className="py-12 text-center text-neutral-500 text-sm">
            Nội dung {activeTab} sẽ được mở rộng trong tương lai...
          </div>
        )}
      </div>
    </div>
  );
}
