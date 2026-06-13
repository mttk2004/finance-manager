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
            cursor={{fill: 'rgba(255, 255, 255, 0.05)', stroke: 'rgba(255, 255, 255, 0.1)', strokeWidth: 1}}
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
            itemStyle={{ padding: '4px 0' }}
            labelStyle={{ color: '#aaa', marginBottom: '10px', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any, name: any) => {
              const label = name === 'income' ? 'Thu nhập' : 'Chi tiêu';
              return [
                <span key={name} className="font-mono font-bold text-foreground">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value))}
                </span>, 
                <span key={`${name}-label`} className={name === 'income' ? 'text-emerald-400' : 'text-rose-400'}>{label}</span>
              ];
            }}
          />
          <Bar name="income" dataKey="income" fill="url(#colorIncome)" radius={[6, 6, 0, 0]} maxBarSize={24} />
          <Bar name="expense" dataKey="expense" fill="url(#colorExpense)" radius={[6, 6, 0, 0]} maxBarSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
