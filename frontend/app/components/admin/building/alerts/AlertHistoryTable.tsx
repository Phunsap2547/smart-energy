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
// components/admin/building/alerts/AlertHistoryTable.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  ShieldAlert,
  ZapOff,
  Building2,
  Calendar,
  Activity,
  Zap,
  CheckCircle
} from 'lucide-react';

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

const OFFLINE_TYPES = [
  'device_offline',
  'power_outage',
  'คาดว่าระบบไฟดับ / สัญญาณขาดหาย (Offline)',
  'ตรวจพบไฟดับหรือสัญญาณขาดหาย',
];

type DateGroup = 'today' | 'yesterday' | 'earlier' | 'all';

function getDateCategory(dateString: string): 'today' | 'yesterday' | 'earlier' {
  const targetDate = new Date(dateString);
  const now = new Date();

  const isToday =
    targetDate.getDate() === now.getDate() &&
    targetDate.getMonth() === now.getMonth() &&
    targetDate.getFullYear() === now.getFullYear();

  if (isToday) return 'today';

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const isYesterday =
    targetDate.getDate() === yesterday.getDate() &&
    targetDate.getMonth() === yesterday.getMonth() &&
    targetDate.getFullYear() === yesterday.getFullYear();

  if (isYesterday) return 'yesterday';

  return 'earlier';
}

// 🎨 Helper แปลงประเภทการแจ้งเตือนเป็นชื่อภาษาไทยพร้อม Badge Color
function getTypeBadge(type: string, isOffline?: boolean) {
  if (isOffline) {
    return {
      label: 'ไฟดับ / สัญญาณขาดหาย',
      className: 'bg-rose-50 text-rose-700 border-rose-200/80',
      icon: <ZapOff size={17} className="text-rose-600 shrink-0" />
    };
  }

  const normalized = type.toLowerCase().trim();

  switch (normalized) {
    case 'voltage_sag':
      return {
        label: 'ไฟตก (Voltage Sag)',
        className: 'bg-amber-50 text-amber-700 border-amber-200/80',
        icon: <Zap size={17} className="text-amber-600 shrink-0" />
      };
    case 'under_voltage':
    case 'undervoltage':
      return {
        label: 'แรงดันไฟต่ำ (Under Voltage)',
        className: 'bg-orange-50 text-orange-700 border-orange-200/80',
        icon: <AlertTriangle size={17} className="text-orange-600 shrink-0" />
      };
    case 'over_voltage':
    case 'overvoltage':
      return {
        label: 'แรงดันไฟเกิน (Over Voltage)',
        className: 'bg-red-50 text-red-700 border-red-200/80',
        icon: <ShieldAlert size={17} className="text-red-600 shrink-0" />
      };
    default:
      return {
        label: type || 'ความผิดปกติไฟฟ้า',
        className: 'bg-slate-100 text-slate-700 border-slate-200',
        icon: <Activity size={17} className="text-slate-500 shrink-0" />
      };
  }
}

export default function AlertHistoryTable({ buildingId }: AlertHistoryTableProps) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [buildingName, setBuildingName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<DateGroup>('today');
  const isFirstLoad = useRef(true);

  const fetchAlertsAndDetectOutages = useCallback(async () => {
    if (!buildingId) return;

    if (isFirstLoad.current) {
      setLoading(true);
    }

    try {
      const { data: buildingData } = await supabase
        .from('buildings')
        .select('name')
        .eq('id', buildingId)
        .maybeSingle();

      const currentBuildingName = buildingData?.name || `อาคาร #${buildingId}`;
      setBuildingName(currentBuildingName);

      const { data: devices, error: deviceError } = await supabase
        .from('devices')
        .select('id')
        .eq('building_id', buildingId);

      if (deviceError || !devices || devices.length === 0) {
        setAlerts([]);
        return;
      }

      const deviceIds = devices.map((d) => d.id);

      const { data: anomaliesData } = await supabase
        .from('anomalies')
        .select('*')
        .in('device_id', deviceIds)
        .order('created_at', { ascending: false });

      const dbAlerts: AlertItem[] = (anomaliesData || [])
        .filter((item) => !OFFLINE_TYPES.includes(item.type))
        .map((item) => {
          const rawStatus = (item.status || '').toLowerCase();
          const isActive = ['open', 'investigating', 'active'].includes(rawStatus);

          return {
            id: item.id,
            device_id: item.device_id,
            type: item.type || 'ความผิดปกติไฟฟ้า',
            description: item.description || 'พบค่าไฟฟ้าไม่อยู่ในเกณฑ์ปกติ',
            status: isActive ? 'ACTIVE' : 'RESOLVED',
            created_at: item.created_at,
            building_name: currentBuildingName,
            is_offline_alert: false,
          };
        });

      const detectedOutages: AlertItem[] = [];

      if (deviceIds.length > 0) {
        const { data: outageData, error: outageErr } = await supabase.rpc('get_device_outages', {
          p_device_ids: deviceIds,
          p_min_minutes: 15,
        });

        if (!outageErr && outageData) {
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

      const OFFLINE_MIN = 15;
      const liveOutages: AlertItem[] = [];

      const latestRows = await Promise.all(
        deviceIds.map(async (id) => {
          const { data } = await supabase
            .from('energy_readings')
            .select('reading_time')
            .eq('device_id', id)
            .order('reading_time', { ascending: false })
            .limit(1)
            .maybeSingle();
          return { id, last: data?.reading_time as string | undefined };
        })
      );

      const nowMs = Date.now();
      latestRows.forEach(({ id, last }) => {
        if (!last) return;
        const lastDate = new Date(last);
        const diffMinutes = Math.floor((nowMs - lastDate.getTime()) / 60000);
        if (diffMinutes < OFFLINE_MIN) return;

        const displayDiff =
          diffMinutes >= 60
            ? `${Math.floor(diffMinutes / 60)} ชม. ${diffMinutes % 60} นาที`
            : `${diffMinutes} นาที`;

        liveOutages.push({
          id: `outage-live-${id}`,
          device_id: id,
          type: 'ไฟดับ / สัญญาณขาดหาย',
          description: `ตรวจพบไฟดับหรือสัญญาณขาดหายเป็นเวลา ${displayDiff} (ตั้งแต่ ${lastDate.toLocaleString('th-TH', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })} ถึงปัจจุบัน ยังไม่ได้รับข้อมูลใหม่)`,
          status: 'ACTIVE',
          created_at: lastDate.toISOString(),
          building_name: currentBuildingName,
          is_offline_alert: true,
        });
      });

      const combinedAlerts = [...liveOutages, ...detectedOutages, ...dbAlerts].sort(
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

  const counts = useMemo(() => {
    let today = 0;
    let yesterday = 0;
    let earlier = 0;

    alerts.forEach((item) => {
      const cat = getDateCategory(item.created_at);
      if (cat === 'today') today++;
      else if (cat === 'yesterday') yesterday++;
      else earlier++;
    });

    return { today, yesterday, earlier, all: alerts.length };
  }, [alerts]);

  const filteredAlerts = useMemo(() => {
    if (selectedTab === 'all') return alerts;
    return alerts.filter((item) => getDateCategory(item.created_at) === selectedTab);
  }, [alerts, selectedTab]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center shadow-sm flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-slate-700 font-semibold text-base">กำลังโหลดประวัติการแจ้งเตือน...</span>
      </div>
    );
  }

  const todayStr = new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
  const yesterdayStr = new Date(Date.now() - 86400000).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-red-500/15 via-rose-500/10 to-red-500/5 border-b border-red-200/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-600 text-white rounded-xl shadow-xs">
            <ShieldAlert size={22} />
          </div>
          <div>
            <h3 className="font-bold text-red-950 text-lg leading-snug">
              รายการประวัติการแจ้งเตือน
            </h3>
            <p className="text-sm text-red-900/70">บันทึกเหตุการณ์ไฟดับ สัญญาณขาดหาย และความผิดปกติของไฟฟ้า</p>
          </div>
        </div>
        {buildingName && (
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 px-3.5 py-1.5 rounded-lg shadow-2xs">
            <Building2 size={16} className="text-blue-600" />
            {buildingName}
          </div>
        )}
      </div>

      {/* Filter Tabs - เพิ่มขนาดฟอนต์ */}
      <div className="px-5 py-3 bg-slate-100/60 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-sm font-medium">
        <button
          onClick={() => setSelectedTab('today')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${selectedTab === 'today'
            ? 'bg-white text-blue-600 font-bold shadow-xs border border-slate-200'
            : 'text-slate-600 hover:bg-slate-200/60'
            }`}
        >
          <span className="text-sm">วันนี้ ({todayStr})</span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${counts.today > 0
              ? selectedTab === 'today'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-slate-200 text-slate-700'
              : 'bg-slate-100 text-slate-400'
              }`}
          >
            {counts.today}
          </span>
        </button>

        <button
          onClick={() => setSelectedTab('yesterday')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${selectedTab === 'yesterday'
            ? 'bg-white text-blue-600 font-bold shadow-xs border border-slate-200'
            : 'text-slate-600 hover:bg-slate-200/60'
            }`}
        >
          <span className="text-sm">เมื่อวาน ({yesterdayStr})</span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${counts.yesterday > 0
              ? selectedTab === 'yesterday'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-slate-200 text-slate-700'
              : 'bg-slate-100 text-slate-400'
              }`}
          >
            {counts.yesterday}
          </span>
        </button>

        <button
          onClick={() => setSelectedTab('earlier')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${selectedTab === 'earlier'
            ? 'bg-white text-blue-600 font-bold shadow-xs border border-slate-200'
            : 'text-slate-600 hover:bg-slate-200/60'
            }`}
        >
          <Calendar size={16} className="text-slate-500" />
          <span className="text-sm">ก่อนหน้านี้</span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${counts.earlier > 0
              ? selectedTab === 'earlier'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-slate-200 text-slate-700'
              : 'bg-slate-100 text-slate-400'
              }`}
          >
            {counts.earlier}
          </span>
        </button>

        <button
          onClick={() => setSelectedTab('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ml-auto ${selectedTab === 'all'
            ? 'bg-slate-800 text-white font-bold shadow-xs'
            : 'text-slate-600 hover:bg-slate-200/60'
            }`}
        >
          <span className="text-sm">ทั้งหมด</span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-700 text-slate-200">
            {counts.all}
          </span>
        </button>
      </div>

      {/* Table Content */}
      {filteredAlerts.length === 0 ? (
        <div className="p-14 text-center flex flex-col items-center justify-center gap-2 text-slate-400">
          <CheckCircle size={36} className="text-emerald-500/60" />
          <p className="text-base font-medium text-slate-600">ไม่พบประวัติการแจ้งเตือนในช่วงเวลาที่เลือก</p>
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[550px]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-100 z-10 text-slate-700 text-sm font-bold uppercase tracking-wider border-b border-slate-200 shadow-2xs">
              <tr>
                {/* กำหนด min-w และ pr-8 เพื่อเว้นระยะห่างคอลัมน์ */}
                <th className="py-3.5 px-6 min-w-[280px] pr-8">ประเภทเหตุการณ์</th>
                <th className="py-3.5 px-6">รายละเอียด</th>
                <th className="py-3.5 px-6 w-[180px] whitespace-nowrap">เวลาที่เกิด</th>
                <th className="py-3.5 px-6 w-[140px] whitespace-nowrap">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 text-base">
              {filteredAlerts.map((item) => {
                const badge = getTypeBadge(item.type, item.is_offline_alert);
                return (
                  <tr key={item.id} className="hover:bg-slate-50/90 transition-colors">
                    {/* ประเภทเหตุการณ์ (เว้นระยะ pr-8 + min-w) */}
                    <td className="py-4 px-6 min-w-[280px] pr-8 font-semibold whitespace-nowrap">
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold border ${badge.className}`}>
                        {badge.icon}
                        {badge.label}
                      </span>
                    </td>

                    {/* รายละเอียด */}
                    <td className="py-4 px-6 leading-relaxed text-slate-700 font-normal">
                      {item.description}
                    </td>

                    {/* เวลาที่เกิด */}
                    <td className="py-4 px-6 text-sm text-slate-600 whitespace-nowrap">
                      <div className="flex items-center gap-2 font-medium">
                        <Clock size={16} className="text-slate-400 shrink-0" />
                        {new Date(item.created_at).toLocaleString('th-TH', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>

                    {/* สถานะ */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      {item.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200 animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                          กำลังเกิดขึ้น
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={15} className="text-emerald-600" />
                          สิ้นสุดแล้ว
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}