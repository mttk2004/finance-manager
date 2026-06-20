"use client";

import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface TimeSeriesData {
  name: string;
  balance: number;
}

export function TimeSeriesChart({ data }: { data: TimeSeriesData[] }) {
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
        <AreaChart
          data={data}
          margin={{ top: 20, right: 10, left: 10, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary-accent)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--primary-accent)" stopOpacity={0.0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#737373', fontFamily: 'monospace' }} 
            dy={15} 
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(23, 23, 23, 0.95)', 
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.08)', 
              borderRadius: '20px', 
              fontSize: '12px', 
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
              padding: '12px'
            }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any) => [new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value)), 'Số dư']}
            labelStyle={{ color: '#888', marginBottom: '8px', fontWeight: 'bold' }}
          />
          <Area 
            type="monotone" 
            dataKey="balance" 
            stroke="var(--primary-accent)" 
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorBalance)"
            activeDot={{ r: 5, strokeWidth: 0, fill: 'var(--primary-accent)' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
