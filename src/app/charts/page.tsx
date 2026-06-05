"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { getCashFlowData, getDashboardData, getBalanceHistory, getCategorySpendingData } from "@/lib/db/actions";
import { CustomSelect } from "@/components/ui/custom-select";
import { EmptyState } from "@/components/empty-state";
import { TrendingUp } from "lucide-react";

const CashFlowChart = dynamic(() => import("@/components/cash-flow-chart").then(mod => mod.CashFlowChart), { ssr: false });
const CategoryDonutChart = dynamic(() => import("@/components/category-donut-chart").then(mod => mod.CategoryDonutChart), { ssr: false });
const TimeSeriesChart = dynamic(() => import("@/components/time-series-chart").then(mod => mod.TimeSeriesChart), { ssr: false });
const MomLineChart = dynamic(() => import("@/components/mom-line-chart").then(mod => mod.MomLineChart), { ssr: false });

type Range = 'this-month' | 'last-month' | 'last-3-months' | 'last-6-months' | 'last-12-months' | 'all-time';

export default function ChartsPage() {
  const [balanceRange, setBalanceRange] = useState<Range>('this-month');
  const [trendRange, setTrendRange] = useState<Range>('this-month');
  const [barRange, setBarRange] = useState<Range>('this-month');
  const [categoryRange, setCategoryRange] = useState<Range>('this-month');
  const [topRange, setTopRange] = useState<Range>('this-month');
  
  const [balanceData, setBalanceData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [barData, setBarData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [topCategoryData, setTopCategoryData] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const [b, trend, cat] = await Promise.all([
          getBalanceHistory('this-month'),
          getCashFlowData('this-month'),
          getCategorySpendingData('this-month')
        ]);
        setBalanceData(b);
        setTrendData(trend);
        setBarData(trend);
        setCategoryData(cat);
        setTopCategoryData(cat);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitial();
  }, []);

  // Individual range handlers
  useEffect(() => {
    getBalanceHistory(balanceRange).then(setBalanceData);
  }, [balanceRange]);

  useEffect(() => {
    getCashFlowData(trendRange).then(setTrendData);
  }, [trendRange]);

  useEffect(() => {
    getCashFlowData(barRange).then(setBarData);
  }, [barRange]);

  useEffect(() => {
    getCategorySpendingData(categoryRange).then(setCategoryData);
  }, [categoryRange]);

  useEffect(() => {
    getCategorySpendingData(topRange).then(setTopCategoryData);
  }, [topRange]);

  const getTopCategories = (data: any[]) => {
    const total = data.reduce((acc, curr) => acc + curr.spent, 0);
    return [...data]
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 4)
      .map((cat, i) => ({
        name: cat.category?.name || 'Khác',
        amount: cat.spent,
        percent: total > 0 ? Math.round((cat.spent / total) * 100) : 0,
        color: ['bg-blue-500', 'bg-orange-500', 'bg-purple-500', 'bg-emerald-500'][i % 4]
      }));
  };

  const topCategories = getTopCategories(topCategoryData);

  const rangeOptions = [
    { value: "this-month", label: "Tháng này" },
    { value: "last-month", label: "Tháng trước" },
    { value: "last-3-months", label: "3 tháng gần nhất" },
    { value: "last-6-months", label: "6 tháng gần nhất" },
    { value: "last-12-months", label: "12 tháng gần nhất" },
    { value: "all-time", label: "Tất cả thời gian" },
  ];

  return (
    <div className="flex flex-col w-full h-full pb-20 md:pb-8 space-y-8 md:space-y-12 max-w-5xl mx-auto mt-4 md:mt-8 px-4 md:px-0">
      <div className="mb-4">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2">Biểu đồ & Phân tích</h1>
        <p className="text-muted-foreground">Xem chi tiết dòng tiền và phân bổ chi tiêu của bạn theo thời gian.</p>
      </div>

      {/* Analytics Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border p-6 rounded-3xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-medium text-foreground/80">Biến động số dư</h3>
            <CustomSelect 
              value={balanceRange}
              onChange={(e) => setBalanceRange(e.target.value as any)}
              options={rangeOptions}
            />
          </div>
          <div className="h-80 w-full relative -ml-4">
             <TimeSeriesChart data={balanceData} />
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-3xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-medium text-foreground/80">Xu hướng Thu - Chi</h3>
            <CustomSelect 
              value={trendRange}
              onChange={(e) => setTrendRange(e.target.value as any)}
              options={rangeOptions}
            />
          </div>
          <div className="h-80 w-full relative -ml-4">
             <MomLineChart data={trendData} />
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-3xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-medium text-foreground/80">So sánh Thu - Chi (Cột)</h3>
            <CustomSelect 
              value={barRange}
              onChange={(e) => setBarRange(e.target.value as any)}
              options={rangeOptions}
            />
          </div>
          <div className="h-80 w-full relative -ml-4">
             <CashFlowChart data={barData} />
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-3xl flex flex-col h-auto min-h-96 relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-medium text-foreground/80">Phân bổ chi tiêu</h3>
            <CustomSelect 
              value={categoryRange}
              onChange={(e) => setCategoryRange(e.target.value as any)}
              options={rangeOptions}
            />
          </div>
          <div className="flex-1 w-full relative min-h-[250px]">
             <CategoryDonutChart data={categoryData} />
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-3xl flex flex-col min-h-96 md:col-span-2 lg:col-span-1 relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-medium text-foreground/80">Top Chi tiêu</h3>
            <CustomSelect 
              value={topRange}
              onChange={(e) => setTopRange(e.target.value as any)}
              options={rangeOptions}
            />
          </div>
          <div className="space-y-4 flex-1">
             {topCategories.length === 0 ? (
               <EmptyState 
                 icon={TrendingUp}
                 title="Chưa có dữ liệu chi tiêu"
                 description="Dữ liệu chi tiêu của bạn sẽ được hiển thị tại đây."
                 className="py-12"
               />
             ) : (
               topCategories.map(cat => (
                 <div key={cat.name} className="flex flex-col gap-2 cursor-pointer group">
                   <div className="flex justify-between text-sm">
                     <span className="text-muted-foreground group-hover:text-foreground transition-colors">{cat.name}</span>
                     <span className="font-mono text-foreground group-hover:text-muted-foreground transition-colors">{cat.amount.toLocaleString('vi-VN')}đ</span>
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
