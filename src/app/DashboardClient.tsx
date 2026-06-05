"use client";

import { useState, useTransition } from "react";
import { createTransaction, deleteTransaction } from "@/lib/db/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Transaction, TransactionType, Fund, Category, CashFlowItem } from "@/types";
import { DashboardHeader } from "@/features/dashboard/DashboardHeader";
import { TransactionForm } from "@/features/dashboard/TransactionForm";
import { FinancialInsights } from "@/features/dashboard/FinancialInsights";
import { CategoryBudgets } from "@/features/dashboard/CategoryBudgets";
import { RecentTransactions } from "@/features/dashboard/RecentTransactions";
import { DashboardModals } from "@/features/dashboard/DashboardModals";

interface DashboardData {
  allFunds: Fund[];
  recentTransactions: Transaction[];
  totalBalance: number;
  showReminder: boolean;
  budgetTracking: {
    id: string;
    spent: number;
    amountLimit: number;
    category?: {
      icon: string | null;
      name: string;
    } | null;
  }[];
  totalSpentMonth: number;
  totalSpentLastMonth: number;
  totalBudgetMonth: number;
  currentMonthPeriod: string;
  allCategories: Category[];
  initialCashFlow: CashFlowItem[];
  allTemplates: {
    id: string;
    title: string;
    amount: number | null;
    notePreset: string | null;
    category?: { icon: string | null } | null;
  }[];
}

interface DashboardClientProps {
  initialData: DashboardData;
}

export default function DashboardClient({ initialData }: DashboardClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDistributionModalOpen, setDistributionModalOpen] = useState(false);
  const [isFundSelectorOpen, setFundSelectorOpen] = useState(false);
  const [isTransferModalOpen, setTransferModalOpen] = useState(false);
  const [transferToFund, setTransferToFund] = useState<Fund | null>(null);
  const [activeFund, setActiveFund] = useState<Fund>(
    initialData.allFunds.find(f => f.isDefault) || initialData.allFunds[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transferAmount, setTransferAmount] = useState("");

  const handleTransaction = async (type: TransactionType, amount: string, note: string) => {
    if (!amount || amount === '0' || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const newTx = await createTransaction({
        fundId: activeFund.id,
        amount: parseInt(amount),
        type,
        note,
      });
      
      toast.success(
        type === 'INCOME' ? "Đã ghi nhận thu nhập" :
        type === 'EXPENSE' ? "Đã ghi nhận chi tiêu" : "Đã ghi nhận giao dịch",
        {
          description: `${parseInt(amount).toLocaleString('vi-VN')}đ từ ${activeFund.name}`,
          duration: 5000,
          action: {
            label: "Hoàn tác",
            onClick: async () => {
              try {
                await deleteTransaction(newTx.id);
                toast.success("Đã hoàn tác giao dịch");
                startTransition(() => {
                  router.refresh();
                });
              } catch {
                toast.error("Không thể hoàn tác giao dịch");
              }
            }
          }
        }
      );

      startTransition(() => {
        router.refresh();
      });
    } catch {
      toast.error("Lỗi khi thực hiện giao dịch");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTransfer = async () => {
    if (!transferAmount || transferAmount === '0' || !transferToFund || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await createTransaction({
        fundId: activeFund.id,
        toFundId: transferToFund.id,
        amount: parseInt(transferAmount),
        type: 'TRANSFER',
      });
      
      toast.success("Chuyển tiền thành công");
      setTransferAmount("");
      setTransferModalOpen(false);
      startTransition(() => {
        router.refresh();
      });
    } catch {
      toast.error("Lỗi khi chuyển tiền");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group transactions by date
  const groupedTransactions = initialData.recentTransactions.reduce((acc: Record<string, Transaction[]>, tx) => {
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
        showReminder={initialData.showReminder}
        isDistributionModalOpen={isDistributionModalOpen}
        setDistributionModalOpen={setDistributionModalOpen}
        isFundSelectorOpen={isFundSelectorOpen}
        setFundSelectorOpen={setFundSelectorOpen}
        isTransferModalOpen={isTransferModalOpen}
        setTransferModalOpen={setTransferModalOpen}
        activeFund={activeFund}
        funds={initialData.allFunds}
        onSelectFund={setActiveFund}
        transferToFund={transferToFund}
        setTransferToFund={setTransferToFund}
        amount={transferAmount}
        handleTransfer={handleTransfer}
        isSubmitting={isSubmitting}
      />

      <div className="flex flex-col w-full h-full pb-20 md:pb-8 space-y-8 md:space-y-12 max-w-5xl mx-auto mt-4 md:mt-8">
        <DashboardHeader 
          totalBalance={initialData.totalBalance}
          totalSpentMonth={initialData.totalSpentMonth}
          totalBudgetMonth={initialData.totalBudgetMonth}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 md:px-0">
          <div className="lg:col-span-2 space-y-8">
            <TransactionForm 
              activeFund={activeFund}
              allCategories={initialData.allCategories}
              allTemplates={initialData.allTemplates}
              onOpenFundSelector={() => setFundSelectorOpen(true)}
              onOpenTransferModal={() => setTransferModalOpen(true)}
              handleTransaction={handleTransaction}
              isSubmitting={isSubmitting}
            />

            <FinancialInsights 
              totalSpentMonth={initialData.totalSpentMonth}
              totalSpentLastMonth={initialData.totalSpentLastMonth}
              totalBudgetMonth={initialData.totalBudgetMonth}
              totalBalance={initialData.totalBalance}
              fundCount={initialData.allFunds.length}
            />

            <CategoryBudgets budgetTracking={initialData.budgetTracking} />
          </div>

          <RecentTransactions 
            groupedTransactions={groupedTransactions}
            isSubmitting={isSubmitting}
            isPending={isPending}
          />
        </div>
      </div>
    </>
  );
}
