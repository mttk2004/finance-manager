'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const data = [
  { name: 'T5', income: 4000000, expense: 2400000 },
  { name: 'T6', income: 3000000, expense: 1398000 },
  { name: 'T7', income: 2000000, expense: 9800000 },
  { name: 'CN', income: 2780000, expense: 3908000 },
  { name: 'T2', income: 1890000, expense: 4800000 },
  { name: 'T3', income: 2390000, expense: 3800000 },
  { name: 'T4', income: 3490000, expense: 4300000 },
];

export function CashFlowChart() {
  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 0,
            left: -20,
            bottom: 0,
          }}
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
            formatter={(value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}
          />
          <Bar dataKey="income" fill="#10b981" radius={[2, 2, 0, 0]} maxBarSize={12} />
          <Bar dataKey="expense" fill="#f43f5e" radius={[2, 2, 0, 0]} maxBarSize={12} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
