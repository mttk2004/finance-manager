"use client";

import { CashFlowChart } from "@/components/cash-flow-chart";
import { CategoryDonutChart } from "@/components/category-donut-chart";

export default function ChartsPage() {
  return (
    <div className="flex flex-col w-full h-full pb-20 md:pb-8 space-y-8 md:space-y-12 max-w-5xl mx-auto mt-4 md:mt-8 px-4 md:px-0">
      <div className="mb-4">
        <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Biểu đồ & Phân tích</h1>
        <p className="text-neutral-400">Xem chi tiết dòng tiền và phân bổ chi tiêu của bạn theo thời gian.</p>
      </div>

      {/* Analytics Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#121212] border border-white/[0.04] p-6 rounded-3xl md:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-medium text-neutral-300">Dòng tiền theo tháng (MoM)</h3>
            <select className="bg-[#1A1A1A] border border-white/5 text-sm text-neutral-300 rounded-lg px-3 py-1.5 focus:outline-none">
              <option>6 tháng gần nhất</option>
              <option>Năm nay</option>
            </select>
          </div>
          <div className="h-80 w-full relative -ml-4">
             <CashFlowChart />
          </div>
        </div>

        <div className="bg-[#121212] border border-white/[0.04] p-6 rounded-3xl">
          <h3 className="text-sm font-medium text-neutral-300 mb-6">Phân bổ chi tiêu tháng này</h3>
          <div className="h-64 w-full relative">
             <CategoryDonutChart />
          </div>
        </div>

        <div className="bg-[#121212] border border-white/[0.04] p-6 rounded-3xl flex flex-col">
          <h3 className="text-sm font-medium text-neutral-300 mb-6">Top Danh mục chi nhiều nhất</h3>
          <div className="space-y-4 flex-1">
             {[
               { name: 'Ăn uống', amount: 3500000, percent: 35, color: 'bg-blue-500' },
               { name: 'Mua sắm', amount: 1800000, percent: 18, color: 'bg-orange-500' },
               { name: 'Di chuyển', amount: 1200000, percent: 12, color: 'bg-purple-500' },
               { name: 'Sinh hoạt', amount: 900000, percent: 9, color: 'bg-emerald-500' },
             ].map(cat => (
               <div key={cat.name} className="flex flex-col gap-2">
                 <div className="flex justify-between text-sm">
                   <span className="text-neutral-400">{cat.name}</span>
                   <span className="font-mono text-white">{cat.amount.toLocaleString('vi-VN')}đ</span>
                 </div>
                 <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden">
                   <div className={`h-full ${cat.color}`} style={{ width: `${cat.percent}%` }}></div>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
