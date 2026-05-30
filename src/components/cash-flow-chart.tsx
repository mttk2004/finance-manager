'use client';

import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Tháng 5', income: 15000000, expense: 12000000 },
  { name: 'Tháng 6', income: 15000000, expense: 14000000 },
  { name: 'Tháng 7', income: 18000000, expense: 13500000 },
  { name: 'Tháng 8', income: 15000000, expense: 16000000 },
  { name: 'Tháng 9', income: 16000000, expense: 11000000 },
  { name: 'Tháng 10', income: 15000000, expense: 4000000 },
];

export function CashFlowChart() {
  return (
    <div className="h-40 w-full relative -ml-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
        >
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#737373' }} 
            dy={10} 
          />
          <Tooltip 
            cursor={{fill: 'rgba(255, 255, 255, 0.05)'}}
            contentStyle={{ backgroundColor: '#171717', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
            formatter={(value: any) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value))}
          />
          <Bar dataKey="income" fill="#10b981" radius={[2, 2, 0, 0]} maxBarSize={12} />
          <Bar dataKey="expense" fill="#f43f5e" radius={[2, 2, 0, 0]} maxBarSize={12} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
