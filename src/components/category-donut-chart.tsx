'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
  { name: 'Ăn uống', value: 4500000 },
  { name: 'Di chuyển', value: 1200000 },
  { name: 'Nhà cửa', value: 5000000 },
  { name: 'Mua sắm', value: 2000000 },
  { name: 'Sức khỏe', value: 800000 },
];

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#f43f5e'];

export function CategoryDonutChart() {
  return (
    <div className="h-40 w-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={60}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#171717', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
            formatter={(value: any) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value))}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[10px] text-neutral-500 uppercase">Tổng chi</span>
        <span className="text-sm font-mono font-medium text-white">13.5M</span>
      </div>
    </div>
  );
}
