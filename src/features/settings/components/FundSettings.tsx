"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AmountInput } from "@/components/amount-input";
import { Fund } from "@/types";
import { useFunds } from "@/hooks/use-funds";

interface FundSettingsProps {
  funds: Fund[];
  isLoading: boolean;
}

export function FundSettings({ funds: initialFunds, isLoading: parentIsLoading }: FundSettingsProps) {
  const { 
    funds, 
    createFund, 
    updateFund, 
    deleteFund, 
    setDefaultFund, 
    isSubmitting 
  } = useFunds(initialFunds);
  
  const [isAddingFund, setIsAddingFund] = useState(false);
  const [editingFundId, setEditingFundId] = useState<string | null>(null);
  const [fundToDelete, setFundToDelete] = useState<Fund | null>(null);
  const [fundName, setFundName] = useState("");
  const [fundBalance, setFundBalance] = useState("");

  const isLoading = parentIsLoading || isSubmitting;

  const resetFundForm = () => {
    setFundName("");
    setFundBalance("");
    setIsAddingFund(false);
    setEditingFundId(null);
  };

  const handleAddFund = () => {
    if (!fundName || isSubmitting) return;
    createFund({ name: fundName, balance: parseInt(fundBalance) || 0 }, {
      onSuccess: resetFundForm
    });
  };

  const handleUpdateFund = () => {
    if (!fundName || !editingFundId || isSubmitting) return;
    updateFund({ 
      id: editingFundId, 
      data: { name: fundName, balance: parseInt(fundBalance) || 0 } 
    }, {
      onSuccess: resetFundForm
    });
  };

  const handleDeleteFund = () => {
    if (!fundToDelete || isSubmitting) return;
    deleteFund(fundToDelete.id, {
      onSuccess: () => setFundToDelete(null)
    });
  };

  const handleSetDefaultFund = (id: string) => {
    if (isSubmitting) return;
    setDefaultFund(id);
  };

  const startEditFund = (fund: Fund) => {
    setEditingFundId(fund.id);
    setFundName(fund.name);
    setFundBalance((fund.balance || 0).toString());
    setIsAddingFund(false);
  };

  return (
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
          disabled={isLoading}
          className="text-xs bg-foreground text-background font-medium px-3 py-1.5 rounded-lg hover:bg-neutral-200 transition-colors cursor-pointer disabled:opacity-50"
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
          <div className="sm:w-32 w-full">
            <AmountInput 
              value={fundBalance}
              onChange={(val) => setFundBalance(val)}
              placeholder="Số dư" 
              className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm" 
            />
          </div>
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
        {funds.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8 col-span-2">Chưa có quỹ nào</p>
        ) : (
          funds.map((fund, idx) => {
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
    </div>
  );
}
