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
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 w-full relative min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius="65%"
              outerRadius="90%"
              paddingAngle={5}
              dataKey="value"
              stroke="none"
              animationBegin={0}
              animationDuration={1500}
              animationEasing="ease-out"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(23, 23, 23, 0.95)', 
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '24px', 
                fontSize: '13px', 
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)',
                padding: '16px',
                zIndex: 100
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any, name: any) => [
                <span key={name} className="font-mono font-bold text-foreground">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value))}
                </span>,
                <span key={`${name}-label`} className="text-muted-foreground">{name}</span>
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none translate-y-1">
          <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold mb-1 opacity-50">Tổng chi</span>
          <span className="text-2xl font-mono font-bold text-foreground tracking-tighter">
            {(totalSpent / 1000000).toFixed(1)}<span className="text-muted-foreground text-sm ml-0.5">M</span>
          </span>
        </div>
      </div>
      
      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 px-2">
        {chartData.map((entry, index) => (
          <div key={entry.name} className="flex items-center gap-2 overflow-hidden">
            <div 
              className="w-1.5 h-1.5 rounded-full shrink-0" 
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-[10px] text-muted-foreground font-medium truncate uppercase tracking-wider">
              {entry.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
