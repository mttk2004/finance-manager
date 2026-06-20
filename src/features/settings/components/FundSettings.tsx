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

  const [transferTargetId, setTransferTargetId] = useState<string>("");

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
    deleteFund({ 
      id: fundToDelete.id, 
      options: transferTargetId ? { transferToFundId: transferTargetId } : undefined 
    }, {
      onSuccess: () => {
        setFundToDelete(null);
        setTransferTargetId("");
      }
    });
  };

  const handleSetDefaultFund = (id: string) => {
    if (isSubmitting) return;
    setDefaultFund(id);
  };

  const otherFunds = funds.filter(f => fundToDelete && f.id !== fundToDelete.id);

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
          className="text-xs bg-primary-accent text-white font-semibold px-4 py-2 rounded-xl hover:bg-primary-accent/90 shadow-md shadow-primary-accent/10 active:scale-[0.97] transition-all cursor-pointer disabled:opacity-50"
        >
          {isAddingFund || editingFundId ? "Hủy" : "+ Thêm quỹ mới"}
        </button>
      </div>
      
      {(isAddingFund || editingFundId) && (
        <div 
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm px-0 md:px-4 py-0 md:py-6 animate-in fade-in duration-200"
          onClick={resetFundForm}
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
                {editingFundId ? "Chỉnh sửa quỹ" : "Thêm quỹ mới"}
              </h2>
              <button onClick={resetFundForm} className="p-2 hover:bg-white/5 rounded-full transition-colors text-muted-foreground cursor-pointer">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div className="space-y-8">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-2 block">Tên quỹ (VD: Tiền mặt, Thẻ ATM...)</label>
                <input 
                  type="text" 
                  value={fundName}
                  onChange={(e) => setFundName(e.target.value)}
                  placeholder="Nhập tên quỹ..." 
                  className="w-full bg-white/[0.03] border border-border rounded-2xl px-5 py-4 text-lg font-medium text-foreground focus:outline-none focus:border-primary-accent/30 focus:bg-white/[0.05] transition-all" 
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-2 block">Số dư hiện tại (VND)</label>
                <AmountInput 
                  value={fundBalance}
                  onChange={(val) => setFundBalance(val)}
                  placeholder="0" 
                  className="bg-white/[0.03] border border-border rounded-2xl px-5 py-4 text-3xl focus-within:border-primary-accent/30 focus-within:bg-white/[0.05]" 
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  onClick={resetFundForm}
                  className="flex-1 py-4 rounded-2xl text-muted-foreground font-medium text-sm hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button 
                  onClick={editingFundId ? handleUpdateFund : handleAddFund}
                  disabled={isSubmitting || !fundName}
                  className="flex-[2] py-4 rounded-2xl bg-primary-accent text-white font-bold text-sm hover:bg-primary-accent/90 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 shadow-md shadow-primary-accent/10"
                >
                  {isSubmitting ? "Đang lưu..." : (editingFundId ? "Cập nhật quỹ" : "Lưu quỹ")}
                </button>
              </div>
            </div>
          </div>
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
        <div 
          className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm px-0 md:px-4 py-0 md:py-6 animate-in fade-in duration-200"
          onClick={() => {
            setFundToDelete(null);
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
              <h2 className="text-2xl font-bold text-foreground tracking-tight mb-3">Xác nhận xóa quỹ?</h2>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Bạn sắp xóa quỹ <strong className="text-foreground">{fundToDelete.name}</strong>. Hãy chọn cách xử lý với số dư và dữ liệu của quỹ này.
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-2 block">Tùy chọn an toàn (Tùy chọn)</label>
              <div className="bg-white/[0.02] border border-border rounded-2xl p-4">
                <p className="text-xs text-muted-foreground mb-3">Chuyển toàn bộ số dư ({(fundToDelete.balance || 0).toLocaleString('vi-VN')}đ) và giao dịch sang:</p>
                <select 
                  value={transferTargetId}
                  onChange={(e) => setTransferTargetId(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary-accent/30 transition-all cursor-pointer"
                >
                  <option value="">-- Không chuyển (Xóa sạch) --</option>
                  {otherFunds.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
              <p className="text-[10px] text-rose-400/60 px-2 italic">
                * Nếu không chọn, tất cả giao dịch liên quan đến quỹ này sẽ bị mất vĩnh viễn.
              </p>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setFundToDelete(null);
                  setTransferTargetId("");
                }}
                disabled={isSubmitting}
                className="flex-1 py-4 rounded-2xl text-muted-foreground font-medium text-sm hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleDeleteFund}
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
