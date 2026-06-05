"use client";

import { useState, useTransition } from "react";
import { createTransaction, deleteTransaction, getDashboardData } from "@/lib/db/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Transaction, TransactionType, Fund, Category, CashFlowItem } from "@/types";
import { DashboardHeader } from "@/features/dashboard/DashboardHeader";
import { TransactionForm } from "@/features/dashboard/TransactionForm";
import { FinancialInsights } from "@/features/dashboard/FinancialInsights";
import { CategoryBudgets } from "@/features/dashboard/CategoryBudgets";
import { RecentTransactions } from "@/features/dashboard/RecentTransactions";
import { DashboardModals } from "@/features/dashboard/DashboardModals";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const [isDistributionModalOpen, setDistributionModalOpen] = useState(false);
  const [isFundSelectorOpen, setFundSelectorOpen] = useState(false);
  const [isTransferModalOpen, setTransferModalOpen] = useState(false);
  const [transferToFund, setTransferToFund] = useState<Fund | null>(null);
  const [transferAmount, setTransferAmount] = useState("");

  // 1. React Query for SWR performance
  const { data: dashboardData } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => getDashboardData(),
    initialData: initialData,
    staleTime: 30000, // 30 seconds
  });

  const data = dashboardData || initialData;

  const [activeFund, setActiveFund] = useState<Fund>(
    data.allFunds.find(f => f.isDefault) || data.allFunds[0]
  );

  // 2. Mutations for instant feedback
  const createTxMutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      // Also trigger a router refresh to keep server components in sync if any
      startTransition(() => {
        router.refresh();
      });
    },
    onError: () => {
      toast.error("Lỗi khi thực hiện giao dịch");
    }
  });

  const deleteTxMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      startTransition(() => {
        router.refresh();
      });
    }
  });

  const handleTransaction = async (type: TransactionType, amount: string, note: string) => {
    if (!amount || amount === '0' || createTxMutation.isPending) return;
    
    createTxMutation.mutate({
      fundId: activeFund.id,
      amount: parseInt(amount),
      type,
      note,
    }, {
      onSuccess: (newTx) => {
        toast.success(
          type === 'INCOME' ? "Đã ghi nhận thu nhập" :
          type === 'EXPENSE' ? "Đã ghi nhận chi tiêu" : "Đã ghi nhận giao dịch",
          {
            description: `${parseInt(amount).toLocaleString('vi-VN')}đ từ ${activeFund.name}`,
            duration: 5000,
            action: {
              label: "Hoàn tác",
              onClick: () => deleteTxMutation.mutate(newTx.id)
            }
          }
        );
      }
    });
  };

  const handleTransfer = async () => {
    if (!transferAmount || transferAmount === '0' || !transferToFund || createTxMutation.isPending) return;
    
    createTxMutation.mutate({
      fundId: activeFund.id,
      toFundId: transferToFund.id,
      amount: parseInt(transferAmount),
      type: 'TRANSFER',
    }, {
      onSuccess: () => {
        toast.success("Chuyển tiền thành công");
        setTransferAmount("");
        setTransferModalOpen(false);
      }
    });
  };

  // Group transactions by date
  const groupedTransactions = data.recentTransactions.reduce((acc: Record<string, Transaction[]>, tx) => {
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
        setDistributionModalOpen={setDistributionModalOpen}
        isFundSelectorOpen={isFundSelectorOpen}
        setFundSelectorOpen={setFundSelectorOpen}
        isTransferModalOpen={isTransferModalOpen}
        setTransferModalOpen={setTransferModalOpen}
        activeFund={activeFund}
        funds={data.allFunds}
        onSelectFund={setActiveFund}
        transferToFund={transferToFund}
        setTransferToFund={setTransferToFund}
        amount={transferAmount}
        handleTransfer={handleTransfer}
        isSubmitting={createTxMutation.isPending}
        isPending={isPending}
      />

      <div className="flex flex-col w-full h-full pb-20 md:pb-8 space-y-8 md:space-y-12 max-w-5xl mx-auto mt-4 md:mt-8">
        <DashboardHeader 
          totalBalance={data.totalBalance}
          totalSpentMonth={data.totalSpentMonth}
          totalBudgetMonth={data.totalBudgetMonth}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 md:px-0">
          <div className="lg:col-span-2 space-y-8">
            <TransactionForm 
              activeFund={activeFund}
              allCategories={data.allCategories}
              allTemplates={data.allTemplates}
              onOpenFundSelector={() => setFundSelectorOpen(true)}
              onOpenTransferModal={() => setTransferModalOpen(true)}
              handleTransaction={handleTransaction}
              isSubmitting={createTxMutation.isPending}
              isPending={isPending}
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
            isSubmitting={createTxMutation.isPending}
            isPending={isPending}
          />
        </div>
      </div>
    </>
  );
}
