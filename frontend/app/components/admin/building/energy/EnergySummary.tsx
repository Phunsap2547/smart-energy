'use client';

import React from 'react';
import { Zap, Activity, TrendingUp, DollarSign } from 'lucide-react';

export interface EnergyTelemetryData {
  voltage_system: number | null;
  voltage_a: number | null;
  voltage_b: number | null;
  voltage_c: number | null;

  current_system: number | null;
  current_a: number | null;
  current_b: number | null;
  current_c: number | null;

  power_kw: number | null;
  power_a: number | null;
  power_b: number | null;
  power_c: number | null;
  energy_kwh: number | null;

  power_factor: number | null;
  pf_a: number | null;
  pf_b: number | null;
  pf_c: number | null;

  frequency_hz: number | null;
  voltage_unbalance_pct: number | null;
  current_unbalance_pct: number | null;
  thd_voltage_l1_pct: number | null;
  thd_current_l1_pct: number | null;
}

interface EnergySummaryProps {
  data?: EnergyTelemetryData | null;
  loading?: boolean;
}

interface SummaryCardProps {
  title: string;
  value: string;
  unit: string;
  change?: string;
  isPositive?: boolean;
  icon: React.ElementType;
  loading?: boolean;
}

function SummaryCard({ title, value, unit, change, isPositive, icon: Icon, loading }: SummaryCardProps) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">{title}</span>
        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      {loading ? (
        <div className="mt-3 space-y-2 animate-pulse">
          <div className="h-7 bg-slate-200 rounded w-24"></div>
          <div className="h-3 bg-slate-100 rounded w-32"></div>
        </div>
      ) : (
        <>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-800">{value}</span>
            <span className="text-xs text-slate-500 font-medium">{unit}</span>
          </div>
          {change && (
            <div className="mt-2 flex items-center gap-1.5 text-xs">
              <span className={`font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                {change}
              </span>
              <span className="text-slate-400">สถานะระบบ</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function EnergySummary({ data, loading }: EnergySummaryProps) {
  const energyKwh = data?.energy_kwh ?? 0;
  const powerKw = data?.power_kw ?? 0;
  const pf = data?.power_factor ?? 0;

  // ประมาณการค่าไฟคร่าวๆ (ฐานอัตราประมาณ 4.5 บาท / kWh)
  const estimatedCost = energyKwh * 4.5;

  const formatNum = (val: number, decimals = 1) => {
    return val.toLocaleString('th-TH', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <SummaryCard
        title="พลังงานไฟฟ้ารวม"
        value={formatNum(energyKwh, 0)}
        unit="kWh"
        icon={Zap}
        loading={loading}
      />
      <SummaryCard
        title="กำลังไฟฟ้า (Demand)"
        value={formatNum(powerKw, 2)}
        unit="kW"
        icon={TrendingUp}
        loading={loading}
      />
      <SummaryCard
        title="Power Factor เฉลี่ย"
        value={formatNum(pf, 2)}
        unit="PF"
        change={pf >= 0.85 ? 'ปกติ' : 'ต่ำกว่าเกณฑ์'}
        isPositive={pf >= 0.85}
        icon={Activity}
        loading={loading}
      />
      {/* <SummaryCard
        title="ประมาณการค่าไฟฟ้า"
        value={formatNum(estimatedCost, 0)}
        unit="บาท"
        icon={DollarSign}
        loading={loading}
      /> */}
    </div>
  );
}