'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useDashboard } from '@/hooks/use-dashboard';
import { useTransactions } from '@/hooks/use-transactions';
import { TransactionForm } from '@/features/dashboard/transaction-form';
import { DashboardModals } from '@/features/dashboard/dashboard-modals';
import { Fund } from '@/types';
import { toast } from 'sonner';
import { useDashboardStore } from '@/hooks/use-dashboard-store';

function ModalsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const activeModal = searchParams.get('modal');
  const isOpen = activeModal === 'create-transaction';
  
  const { dashboardData } = useDashboard();
  const { createTransaction, isSubmitting } = useTransactions();
  const { activeFund } = useDashboardStore();

  const [transferToFund, setTransferToFund] = useState<Fund | null>(null);
  const [transferAmount, setTransferAmount] = useState("");
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0]);

  // Sync transfer form states from URL params
  const queryAmount = searchParams.get('amount') || "";
  const queryDate = searchParams.get('date') || new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (activeModal === 'transfer') {
      if (queryAmount) setTransferAmount(queryAmount);
      if (queryDate) setTransferDate(queryDate);
    }
  }, [activeModal, queryAmount, queryDate]);

  const setModal = (modalName: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (modalName) {
      params.set('modal', modalName);
    } else {
      params.delete('modal');
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleTransfer = async (customDate?: string) => {
    if (!transferAmount || transferAmount === '0' || !transferToFund || isSubmitting || !activeFund) return;
    
    await createTransaction({
      fundId: activeFund.id,
      toFundId: transferToFund.id,
      amount: parseInt(transferAmount),
      type: 'TRANSFER',
      date: customDate ? new Date(customDate) : new Date(),
    });
    
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
    toast.success("Chuyển tiền thành công");
    setTransferAmount("");
    setTransferToFund(null);
    setModal(null);
  };

  const onOpenTransferModal = (amount: string, date: string) => {
    setTransferAmount(amount);
    setTransferDate(date);
    setModal('transfer');
  };

  if (!activeModal) return null;
  if (!dashboardData) return null;

  return (
    <>
      <DashboardModals 
        isDistributionModalOpen={activeModal === 'distribution'}
        setDistributionModalOpen={(open) => setModal(open ? 'distribution' : null)}
        isFundSelectorOpen={activeModal === 'fund-selector'}
        setFundSelectorOpen={(open) => setModal(open ? 'fund-selector' : null)}
        isTransferModalOpen={activeModal === 'transfer'}
        setTransferModalOpen={(open) => setModal(open ? 'transfer' : null)}
        funds={dashboardData.allFunds}
        transferToFund={transferToFund}
        setTransferToFund={setTransferToFund}
        amount={transferAmount}
        setAmount={setTransferAmount}
        handleTransfer={handleTransfer}
        isSubmitting={isSubmitting}
        date={transferDate}
      />

      {/* Global quick create transaction modal (Bottom Sheet styled) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm px-0 md:px-4 py-0 md:py-6 animate-in fade-in duration-200">
          {/* Backdrop click to close */}
          <div className="absolute inset-0" onClick={() => setModal(null)} />
          
          {/* Modal content - Bottom Sheet styled on mobile, centered dialog on desktop */}
          <div className="bg-background border-t md:border border-border rounded-t-[32px] md:rounded-[32px] w-full max-w-xl max-h-[92vh] md:max-h-[85vh] overflow-y-auto flex flex-col shadow-2xl relative z-10 bottom-0 md:bottom-auto fixed md:relative transition-all duration-300 md:animate-in md:zoom-in-95 animate-in slide-in-from-bottom duration-300">
            
            {/* Header dragging handle for mobile */}
            <div className="md:hidden flex justify-center py-3 bg-card border-b border-border/10">
              <div className="w-12 h-1.5 rounded-full bg-neutral-800" />
            </div>

            {/* Header */}
            <div className="px-6 py-4 md:py-5 border-b border-border flex justify-between items-center bg-card">
              <div>
                <h3 className="text-lg font-bold text-foreground">Thêm giao dịch nhanh</h3>
                <p className="text-xs text-muted-foreground">Tạo nhanh giao dịch thu chi mới</p>
              </div>
              <button 
                onClick={() => setModal(null)}
                className="p-1.5 hover:bg-white/5 rounded-full transition-colors text-muted-foreground cursor-pointer"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            {/* Form */}
            <div className="p-6 md:p-8 bg-card flex-1">
              <TransactionForm
                allCategories={dashboardData.allCategories}
                allTemplates={dashboardData.allTemplates}
                budgetTracking={dashboardData.budgetTracking}
                onOpenTransferModal={onOpenTransferModal}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function GlobalTransactionModals() {
  return (
    <Suspense fallback={null}>
      <ModalsContent />
    </Suspense>
  );
}
