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
    <div className="h-full w-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#525252', fontWeight: 500 }} 
            dy={15} 
          />
          <Tooltip 
            cursor={{fill: 'rgba(255, 255, 255, 0.03)'}}
            contentStyle={{ 
              backgroundColor: 'rgba(23, 23, 23, 0.8)', 
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.05)', 
              borderRadius: '16px', 
              fontSize: '12px', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any) => [new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value)), '']}
          />
          <Bar dataKey="income" fill="url(#colorIncome)" radius={[6, 6, 0, 0]} maxBarSize={24} />
          <Bar dataKey="expense" fill="url(#colorExpense)" radius={[6, 6, 0, 0]} maxBarSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
