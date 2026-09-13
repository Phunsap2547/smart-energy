'use client';

import React, { useState } from 'react';
import { Download, FileText, Calendar, X, Check } from 'lucide-react';

export default function ExportReportModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [format, setFormat] = useState<'pdf' | 'excel' | 'csv'>('excel');
  const [range, setRange] = useState('7d');

  return (
    <>
      {/* Trigger Button */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm h-full flex flex-col justify-between">
        <div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit mb-3">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">ส่งออกรายงานพลังงาน</h3>
          <p className="text-xs text-slate-500 mt-1">
            ดาวน์โหลดข้อมูลการใช้ไฟฟ้าในรูปแบบไฟล์ PDF, Excel หรือ CSV
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full mt-4 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          สร้างรายงาน
        </button>
      </div>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-slate-800 mb-1">ดาวน์โหลดรายงานพลังงาน</h3>
            <p className="text-xs text-slate-500 mb-5">เลือกรูปแบบและช่วงเวลาที่ต้องการส่งออกข้อมูล</p>

            <div className="space-y-4">
              {/* Format selection */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2">รูปแบบไฟล์</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['excel', 'pdf', 'csv'] as const).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setFormat(item)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold uppercase flex items-center justify-center gap-1.5 transition-all ${
                        format === item
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {format === item && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Range selection */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2">ช่วงเวลา</label>
                <div className="relative">
                  <select
                    value={range}
                    onChange={(e) => setRange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium py-2.5 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="today">วันนี้</option>
                    <option value="7d">7 วันล่าสุด</option>
                    <option value="30d">30 วันล่าสุด</option>
                    <option value="month">เดือนนี้</option>
                  </select>
                  <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  alert(`กำลังดาวน์โหลดรายงาน ${format.toUpperCase()} (${range})`);
                  setIsOpen(false);
                }}
                className="flex-1 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors"
              >
                ดาวน์โหลด
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}