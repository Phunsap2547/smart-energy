'use client';

import React, { useRef } from 'react';
import {
  X,
  Printer,
  Zap,
  Gauge,
  DollarSign,
  Calendar,
  Building2,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { EnergyTelemetryData } from '@/app/admin/buildings/[id]/energy';

interface EnergyPrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  buildingId: string;
  buildingName?: string;
  selectedDate: string;
  telemetry: EnergyTelemetryData | null;
}

// ---------- ค่าคงที่ (ปรับตามมาตรฐานที่หน่วยงานใช้) ----------
const TARIFF = 4.3; // บาท/หน่วย
const PF_THRESHOLD = 0.85; // เกณฑ์ PF ของการไฟฟ้า
const THD_LIMIT = 15; // % THD กระแส
const UNBALANCE_LIMIT = 5; // % ความไม่สมดุล

type Phase = 'a' | 'b' | 'c';
const PHASES: Phase[] = ['a', 'b', 'c'];

type Num = number | null | undefined;

export default function EnergyPrintReportModal({
  isOpen,
  onClose,
  buildingId,
  buildingName,
  selectedDate,
  telemetry,
}: EnergyPrintReportModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  // ---------- Helpers ----------
  // อ่านค่าตามชื่อ field แบบไม่ผูกกับ type ของ interface
  const get = (key: string): Num =>
    (telemetry as unknown as Record<string, Num> | null)?.[key];

  const isMissing = (v: Num): v is null | undefined =>
    v === null || v === undefined || Number.isNaN(v);

  // ถ้าไม่มีข้อมูลแสดง "—" แทน 0.00 เพื่อไม่ให้เข้าใจผิดว่าเป็นค่าจริง
  const formatNum = (val: Num, decimals = 2) => {
    if (isMissing(val)) return '—';
    return val.toLocaleString('th-TH', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const formatPct = (val: Num) => (isMissing(val) ? '—' : `${formatNum(val)}%`);

  // ความไม่สมดุล = (เบี่ยงเบนสูงสุดจากค่าเฉลี่ย / ค่าเฉลี่ย) x 100
  const calcUnbalance = (a: Num, b: Num, c: Num): number | null => {
    if (isMissing(a) || isMissing(b) || isMissing(c)) return null;
    const avg = (a + b + c) / 3;
    if (avg === 0) return null;
    const maxDev = Math.max(Math.abs(a - avg), Math.abs(b - avg), Math.abs(c - avg));
    return (maxDev / avg) * 100;
  };

  // ---------- คำนวณค่าที่ใช้แสดงผล ----------
  const dailyEnergy = get('daily_energy_kwh');
  const powerFactor = get('power_factor');
  const estimatedCost = (dailyEnergy ?? 0) * TARIFF;
  const isPfLow = !isMissing(powerFactor) && powerFactor < PF_THRESHOLD;

  // Peak Demand: ใช้ peak_demand_kw จาก backend ถ้ามี ไม่เช่นนั้นใช้กำลังไฟล่าสุดและติดป้ายกำกับ
  const peakDemand = get('peak_demand_kw');
  const hasRealPeak = !isMissing(peakDemand);
  const peakValue = hasRealPeak ? peakDemand : get('power_kw');
  const peakTimeRaw = (telemetry as unknown as Record<string, string | null> | null)?.[
    'peak_demand_time'
  ];
  const peakTime = peakTimeRaw
    ? new Date(peakTimeRaw).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
    : null;

  // คำนวณ Unbalance จากค่ารายเฟสที่แสดงในตาราง เพื่อให้ตัวเลขสอดคล้องกัน
  // (ถ้าข้อมูลรายเฟสไม่ครบ จะใช้ค่าจาก backend)
  const voltageUnbalance =
    calcUnbalance(get('voltage_a'), get('voltage_b'), get('voltage_c')) ??
    get('voltage_unbalance_pct');
  const currentUnbalance =
    calcUnbalance(get('current_a'), get('current_b'), get('current_c')) ??
    get('current_unbalance_pct');
  const thdCurrent = get('thd_current_l1_pct');

  // เฟสที่ข้อมูลน่าสงสัย: มีกระแสไหลแต่กำลังไฟ/PF ต่ำมาก (เซนเซอร์หรือ CT อาจผิดปกติ)
  const suspectPhases = PHASES.filter((p) => {
    const i = get(`current_${p}`) ?? 0;
    const pf = get(`pf_${p}`) ?? 1;
    const kw = get(`power_${p}`) ?? 0;
    return i > 1 && (pf < 0.3 || kw < 0.1);
  });

  const statusBadge = (value: Num, limit: number) => {
    if (isMissing(value)) {
      return (
        <span className="bg-slate-200 text-slate-600 text-[9px] px-1.5 py-0.5 rounded font-bold">
          ไม่มีข้อมูล
        </span>
      );
    }
    return value > limit ? (
      <span className="bg-rose-100 text-rose-700 text-[9px] px-1.5 py-0.5 rounded font-bold">
        เกินเกณฑ์
      </span>
    ) : (
      <span className="bg-emerald-100 text-emerald-700 text-[9px] px-1.5 py-0.5 rounded font-bold">
        ปกติ
      </span>
    );
  };

  const phaseCell = (key: 'voltage' | 'current' | 'power' | 'pf', decimals = 2, p?: Phase) => {
    if (!p) return null;
    const bad = suspectPhases.includes(p) && (key === 'pf' || key === 'power');
    return (
      <td
        key={p}
        className={`border border-slate-200 p-2 text-center ${
          bad ? 'bg-rose-50 text-rose-700 font-bold' : ''
        }`}
      >
        {formatNum(get(`${key}_${p}`), decimals)}
        {bad && ' ⚠'}
      </td>
    );
  };

  const qualityItem = (label: string, value: Num, limit: number) => (
    <div className="p-2 bg-white border border-slate-200 rounded-lg flex items-center justify-between gap-2">
      <span className="text-slate-500">{label}</span>
      <span className="flex items-center gap-1.5 shrink-0">
        <span className="font-bold text-slate-800">{formatPct(value)}</span>
        {statusBadge(value, limit)}
      </span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto print:static print:block print:bg-transparent print:p-0 print:backdrop-blur-none">
      {/* Modal Box Container */}
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:overflow-visible print:shadow-none print:rounded-none">
        {/* Modal Top Control Header (ไม่ปรากฏเวลาสั่ง Print) */}
        <div className="p-4 bg-slate-800 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">ตัวอย่างก่อนพิมพ์รายงาน (A4 Executive Summary)</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              พิมพ์รายงาน / Export PDF
            </button>
            <button
              onClick={onClose}
              aria-label="ปิด"
              className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* --- A4 Printable Area --- */}
        <div className="p-8 overflow-y-auto print:p-0 print:overflow-visible" ref={printRef}>
          <style>{`
            @media print {
              body * {
                visibility: hidden;
              }
              .print-area, .print-area * {
                visibility: visible;
              }
              .print-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                padding: 15mm;
                background: white;
              }
              @page {
                size: A4 portrait;
                margin: 0;
              }
            }
          `}</style>

          <div className="print-area space-y-5 text-slate-800 font-sans">
            {/* Header รายงาน A4 */}
            <div className="border-b-2 border-slate-800 pb-4 flex items-start justify-between">
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  รายงานสรุปการใช้พลังงานไฟฟ้าประจำวัน
                </h1>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  อาคาร:{' '}
                  <span className="font-bold text-slate-800">
                    {buildingName || `อาคาร ${buildingId}`}
                  </span>
                  <span className="text-slate-400">(รหัส: {buildingId})</span>
                </p>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-md text-xs font-bold text-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  {selectedDate}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  สร้างเมื่อ: {new Date().toLocaleString('th-TH')}
                </p>
              </div>
            </div>

            {/* 1. KPI Cards */}
            <div className="grid grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3 text-emerald-600" /> ปริมาณไฟรวม
                </div>
                <div className="text-base font-extrabold text-slate-900 mt-1">
                  {formatNum(dailyEnergy)}{' '}
                  <span className="text-xs font-normal text-slate-500">kWh</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">สะสมทั้งวัน</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3 text-rose-500" />
                  {hasRealPeak ? 'ความต้องการสูงสุด (Peak)' : 'กำลังไฟล่าสุด'}
                </div>
                <div className="text-base font-extrabold text-rose-600 mt-1">
                  {formatNum(peakValue)}{' '}
                  <span className="text-xs font-normal text-slate-500">kW</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {hasRealPeak
                    ? peakTime
                      ? `เกิดเมื่อเวลา ${peakTime} น.`
                      : 'สูงสุดของวัน'
                    : 'ยังไม่มีค่า Peak ของวัน'}
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-[10px] text-slate-500 font-bold flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Gauge className="w-3 h-3 text-indigo-500" /> Power Factor
                  </span>
                  {isMissing(powerFactor) ? (
                    <span className="bg-slate-200 text-slate-600 text-[9px] px-1.5 py-0.5 rounded font-bold">
                      ไม่มีข้อมูล
                    </span>
                  ) : isPfLow ? (
                    <span className="bg-rose-100 text-rose-700 text-[9px] px-1.5 py-0.5 rounded font-bold">
                      ต่ำกว่าเกณฑ์
                    </span>
                  ) : (
                    <span className="bg-emerald-100 text-emerald-700 text-[9px] px-1.5 py-0.5 rounded font-bold">
                      ปกติ
                    </span>
                  )}
                </div>
                <div
                  className={`text-base font-extrabold mt-1 ${
                    isPfLow ? 'text-rose-600' : 'text-indigo-600'
                  }`}
                >
                  {formatNum(powerFactor, 3)}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">เกณฑ์ ≥ {PF_THRESHOLD}</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-amber-500" /> ประเมินค่าไฟ
                </div>
                <div className="text-base font-extrabold text-amber-600 mt-1">
                  ฿{formatNum(estimatedCost)}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">คิดที่ {TARIFF} บาท/หน่วย</div>
              </div>
            </div>

            {/* 2. บทสรุปและข้อเสนอแนะ (เรียงปัญหาที่ต้องแก้ไว้ก่อน) */}
            <div
              className={`p-3.5 border rounded-xl text-xs space-y-1.5 ${
                isPfLow || suspectPhases.length > 0
                  ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="font-bold text-slate-900">💡 บทสรุปและข้อเสนอแนะ</div>

              {suspectPhases.length > 0 && (
                <p className="text-rose-700 font-semibold flex items-start gap-1 leading-relaxed">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-600" />
                  <span>
                    ข้อมูล Phase {suspectPhases.map((p) => p.toUpperCase()).join(', ')}{' '}
                    ผิดปกติ (มีกระแสไหลแต่กำลังไฟ/PF ต่ำมาก)
                    ควรตรวจสอบเซนเซอร์หรือ CT ก่อนนำตัวเลขไปใช้ตัดสินใจ
                  </span>
                </p>
              )}

              {isPfLow ? (
                <p className="text-rose-700 font-semibold flex items-start gap-1 leading-relaxed">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-600" />
                  <span>
                    ค่า Power Factor ({formatNum(powerFactor, 3)}) ต่ำกว่าเกณฑ์ของการไฟฟ้า (
                    {PF_THRESHOLD}) ควรให้วิศวกรตรวจสอบ Capacitor Bank เพื่อป้องกันค่าปรับ
                  </span>
                </p>
              ) : (
                !isMissing(powerFactor) && (
                  <p className="text-emerald-700 font-medium flex items-start gap-1 leading-relaxed">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-600" />
                    <span>ค่า Power Factor อยู่ในเกณฑ์มาตรฐาน</span>
                  </p>
                )
              )}

              <p className="leading-relaxed">
                • ใช้ไฟฟ้าสะสมประจำวันรวม <strong>{formatNum(dailyEnergy)} kWh</strong>{' '}
                ประเมินค่าไฟฟ้าเบื้องต้นประมาณ <strong>฿{formatNum(estimatedCost)}</strong>{' '}
                (คิดที่ {TARIFF} บาท/หน่วย)
              </p>
            </div>

            {/* 3. ตารางรายเฟส */}
            <div>
              <h2 className="text-xs font-bold tracking-wider text-slate-500 mb-2">
                รายละเอียดแรงดันและกระแสไฟฟ้ารายเฟส (Electrical Parameters)
              </h2>
              <table className="w-full text-xs text-left border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    <th className="border border-slate-200 p-2 font-bold">พารามิเตอร์</th>
                    <th className="border border-slate-200 p-2 text-center font-bold">รวม/ระบบ</th>
                    <th className="border border-slate-200 p-2 text-center font-bold text-amber-700">
                      Phase A
                    </th>
                    <th className="border border-slate-200 p-2 text-center font-bold text-emerald-700">
                      Phase B
                    </th>
                    <th className="border border-slate-200 p-2 text-center font-bold text-indigo-700">
                      Phase C
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-200 p-2 font-medium">
                      แรงดันไฟฟ้า (Voltage - V)
                    </td>
                    <td className="border border-slate-200 p-2 text-center font-bold">
                      {formatNum(get('voltage_system'))}
                    </td>
                    {PHASES.map((p) => phaseCell('voltage', 2, p))}
                  </tr>
                  <tr>
                    <td className="border border-slate-200 p-2 font-medium">
                      กระแสไฟฟ้า (Current - A)
                    </td>
                    <td className="border border-slate-200 p-2 text-center font-bold">
                      {formatNum(get('current_system'))}
                    </td>
                    {PHASES.map((p) => phaseCell('current', 2, p))}
                  </tr>
                  <tr>
                    <td className="border border-slate-200 p-2 font-medium">
                      กำลังไฟฟ้า (Active Power - kW)
                    </td>
                    <td className="border border-slate-200 p-2 text-center font-bold">
                      {formatNum(get('power_kw'))}
                    </td>
                    {PHASES.map((p) => phaseCell('power', 2, p))}
                  </tr>
                  <tr>
                    <td className="border border-slate-200 p-2 font-medium">Power Factor (PF)</td>
                    <td className="border border-slate-200 p-2 text-center font-bold">
                      {formatNum(powerFactor, 3)}
                    </td>
                    {PHASES.map((p) => phaseCell('pf', 3, p))}
                  </tr>
                </tbody>
              </table>
              <p className="text-[10px] text-slate-400 mt-1.5">
                หมายเหตุ: แรงดันรวม = ค่าเฉลี่ยของ 3 เฟส, กระแสรวม = ค่าเฉลี่ยของ 3 เฟส,
                กำลังไฟรวม = ผลรวมของ 3 เฟส (ปรับข้อความให้ตรงกับวิธีคำนวณจริงของระบบ)
                {suspectPhases.length > 0 && ' | เซลล์สีแดง (⚠) คือค่าที่น่าสงสัย'}
              </p>
            </div>

            {/* 4. Power Quality */}
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-2">
              <h2 className="text-xs font-bold tracking-wider text-slate-500">
                สรุปคุณภาพไฟฟ้าและความผิดปกติ (Power Quality Status)
              </h2>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {qualityItem('ความไม่สมดุลของแรงดัน', voltageUnbalance, UNBALANCE_LIMIT)}
                {qualityItem('ความไม่สมดุลของกระแส', currentUnbalance, UNBALANCE_LIMIT)}
                {qualityItem('THD กระแส (L1)', thdCurrent, THD_LIMIT)}
              </div>
              <p className="text-[10px] text-slate-400">
                เกณฑ์อ้างอิง: ความไม่สมดุล ≤ {UNBALANCE_LIMIT}% | THD กระแส ≤ {THD_LIMIT}%
              </p>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-400">
              <p>ระบบบริหารจัดการพลังงานอาคารอัจฉริยะ (Smart Building Energy Management)</p>
              <p>หน้า 1 จาก 1</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}