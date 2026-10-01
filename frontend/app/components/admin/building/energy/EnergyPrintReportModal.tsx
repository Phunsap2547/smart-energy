'use client';

import React, { useRef } from 'react';
import { X, Printer, Zap, Gauge, DollarSign, Calendar, Building2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { EnergyTelemetryData } from '@/app/admin/buildings/[id]/energy/page';

interface EnergyPrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  buildingId: string;
  buildingName?: string; // เพิ่ม prop รองรับชื่ออาคารเต็ม
  selectedDate: string;
  telemetry: EnergyTelemetryData | null;
}

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

  const formatNum = (val: number | null | undefined, decimals = 2) => {
    if (val === null || val === undefined) return '0.00';
    return val.toLocaleString('th-TH', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  // คำนวณประมาณการค่าไฟที่ถูกต้อง (เช่น 4.2 บาท/หน่วย)
  const estimatedCost = (telemetry?.daily_energy_kwh ?? 0) * 4.2;
  const isPfLow = (telemetry?.power_factor ?? 1) < 0.85;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      {/* Modal Box Container */}
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Control Header (จะไม่ปรากฏเวลาสั่ง Print) */}
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
                  อาคาร: <span className="font-bold text-slate-800">{buildingName || `อาคาร ${buildingId}`}</span>
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

            {/* 1. Key Performance Indicators (KPI Cards) */}
            <div className="grid grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3 text-emerald-600" /> ปริมาณไฟรวม
                </div>
                <div className="text-base font-extrabold text-slate-900 mt-1">
                  {formatNum(telemetry?.daily_energy_kwh)} <span className="text-xs font-normal text-slate-500">kWh</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3 text-rose-500" /> Peak Demand
                </div>
                <div className="text-base font-extrabold text-rose-600 mt-1">
                  {formatNum(telemetry?.power_kw)} <span className="text-xs font-normal text-slate-500">kW</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center justify-between">
                  <span className="flex items-center gap-1"><Gauge className="w-3 h-3 text-indigo-500" /> Power Factor</span>
                  {isPfLow ? (
                    <span className="bg-rose-100 text-rose-700 text-[9px] px-1.5 py-0.5 rounded font-bold">ต่ำกว่าเกณฑ์</span>
                  ) : (
                    <span className="bg-emerald-100 text-emerald-700 text-[9px] px-1.5 py-0.5 rounded font-bold">ปกติ</span>
                  )}
                </div>
                <div className={`text-base font-extrabold mt-1 ${isPfLow ? 'text-rose-600' : 'text-indigo-600'}`}>
                  {formatNum(telemetry?.power_factor, 3)}
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-amber-500" /> ประเมินค่าไฟ
                </div>
                <div className="text-base font-extrabold text-amber-600 mt-1">
                  ฿{formatNum(estimatedCost)}
                </div>
              </div>
            </div>

            {/* 2. Executive Insights (บทสรุปภาพรวมสำหรับคนนอก/ผู้บริหาร) */}
            <div className={`p-3.5 border rounded-xl text-xs space-y-1.5 ${isPfLow ? 'bg-amber-50/80 border-amber-200 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
              <div className="font-bold flex items-center gap-1.5 text-slate-900">
                <span>💡 บทสรุปการใช้งานและข้อเสนอแนะ:</span>
              </div>
              <p className="leading-relaxed">
                • ปริมาณการใช้วิฟฟ้าสะสมประจำวันรวม <strong>{formatNum(telemetry?.daily_energy_kwh)} kWh</strong> ประเมินค่าไฟฟ้าเบื้องต้นประมาณ <strong>฿{formatNum(estimatedCost)}</strong>
              </p>
              {isPfLow ? (
                <p className="text-rose-700 font-semibold flex items-center gap-1 leading-relaxed">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                  ค่า Power Factor ({formatNum(telemetry?.power_factor, 3)}) ต่ำกว่ามาตรฐานการไฟฟ้า (0.85) ควรให้วิศวกรตรวจสอบ Capacitor Bank เพื่อป้องกันค่าปรับ
                </p>
              ) : (
                <p className="text-emerald-700 font-medium flex items-center gap-1 leading-relaxed">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                  คุณภาพไฟฟ้าและค่า Power Factor อยู่ในเกณฑ์มาตรฐาน การใช้พลังงานอยู่ในภาวะปกติ
                </p>
              )}
            </div>

            {/* 3. Detailed Technical Table */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                รายละเอียดแรงดันและกระแสไฟฟ้ารายเฟส (Electrical Parameters)
              </h2>
              <table className="w-full text-xs text-left border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    <th className="border border-slate-200 p-2 font-bold">พารามิเตอร์</th>
                    <th className="border border-slate-200 p-2 text-center font-bold">รวม/ระบบ</th>
                    <th className="border border-slate-200 p-2 text-center font-bold text-amber-700">Phase A</th>
                    <th className="border border-slate-200 p-2 text-center font-bold text-emerald-700">Phase B</th>
                    <th className="border border-slate-200 p-2 text-center font-bold text-indigo-700">Phase C</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="border border-slate-200 p-2 font-medium">แรงดันไฟฟ้า (Voltage - V)</td>
                    <td className="border border-slate-200 p-2 text-center font-bold">{formatNum(telemetry?.voltage_system)}</td>
                    <td className="border border-slate-200 p-2 text-center">{formatNum(telemetry?.voltage_a)}</td>
                    <td className="border border-slate-200 p-2 text-center">{formatNum(telemetry?.voltage_b)}</td>
                    <td className="border border-slate-200 p-2 text-center">{formatNum(telemetry?.voltage_c)}</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-200 p-2 font-medium">กระแสไฟฟ้า (Current - A)</td>
                    <td className="border border-slate-200 p-2 text-center font-bold">{formatNum(telemetry?.current_system)}</td>
                    <td className="border border-slate-200 p-2 text-center">{formatNum(telemetry?.current_a)}</td>
                    <td className="border border-slate-200 p-2 text-center">{formatNum(telemetry?.current_b)}</td>
                    <td className="border border-slate-200 p-2 text-center">{formatNum(telemetry?.current_c)}</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-200 p-2 font-medium">กำลังไฟฟ้า (Active Power - kW)</td>
                    <td className="border border-slate-200 p-2 text-center font-bold">{formatNum(telemetry?.power_kw)}</td>
                    <td className="border border-slate-200 p-2 text-center">{formatNum(telemetry?.power_a)}</td>
                    <td className="border border-slate-200 p-2 text-center">{formatNum(telemetry?.power_b)}</td>
                    <td className="border border-slate-200 p-2 text-center">{formatNum(telemetry?.power_c)}</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-200 p-2 font-medium">Power Factor (PF)</td>
                    <td className="border border-slate-200 p-2 text-center font-bold">{formatNum(telemetry?.power_factor, 3)}</td>
                    <td className="border border-slate-200 p-2 text-center">{formatNum(telemetry?.pf_a, 3)}</td>
                    <td className="border border-slate-200 p-2 text-center">{formatNum(telemetry?.pf_b, 3)}</td>
                    <td className="border border-slate-200 p-2 text-center">{formatNum(telemetry?.pf_c, 3)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 4. Power Quality Summary */}
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                สรุปคุณภาพไฟฟ้าและความผิดปกติ (Power Quality Status)
              </h2>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                  <span className="text-slate-500">Voltage Unbalance:</span>
                  <span className="font-bold text-slate-800">
                    {formatNum(telemetry?.voltage_unbalance_pct)}%
                  </span>
                </div>
                <div className="p-2 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                  <span className="text-slate-500">Current Unbalance:</span>
                  <span className="font-bold text-slate-800">
                    {formatNum(telemetry?.current_unbalance_pct)}%
                  </span>
                </div>
                <div className="p-2 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                  <span className="text-slate-500">Current THD (L1):</span>
                  <span className="font-bold text-slate-800">
                    {formatNum(telemetry?.thd_current_l1_pct)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Footer รายงาน A4 */}
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