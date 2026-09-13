'use client';

import React from 'react';
import { Zap, Activity, TrendingUp, DollarSign } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string;
  unit: string;
  change: string;
  isPositive: boolean;
  icon: React.ElementType;
}

function SummaryCard({ title, value, unit, change, isPositive, icon: Icon }: SummaryCardProps) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">{title}</span>
        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-2xl font-bold text-slate-800">{value}</span>
        <span className="text-xs text-slate-500 font-medium">{unit}</span>
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-xs">
        <span className={`font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
          {change}
        </span>
        <span className="text-slate-400">เทียบกับสัปดาห์ก่อน</span>
      </div>
    </div>
  );
}

export default function EnergySummary() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <SummaryCard
        title="พลังงานไฟฟ้ารวม"
        value="2,440"
        unit="kWh"
        change="-3.2%"
        isPositive={true}
        icon={Zap}
      />
      <SummaryCard
        title="Peak Demand"
        value="45.2"
        unit="kW"
        change="+1.8%"
        isPositive={false}
        icon={TrendingUp}
      />
      <SummaryCard
        title="Power Factor เฉลี่ย"
        value="0.92"
        unit="PF"
        change="+0.04"
        isPositive={true}
        icon={Activity}
      />
      <SummaryCard
        title="ประมาณการค่าไฟฟ้า"
        value="10,980"
        unit="บาท"
        change="-3.2%"
        isPositive={true}
        icon={DollarSign}
      />
    </div>
  );
}