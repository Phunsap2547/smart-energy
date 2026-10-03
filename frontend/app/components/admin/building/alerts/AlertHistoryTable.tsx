// 'use client';

// import React from 'react';

// export interface AnomalyItem {
//   id: number | string;
//   description: string; // ข้อความจาก ML เช่น "⚫ ไฟดับ (Power Outage)", "🔺 ไฟเกิน (Over Voltage)"
//   created_at: string;  // วัน-เวลาที่บันทึก
// }

// interface AlertHistoryTableProps {
//   alerts?: AnomalyItem[];
//   loading?: boolean;
// }

// export const AlertHistoryTable: React.FC<AlertHistoryTableProps> = ({ 
//   alerts = [], 
//   loading = false 
// }) => {
//   if (loading) {
//     return (
//       <div className="w-full bg-white rounded-xl border border-gray-100 p-8 shadow-sm flex justify-center items-center">
//         <p className="text-gray-400 text-sm animate-pulse">กำลังโหลดข้อมูลประวัติการแจ้งเตือน...</p>
//       </div>
//     );
//   }

//   if (!alerts || alerts.length === 0) {
//     return (
//       <div className="w-full bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
//         <p className="text-gray-500 text-base">ยังไม่มีประวัติการแจ้งเตือน</p>
//       </div>
//     );
//   }

//   const formatDate = (dateStr: string) => {
//     if (!dateStr) return '-';
//     const d = new Date(dateStr);
//     return isNaN(d.getTime())
//       ? dateStr
//       : d.toLocaleString('th-TH', {
//           day: '2-digit',
//           month: '2-digit',
//           year: 'numeric',
//           hour: '2-digit',
//           minute: '2-digit',
//           second: '2-digit',
//         });
//   };

//   return (
//     <div className="w-full bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
//       <div className="overflow-x-auto">
//         <table className="w-full text-left border-collapse">
//           <thead>
//             <tr className="bg-slate-50 border-b border-gray-100 text-slate-600 text-sm font-semibold">
//               <th className="py-3.5 px-5 w-60">วัน - เวลา</th>
//               <th className="py-3.5 px-5">สถานะการแจ้งเตือน (ML Status)</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-100 text-sm text-slate-700">
//             {alerts.map((item) => (
//               <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
//                 <td className="py-4 px-5 font-mono text-xs text-slate-500 whitespace-nowrap">
//                   {formatDate(item.created_at)}
//                 </td>
//                 <td className="py-4 px-5 font-semibold text-slate-800">
//                   {item.description}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default AlertHistoryTable;


// components/admin/building/alerts/AlertHistoryTable.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { AlertTriangle, Clock, CheckCircle2, ShieldAlert, ZapOff, Building2 } from 'lucide-react';

export interface AlertItem {
  id: string | number;
  device_id: number;
  type: string;
  description: string;
  status: string; // 'ACTIVE' | 'RESOLVED'
  created_at: string;
  ended_at?: string;
  building_name?: string;
  is_offline_alert?: boolean;
}

interface AlertHistoryTableProps {
  buildingId: number;
}

export default function AlertHistoryTable({ buildingId }: AlertHistoryTableProps) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [buildingName, setBuildingName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const isFirstLoad = useRef(true);

  const fetchAlertsAndDetectOutages = useCallback(async () => {
    if (!buildingId) return;

    if (isFirstLoad.current) {
      setLoading(true);
    }

    try {
      // 1. ดึงชื่อตึก
      const { data: buildingData } = await supabase
        .from('buildings')
        .select('name')
        .eq('id', buildingId)
        .maybeSingle();

      const currentBuildingName = buildingData?.name || `อาคาร #${buildingId}`;
      setBuildingName(currentBuildingName);

      // 2. ดึงเฉพาะ Devices ของอาคารนี้
      const { data: devices, error: deviceError } = await supabase
        .from('devices')
        .select('id')
        .eq('building_id', buildingId);

      if (deviceError || !devices || devices.length === 0) {
        setAlerts([]);
        return;
      }

      const deviceIds = devices.map((d) => d.id);

      // 3. ดึงประวัติจากตาราง anomalies
      const { data: anomaliesData } = await supabase
        .from('anomalies')
        .select('*')
        .in('device_id', deviceIds)
        .order('created_at', { ascending: false });

      const dbAlerts: AlertItem[] = (anomaliesData || []).map((item) => ({
        id: item.id,
        device_id: item.device_id,
        type: item.type || 'ความผิดปกติไฟฟ้า',
        description: item.description || 'พบค่าไฟฟ้าไม่อยู่ในเกณฑ์ปกติ',
        status: item.status || 'RESOLVED',
        created_at: item.created_at,
        building_name: currentBuildingName,
        is_offline_alert: false,
      }));

      // 4. ⚡ เรียกใช้ RPC ดึงรายการไฟดับจาก Database โดยตรง
const detectedOutages: AlertItem[] = [];

if (deviceIds.length > 0) {
  const { data: outageData, error: outageErr } = await supabase.rpc('get_device_outages', {
    p_device_ids: deviceIds,
    p_min_minutes: 15,
  });

  if (outageErr) {
    console.error('❌ RPC Error:', outageErr);
  } else if (outageData) {
    outageData.forEach((row: any) => {
      const startDate = new Date(row.start_time);
      const endDate = new Date(row.end_time);
      const diffMinutes = Number(row.gap_minutes);

      const displayDiff =
        diffMinutes >= 60
          ? `${Math.floor(diffMinutes / 60)} ชม. ${diffMinutes % 60} นาที`
          : `${diffMinutes} นาที`;

      detectedOutages.push({
        id: `outage-${row.device_id}-${row.start_time}`,
        device_id: row.device_id,
        type: 'ไฟดับ / สัญญาณขาดหาย',
        description: `ตรวจพบไฟดับหรือสัญญาณขาดหายเป็นเวลา ${displayDiff} (ตั้งแต่ ${startDate.toLocaleString('th-TH', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        })} ถึง ${endDate.toLocaleString('th-TH', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        })})`,
        status: 'RESOLVED',
        created_at: startDate.toISOString(),
        ended_at: endDate.toISOString(),
        building_name: currentBuildingName,
        is_offline_alert: true,
      });
    });
  }
}

      // 5. รวมรายการและเรียงลำดับจากใหม่ไปเก่า
      const combinedAlerts = [...detectedOutages, ...dbAlerts].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setAlerts(combinedAlerts);
    } catch (err) {
      console.error('❌ Error loading alert history:', err);
    } finally {
      if (isFirstLoad.current) {
        setLoading(false);
        isFirstLoad.current = false;
      }
    }
  }, [buildingId]);

  useEffect(() => {
    isFirstLoad.current = true;
    fetchAlertsAndDetectOutages();
    const interval = setInterval(fetchAlertsAndDetectOutages, 10000);
    return () => clearInterval(interval);
  }, [fetchAlertsAndDetectOutages]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-8 border border-slate-200 text-center text-slate-500 font-medium shadow-sm">
        กำลังตรวจสอบประวัติการแจ้งเตือน...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="text-slate-700" size={18} />
          <h3 className="font-bold text-slate-800 text-sm">
            รายการประวัติการแจ้งเตือน ({alerts.length})
          </h3>
        </div>
        {buildingName && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-200/60 px-2.5 py-1 rounded-md">
            <Building2 size={14} className="text-slate-500" />
            {buildingName}
          </div>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-sm">
          ไม่พบประวัติการแจ้งเตือนหรือเหตุการณ์ไฟดับสำหรับ{buildingName || 'อาคารนี้'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100/70 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">ประเภท</th>
                <th className="py-3 px-4">รายละเอียด</th>
                <th className="py-3 px-4">เวลาที่เกิด</th>
                <th className="py-3 px-4">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {alerts.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-semibold whitespace-nowrap">
                    <span className="flex items-center gap-1.5">
                      {item.is_offline_alert ? (
                        <ZapOff size={16} className="text-red-600 shrink-0" />
                      ) : (
                        <AlertTriangle size={16} className="text-amber-500 shrink-0" />
                      )}
                      {item.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-xs leading-relaxed text-slate-600">
                    {item.description}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Clock size={13} className="text-slate-400" />
                      {new Date(item.created_at).toLocaleString('th-TH', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {item.status === 'ACTIVE' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        กำลังเกิดขึ้น
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={12} className="text-emerald-600" />
                        สิ้นสุดแล้ว
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}