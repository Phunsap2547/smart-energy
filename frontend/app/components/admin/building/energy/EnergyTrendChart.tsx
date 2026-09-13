'use client';

import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const trendData = [
  { time: '00:00', current: 12, previous: 15 },
  { time: '04:00', current: 10, previous: 12 },
  { time: '08:00', current: 28, previous: 25 },
  { time: '12:00', current: 42, previous: 38 },
  { time: '16:00', current: 39, previous: 40 },
  { time: '20:00', current: 22, previous: 20 },
];

export default function EnergyTrendChart() {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">แนวโน้มการกำลังไฟฟ้า (kW)</h3>
          <p className="text-xs text-slate-400 mt-0.5">เปรียบเทียบกับช่วงเวลาเดียวกันในรอบก่อน</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-600 font-medium">ปัจจุบัน</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
            <span className="text-slate-400 font-medium">ก่อนหน้า</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="currentEnergy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
            <Area type="monotone" dataKey="previous" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="4 4" fill="none" />
            <Area type="monotone" dataKey="current" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#currentEnergy)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}