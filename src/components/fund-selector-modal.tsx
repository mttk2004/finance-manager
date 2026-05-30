"use client";

export interface Fund {
  id: string;
  name: string;
  balance: number | null;
}

interface FundSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFund: string;
  onSelectFund: (fund: string) => void;
  funds?: Fund[];
}

export function FundSelectorModal({ isOpen, onClose, currentFund, onSelectFund, funds = [] }: FundSelectorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-[#121212] border border-white/[0.04] rounded-3xl p-6 max-w-sm w-full shadow-2xl relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-white tracking-tight">Chọn quỹ giao dịch</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-neutral-400">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <div className="space-y-2 mb-6">
          {funds.length === 0 ? (
            <p className="text-sm text-neutral-500 text-center py-4">Chưa có quỹ nào</p>
          ) : (
            funds.map(fund => (
              <button 
                key={fund.id}
                onClick={() => {
                  onSelectFund(fund.name);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                  currentFund === fund.name 
                    ? 'bg-emerald-500/10 border-emerald-500/20' 
                    : 'bg-[#1A1A1A] border-white/[0.02] hover:bg-[#222222]'
                }`}
              >
                <span className={`font-medium ${currentFund === fund.name ? 'text-emerald-400' : 'text-neutral-300'}`}>
                  {fund.name}
                </span>
                <span className={`font-mono text-sm ${currentFund === fund.name ? 'text-emerald-500/80' : 'text-neutral-500'}`}>
                  {(fund.balance || 0).toLocaleString('vi-VN')}đ
                </span>
              </button>
            ))
          )}
        </div>

        <button 
          onClick={() => {
            // Go to settings or show another modal
            onClose();
          }}
          className="w-full py-3 rounded-xl border border-white/[0.05] border-dashed text-neutral-400 font-medium text-sm hover:bg-white/[0.02] hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Tạo quỹ mới
        </button>
      </div>
    </div>
  );
}
