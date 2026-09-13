'use client';

import React from 'react';
import { AlertTriangle, AlertCircle, Info, ChevronRight } from 'lucide-react';

interface AlertItem {
  id: string;
  type: 'danger' | 'warning' | 'info';
  title: string;
  time: string;
  detail: string;
}

const mockAlerts: AlertItem[] = [
  {
    id: '1',
    type: 'danger',
    title: 'Peak Load เกินเกณฑ์กำหนด',
    time: '14:30 น.',
    detail: 'การใช้ไฟฟ้าพุ่งสูงถึง 45.2 kW เกินขีดจำกัดสูงสุด 40 kW',
  },
  {
    id: '2',
    type: 'warning',
    title: 'Power Factor (PF) ต่ำกว่ามาตรฐาน',
    time: '11:15 น.',
    detail: 'ค่า PF เฉลี่ยอยู่ที่ 0.78 (เกณฑ์แนะนำ ≥ 0.85)',
  },
  {
    id: '3',
    type: 'info',
    title: 'สรุปการใช้พลังงานประจำวัน',
    time: '08:00 น.',
    detail: 'การใช้ไฟฟ้ารวมเมื่อวานนี้อยู่ที่ 320 kWh ลดลง 4.5%',
  },
];

export default function AlertWidget() {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 text-sm">แจ้งเตือน & เหตุการณ์พลังงาน</h3>
          <span className="text-xs bg-red-50 text-red-600 font-semibold px-2 py-0.5 rounded-full">
            {mockAlerts.length} รายการ
          </span>
        </div>

        <div className="space-y-3">
          {mockAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
                alert.type === 'danger'
                  ? 'bg-red-50/50 border-red-100'
                  : alert.type === 'warning'
                  ? 'bg-amber-50/50 border-amber-100'
                  : 'bg-blue-50/50 border-blue-100'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {alert.type === 'danger' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                {alert.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-500" />}
                {alert.type === 'info' && <Info className="w-4 h-4 text-blue-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-800 truncate">{alert.title}</h4>
                  <span className="text-[10px] text-slate-400 shrink-0">{alert.time}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 line-clamp-1">{alert.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="w-full mt-4 py-2 text-xs font-semibold text-emerald-600 bg-emerald-50/60 hover:bg-emerald-50 rounded-xl transition-colors flex items-center justify-center gap-1"
      >
        ดูประวัติการแจ้งเตือนทั้งหมด
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}