'use client';

import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface CashFlowData {
  name: string;
  income: number;
  expense: number;
}

export function CashFlowChart({ data }: { data: CashFlowData[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-neutral-600 text-xs">
        Không có dữ liệu
      </div>
    );
  }

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
              backgroundColor: 'rgba(23, 23, 23, 0.9)', 
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.08)', 
              borderRadius: '20px', 
              fontSize: '12px', 
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
              padding: '12px'
            }}
            itemStyle={{ padding: '2px 0' }}
            labelStyle={{ color: '#888', marginBottom: '8px', fontWeight: 'bold' }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any, name: any) => {
              const label = name === 'income' ? 'Thu nhập' : 'Chi tiêu';
              return [new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value)), label];
            }}
          />
          <Bar name="income" dataKey="income" fill="url(#colorIncome)" radius={[6, 6, 0, 0]} maxBarSize={24} />
          <Bar name="expense" dataKey="expense" fill="url(#colorExpense)" radius={[6, 6, 0, 0]} maxBarSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
