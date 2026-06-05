"use client";

import { useState } from "react";
import { getDashboardData } from "@/server/actions/dashboard";
import { createTransaction, deleteTransaction } from "@/server/actions/transactions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Transaction, TransactionType, Fund, Category, CashFlowItem } from "@/types";
import { DashboardHeader } from "./dashboard-header";
import { TransactionForm } from "./transaction-form";
import { FinancialInsights } from "./financial-insights";
import { CategoryBudgets } from "./category-budgets";
import { RecentTransactions } from "./recent-transactions";
import { DashboardModals } from "./dashboard-modals";
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

  // 2. Mutations with Optimistic Updates
  const createTxMutation = useMutation({
    mutationFn: createTransaction,
    onMutate: async (newTxData) => {
      await queryClient.cancelQueries({ queryKey: ['dashboard'] });
      const previousData = queryClient.getQueryData<DashboardData>(['dashboard']);
      
      if (previousData) {
        const amount = newTxData.amount;
        const type = newTxData.type;
        const isPlus = type === 'INCOME' || type === 'BORROW';
        
        queryClient.setQueryData(['dashboard'], {
          ...previousData,
          totalBalance: isPlus ? previousData.totalBalance + amount : previousData.totalBalance - amount,
          totalSpentMonth: type === 'EXPENSE' ? previousData.totalSpentMonth + amount : previousData.totalSpentMonth,
          recentTransactions: [
            {
              id: 'temp-' + Date.now(),
              amount: amount,
              type: type,
              date: new Date(),
              note: newTxData.note || null,
              fund: { name: activeFund.name },
              category: previousData.allCategories.find(c => c.id === newTxData.categoryId) || null
            },
            ...previousData.recentTransactions
          ].slice(0, 5)
        });
      }
      return { previousData };
    },
    onSuccess: (newTx, variables) => {
      toast.success(
        variables.type === 'INCOME' ? "Đã ghi nhận thu nhập" :
        variables.type === 'EXPENSE' ? "Đã ghi nhận chi tiêu" : "Đã ghi nhận giao dịch",
        {
          description: `${variables.amount.toLocaleString('vi-VN')}đ từ ${activeFund.name}`,
          duration: 5000,
          action: {
            label: "Hoàn tác",
            onClick: () => deleteTxMutation.mutate(newTx.id)
          }
        }
      );
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['dashboard'], context.previousData);
      }
      toast.error("Lỗi khi thực hiện giao dịch");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['balanceHistory'] });
      queryClient.invalidateQueries({ queryKey: ['cashFlowTrend'] });
      queryClient.invalidateQueries({ queryKey: ['cashFlowBar'] });
      queryClient.invalidateQueries({ queryKey: ['categorySpending'] });
      queryClient.invalidateQueries({ queryKey: ['topSpending'] });
    }
  });

  const deleteTxMutation = useMutation({
    mutationFn: deleteTransaction,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['dashboard'] });
      const previousData = queryClient.getQueryData<DashboardData>(['dashboard']);
      
      if (previousData) {
        const txToDelete = previousData.recentTransactions.find(t => t.id === id);
        if (txToDelete) {
          const isPlus = txToDelete.type === 'INCOME' || txToDelete.type === 'BORROW';
          queryClient.setQueryData(['dashboard'], {
            ...previousData,
            totalBalance: isPlus ? previousData.totalBalance - txToDelete.amount : previousData.totalBalance + txToDelete.amount,
            recentTransactions: previousData.recentTransactions.filter(t => t.id !== id)
          });
        }
      }
      return { previousData };
    },
    onSuccess: () => {
      toast.success("Đã hoàn tác giao dịch");
    },
    onError: (err, id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['dashboard'], context.previousData);
      }
      toast.error("Không thể hoàn tác giao dịch");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['balanceHistory'] });
      queryClient.invalidateQueries({ queryKey: ['cashFlowTrend'] });
      queryClient.invalidateQueries({ queryKey: ['cashFlowBar'] });
      queryClient.invalidateQueries({ queryKey: ['categorySpending'] });
      queryClient.invalidateQueries({ queryKey: ['topSpending'] });
    }
  });

  const handleTransaction = async (type: TransactionType, amount: string, note: string) => {
    if (!amount || amount === '0' || createTxMutation.isPending) return;
    
    createTxMutation.mutate({
      fundId: activeFund.id,
      amount: parseInt(amount),
      type,
      note,
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
          />
        </div>
      </div>
    </>
  );
}
