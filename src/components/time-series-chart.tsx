"use client";

import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const data = [
  { name: 'T5', balance: 35000000 },
  { name: 'T6', balance: 36000000 },
  { name: 'T7', balance: 40500000 },
  { name: 'T8', balance: 39500000 },
  { name: 'T9', balance: 44500000 },
  { name: 'T10', balance: 45500000 },
];

export function TimeSeriesChart() {
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
          <Line 
            type="monotone" 
            dataKey="balance" 
            stroke="#3b82f6" 
            strokeWidth={4}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4, stroke: '#121212' }}
            activeDot={{ r: 6, strokeWidth: 0, fill: '#60a5fa' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
