'use client';

import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const dailyData = [
  { day: 'จ.', energy: 310 },
  { day: 'อ.', energy: 420 },
  { day: 'พ.', energy: 380 },
  { day: 'พฤ.', energy: 450 },
  { day: 'ศ.', energy: 490 },
  { day: 'ส.', energy: 210 },
  { day: 'อา.', energy: 180 },
];

export default function DailyEnergyChart() {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">การใช้พลังงานรายวัน (kWh)</h3>
          <p className="text-xs text-slate-400 mt-0.5">ปริมาณการใช้งานในสัปดาห์นี้</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
            เฉลี่ย 348.5 kWh/วัน
          </span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
            <Tooltip
              formatter={(value: number) => [`${value} kWh`, 'ปริมาณการใช้ไฟ']}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
            />
            <Bar dataKey="energy" fill="#10b981" radius={[6, 6, 0, 0]} barSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}