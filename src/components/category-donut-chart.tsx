'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#f43f5e', '#ec4899', '#06b6d4'];

interface CategoryDonutChartProps {
  data: {
    category?: {
      name: string;
    } | null;
    spent: number;
  }[];
}

export function CategoryDonutChart({ data }: CategoryDonutChartProps) {
  const chartData = data
    .filter(item => item.spent > 0)
    .map(item => ({
      name: item.category?.name || 'Khác',
      value: item.spent
    }));

  const totalSpent = chartData.reduce((acc, curr) => acc + curr.value, 0);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-neutral-600 text-xs">
        Chưa có chi tiêu trong tháng này
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={90}
            paddingAngle={4}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(23, 23, 23, 0.9)', 
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.08)', 
              borderRadius: '20px', 
              fontSize: '12px', 
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
              padding: '12px'
            }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value))}
            labelStyle={{ color: '#888', marginBottom: '8px', fontWeight: 'bold' }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1">Tổng chi</span>
        <span className="text-lg font-mono font-bold text-white">
          {(totalSpent / 1000000).toFixed(1)}M
        </span>
      </div>
    </div>
  );
}
