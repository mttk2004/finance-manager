"use client";

import { useState } from "react";
import { Transaction, TransactionType, Fund, Category, CashFlowItem, DashboardData } from "@/types";
import { DashboardHeader } from "./dashboard-header";
import { TransactionForm } from "./transaction-form";
import { FinancialInsights } from "./financial-insights";
import { RecentTransactions } from "./recent-transactions";
import { useDashboard } from "@/hooks/use-dashboard";
import { useTransactions } from "@/hooks/use-transactions";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

import { useEffect, Suspense, use } from "react";
import { useDashboardStore } from "@/hooks/use-dashboard-store";

interface DashboardClientProps {
  initialData: DashboardData;
  cashFlowPromise: Promise<CashFlowItem[]>;
}

  export default function DashboardClient({ initialData, cashFlowPromise }: DashboardClientProps) {
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

  const { dashboardData } = useDashboard(initialData);
  const { isSubmitting } = useTransactions();

  const data = dashboardData || initialData;

  useEffect(() => {
    if (!activeFund && data.allFunds.length > 0) {
      setActiveFund(data.allFunds.find((f: Fund) => f.isDefault) || data.allFunds[0]);
    }
  }, [data.allFunds, activeFund, setActiveFund]);

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
      <div className="flex flex-col w-full h-full pb-20 md:pb-8 space-y-6 md:space-y-10 max-w-7xl mx-auto mt-4 md:mt-8">
        <DashboardHeader 
          totalBalance={data.totalBalance}
          totalSpentMonth={data.totalSpentMonth}
          totalBudgetMonth={data.totalBudgetMonth}
          onOpenDistributionModal={() => setModal('distribution')}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 px-4 md:px-0">
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            <TransactionForm
              allCategories={data.allCategories}
              allTemplates={data.allTemplates}
              budgetTracking={data.budgetTracking}
            />

            <FinancialInsights 
              totalSpentMonth={data.totalSpentMonth}
              totalSpentLastMonth={data.totalSpentLastMonth}
              totalBudgetMonth={data.totalBudgetMonth}
              totalBalance={data.totalBalance}
              fundCount={data.allFunds.length}
            />
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
