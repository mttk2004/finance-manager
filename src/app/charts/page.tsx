"use client";

import { useState, useEffect } from "react";
import { CashFlowChart } from "@/components/cash-flow-chart";
import { CategoryDonutChart } from "@/components/category-donut-chart";
import { TimeSeriesChart } from "@/components/time-series-chart";
import { MomLineChart } from "@/components/mom-line-chart";
import { getCashFlowData, getDashboardData, getBalanceHistory } from "@/lib/db/actions";

type Range = 'this-month' | 'last-month' | 'last-3-months' | 'last-6-months' | 'last-12-months' | 'all-time';

export default function ChartsPage() {
  const [balanceRange, setBalanceRange] = useState<Range>('last-6-months');
  const [trendRange, setTrendRange] = useState<Range>('last-6-months');
  const [barRange, setBarRange] = useState<Range>('last-6-months');
  
  const [balanceData, setBalanceData] = useState<any[]>([]);
  const [cashFlowData, setCashFlowData] = useState<any[]>([]);
  const [barData, setBarData] = useState<any[]>([]);
  const [budgetTracking, setBudgetTracking] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const [b, cf, dbData] = await Promise.all([
          getBalanceHistory(balanceRange),
          getCashFlowData(trendRange),
          getDashboardData()
        ]);
        setBalanceData(b);
        setCashFlowData(cf);
        setBarData(cf); // Sync initially
        setBudgetTracking(dbData.budgetTracking);
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
    getCashFlowData(trendRange).then(setCashFlowData);
  }, [trendRange]);

  useEffect(() => {
    getCashFlowData(barRange).then(setBarData);
  }, [barRange]);

  const topCategories = [...budgetTracking]
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 4)
    .map((cat, i) => ({
      name: cat.category?.name || 'Khác',
      amount: cat.spent,
      percent: budgetTracking.reduce((acc, curr) => acc + curr.spent, 0) > 0 
        ? Math.round((cat.spent / budgetTracking.reduce((acc, curr) => acc + curr.spent, 0)) * 100) 
        : 0,
      color: ['bg-blue-500', 'bg-orange-500', 'bg-purple-500', 'bg-emerald-500'][i % 4]
    }));

  return (
    <div className="flex flex-col w-full h-full pb-20 md:pb-8 space-y-8 md:space-y-12 max-w-5xl mx-auto mt-4 md:mt-8 px-4 md:px-0">
      <div className="mb-4">
        <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Biểu đồ & Phân tích</h1>
        <p className="text-neutral-400">Xem chi tiết dòng tiền và phân bổ chi tiêu của bạn theo thời gian.</p>
      </div>

      {/* Analytics Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#121212] border border-white/[0.04] p-6 rounded-3xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-medium text-neutral-300">Biến động số dư</h3>
            <select 
              value={balanceRange}
              onChange={(e) => setBalanceRange(e.target.value as any)}
              className="bg-[#1A1A1A] border border-white/5 text-sm text-neutral-300 rounded-lg px-3 py-1.5 focus:outline-none cursor-pointer transition-colors hover:bg-white/[0.05]"
            >
              <option value="this-month">Tháng này</option>
              <option value="last-month">Tháng trước</option>
              <option value="last-3-months">3 tháng gần nhất</option>
              <option value="last-6-months">6 tháng gần nhất</option>
              <option value="last-12-months">12 tháng gần nhất</option>
              <option value="all-time">Tất cả thời gian</option>
            </select>
          </div>
          <div className="h-80 w-full relative -ml-4">
             <TimeSeriesChart data={balanceData} />
          </div>
        </div>

        <div className="bg-[#121212] border border-white/[0.04] p-6 rounded-3xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-medium text-neutral-300">Xu hướng Thu - Chi</h3>
            <select 
              value={trendRange}
              onChange={(e) => setTrendRange(e.target.value as any)}
              className="bg-[#1A1A1A] border border-white/5 text-sm text-neutral-300 rounded-lg px-3 py-1.5 focus:outline-none cursor-pointer transition-colors hover:bg-white/[0.05]"
            >
              <option value="this-month">Tháng này</option>
              <option value="last-month">Tháng trước</option>
              <option value="last-3-months">3 tháng gần nhất</option>
              <option value="last-6-months">6 tháng gần nhất</option>
              <option value="last-12-months">12 tháng gần nhất</option>
              <option value="all-time">Tất cả thời gian</option>
            </select>
          </div>
          <div className="h-80 w-full relative -ml-4">
             <MomLineChart data={cashFlowData} />
          </div>
        </div>

        <div className="bg-[#121212] border border-white/[0.04] p-6 rounded-3xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-medium text-neutral-300">So sánh Thu - Chi (Cột)</h3>
            <select 
              value={barRange}
              onChange={(e) => setBarRange(e.target.value as any)}
              className="bg-[#1A1A1A] border border-white/5 text-sm text-neutral-300 rounded-lg px-3 py-1.5 focus:outline-none cursor-pointer transition-colors hover:bg-white/[0.05]"
            >
              <option value="this-month">Tháng này</option>
              <option value="last-month">Tháng trước</option>
              <option value="last-3-months">3 tháng gần nhất</option>
              <option value="last-6-months">6 tháng gần nhất</option>
              <option value="last-12-months">12 tháng gần nhất</option>
              <option value="all-time">Tất cả thời gian</option>
            </select>
          </div>
          <div className="h-80 w-full relative -ml-4">
             <CashFlowChart data={barData} />
          </div>
        </div>

        <div className="bg-[#121212] border border-white/[0.04] p-6 rounded-3xl flex flex-col h-auto min-h-96">
          <h3 className="text-sm font-medium text-neutral-300 mb-6 shrink-0">Phân bổ chi tiêu tháng này</h3>
          <div className="flex-1 w-full relative min-h-[250px]">
             <CategoryDonutChart data={budgetTracking} />
          </div>
        </div>

        <div className="bg-[#121212] border border-white/[0.04] p-6 rounded-3xl flex flex-col min-h-96 md:col-span-2 lg:col-span-1">
          <h3 className="text-sm font-medium text-neutral-300 mb-6 shrink-0">Top Danh mục chi nhiều nhất</h3>
          <div className="space-y-4 flex-1">
             {topCategories.length === 0 ? (
               <p className="text-xs text-neutral-600 text-center py-12">Chưa có chi tiêu</p>
             ) : (
               topCategories.map(cat => (
                 <div key={cat.name} className="flex flex-col gap-2 cursor-pointer group">
                   <div className="flex justify-between text-sm">
                     <span className="text-neutral-400 group-hover:text-white transition-colors">{cat.name}</span>
                     <span className="font-mono text-white group-hover:text-neutral-300 transition-colors">{cat.amount.toLocaleString('vi-VN')}đ</span>
                   </div>
                   <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden">
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
