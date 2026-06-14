import dynamic from "next/dynamic";
import { FundSelectorModal } from "@/components/fund-selector-modal";
import { Fund } from "@/types";

const IncomeDistributionModal = dynamic(() => import("@/components/income-distribution-modal").then(mod => mod.IncomeDistributionModal), { ssr: false });

import { useDashboardStore } from "@/hooks/use-dashboard-store";

interface DashboardModalsProps {
  isDistributionModalOpen: boolean;
  setDistributionModalOpen: (open: boolean) => void;
  isFundSelectorOpen: boolean;
  setFundSelectorOpen: (open: boolean) => void;
  isTransferModalOpen: boolean;
  setTransferModalOpen: (open: boolean) => void;
  funds: Fund[];
  transferToFund: Fund | null;
  setTransferToFund: (fund: Fund | null) => void;
  amount: string;
  setAmount: (amount: string) => void;
  handleTransfer: () => Promise<void>;
  isSubmitting: boolean;
}

export function DashboardModals({
  isDistributionModalOpen,
  setDistributionModalOpen,
  isFundSelectorOpen,
  setFundSelectorOpen,
  isTransferModalOpen,
  setTransferModalOpen,
  funds,
  transferToFund,
  setTransferToFund,
  amount,
  setAmount,
  handleTransfer,
  isSubmitting,
}: DashboardModalsProps) {
  const { activeFund, setActiveFund } = useDashboardStore();
  const isLoading = isSubmitting;

  if (!activeFund) return null;

  return (
    <>
      <IncomeDistributionModal isOpen={isDistributionModalOpen} onClose={() => setDistributionModalOpen(false)} />
      <FundSelectorModal 
        isOpen={isFundSelectorOpen} 
        onClose={() => setFundSelectorOpen(false)} 
        currentFund={activeFund.name} 
        funds={funds}
        onSelectFund={(fundName) => {
          const fund = funds.find(f => f.name === fundName);
          if (fund) setActiveFund(fund);
        }} 
      />
      {/* Transfer Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-card border border-border rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-foreground tracking-tight">Chuyển tiền</h2>
              <button 
                onClick={() => setTransferModalOpen(false)} 
                disabled={isLoading}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-muted-foreground cursor-pointer disabled:opacity-50"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-end mb-1">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Từ quỹ</p>
                <span className="text-[10px] font-mono text-emerald-500/60">Số dư: {(activeFund.balance || 0).toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground font-medium flex justify-between items-center">
                <span>{activeFund.name}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></span>
              </div>
              
              <div className="flex justify-center -my-3 relative z-10">
                <div className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground shadow-lg">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
                </div>
              </div>
              
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-medium">Đến quỹ</p>
                <select 
                  value={transferToFund?.id || ''} 
                  onChange={(e) => {
                    const fund = funds.find(f => f.id === e.target.value);
                    if (fund) setTransferToFund(fund);
                  }}
                  disabled={isLoading}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50 appearance-none cursor-pointer"
                >
                  <option value="" disabled>-- Chọn quỹ đích --</option>
                  {funds.filter(f => f.id !== activeFund.id).map(f => (
                    <option key={f.id} value={f.id}>{f.name} ({(f.balance || 0).toLocaleString('vi-VN')}đ)</option>
                  ))}
                </select>
              </div>
              
              <div className="pt-2">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Số tiền chuyển</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setAmount((activeFund.balance || 0).toString())}
                      className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                    >
                      Chuyển hết
                    </button>
                    {parseInt(amount || '0') > (activeFund.balance || 0) && (
                      <span className="text-[10px] font-bold text-rose-500 animate-pulse">Vượt số dư!</span>
                    )}
                  </div>
                </div>
                <div className={`text-3xl font-mono tracking-tight bg-secondary border rounded-2xl px-4 py-4 text-center transition-all ${parseInt(amount || '0') > (activeFund.balance || 0) ? 'border-rose-500/50 text-rose-500' : 'border-border text-foreground'}`}>
                  {parseInt(amount || '0').toLocaleString('vi-VN')}<span className="text-sm ml-1 opacity-50">đ</span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleTransfer}
              disabled={isLoading || !transferToFund || !amount || amount === '0' || parseInt(amount) > (activeFund.balance || 0)}
              className="w-full py-4 rounded-2xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-500 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xl shadow-blue-900/20"
            >
              {isLoading ? "ĐANG XỬ LÝ..." : "XÁC NHẬN CHUYỂN QUỸ"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
