'use client';

import React from 'react';

export interface AnomalyItem {
  id: number | string;
  description: string; // ข้อความจาก ML เช่น "⚫ ไฟดับ (Power Outage)", "🔺 ไฟเกิน (Over Voltage)"
  created_at: string;  // วัน-เวลาที่บันทึก
}

interface AlertHistoryTableProps {
  alerts?: AnomalyItem[];
  loading?: boolean;
}

export const AlertHistoryTable: React.FC<AlertHistoryTableProps> = ({ 
  alerts = [], 
  loading = false 
}) => {
  if (loading) {
    return (
      <div className="w-full bg-white rounded-xl border border-gray-100 p-8 shadow-sm flex justify-center items-center">
        <p className="text-gray-400 text-sm animate-pulse">กำลังโหลดข้อมูลประวัติการแจ้งเตือน...</p>
      </div>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <div className="w-full bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <p className="text-gray-500 text-base">ยังไม่มีประวัติการแจ้งเตือน</p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleString('th-TH', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
  };

  return (
    <div className="w-full bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-gray-100 text-slate-600 text-sm font-semibold">
              <th className="py-3.5 px-5 w-60">วัน - เวลา</th>
              <th className="py-3.5 px-5">สถานะการแจ้งเตือน (ML Status)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm text-slate-700">
            {alerts.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-4 px-5 font-mono text-xs text-slate-500 whitespace-nowrap">
                  {formatDate(item.created_at)}
                </td>
                <td className="py-4 px-5 font-semibold text-slate-800">
                  {item.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AlertHistoryTable;