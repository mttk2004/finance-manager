"use client";

import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const data = [
  { name: 'T5', income: 15000000, expense: 12000000 },
  { name: 'T6', income: 15000000, expense: 14000000 },
  { name: 'T7', income: 18000000, expense: 13500000 },
  { name: 'T8', income: 15000000, expense: 16000000 },
  { name: 'T9', income: 16000000, expense: 11000000 },
  { name: 'T10', income: 15000000, expense: 4000000 },
];

export function MomLineChart() {
  return (
    <div className="h-full w-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 10, left: 10, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#737373', fontFamily: 'monospace' }} 
            dy={15} 
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#171717', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '13px', color: '#fff' }}
            formatter={(value: number | string) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value))}
            labelStyle={{ color: '#a3a3a3', marginBottom: '4px' }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#a3a3a3' }} />
          <Line 
            name="Thu vào"
            type="monotone" 
            dataKey="income" 
            stroke="#10b981" 
            strokeWidth={3}
            dot={{ fill: '#10b981', strokeWidth: 2, r: 4, stroke: '#121212' }}
            activeDot={{ r: 6, strokeWidth: 0, fill: '#34d399' }}
          />
          <Line 
            name="Chi ra"
            type="monotone" 
            dataKey="expense" 
            stroke="#f43f5e" 
            strokeWidth={3}
            dot={{ fill: '#f43f5e', strokeWidth: 2, r: 4, stroke: '#121212' }}
            activeDot={{ r: 6, strokeWidth: 0, fill: '#fb7185' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
