//EnergySummary.tsx
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

  energy_kwh: number | null;               // ค่าสะสมรวมทั้งหมด
  energy_start_of_day_kwh?: number | null;  // ค่าสะสม ณ เริ่มต้นช่วงเวลา
  daily_energy_kwh?: number | null;         // หน่วยไฟของช่วงเวลาที่เลือก

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

// ค่าที่ได้จากกราฟ Peak Demand และ Power Factor (ช่วงเวลาเดียวกับกราฟ)
export interface EnergyPeakData {
  peakKw: number | null;
  peakKwTime: string | null;
  peakPf: number | null;
  /** 'avg' = PF เฉลี่ย (โหมดรายวัน), 'max' = PF สูงสุดรายวัน (โหมด 7/30 วัน) */
  pfKind: 'avg' | 'max';
}

interface EnergySummaryProps {
  data?: EnergyTelemetryData | null;
  peak?: EnergyPeakData | null;
  timeRange?: 'day' | '7d' | '30d' | string;
  loading?: boolean;
}

interface SummaryCardProps {
  title: string;
  value: string;
  unit: string;
  subtitle?: string;
  change?: string;
  isPositive?: boolean;
  icon: React.ElementType;
  loading?: boolean;
}

function SummaryCard({ title, value, unit, subtitle, change, isPositive, icon: Icon, loading }: SummaryCardProps) {
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

          {subtitle && (
            <div className="mt-1 text-[11px] text-slate-400 font-normal">
              {subtitle}
            </div>
          )}

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

export default function EnergySummary({ data, peak, timeRange = 'day', loading }: EnergySummaryProps) {
  const cumulativeEnergy = data?.energy_kwh ?? 0;

  // Peak kW และ PF มาจากกราฟ (ช่วงเวลาและวิธีคำนวณเดียวกัน)
  const powerKw = peak?.peakKw ?? 0;
  const pf = peak?.peakPf ?? 0;
  const pfKind = peak?.pfKind ?? 'avg';

  // ยังไม่ได้รับค่าจากกราฟ ให้แสดงสถานะกำลังโหลด
  const peakLoading = loading || peak == null;

  // ใช้ค่าหน่วยไฟฟ้าของช่วงเวลานั้นๆ ที่ส่งมาจาก page.tsx
  const periodEnergyKwh = data?.daily_energy_kwh ?? 0;

  // ประมาณการค่าไฟ (ฐานประมาณ 4.3 บาท / kWh)
  const estimatedCost = periodEnergyKwh * 4.3;

  const formatNum = (val: number, decimals = 1) => {
    return val.toLocaleString('th-TH', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const rangeLabel =
    timeRange === '7d' ? '7 วันล่าสุด' : timeRange === '30d' ? '30 วันล่าสุด' : 'วันที่เลือก';

  // 1. พลังงานไฟฟ้า (kWh)
  const getEnergyTitle = () => `พลังงานไฟฟ้า (${rangeLabel})`;

  // 2. กำลังไฟฟ้าสูงสุด (kW) ตรงกับกราฟ Peak Demand
  const getPowerTitle = () => `กำลังไฟฟ้าสูงสุด (Peak ${rangeLabel})`;
  const getPowerSubtitle = () =>
    peak?.peakKwTime ? `เกิดขึ้นเมื่อ ${peak.peakKwTime}` : `ค่ากำลังไฟฟ้าสูงสุดใน${rangeLabel}`;

  // 3. Power Factor ตรงกับกราฟ PF (รายวัน = เฉลี่ย, หลายวัน = สูงสุดรายวัน)
  const getPfTitle = () =>
    pfKind === 'max' ? `Power Factor สูงสุด (${rangeLabel})` : `Power Factor เฉลี่ย (${rangeLabel})`;
  const getPfSubtitle = () =>
    pfKind === 'max' ? `ค่า PF สูงสุดใน${rangeLabel}` : `ค่า PF เฉลี่ยใน${rangeLabel}`;

  // 4. ประมาณการค่าไฟฟ้า (บาท)
  const getCostTitle = () => `ประมาณการค่าไฟฟ้า (${rangeLabel})`;
  const getCostSubtitle = () => `คำนวณจากหน่วยไฟฟ้าใน${rangeLabel}`;

  // แสดงสถานะ PF เฉพาะเมื่อเป็นค่าเฉลี่ย (ค่าสูงสุดจะดูดีกว่าความจริง)
  const showPfStatus = pfKind === 'avg' && pf > 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* การ์ดที่ 1: พลังงานไฟฟ้า */}
      <SummaryCard
        title={getEnergyTitle()}
        value={formatNum(periodEnergyKwh, 1)}
        unit="kWh"
        subtitle={`สะสมรวมทั้งหมด: ${formatNum(cumulativeEnergy, 0)} kWh`}
        icon={Zap}
        loading={loading}
      />

      {/* การ์ดที่ 2: กำลังไฟฟ้าสูงสุด (kW) */}
      <SummaryCard
        title={getPowerTitle()}
        value={formatNum(powerKw, 2)}
        unit="kW"
        subtitle={getPowerSubtitle()}
        icon={TrendingUp}
        loading={peakLoading}
      />

      {/* การ์ดที่ 3: Power Factor (PF) */}
      <SummaryCard
        title={getPfTitle()}
        value={formatNum(pf, 2)}
        unit="PF"
        subtitle={getPfSubtitle()}
        change={showPfStatus ? (pf >= 0.85 ? 'ปกติ' : 'ต่ำกว่าเกณฑ์') : undefined}
        isPositive={pf >= 0.85}
        icon={Activity}
        loading={peakLoading}
      />

      {/* การ์ดที่ 4: ประมาณการค่าไฟฟ้า */}
      <SummaryCard
        title={getCostTitle()}
        value={formatNum(estimatedCost, 0)}
        unit="บาท"
        subtitle={getCostSubtitle()}
        icon={DollarSign}
        loading={loading}
      />
    </div>
  );
}