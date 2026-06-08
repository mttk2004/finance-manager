"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Transaction, TransactionType, Fund, Category, CashFlowItem, DashboardData } from "@/types";
import { DashboardHeader } from "./dashboard-header";
import { TransactionForm } from "./transaction-form";
import { FinancialInsights } from "./financial-insights";
import { CategoryBudgets } from "./category-budgets";
import { RecentTransactions } from "./recent-transactions";
import { DashboardModals } from "./dashboard-modals";
import { useDashboard } from "@/hooks/use-dashboard";
import { useTransactions } from "@/hooks/use-transactions";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

import { useEffect } from "react";
import { useDashboardStore } from "@/hooks/use-dashboard-store";

interface DashboardClientProps {
  initialData: DashboardData;
}

  export default function DashboardClient({ initialData }: DashboardClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { activeFund, setActiveFund } = useDashboardStore();

  const activeModal = searchParams.get('modal');
  const isDistributionModalOpen = activeModal === 'distribution';
  const isFundSelectorOpen = activeModal === 'fund-selector';
  const isTransferModalOpen = activeModal === 'transfer';

  const setModal = (modalName: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (modalName) {
      params.set('modal', modalName);
    } else {
      params.delete('modal');
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const [transferToFund, setTransferToFund] = useState<Fund | null>(null);
  const [transferAmount, setTransferAmount] = useState("");

  const { dashboardData } = useDashboard(initialData);
  const { createTransaction, isSubmitting } = useTransactions();

  const data = dashboardData || initialData;

  useEffect(() => {
    if (!activeFund && data.allFunds.length > 0) {
      setActiveFund(data.allFunds.find((f: Fund) => f.isDefault) || data.allFunds[0]);
    }
  }, [data.allFunds, activeFund, setActiveFund]);

  const handleTransfer = async () => {
    if (!transferAmount || transferAmount === '0' || !transferToFund || isSubmitting || !activeFund) return;
    
    await createTransaction({
      fundId: activeFund.id,
      toFundId: transferToFund.id,
      amount: parseInt(transferAmount),
      type: 'TRANSFER',
    });
    
    toast.success("Chuyển tiền thành công");
    setTransferAmount("");
    setModal(null);
  };

  // Group transactions by date
  const groupedTransactions = data.recentTransactions.reduce((acc: Record<string, Transaction[]>, tx: Transaction) => {
    const date = new Date(tx.date!);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    let dateStr = date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long' });
    if (date.toDateString() === today.toDateString()) dateStr = 'Hôm nay';
    else if (date.toDateString() === yesterday.toDateString()) dateStr = 'Hôm qua';

    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(tx);
    return acc;
  }, {});

  return (
    <>
      <DashboardModals 
        showReminder={data.showReminder}
        isDistributionModalOpen={isDistributionModalOpen}
        setDistributionModalOpen={(open) => setModal(open ? 'distribution' : null)}
        isFundSelectorOpen={isFundSelectorOpen}
        setFundSelectorOpen={(open) => setModal(open ? 'fund-selector' : null)}
        isTransferModalOpen={isTransferModalOpen}
        setTransferModalOpen={(open) => setModal(open ? 'transfer' : null)}
        funds={data.allFunds}
        transferToFund={transferToFund}
        setTransferToFund={setTransferToFund}
        amount={transferAmount}
        handleTransfer={handleTransfer}
        isSubmitting={isSubmitting}
      />

      <div className="flex flex-col w-full h-full pb-20 md:pb-8 space-y-8 md:space-y-12 max-w-5xl mx-auto mt-4 md:mt-8">
        <DashboardHeader 
          totalBalance={data.totalBalance}
          totalSpentMonth={data.totalSpentMonth}
          totalBudgetMonth={data.totalBudgetMonth}
          onOpenDistributionModal={() => setModal('distribution')}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 md:px-0">
          <div className="lg:col-span-2 space-y-8">
            <TransactionForm
              allCategories={data.allCategories}
              allTemplates={data.allTemplates}
            />

            <FinancialInsights 
              totalSpentMonth={data.totalSpentMonth}
              totalSpentLastMonth={data.totalSpentLastMonth}
              totalBudgetMonth={data.totalBudgetMonth}
              totalBalance={data.totalBalance}
              fundCount={data.allFunds.length}
            />

            <CategoryBudgets budgetTracking={data.budgetTracking} />
          </div>

          <RecentTransactions 
            groupedTransactions={groupedTransactions}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </>
  );
}
