'use client';

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface PhaseLineChartProps {
  title: string;
  data: any[];
  keys: { l1: string; l2: string; l3: string };
  unit?: string;
  domain?: [number, number];
  loading?: boolean;
}

export default function PhaseLineChart({
  title,
  data,
  keys,
  unit = '',
  domain,
  loading = false,
}: PhaseLineChartProps) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs space-y-4">
      <h3 className="text-sm font-bold text-gray-800">{title}</h3>

      {loading ? (
        <div className="h-48 flex items-center justify-center text-xs text-gray-400">
          กำลังโหลดข้อมูล...
        </div>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: '#94a3b8' }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                domain={domain ? domain : ['auto', 'auto']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                formatter={(value: any) => [`${value} ${unit}`, '']}
              />
              <Line
                type="monotone"
                dataKey={keys.l1}
                name="L1"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey={keys.l2}
                name="L2"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey={keys.l3}
                name="L3"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}