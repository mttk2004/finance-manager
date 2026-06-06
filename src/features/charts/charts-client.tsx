"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { getCashFlowData, getBalanceHistory, getCategorySpendingData } from "@/server/actions/charts";
import { CustomSelect } from "@/components/ui/custom-select";
import { EmptyState } from "@/components/empty-state";
import { TrendingUp, Loader2 } from "lucide-react";
import { CashFlowItem, BalanceHistory, CategorySpending } from "@/types";
import { useQuery } from "@tanstack/react-query";

const CashFlowChart = dynamic(() => import("@/components/cash-flow-chart").then(mod => mod.CashFlowChart), { ssr: false });
const CategoryDonutChart = dynamic(() => import("@/components/category-donut-chart").then(mod => mod.CategoryDonutChart), { ssr: false });
const TimeSeriesChart = dynamic(() => import("@/components/time-series-chart").then(mod => mod.TimeSeriesChart), { ssr: false });
const MomLineChart = dynamic(() => import("@/components/mom-line-chart").then(mod => mod.MomLineChart), { ssr: false });

import { QUERY_KEYS, DATE_RANGE_OPTIONS } from "@/lib/constants";

type Range = typeof DATE_RANGE_OPTIONS[number]['value'];

interface ChartsClientProps {
  initialBalance: BalanceHistory[];
  initialTrend: CashFlowItem[];
  initialCategory: CategorySpending[];
}

const rangeOptions = DATE_RANGE_OPTIONS;

interface ChartWrapperProps {
  title: string;
  children: React.ReactNode;
  range: string;
  setRange: (range: string) => void;
  isFetching: boolean;
}

const ChartWrapper = ({ title, children, range, setRange, isFetching }: ChartWrapperProps) => (
  <div className="bg-card border border-border p-6 rounded-3xl relative overflow-hidden group">
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium text-foreground/80">{title}</h3>
        {isFetching && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
      </div>
      <CustomSelect 
        value={range}
        onChange={(e) => setRange(e.target.value)}
        options={rangeOptions}
      />
    </div>
    <div className={`transition-opacity duration-300 ${isFetching ? 'opacity-40' : 'opacity-100'}`}>
      {children}
    </div>
  </div>
);

export default function ChartsClient({ initialBalance, initialTrend, initialCategory }: ChartsClientProps) {
  const [balanceRange, setBalanceRange] = useState<string>('this-month');
  const [trendRange, setTrendRange] = useState<string>('this-month');
  const [barRange, setBarRange] = useState<string>('this-month');
  const [categoryRange, setCategoryRange] = useState<string>('this-month');
  const [topRange, setTopRange] = useState<string>('this-month');
  
  // React Query for fine-grained loading states
  const balanceQuery = useQuery({
    queryKey: QUERY_KEYS.BALANCE_HISTORY(balanceRange),
    queryFn: () => getBalanceHistory(balanceRange as any),
    initialData: balanceRange === 'this-month' ? initialBalance : undefined,
  });

  const trendQuery = useQuery({
    queryKey: QUERY_KEYS.CASH_FLOW_TREND(trendRange),
    queryFn: () => getCashFlowData(trendRange as any),
    initialData: trendRange === 'this-month' ? initialTrend : undefined,
  });

  const barQuery = useQuery({
    queryKey: QUERY_KEYS.CASH_FLOW_BAR(barRange),
    queryFn: () => getCashFlowData(barRange as any),
    initialData: barRange === 'this-month' ? initialTrend : undefined,
  });

  const categoryQuery = useQuery({
    queryKey: QUERY_KEYS.CATEGORY_SPENDING(categoryRange),
    queryFn: () => getCategorySpendingData(categoryRange as any),
    initialData: categoryRange === 'this-month' ? initialCategory : undefined,
  });

  const topQuery = useQuery({
    queryKey: QUERY_KEYS.TOP_SPENDING(topRange),
    queryFn: () => getCategorySpendingData(topRange as any),
    initialData: topRange === 'this-month' ? initialCategory : undefined,
  });

  const getTopCategories = (data: CategorySpending[]) => {
    const total = data.reduce((acc, curr) => acc + curr.spent, 0);
    return [...data]
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 4)
      .map((cat, i) => ({
        name: cat.category?.name || cat.name || 'Khác',
        amount: cat.spent,
        percent: total > 0 ? Math.round((cat.spent / total) * 100) : 0,
        color: ['bg-blue-500', 'bg-orange-500', 'bg-purple-500', 'bg-emerald-500'][i % 4]
      }));
  };

  const topCategories = getTopCategories(topQuery.data || []);

  return (
    <div className="flex flex-col w-full h-full pb-20 md:pb-8 space-y-8 md:space-y-12 max-w-5xl mx-auto mt-4 md:mt-8 px-4 md:px-0">
      <div className="mb-4">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2">Biểu đồ & Phân tích</h1>
        <p className="text-muted-foreground">Xem chi tiết dòng tiền và phân bổ chi tiêu của bạn theo thời gian.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartWrapper title="Biến động số dư" range={balanceRange} setRange={setBalanceRange} isFetching={balanceQuery.isFetching}>
          <div className="h-80 w-full relative -ml-4">
             <TimeSeriesChart data={balanceQuery.data || []} />
          </div>
        </ChartWrapper>

        <ChartWrapper title="Xu hướng Thu - Chi" range={trendRange} setRange={setTrendRange} isFetching={trendQuery.isFetching}>
          <div className="h-80 w-full relative -ml-4">
             <MomLineChart data={trendQuery.data || []} />
          </div>
        </ChartWrapper>

        <ChartWrapper title="So sánh Thu - Chi (Cột)" range={barRange} setRange={setBarRange} isFetching={barQuery.isFetching}>
          <div className="h-80 w-full relative -ml-4">
             <CashFlowChart data={barQuery.data || []} />
          </div>
        </ChartWrapper>

        <ChartWrapper title="Phân bổ chi tiêu" range={categoryRange} setRange={setCategoryRange} isFetching={categoryQuery.isFetching}>
          <div className="flex-1 w-full relative min-h-[250px]">
             <CategoryDonutChart data={categoryQuery.data || []} />
          </div>
        </ChartWrapper>

        <div className="bg-card border border-border p-6 rounded-3xl flex flex-col min-h-96 md:col-span-2 lg:col-span-1 relative overflow-hidden group">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-foreground/80">Top Chi tiêu</h3>
              {topQuery.isFetching && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
            </div>
            <CustomSelect 
              value={topRange}
              onChange={(e) => setTopRange(e.target.value as Range)}
              options={rangeOptions}
            />
          </div>
          <div className={`space-y-4 flex-1 transition-opacity duration-300 ${topQuery.isFetching ? 'opacity-40' : 'opacity-100'}`}>
             {topCategories.length === 0 ? (
               <EmptyState 
                 icon={TrendingUp}
                 title="Chưa có dữ liệu chi tiêu"
                 description="Dữ liệu chi tiêu của bạn sẽ được hiển thị tại đây."
                 className="py-12"
               />
             ) : (
               topCategories.map(cat => (
                 <div key={cat.name} className="flex flex-col gap-2 cursor-pointer group/item">
                   <div className="flex justify-between text-sm">
                     <span className="text-muted-foreground group-hover/item:text-foreground transition-colors">{cat.name}</span>
                     <span className="font-mono text-foreground group-hover/item:text-muted-foreground transition-colors">{cat.amount.toLocaleString('vi-VN')}đ</span>
                   </div>
                   <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                     <div className={`h-full ${cat.color}`} style={{ width: `${cat.percent}%` }}></div>
                   </div>
                 </div>
               ))
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
