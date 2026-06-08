import dynamic from "next/dynamic";
import { FundSelectorModal } from "@/components/fund-selector-modal";
import { Fund } from "@/types";

const DailyReminderModal = dynamic(() => import("@/components/daily-reminder-modal").then(mod => mod.DailyReminderModal), { ssr: false });
const IncomeDistributionModal = dynamic(() => import("@/components/income-distribution-modal").then(mod => mod.IncomeDistributionModal), { ssr: false });

import { useDashboardStore } from "@/hooks/use-dashboard-store";

interface DashboardModalsProps {
  showReminder: boolean;
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
  handleTransfer: () => Promise<void>;
  isSubmitting: boolean;
}

export function DashboardModals({
  showReminder,
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
  handleTransfer,
  isSubmitting,
}: DashboardModalsProps) {
  const { activeFund, setActiveFund } = useDashboardStore();
  const isLoading = isSubmitting;

  if (!activeFund) return null;

  return (
    <>
      <DailyReminderModal show={showReminder} />
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
              <div>
                <p className="text-xs text-muted-foreground mb-2 font-medium">Từ quỹ</p>
                <div className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-neutral-300">
                  {activeFund.name}
                </div>
              </div>
              
              <div className="flex justify-center -my-2 relative z-10">
                <div className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
                </div>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground mb-2 font-medium">Đến quỹ</p>
                <select 
                  value={transferToFund?.id || ''} 
                  onChange={(e) => {
                    const fund = funds.find(f => f.id === e.target.value);
                    if (fund) setTransferToFund(fund);
                  }}
                  disabled={isLoading}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-white/20 transition-colors disabled:opacity-50"
                >
                  <option value="" disabled>-- Chọn quỹ đích --</option>
                  {funds.filter(f => f.id !== activeFund.id).map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground mb-2 font-medium">Số tiền chuyển</p>
                <div className="text-2xl font-mono text-foreground tracking-tight bg-secondary border border-border rounded-xl px-4 py-3">
                  {parseInt(amount || '0').toLocaleString('vi-VN')}đ
                </div>
              </div>
            </div>

            <button 
              onClick={handleTransfer}
              disabled={isLoading || !transferToFund}
              className="w-full py-4 rounded-xl bg-blue-500 text-white font-bold text-sm hover:bg-blue-400 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "ĐANG CHUYỂN..." : "XÁC NHẬN CHUYỂN"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
