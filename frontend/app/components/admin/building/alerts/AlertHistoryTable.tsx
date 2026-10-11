// // // // AlertHistoryTable.tsx
// // // 'use client';

// // // import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
// // // import { supabase } from '@/lib/supabase';
// // // import {
// // //   AlertTriangle,
// // //   Clock,
// // //   CheckCircle2,
// // //   ShieldAlert,
// // //   ZapOff,
// // //   Building2,
// // //   Calendar,
// // //   Activity,
// // //   Zap,
// // //   CheckCircle,
// // //   Moon
// // // } from 'lucide-react';

// // // export interface AlertItem {
// // //   id: string | number;
// // //   device_id: number;
// // //   type: string;
// // //   description: string;
// // //   status: string; // 'ACTIVE' | 'RESOLVED'
// // //   created_at: string;
// // //   ended_at?: string;
// // //   building_name?: string;
// // //   is_offline_alert?: boolean;
// // // }

// // // interface AlertHistoryTableProps {
// // //   buildingId: number;
// // // }

// // // const OFFLINE_TYPES = [
// // //   'device_offline',
// // //   'power_outage',
// // //   'คาดว่าระบบไฟดับ / สัญญาณขาดหาย (Offline)',
// // //   'ตรวจพบไฟดับหรือสัญญาณขาดหาย',
// // // ];

// // // type DateGroup = 'today' | 'yesterday' | 'earlier' | 'all';

// // // function getDateCategory(dateString: string): 'today' | 'yesterday' | 'earlier' {
// // //   const targetDate = new Date(dateString);
// // //   const now = new Date();

// // //   const isToday =
// // //     targetDate.getDate() === now.getDate() &&
// // //     targetDate.getMonth() === now.getMonth() &&
// // //     targetDate.getFullYear() === now.getFullYear();

// // //   if (isToday) return 'today';

// // //   const yesterday = new Date(now);
// // //   yesterday.setDate(now.getDate() - 1);

// // //   const isYesterday =
// // //     targetDate.getDate() === yesterday.getDate() &&
// // //     targetDate.getMonth() === yesterday.getMonth() &&
// // //     targetDate.getFullYear() === yesterday.getFullYear();

// // //   if (isYesterday) return 'yesterday';

// // //   return 'earlier';
// // // }

// // // // 🎨 Helper แปลงประเภทการแจ้งเตือนเป็นชื่อภาษาไทยพร้อม Badge Color
// // // function getTypeBadge(type: string, isOffline?: boolean) {
// // //   if (isOffline) {
// // //     return {
// // //       label: 'ไฟดับ / สัญญาณขาดหาย',
// // //       className: 'bg-rose-50 text-rose-700 border-rose-200/80',
// // //       icon: <ZapOff size={17} className="text-rose-600 shrink-0" />
// // //     };
// // //   }

// // //   const normalized = type.toLowerCase().trim();

// // //   switch (normalized) {
// // //     case 'under_voltage':
// // //     case 'undervoltage':
// // //       return {
// // //         label: 'แรงดันไฟต่ำ (Under Voltage)',
// // //         className: 'bg-orange-50 text-orange-700 border-orange-200/80',
// // //         icon: <AlertTriangle size={17} className="text-orange-600 shrink-0" />
// // //       };
// // //     case 'over_voltage':
// // //     case 'overvoltage':
// // //       return {
// // //         label: 'แรงดันไฟเกิน (Over Voltage)',
// // //         className: 'bg-red-50 text-red-700 border-red-200/80',
// // //         icon: <ShieldAlert size={17} className="text-red-600 shrink-0" />
// // //       };
// // //     case 'night_usage':
// // //       return {
// // //         label: 'มีการใช้ไฟช่วงกลางคืน (Night Usage)',
// // //         className: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
// // //         icon: <Moon size={17} className="text-indigo-600 shrink-0" />
// // //       };
// // //     default:
// // //       return {
// // //         label: type || 'ความผิดปกติไฟฟ้า',
// // //         className: 'bg-slate-100 text-slate-700 border-slate-200',
// // //         icon: <Activity size={17} className="text-slate-500 shrink-0" />
// // //       };
// // //   }
// // // }

// // // export default function AlertHistoryTable({ buildingId }: AlertHistoryTableProps) {
// // //   const [alerts, setAlerts] = useState<AlertItem[]>([]);
// // //   const [buildingName, setBuildingName] = useState<string>('');
// // //   const [loading, setLoading] = useState(true);
// // //   const [selectedTab, setSelectedTab] = useState<DateGroup>('today');
// // //   const isFirstLoad = useRef(true);

// // //   const fetchAlertsAndDetectOutages = useCallback(async () => {
// // //     if (!buildingId) return;

// // //     if (isFirstLoad.current) {
// // //       setLoading(true);
// // //     }

// // //     try {
// // //       const { data: buildingData } = await supabase
// // //         .from('buildings')
// // //         .select('name')
// // //         .eq('id', buildingId)
// // //         .maybeSingle();

// // //       const currentBuildingName = buildingData?.name || `อาคาร #${buildingId}`;
// // //       setBuildingName(currentBuildingName);

// // //       const { data: devices, error: deviceError } = await supabase
// // //         .from('devices')
// // //         .select('id')
// // //         .eq('building_id', buildingId);

// // //       if (deviceError || !devices || devices.length === 0) {
// // //         setAlerts([]);
// // //         return;
// // //       }

// // //       const deviceIds = devices.map((d) => d.id);

// // //       const { data: anomaliesData } = await supabase
// // //         .from('anomalies')
// // //         .select('*')
// // //         .in('device_id', deviceIds)
// // //         .order('created_at', { ascending: false });

// // //       // const dbAlerts: AlertItem[] = (anomaliesData || [])
// // //       //   .filter((item) => {
// // //       //     const rawType = (item.type || '').toLowerCase().trim();
// // //       //     return (
// // //       //       !OFFLINE_TYPES.includes(item.type) &&
// // //       //       rawType !== 'under_voltage' &&
// // //       //       rawType !== 'undervoltage'
// // //       //     );
// // //       //   })
// // //       //   .map((item) => {
// // //       //     const rawStatus = (item.status || '').toLowerCase();
// // //       //     const isActive = ['open', 'investigating', 'active'].includes(rawStatus);

// // //       //     return {
// // //       //       id: item.id,
// // //       //       device_id: item.device_id,
// // //       //       type: item.type || 'ความผิดปกติไฟฟ้า',
// // //       //       description: item.description || 'พบค่าไฟฟ้าไม่อยู่ในเกณฑ์ปกติ',
// // //       //       status: isActive ? 'ACTIVE' : 'RESOLVED',
// // //       //       created_at: item.created_at,
// // //       //       building_name: currentBuildingName,
// // //       //       is_offline_alert: false,
// // //       //     };
// // //       //   });

// // //       const dbAlerts: AlertItem[] = (anomaliesData || [])
// // //         .filter((item) => !OFFLINE_TYPES.includes(item.type))
// // //         .map((item) => {
// // //           const rawStatus = (item.status || '').toLowerCase();
// // //           const isActive = ['open', 'investigating', 'active'].includes(rawStatus);

// // //           return {
// // //             id: item.id,
// // //             device_id: item.device_id,
// // //             type: item.type || 'ความผิดปกติไฟฟ้า',
// // //             description: item.description || 'พบค่าไฟฟ้าไม่อยู่ในเกณฑ์ปกติ',
// // //             status: isActive ? 'ACTIVE' : 'RESOLVED',
// // //             created_at: item.created_at,
// // //             building_name: currentBuildingName,
// // //             is_offline_alert: false,
// // //           };
// // //         });

// // //       const detectedOutages: AlertItem[] = [];

// // //       if (deviceIds.length > 0) {
// // //         const { data: outageData, error: outageErr } = await supabase.rpc('get_device_outages', {
// // //           p_device_ids: deviceIds,
// // //           p_min_minutes: 3,
// // //         });

// // //         if (!outageErr && outageData) {
// // //           outageData.forEach((row: any) => {
// // //             const startDate = new Date(row.start_time);
// // //             const endDate = new Date(row.end_time);
// // //             const diffMinutes = Number(row.gap_minutes);

// // //             const displayDiff =
// // //               diffMinutes >= 60
// // //                 ? `${Math.floor(diffMinutes / 60)} ชม. ${diffMinutes % 60} นาที`
// // //                 : `${diffMinutes} นาที`;

// // //             detectedOutages.push({
// // //               id: `outage-${row.device_id}-${row.start_time}`,
// // //               device_id: row.device_id,
// // //               type: 'ไฟดับ / สัญญาณขาดหาย',
// // //               description: `ตรวจพบไฟดับหรือสัญญาณขาดหายเป็นเวลา ${displayDiff} (ตั้งแต่ ${startDate.toLocaleString('th-TH', {
// // //                 day: 'numeric',
// // //                 month: 'short',
// // //                 hour: '2-digit',
// // //                 minute: '2-digit',
// // //               })} ถึง ${endDate.toLocaleString('th-TH', {
// // //                 day: 'numeric',
// // //                 month: 'short',
// // //                 hour: '2-digit',
// // //                 minute: '2-digit',
// // //               })})`,
// // //               status: 'RESOLVED',
// // //               created_at: startDate.toISOString(),
// // //               ended_at: endDate.toISOString(),
// // //               building_name: currentBuildingName,
// // //               is_offline_alert: true,
// // //             });
// // //           });
// // //         }
// // //       }

// // //       const OFFLINE_MIN = 3;
// // //       const liveOutages: AlertItem[] = [];

// // //       const latestRows = await Promise.all(
// // //         deviceIds.map(async (id) => {
// // //           const { data } = await supabase
// // //             .from('energy_readings')
// // //             .select('reading_time, voltage_a, voltage_b, voltage_c, voltage_system')
// // //             .eq('device_id', id)
// // //             .order('reading_time', { ascending: false })
// // //             .limit(1)
// // //             .maybeSingle();
// // //           return { id, last: data?.reading_time as string | undefined, row: data };
// // //         })
// // //       );

// // //       const nowMs = Date.now();
// // //       latestRows.forEach(({ id, last, row }) => {
// // //         if (!last) return;
// // //         const lastDate = new Date(last);
// // //         const diffMinutes = Math.floor((nowMs - lastDate.getTime()) / 60000);

// // //         const volts = [row?.voltage_a, row?.voltage_b, row?.voltage_c, row?.voltage_system]
// // //           .filter((v) => v !== null && v !== undefined)
// // //           .map(Number);
// // //         const isZeroVoltage = volts.length > 0 && volts.every((v) => v < 5);

// // //         if (diffMinutes < OFFLINE_MIN && !isZeroVoltage) return;

// // //         const timeStr = lastDate.toLocaleString('th-TH', {
// // //           day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
// // //         });
// // //         const displayDiff =
// // //           diffMinutes >= 60
// // //             ? `${Math.floor(diffMinutes / 60)} ชม. ${diffMinutes % 60} นาที`
// // //             : `${diffMinutes} นาที`;

// // //         liveOutages.push({
// // //           id: `outage-live-${id}`,
// // //           device_id: id,
// // //           type: 'ไฟดับ / สัญญาณขาดหาย',
// // //           description: isZeroVoltage
// // //             ? `ตรวจพบแรงดันเป็น 0 V ไฟดับ (ตั้งแต่ ${timeStr} ถึงปัจจุบัน)`
// // //             : `ตรวจพบไฟดับหรือสัญญาณขาดหายเป็นเวลา ${displayDiff} (ตั้งแต่ ${timeStr} ถึงปัจจุบัน ยังไม่ได้รับข้อมูลใหม่)`,
// // //           status: 'ACTIVE',
// // //           created_at: lastDate.toISOString(),
// // //           building_name: currentBuildingName,
// // //           is_offline_alert: true,
// // //         });
// // //       });

// // //       const combinedAlerts = [...liveOutages, ...detectedOutages, ...dbAlerts].sort(
// // //         (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
// // //       );

// // //       setAlerts(combinedAlerts);
// // //     } catch (err) {
// // //       console.error('❌ Error loading alert history:', err);
// // //     } finally {
// // //       if (isFirstLoad.current) {
// // //         setLoading(false);
// // //         isFirstLoad.current = false;
// // //       }
// // //     }
// // //   }, [buildingId]);

// // //   useEffect(() => {
// // //     isFirstLoad.current = true;
// // //     fetchAlertsAndDetectOutages();
// // //     const interval = setInterval(fetchAlertsAndDetectOutages, 10000);
// // //     return () => clearInterval(interval);
// // //   }, [fetchAlertsAndDetectOutages]);

// // //   const counts = useMemo(() => {
// // //     let today = 0;
// // //     let yesterday = 0;
// // //     let earlier = 0;

// // //     alerts.forEach((item) => {
// // //       const cat = getDateCategory(item.created_at);
// // //       if (cat === 'today') today++;
// // //       else if (cat === 'yesterday') yesterday++;
// // //       else earlier++;
// // //     });

// // //     return { today, yesterday, earlier, all: alerts.length };
// // //   }, [alerts]);

// // //   const filteredAlerts = useMemo(() => {
// // //     if (selectedTab === 'all') return alerts;
// // //     return alerts.filter((item) => getDateCategory(item.created_at) === selectedTab);
// // //   }, [alerts, selectedTab]);

// // //   if (loading) {
// // //     return (
// // //       <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center shadow-sm flex flex-col items-center justify-center gap-3">
// // //         <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
// // //         <span className="text-slate-700 font-semibold text-base">กำลังโหลดประวัติการแจ้งเตือน...</span>
// // //       </div>
// // //     );
// // //   }

// // //   const todayStr = new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
// // //   const yesterdayStr = new Date(Date.now() - 86400000).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });

// // //   return (
// // //     <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
// // //       {/* Header */}
// // //       <div className="px-6 py-4 bg-gradient-to-r from-red-500/15 via-rose-500/10 to-red-500/5 border-b border-red-200/80 flex flex-wrap items-center justify-between gap-3">
// // //         <div className="flex items-center gap-3">
// // //           <div className="p-2.5 bg-red-600 text-white rounded-xl shadow-xs">
// // //             <ShieldAlert size={22} />
// // //           </div>
// // //           <div>
// // //             <h3 className="font-bold text-red-950 text-lg leading-snug">
// // //               รายการประวัติการแจ้งเตือน
// // //             </h3>
// // //             <p className="text-sm text-red-900/70">บันทึกเหตุการณ์ไฟดับ สัญญาณขาดหาย และความผิดปกติของไฟฟ้า</p>
// // //           </div>
// // //         </div>
// // //         {buildingName && (
// // //           <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 px-3.5 py-1.5 rounded-lg shadow-2xs">
// // //             <Building2 size={16} className="text-blue-600" />
// // //             {buildingName}
// // //           </div>
// // //         )}
// // //       </div>

// // //       {/* Filter Tabs - เพิ่มขนาดฟอนต์ */}
// // //       <div className="px-5 py-3 bg-slate-100/60 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-sm font-medium">
// // //         <button
// // //           onClick={() => setSelectedTab('today')}
// // //           className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${selectedTab === 'today'
// // //             ? 'bg-white text-blue-600 font-bold shadow-xs border border-slate-200'
// // //             : 'text-slate-600 hover:bg-slate-200/60'
// // //             }`}
// // //         >
// // //           <span className="text-sm">วันนี้ ({todayStr})</span>
// // //           <span
// // //             className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${counts.today > 0
// // //               ? selectedTab === 'today'
// // //                 ? 'bg-blue-100 text-blue-700'
// // //                 : 'bg-slate-200 text-slate-700'
// // //               : 'bg-slate-100 text-slate-400'
// // //               }`}
// // //           >
// // //             {counts.today}
// // //           </span>
// // //         </button>

// // //         <button
// // //           onClick={() => setSelectedTab('yesterday')}
// // //           className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${selectedTab === 'yesterday'
// // //             ? 'bg-white text-blue-600 font-bold shadow-xs border border-slate-200'
// // //             : 'text-slate-600 hover:bg-slate-200/60'
// // //             }`}
// // //         >
// // //           <span className="text-sm">เมื่อวาน ({yesterdayStr})</span>
// // //           <span
// // //             className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${counts.yesterday > 0
// // //               ? selectedTab === 'yesterday'
// // //                 ? 'bg-blue-100 text-blue-700'
// // //                 : 'bg-slate-200 text-slate-700'
// // //               : 'bg-slate-100 text-slate-400'
// // //               }`}
// // //           >
// // //             {counts.yesterday}
// // //           </span>
// // //         </button>

// // //         <button
// // //           onClick={() => setSelectedTab('earlier')}
// // //           className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${selectedTab === 'earlier'
// // //             ? 'bg-white text-blue-600 font-bold shadow-xs border border-slate-200'
// // //             : 'text-slate-600 hover:bg-slate-200/60'
// // //             }`}
// // //         >
// // //           <Calendar size={16} className="text-slate-500" />
// // //           <span className="text-sm">ก่อนหน้านี้</span>
// // //           <span
// // //             className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${counts.earlier > 0
// // //               ? selectedTab === 'earlier'
// // //                 ? 'bg-blue-100 text-blue-700'
// // //                 : 'bg-slate-200 text-slate-700'
// // //               : 'bg-slate-100 text-slate-400'
// // //               }`}
// // //           >
// // //             {counts.earlier}
// // //           </span>
// // //         </button>

// // //         <button
// // //           onClick={() => setSelectedTab('all')}
// // //           className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ml-auto ${selectedTab === 'all'
// // //             ? 'bg-slate-800 text-white font-bold shadow-xs'
// // //             : 'text-slate-600 hover:bg-slate-200/60'
// // //             }`}
// // //         >
// // //           <span className="text-sm">ทั้งหมด</span>
// // //           <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-700 text-slate-200">
// // //             {counts.all}
// // //           </span>
// // //         </button>
// // //       </div>

// // //       {/* Table Content */}
// // //       {filteredAlerts.length === 0 ? (
// // //         <div className="p-14 text-center flex flex-col items-center justify-center gap-2 text-slate-400">
// // //           <CheckCircle size={36} className="text-emerald-500/60" />
// // //           <p className="text-base font-medium text-slate-600">ไม่พบประวัติการแจ้งเตือนในช่วงเวลาที่เลือก</p>
// // //         </div>
// // //       ) : (
// // //         <div className="overflow-x-auto max-h-[550px]">
// // //           <table className="w-full text-left border-collapse">
// // //             <thead className="sticky top-0 bg-slate-100 z-10 text-slate-700 text-sm font-bold uppercase tracking-wider border-b border-slate-200 shadow-2xs">
// // //               <tr>
// // //                 {/* กำหนด min-w และ pr-8 เพื่อเว้นระยะห่างคอลัมน์ */}
// // //                 <th className="py-3.5 px-6 min-w-[280px] pr-8">ประเภทเหตุการณ์</th>
// // //                 <th className="py-3.5 px-6">รายละเอียด</th>
// // //                 <th className="py-3.5 px-6 w-[180px] whitespace-nowrap">เวลาที่เกิด</th>
// // //                 <th className="py-3.5 px-6 w-[140px] whitespace-nowrap">สถานะ</th>
// // //               </tr>
// // //             </thead>
// // //             <tbody className="divide-y divide-slate-100 text-slate-800 text-base">
// // //               {filteredAlerts.map((item) => {
// // //                 const badge = getTypeBadge(item.type, item.is_offline_alert);
// // //                 return (
// // //                   <tr key={item.id} className="hover:bg-slate-50/90 transition-colors">
// // //                     {/* ประเภทเหตุการณ์ (เว้นระยะ pr-8 + min-w) */}
// // //                     <td className="py-4 px-6 min-w-[280px] pr-8 font-semibold whitespace-nowrap">
// // //                       <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold border ${badge.className}`}>
// // //                         {badge.icon}
// // //                         {badge.label}
// // //                       </span>
// // //                     </td>

// // //                     {/* รายละเอียด */}
// // //                     <td className="py-4 px-6 leading-relaxed text-slate-700 font-normal">
// // //                       {item.description}
// // //                     </td>

// // //                     {/* เวลาที่เกิด */}
// // //                     <td className="py-4 px-6 text-sm text-slate-600 whitespace-nowrap">
// // //                       <div className="flex items-center gap-2 font-medium">
// // //                         <Clock size={16} className="text-slate-400 shrink-0" />
// // //                         {new Date(item.created_at).toLocaleString('th-TH', {
// // //                           day: 'numeric',
// // //                           month: 'short',
// // //                           hour: '2-digit',
// // //                           minute: '2-digit',
// // //                         })}
// // //                       </div>
// // //                     </td>

// // //                     {/* สถานะ */}
// // //                     <td className="py-4 px-6 whitespace-nowrap">
// // //                       {item.status === 'ACTIVE' ? (
// // //                         <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200 animate-pulse">
// // //                           <span className="w-2 h-2 rounded-full bg-rose-500"></span>
// // //                           กำลังเกิดขึ้น
// // //                         </span>
// // //                       ) : (
// // //                         <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
// // //                           <CheckCircle2 size={15} className="text-emerald-600" />
// // //                           สิ้นสุดแล้ว
// // //                         </span>
// // //                       )}
// // //                     </td>
// // //                   </tr>
// // //                 );
// // //               })}
// // //             </tbody>
// // //           </table>
// // //         </div>
// // //       )}
// // //     </div>
// // //   );
// // // }


// // // AlertHistoryTable.tsx
// // 'use client';

// // import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
// // import { supabase } from '@/lib/supabase';
// // import {
// //   AlertTriangle,
// //   Clock,
// //   CheckCircle2,
// //   ShieldAlert,
// //   ZapOff,
// //   Building2,
// //   Calendar,
// //   Activity,
// //   Zap,
// //   CheckCircle,
// //   Moon
// // } from 'lucide-react';

// // export interface AlertItem {
// //   id: string | number;
// //   device_id: number;
// //   type: string;
// //   description: string;
// //   status: string; // 'ACTIVE' | 'RESOLVED'
// //   created_at: string;
// //   ended_at?: string;
// //   building_name?: string;
// //   is_offline_alert?: boolean;
// //   is_restored_alert?: boolean;
// // }

// // interface AlertHistoryTableProps {
// //   buildingId: number;
// // }

// // const OFFLINE_TYPES = [
// //   'device_offline',
// //   'power_outage',
// //   'คาดว่าระบบไฟดับ / สัญญาณขาดหาย (Offline)',
// //   'ตรวจพบไฟดับหรือสัญญาณขาดหาย',
// // ];

// // type DateGroup = 'today' | 'yesterday' | 'earlier' | 'all';

// // function getDateCategory(dateString: string): 'today' | 'yesterday' | 'earlier' {
// //   const targetDate = new Date(dateString);
// //   const now = new Date();

// //   const isToday =
// //     targetDate.getDate() === now.getDate() &&
// //     targetDate.getMonth() === now.getMonth() &&
// //     targetDate.getFullYear() === now.getFullYear();

// //   if (isToday) return 'today';

// //   const yesterday = new Date(now);
// //   yesterday.setDate(now.getDate() - 1);

// //   const isYesterday =
// //     targetDate.getDate() === yesterday.getDate() &&
// //     targetDate.getMonth() === yesterday.getMonth() &&
// //     targetDate.getFullYear() === yesterday.getFullYear();

// //   if (isYesterday) return 'yesterday';

// //   return 'earlier';
// // }

// // // 🎨 Helper แปลงประเภทการแจ้งเตือนเป็นชื่อภาษาไทยพร้อม Badge Color
// // function getTypeBadge(type: string, isOffline?: boolean, isRestored?: boolean) {
// //   if (isRestored) {
// //     return {
// //       label: 'ไฟกลับมาปกติ',
// //       className: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
// //       icon: <Zap size={17} className="text-emerald-600 shrink-0" />
// //     };
// //   }

// //   if (isOffline) {
// //     return {
// //       label: 'ไฟดับ / สัญญาณขาดหาย',
// //       className: 'bg-rose-50 text-rose-700 border-rose-200/80',
// //       icon: <ZapOff size={17} className="text-rose-600 shrink-0" />
// //     };
// //   }

// //   const normalized = type.toLowerCase().trim();

// //   switch (normalized) {
// //     case 'under_voltage':
// //     case 'undervoltage':
// //       return {
// //         label: 'แรงดันไฟต่ำ (Under Voltage)',
// //         className: 'bg-orange-50 text-orange-700 border-orange-200/80',
// //         icon: <AlertTriangle size={17} className="text-orange-600 shrink-0" />
// //       };
// //     case 'over_voltage':
// //     case 'overvoltage':
// //       return {
// //         label: 'แรงดันไฟเกิน (Over Voltage)',
// //         className: 'bg-red-50 text-red-700 border-red-200/80',
// //         icon: <ShieldAlert size={17} className="text-red-600 shrink-0" />
// //       };
// //     case 'night_usage':
// //       return {
// //         label: 'มีการใช้ไฟช่วงกลางคืน (Night Usage)',
// //         className: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
// //         icon: <Moon size={17} className="text-indigo-600 shrink-0" />
// //       };
// //     default:
// //       return {
// //         label: type || 'ความผิดปกติไฟฟ้า',
// //         className: 'bg-slate-100 text-slate-700 border-slate-200',
// //         icon: <Activity size={17} className="text-slate-500 shrink-0" />
// //       };
// //   }
// // }

// // export default function AlertHistoryTable({ buildingId }: AlertHistoryTableProps) {
// //   const [alerts, setAlerts] = useState<AlertItem[]>([]);
// //   const [buildingName, setBuildingName] = useState<string>('');
// //   const [loading, setLoading] = useState(true);
// //   const [selectedTab, setSelectedTab] = useState<DateGroup>('today');
// //   const isFirstLoad = useRef(true);

// //   const fetchAlertsAndDetectOutages = useCallback(async () => {
// //     if (!buildingId) return;

// //     if (isFirstLoad.current) {
// //       setLoading(true);
// //     }

// //     try {
// //       const { data: buildingData } = await supabase
// //         .from('buildings')
// //         .select('name')
// //         .eq('id', buildingId)
// //         .maybeSingle();

// //       const currentBuildingName = buildingData?.name || `อาคาร #${buildingId}`;
// //       setBuildingName(currentBuildingName);

// //       const { data: devices, error: deviceError } = await supabase
// //         .from('devices')
// //         .select('id')
// //         .eq('building_id', buildingId);

// //       if (deviceError || !devices || devices.length === 0) {
// //         setAlerts([]);
// //         return;
// //       }

// //       const deviceIds = devices.map((d) => d.id);

// //       const { data: anomaliesData } = await supabase
// //         .from('anomalies')
// //         .select('*')
// //         .in('device_id', deviceIds)
// //         .order('created_at', { ascending: false });

// //       // const dbAlerts: AlertItem[] = (anomaliesData || [])
// //       //   .filter((item) => {
// //       //     const rawType = (item.type || '').toLowerCase().trim();
// //       //     return (
// //       //       !OFFLINE_TYPES.includes(item.type) &&
// //       //       rawType !== 'under_voltage' &&
// //       //       rawType !== 'undervoltage'
// //       //     );
// //       //   })
// //       //   .map((item) => {
// //       //     const rawStatus = (item.status || '').toLowerCase();
// //       //     const isActive = ['open', 'investigating', 'active'].includes(rawStatus);

// //       //     return {
// //       //       id: item.id,
// //       //       device_id: item.device_id,
// //       //       type: item.type || 'ความผิดปกติไฟฟ้า',
// //       //       description: item.description || 'พบค่าไฟฟ้าไม่อยู่ในเกณฑ์ปกติ',
// //       //       status: isActive ? 'ACTIVE' : 'RESOLVED',
// //       //       created_at: item.created_at,
// //       //       building_name: currentBuildingName,
// //       //       is_offline_alert: false,
// //       //     };
// //       //   });

// //       const dbAlerts: AlertItem[] = (anomaliesData || [])
// //         .filter((item) => !OFFLINE_TYPES.includes(item.type))
// //         .map((item) => {
// //           const rawStatus = (item.status || '').toLowerCase();
// //           const isActive = ['open', 'investigating', 'active'].includes(rawStatus);

// //           return {
// //             id: item.id,
// //             device_id: item.device_id,
// //             type: item.type || 'ความผิดปกติไฟฟ้า',
// //             description: item.description || 'พบค่าไฟฟ้าไม่อยู่ในเกณฑ์ปกติ',
// //             status: isActive ? 'ACTIVE' : 'RESOLVED',
// //             created_at: item.created_at,
// //             building_name: currentBuildingName,
// //             is_offline_alert: false,
// //           };
// //         });

// //       const detectedOutages: AlertItem[] = [];

// //       if (deviceIds.length > 0) {
// //         const { data: outageData, error: outageErr } = await supabase.rpc('get_device_outages', {
// //           p_device_ids: deviceIds,
// //           p_min_minutes: 2,
// //         });

// //         if (!outageErr && outageData) {
// //           outageData.forEach((row: any) => {
// //             const startDate = new Date(row.start_time);
// //             const endDate = new Date(row.end_time);
// //             const diffMinutes = Number(row.gap_minutes);

// //             const displayDiff =
// //               diffMinutes >= 60
// //                 ? `${Math.floor(diffMinutes / 60)} ชม. ${diffMinutes % 60} นาที`
// //                 : `${diffMinutes} นาที`;

// //             detectedOutages.push({
// //               id: `outage-${row.device_id}-${row.start_time}`,
// //               device_id: row.device_id,
// //               type: 'ไฟดับ / สัญญาณขาดหาย',
// //               description: `ตรวจพบไฟดับหรือสัญญาณขาดหายเป็นเวลา ${displayDiff} (ตั้งแต่ ${startDate.toLocaleString('th-TH', {
// //                 day: 'numeric',
// //                 month: 'short',
// //                 hour: '2-digit',
// //                 minute: '2-digit',
// //               })} ถึง ${endDate.toLocaleString('th-TH', {
// //                 day: 'numeric',
// //                 month: 'short',
// //                 hour: '2-digit',
// //                 minute: '2-digit',
// //               })})`,
// //               status: 'RESOLVED',
// //               created_at: startDate.toISOString(),
// //               ended_at: endDate.toISOString(),
// //               building_name: currentBuildingName,
// //               is_offline_alert: true,
// //             });

// //             // ✅ แจ้งว่าไฟกลับมาปกติ ณ เวลาที่ข้อมูลกลับมา
// //             detectedOutages.push({
// //               id: `restored-${row.device_id}-${row.end_time}`,
// //               device_id: row.device_id,
// //               type: 'ไฟกลับมาปกติ',
// //               description: `ไฟกลับมาปกติ ได้รับข้อมูลอีกครั้งเมื่อ ${endDate.toLocaleString('th-TH', {
// //                 day: 'numeric',
// //                 month: 'short',
// //                 hour: '2-digit',
// //                 minute: '2-digit',
// //               })} (หลังไฟดับหรือสัญญาณขาดหาย ${displayDiff})`,
// //               status: 'RESOLVED',
// //               created_at: endDate.toISOString(),
// //               building_name: currentBuildingName,
// //               is_restored_alert: true,
// //             });
// //           });
// //         }
// //       }

// //       const OFFLINE_MIN = 2;
// //       const liveOutages: AlertItem[] = [];

// //       const latestRows = await Promise.all(
// //         deviceIds.map(async (id) => {
// //           const { data } = await supabase
// //             .from('energy_readings')
// //             .select('reading_time, voltage_a, voltage_b, voltage_c, voltage_system')
// //             .eq('device_id', id)
// //             .order('reading_time', { ascending: false })
// //             .limit(1)
// //             .maybeSingle();
// //           return { id, last: data?.reading_time as string | undefined, row: data };
// //         })
// //       );

// //       const nowMs = Date.now();
// //       latestRows.forEach(({ id, last, row }) => {
// //         if (!last) return;
// //         const lastDate = new Date(last);
// //         const diffMinutes = Math.floor((nowMs - lastDate.getTime()) / 60000);

// //         const volts = [row?.voltage_a, row?.voltage_b, row?.voltage_c, row?.voltage_system]
// //           .filter((v) => v !== null && v !== undefined)
// //           .map(Number);
// //         const isZeroVoltage = volts.length > 0 && volts.every((v) => v < 5);

// //         if (diffMinutes < OFFLINE_MIN && !isZeroVoltage) return;

// //         const timeStr = lastDate.toLocaleString('th-TH', {
// //           day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
// //         });
// //         const displayDiff =
// //           diffMinutes >= 60
// //             ? `${Math.floor(diffMinutes / 60)} ชม. ${diffMinutes % 60} นาที`
// //             : `${diffMinutes} นาที`;

// //         liveOutages.push({
// //           id: `outage-live-${id}`,
// //           device_id: id,
// //           type: 'ไฟดับ / สัญญาณขาดหาย',
// //           description: isZeroVoltage
// //             ? `ตรวจพบแรงดันเป็น 0 V ไฟดับ (ตั้งแต่ ${timeStr} ถึงปัจจุบัน)`
// //             : `ตรวจพบไฟดับหรือสัญญาณขาดหายเป็นเวลา ${displayDiff} (ตั้งแต่ ${timeStr} ถึงปัจจุบัน ยังไม่ได้รับข้อมูลใหม่)`,
// //           status: 'ACTIVE',
// //           created_at: lastDate.toISOString(),
// //           building_name: currentBuildingName,
// //           is_offline_alert: true,
// //         });
// //       });

// //       const combinedAlerts = [...liveOutages, ...detectedOutages, ...dbAlerts].sort(
// //         (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
// //       );

// //       setAlerts(combinedAlerts);
// //     } catch (err) {
// //       console.error('❌ Error loading alert history:', err);
// //     } finally {
// //       if (isFirstLoad.current) {
// //         setLoading(false);
// //         isFirstLoad.current = false;
// //       }
// //     }
// //   }, [buildingId]);

// //   useEffect(() => {
// //     isFirstLoad.current = true;
// //     fetchAlertsAndDetectOutages();
// //     const interval = setInterval(fetchAlertsAndDetectOutages, 10000);
// //     return () => clearInterval(interval);
// //   }, [fetchAlertsAndDetectOutages]);

// //   const counts = useMemo(() => {
// //     let today = 0;
// //     let yesterday = 0;
// //     let earlier = 0;

// //     alerts.forEach((item) => {
// //       const cat = getDateCategory(item.created_at);
// //       if (cat === 'today') today++;
// //       else if (cat === 'yesterday') yesterday++;
// //       else earlier++;
// //     });

// //     return { today, yesterday, earlier, all: alerts.length };
// //   }, [alerts]);

// //   const filteredAlerts = useMemo(() => {
// //     if (selectedTab === 'all') return alerts;
// //     return alerts.filter((item) => getDateCategory(item.created_at) === selectedTab);
// //   }, [alerts, selectedTab]);

// //   if (loading) {
// //     return (
// //       <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center shadow-sm flex flex-col items-center justify-center gap-3">
// //         <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
// //         <span className="text-slate-700 font-semibold text-base">กำลังโหลดประวัติการแจ้งเตือน...</span>
// //       </div>
// //     );
// //   }

// //   const todayStr = new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
// //   const yesterdayStr = new Date(Date.now() - 86400000).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });

// //   return (
// //     <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
// //       {/* Header */}
// //       <div className="px-6 py-4 bg-gradient-to-r from-red-500/15 via-rose-500/10 to-red-500/5 border-b border-red-200/80 flex flex-wrap items-center justify-between gap-3">
// //         <div className="flex items-center gap-3">
// //           <div className="p-2.5 bg-red-600 text-white rounded-xl shadow-xs">
// //             <ShieldAlert size={22} />
// //           </div>
// //           <div>
// //             <h3 className="font-bold text-red-950 text-lg leading-snug">
// //               รายการประวัติการแจ้งเตือน
// //             </h3>
// //             <p className="text-sm text-red-900/70">บันทึกเหตุการณ์ไฟดับ สัญญาณขาดหาย และความผิดปกติของไฟฟ้า</p>
// //           </div>
// //         </div>
// //         {buildingName && (
// //           <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 px-3.5 py-1.5 rounded-lg shadow-2xs">
// //             <Building2 size={16} className="text-blue-600" />
// //             {buildingName}
// //           </div>
// //         )}
// //       </div>

// //       {/* Filter Tabs - เพิ่มขนาดฟอนต์ */}
// //       <div className="px-5 py-3 bg-slate-100/60 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-sm font-medium">
// //         <button
// //           onClick={() => setSelectedTab('today')}
// //           className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${selectedTab === 'today'
// //             ? 'bg-white text-blue-600 font-bold shadow-xs border border-slate-200'
// //             : 'text-slate-600 hover:bg-slate-200/60'
// //             }`}
// //         >
// //           <span className="text-sm">วันนี้ ({todayStr})</span>
// //           <span
// //             className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${counts.today > 0
// //               ? selectedTab === 'today'
// //                 ? 'bg-blue-100 text-blue-700'
// //                 : 'bg-slate-200 text-slate-700'
// //               : 'bg-slate-100 text-slate-400'
// //               }`}
// //           >
// //             {counts.today}
// //           </span>
// //         </button>

// //         <button
// //           onClick={() => setSelectedTab('yesterday')}
// //           className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${selectedTab === 'yesterday'
// //             ? 'bg-white text-blue-600 font-bold shadow-xs border border-slate-200'
// //             : 'text-slate-600 hover:bg-slate-200/60'
// //             }`}
// //         >
// //           <span className="text-sm">เมื่อวาน ({yesterdayStr})</span>
// //           <span
// //             className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${counts.yesterday > 0
// //               ? selectedTab === 'yesterday'
// //                 ? 'bg-blue-100 text-blue-700'
// //                 : 'bg-slate-200 text-slate-700'
// //               : 'bg-slate-100 text-slate-400'
// //               }`}
// //           >
// //             {counts.yesterday}
// //           </span>
// //         </button>

// //         <button
// //           onClick={() => setSelectedTab('earlier')}
// //           className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${selectedTab === 'earlier'
// //             ? 'bg-white text-blue-600 font-bold shadow-xs border border-slate-200'
// //             : 'text-slate-600 hover:bg-slate-200/60'
// //             }`}
// //         >
// //           <Calendar size={16} className="text-slate-500" />
// //           <span className="text-sm">ก่อนหน้านี้</span>
// //           <span
// //             className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${counts.earlier > 0
// //               ? selectedTab === 'earlier'
// //                 ? 'bg-blue-100 text-blue-700'
// //                 : 'bg-slate-200 text-slate-700'
// //               : 'bg-slate-100 text-slate-400'
// //               }`}
// //           >
// //             {counts.earlier}
// //           </span>
// //         </button>

// //         <button
// //           onClick={() => setSelectedTab('all')}
// //           className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ml-auto ${selectedTab === 'all'
// //             ? 'bg-slate-800 text-white font-bold shadow-xs'
// //             : 'text-slate-600 hover:bg-slate-200/60'
// //             }`}
// //         >
// //           <span className="text-sm">ทั้งหมด</span>
// //           <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-700 text-slate-200">
// //             {counts.all}
// //           </span>
// //         </button>
// //       </div>

// //       {/* Table Content */}
// //       {filteredAlerts.length === 0 ? (
// //         <div className="p-14 text-center flex flex-col items-center justify-center gap-2 text-slate-400">
// //           <CheckCircle size={36} className="text-emerald-500/60" />
// //           <p className="text-base font-medium text-slate-600">ไม่พบประวัติการแจ้งเตือนในช่วงเวลาที่เลือก</p>
// //         </div>
// //       ) : (
// //         <div className="overflow-x-auto max-h-[550px]">
// //           <table className="w-full text-left border-collapse">
// //             <thead className="sticky top-0 bg-slate-100 z-10 text-slate-700 text-sm font-bold uppercase tracking-wider border-b border-slate-200 shadow-2xs">
// //               <tr>
// //                 {/* กำหนด min-w และ pr-8 เพื่อเว้นระยะห่างคอลัมน์ */}
// //                 <th className="py-3.5 px-6 min-w-[280px] pr-8">ประเภทเหตุการณ์</th>
// //                 <th className="py-3.5 px-6">รายละเอียด</th>
// //                 <th className="py-3.5 px-6 w-[180px] whitespace-nowrap">เวลาที่เกิด</th>
// //                 <th className="py-3.5 px-6 w-[140px] whitespace-nowrap">สถานะ</th>
// //               </tr>
// //             </thead>
// //             <tbody className="divide-y divide-slate-100 text-slate-800 text-base">
// //               {filteredAlerts.map((item) => {
// //                 const badge = getTypeBadge(item.type, item.is_offline_alert, item.is_restored_alert);
// //                 return (
// //                   <tr key={item.id} className="hover:bg-slate-50/90 transition-colors">
// //                     {/* ประเภทเหตุการณ์ (เว้นระยะ pr-8 + min-w) */}
// //                     <td className="py-4 px-6 min-w-[280px] pr-8 font-semibold whitespace-nowrap">
// //                       <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold border ${badge.className}`}>
// //                         {badge.icon}
// //                         {badge.label}
// //                       </span>
// //                     </td>

// //                     {/* รายละเอียด */}
// //                     <td className="py-4 px-6 leading-relaxed text-slate-700 font-normal">
// //                       {item.description}
// //                     </td>

// //                     {/* เวลาที่เกิด */}
// //                     <td className="py-4 px-6 text-sm text-slate-600 whitespace-nowrap">
// //                       <div className="flex items-center gap-2 font-medium">
// //                         <Clock size={16} className="text-slate-400 shrink-0" />
// //                         {new Date(item.created_at).toLocaleString('th-TH', {
// //                           day: 'numeric',
// //                           month: 'short',
// //                           hour: '2-digit',
// //                           minute: '2-digit',
// //                         })}
// //                       </div>
// //                     </td>

// //                     {/* สถานะ */}
// //                     <td className="py-4 px-6 whitespace-nowrap">
// //                       {item.is_restored_alert ? (
// //                         <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
// //                           <CheckCircle2 size={15} className="text-emerald-600" />
// //                           ปกติแล้ว
// //                         </span>
// //                       ) : item.status === 'ACTIVE' ? (
// //                         <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200 animate-pulse">
// //                           <span className="w-2 h-2 rounded-full bg-rose-500"></span>
// //                           กำลังเกิดขึ้น
// //                         </span>
// //                       ) : (
// //                         <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
// //                           <CheckCircle2 size={15} className="text-emerald-600" />
// //                           สิ้นสุดแล้ว
// //                         </span>
// //                       )}
// //                     </td>
// //                   </tr>
// //                 );
// //               })}
// //             </tbody>
// //           </table>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }


// // AlertHistoryTable.tsx
// 'use client';

// import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
// import { supabase } from '@/lib/supabase';
// import {
//   AlertTriangle,
//   Clock,
//   CheckCircle2,
//   ShieldAlert,
//   ZapOff,
//   Building2,
//   Calendar,
//   Activity,
//   Zap,
//   CheckCircle,
//   Moon
// } from 'lucide-react';

// export interface AlertItem {
//   id: string | number;
//   device_id: number;
//   type: string;
//   description: string;
//   status: string; // 'ACTIVE' | 'RESOLVED'
//   created_at: string;
//   ended_at?: string;
//   building_name?: string;
//   is_offline_alert?: boolean;
//   is_restored_alert?: boolean;
// }

// interface AlertHistoryTableProps {
//   buildingId: number;
// }

// const OFFLINE_TYPES = [
//   'device_offline',
//   'power_outage',
//   'คาดว่าระบบไฟดับ / สัญญาณขาดหาย (Offline)',
//   'ตรวจพบไฟดับหรือสัญญาณขาดหาย',
// ];

// type DateGroup = 'today' | 'yesterday' | 'earlier' | 'all';

// function getDateCategory(dateString: string): 'today' | 'yesterday' | 'earlier' {
//   const targetDate = new Date(dateString);
//   const now = new Date();

//   const isToday =
//     targetDate.getDate() === now.getDate() &&
//     targetDate.getMonth() === now.getMonth() &&
//     targetDate.getFullYear() === now.getFullYear();

//   if (isToday) return 'today';

//   const yesterday = new Date(now);
//   yesterday.setDate(now.getDate() - 1);

//   const isYesterday =
//     targetDate.getDate() === yesterday.getDate() &&
//     targetDate.getMonth() === yesterday.getMonth() &&
//     targetDate.getFullYear() === yesterday.getFullYear();

//   if (isYesterday) return 'yesterday';

//   return 'earlier';
// }

// // 🎨 Helper แปลงประเภทการแจ้งเตือนเป็นชื่อภาษาไทยพร้อม Badge Color
// function getTypeBadge(type: string, isOffline?: boolean, isRestored?: boolean) {
//   if (isRestored) {
//     return {
//       label: 'ไฟกลับมาปกติ',
//       className: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
//       icon: <Zap size={17} className="text-emerald-600 shrink-0" />
//     };
//   }

//   if (isOffline) {
//     return {
//       label: 'ไฟดับ / สัญญาณขาดหาย',
//       className: 'bg-rose-50 text-rose-700 border-rose-200/80',
//       icon: <ZapOff size={17} className="text-rose-600 shrink-0" />
//     };
//   }

//   const normalized = type.toLowerCase().trim();

//   switch (normalized) {
//     case 'under_voltage':
//     case 'undervoltage':
//       return {
//         label: 'แรงดันไฟต่ำ (Under Voltage)',
//         className: 'bg-orange-50 text-orange-700 border-orange-200/80',
//         icon: <AlertTriangle size={17} className="text-orange-600 shrink-0" />
//       };
//     case 'over_voltage':
//     case 'overvoltage':
//       return {
//         label: 'แรงดันไฟเกิน (Over Voltage)',
//         className: 'bg-red-50 text-red-700 border-red-200/80',
//         icon: <ShieldAlert size={17} className="text-red-600 shrink-0" />
//       };
//     case 'night_usage':
//       return {
//         label: 'มีการใช้ไฟช่วงกลางคืน (Night Usage)',
//         className: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
//         icon: <Moon size={17} className="text-indigo-600 shrink-0" />
//       };
//     default:
//       return {
//         label: type || 'ความผิดปกติไฟฟ้า',
//         className: 'bg-slate-100 text-slate-700 border-slate-200',
//         icon: <Activity size={17} className="text-slate-500 shrink-0" />
//       };
//   }
// }

// export default function AlertHistoryTable({ buildingId }: AlertHistoryTableProps) {
//   const [alerts, setAlerts] = useState<AlertItem[]>([]);
//   const [buildingName, setBuildingName] = useState<string>('');
//   const [loading, setLoading] = useState(true);
//   const [selectedTab, setSelectedTab] = useState<DateGroup>('today');
//   const isFirstLoad = useRef(true);

//   const fetchAlertsAndDetectOutages = useCallback(async () => {
//     if (!buildingId) return;

//     if (isFirstLoad.current) {
//       setLoading(true);
//     }

//     try {
//       const { data: buildingData } = await supabase
//         .from('buildings')
//         .select('name')
//         .eq('id', buildingId)
//         .maybeSingle();

//       const currentBuildingName = buildingData?.name || `อาคาร #${buildingId}`;
//       setBuildingName(currentBuildingName);

//       const { data: devices, error: deviceError } = await supabase
//         .from('devices')
//         .select('id')
//         .eq('building_id', buildingId);

//       if (deviceError || !devices || devices.length === 0) {
//         setAlerts([]);
//         return;
//       }

//       const deviceIds = devices.map((d) => d.id);

//       const { data: anomaliesData } = await supabase
//         .from('anomalies')
//         .select('*')
//         .in('device_id', deviceIds)
//         .order('created_at', { ascending: false });

//       // anomalies (ไม่รวมไฟดับ/ออฟไลน์) + แถว "แรงดันกลับสู่ช่วงปกติ" เมื่อมี resolved_at
//       const dbAlerts: AlertItem[] = [];

//       (anomaliesData || [])
//         .filter((item) => !OFFLINE_TYPES.includes(item.type))
//         .forEach((item) => {
//           const rawStatus = (item.status || '').toLowerCase();
//           const isActive = ['open', 'investigating', 'active'].includes(rawStatus);

//           dbAlerts.push({
//             id: item.id,
//             device_id: item.device_id,
//             type: item.type || 'ความผิดปกติไฟฟ้า',
//             description: item.description || 'พบค่าไฟฟ้าไม่อยู่ในเกณฑ์ปกติ',
//             status: isActive ? 'ACTIVE' : 'RESOLVED',
//             created_at: item.created_at,
//             building_name: currentBuildingName,
//             is_offline_alert: false,
//           });

//           // ✅ แรงดันกลับมาปกติ (worker ใส่ resolved_at เฉพาะกรณีกลับเป็นปกติจริง)
//           if (item.resolved_at) {
//             const t = String(item.type || '').toLowerCase();
//             const label = t.includes('under') ? 'ไฟต่ำ' : t.includes('over') ? 'ไฟเกิน' : item.type;

//             dbAlerts.push({
//               id: `resolved-${item.id}`,
//               device_id: item.device_id,
//               type: 'ไฟกลับมาปกติ',
//               description: `แรงดันกลับสู่ช่วงปกติ (${label}สิ้นสุดแล้ว)`,
//               status: 'RESOLVED',
//               created_at: item.resolved_at,
//               building_name: currentBuildingName,
//               is_restored_alert: true,
//             });
//           }
//         });

//       const detectedOutages: AlertItem[] = [];

//       if (deviceIds.length > 0) {
//         const { data: outageData, error: outageErr } = await supabase.rpc('get_device_outages', {
//           p_device_ids: deviceIds,
//           p_min_minutes: 2,
//         });

//         if (!outageErr && outageData) {
//           outageData.forEach((row: any) => {
//             const startDate = new Date(row.start_time);
//             const endDate = new Date(row.end_time);
//             const diffMinutes = Number(row.gap_minutes);

//             const displayDiff =
//               diffMinutes >= 60
//                 ? `${Math.floor(diffMinutes / 60)} ชม. ${diffMinutes % 60} นาที`
//                 : `${diffMinutes} นาที`;

//             detectedOutages.push({
//               id: `outage-${row.device_id}-${row.start_time}`,
//               device_id: row.device_id,
//               type: 'ไฟดับ / สัญญาณขาดหาย',
//               description: `ตรวจพบไฟดับหรือสัญญาณขาดหายเป็นเวลา ${displayDiff} (ตั้งแต่ ${startDate.toLocaleString('th-TH', {
//                 day: 'numeric',
//                 month: 'short',
//                 hour: '2-digit',
//                 minute: '2-digit',
//               })} ถึง ${endDate.toLocaleString('th-TH', {
//                 day: 'numeric',
//                 month: 'short',
//                 hour: '2-digit',
//                 minute: '2-digit',
//               })})`,
//               status: 'RESOLVED',
//               created_at: startDate.toISOString(),
//               ended_at: endDate.toISOString(),
//               building_name: currentBuildingName,
//               is_offline_alert: true,
//             });

//             // ✅ แจ้งว่าไฟกลับมาปกติ ณ เวลาที่ข้อมูลกลับมา
//             detectedOutages.push({
//               id: `restored-${row.device_id}-${row.end_time}`,
//               device_id: row.device_id,
//               type: 'ไฟกลับมาปกติ',
//               description: `ไฟกลับมาปกติ ได้รับข้อมูลอีกครั้งเมื่อ ${endDate.toLocaleString('th-TH', {
//                 day: 'numeric',
//                 month: 'short',
//                 hour: '2-digit',
//                 minute: '2-digit',
//               })} (หลังไฟดับหรือสัญญาณขาดหาย ${displayDiff})`,
//               status: 'RESOLVED',
//               created_at: endDate.toISOString(),
//               building_name: currentBuildingName,
//               is_restored_alert: true,
//             });
//           });
//         }
//       }

//       const OFFLINE_MIN = 2;
//       const liveOutages: AlertItem[] = [];

//       const latestRows = await Promise.all(
//         deviceIds.map(async (id) => {
//           const { data } = await supabase
//             .from('energy_readings')
//             .select('reading_time, voltage_a, voltage_b, voltage_c, voltage_system')
//             .eq('device_id', id)
//             .order('reading_time', { ascending: false })
//             .limit(1)
//             .maybeSingle();
//           return { id, last: data?.reading_time as string | undefined, row: data };
//         })
//       );

//       const nowMs = Date.now();
//       latestRows.forEach(({ id, last, row }) => {
//         if (!last) return;
//         const lastDate = new Date(last);
//         const diffMinutes = Math.floor((nowMs - lastDate.getTime()) / 60000);

//         const volts = [row?.voltage_a, row?.voltage_b, row?.voltage_c, row?.voltage_system]
//           .filter((v) => v !== null && v !== undefined)
//           .map(Number);
//         const isZeroVoltage = volts.length > 0 && volts.every((v) => v < 5);

//         if (diffMinutes < OFFLINE_MIN && !isZeroVoltage) return;

//         const timeStr = lastDate.toLocaleString('th-TH', {
//           day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
//         });
//         const displayDiff =
//           diffMinutes >= 60
//             ? `${Math.floor(diffMinutes / 60)} ชม. ${diffMinutes % 60} นาที`
//             : `${diffMinutes} นาที`;

//         liveOutages.push({
//           id: `outage-live-${id}`,
//           device_id: id,
//           type: 'ไฟดับ / สัญญาณขาดหาย',
//           description: isZeroVoltage
//             ? `ตรวจพบแรงดันเป็น 0 V ไฟดับ (ตั้งแต่ ${timeStr} ถึงปัจจุบัน)`
//             : `ตรวจพบไฟดับหรือสัญญาณขาดหายเป็นเวลา ${displayDiff} (ตั้งแต่ ${timeStr} ถึงปัจจุบัน ยังไม่ได้รับข้อมูลใหม่)`,
//           status: 'ACTIVE',
//           created_at: lastDate.toISOString(),
//           building_name: currentBuildingName,
//           is_offline_alert: true,
//         });
//       });

//       const combinedAlerts = [...liveOutages, ...detectedOutages, ...dbAlerts].sort(
//         (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
//       );

//       setAlerts(combinedAlerts);
//     } catch (err) {
//       console.error('❌ Error loading alert history:', err);
//     } finally {
//       if (isFirstLoad.current) {
//         setLoading(false);
//         isFirstLoad.current = false;
//       }
//     }
//   }, [buildingId]);

//   useEffect(() => {
//     isFirstLoad.current = true;
//     fetchAlertsAndDetectOutages();
//     const interval = setInterval(fetchAlertsAndDetectOutages, 10000);
//     return () => clearInterval(interval);
//   }, [fetchAlertsAndDetectOutages]);

//   const counts = useMemo(() => {
//     let today = 0;
//     let yesterday = 0;
//     let earlier = 0;

//     alerts.forEach((item) => {
//       const cat = getDateCategory(item.created_at);
//       if (cat === 'today') today++;
//       else if (cat === 'yesterday') yesterday++;
//       else earlier++;
//     });

//     return { today, yesterday, earlier, all: alerts.length };
//   }, [alerts]);

//   const filteredAlerts = useMemo(() => {
//     if (selectedTab === 'all') return alerts;
//     return alerts.filter((item) => getDateCategory(item.created_at) === selectedTab);
//   }, [alerts, selectedTab]);

//   if (loading) {
//     return (
//       <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center shadow-sm flex flex-col items-center justify-center gap-3">
//         <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
//         <span className="text-slate-700 font-semibold text-base">กำลังโหลดประวัติการแจ้งเตือน...</span>
//       </div>
//     );
//   }

//   const todayStr = new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
//   const yesterdayStr = new Date(Date.now() - 86400000).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });

//   return (
//     <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
//       {/* Header */}
//       <div className="px-6 py-4 bg-gradient-to-r from-red-500/15 via-rose-500/10 to-red-500/5 border-b border-red-200/80 flex flex-wrap items-center justify-between gap-3">
//         <div className="flex items-center gap-3">
//           <div className="p-2.5 bg-red-600 text-white rounded-xl shadow-xs">
//             <ShieldAlert size={22} />
//           </div>
//           <div>
//             <h3 className="font-bold text-red-950 text-lg leading-snug">
//               รายการประวัติการแจ้งเตือน
//             </h3>
//             <p className="text-sm text-red-900/70">บันทึกเหตุการณ์ไฟดับ สัญญาณขาดหาย และความผิดปกติของไฟฟ้า</p>
//           </div>
//         </div>
//         {buildingName && (
//           <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 px-3.5 py-1.5 rounded-lg shadow-2xs">
//             <Building2 size={16} className="text-blue-600" />
//             {buildingName}
//           </div>
//         )}
//       </div>

//       {/* Filter Tabs - เพิ่มขนาดฟอนต์ */}
//       <div className="px-5 py-3 bg-slate-100/60 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-sm font-medium">
//         <button
//           onClick={() => setSelectedTab('today')}
//           className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${selectedTab === 'today'
//             ? 'bg-white text-blue-600 font-bold shadow-xs border border-slate-200'
//             : 'text-slate-600 hover:bg-slate-200/60'
//             }`}
//         >
//           <span className="text-sm">วันนี้ ({todayStr})</span>
//           <span
//             className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${counts.today > 0
//               ? selectedTab === 'today'
//                 ? 'bg-blue-100 text-blue-700'
//                 : 'bg-slate-200 text-slate-700'
//               : 'bg-slate-100 text-slate-400'
//               }`}
//           >
//             {counts.today}
//           </span>
//         </button>

//         <button
//           onClick={() => setSelectedTab('yesterday')}
//           className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${selectedTab === 'yesterday'
//             ? 'bg-white text-blue-600 font-bold shadow-xs border border-slate-200'
//             : 'text-slate-600 hover:bg-slate-200/60'
//             }`}
//         >
//           <span className="text-sm">เมื่อวาน ({yesterdayStr})</span>
//           <span
//             className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${counts.yesterday > 0
//               ? selectedTab === 'yesterday'
//                 ? 'bg-blue-100 text-blue-700'
//                 : 'bg-slate-200 text-slate-700'
//               : 'bg-slate-100 text-slate-400'
//               }`}
//           >
//             {counts.yesterday}
//           </span>
//         </button>

//         <button
//           onClick={() => setSelectedTab('earlier')}
//           className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${selectedTab === 'earlier'
//             ? 'bg-white text-blue-600 font-bold shadow-xs border border-slate-200'
//             : 'text-slate-600 hover:bg-slate-200/60'
//             }`}
//         >
//           <Calendar size={16} className="text-slate-500" />
//           <span className="text-sm">ก่อนหน้านี้</span>
//           <span
//             className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${counts.earlier > 0
//               ? selectedTab === 'earlier'
//                 ? 'bg-blue-100 text-blue-700'
//                 : 'bg-slate-200 text-slate-700'
//               : 'bg-slate-100 text-slate-400'
//               }`}
//           >
//             {counts.earlier}
//           </span>
//         </button>

//         <button
//           onClick={() => setSelectedTab('all')}
//           className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ml-auto ${selectedTab === 'all'
//             ? 'bg-slate-800 text-white font-bold shadow-xs'
//             : 'text-slate-600 hover:bg-slate-200/60'
//             }`}
//         >
//           <span className="text-sm">ทั้งหมด</span>
//           <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-700 text-slate-200">
//             {counts.all}
//           </span>
//         </button>
//       </div>

//       {/* Table Content */}
//       {filteredAlerts.length === 0 ? (
//         <div className="p-14 text-center flex flex-col items-center justify-center gap-2 text-slate-400">
//           <CheckCircle size={36} className="text-emerald-500/60" />
//           <p className="text-base font-medium text-slate-600">ไม่พบประวัติการแจ้งเตือนในช่วงเวลาที่เลือก</p>
//         </div>
//       ) : (
//         <div className="overflow-x-auto max-h-[550px]">
//           <table className="w-full text-left border-collapse">
//             <thead className="sticky top-0 bg-slate-100 z-10 text-slate-700 text-sm font-bold uppercase tracking-wider border-b border-slate-200 shadow-2xs">
//               <tr>
//                 {/* กำหนด min-w และ pr-8 เพื่อเว้นระยะห่างคอลัมน์ */}
//                 <th className="py-3.5 px-6 min-w-[280px] pr-8">ประเภทเหตุการณ์</th>
//                 <th className="py-3.5 px-6">รายละเอียด</th>
//                 <th className="py-3.5 px-6 w-[180px] whitespace-nowrap">เวลาที่เกิด</th>
//                 <th className="py-3.5 px-6 w-[140px] whitespace-nowrap">สถานะ</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100 text-slate-800 text-base">
//               {filteredAlerts.map((item) => {
//                 const badge = getTypeBadge(item.type, item.is_offline_alert, item.is_restored_alert);
//                 return (
//                   <tr key={item.id} className="hover:bg-slate-50/90 transition-colors">
//                     {/* ประเภทเหตุการณ์ (เว้นระยะ pr-8 + min-w) */}
//                     <td className="py-4 px-6 min-w-[280px] pr-8 font-semibold whitespace-nowrap">
//                       <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold border ${badge.className}`}>
//                         {badge.icon}
//                         {badge.label}
//                       </span>
//                     </td>

//                     {/* รายละเอียด */}
//                     <td className="py-4 px-6 leading-relaxed text-slate-700 font-normal">
//                       {item.description}
//                     </td>

//                     {/* เวลาที่เกิด */}
//                     <td className="py-4 px-6 text-sm text-slate-600 whitespace-nowrap">
//                       <div className="flex items-center gap-2 font-medium">
//                         <Clock size={16} className="text-slate-400 shrink-0" />
//                         {new Date(item.created_at).toLocaleString('th-TH', {
//                           day: 'numeric',
//                           month: 'short',
//                           hour: '2-digit',
//                           minute: '2-digit',
//                         })}
//                       </div>
//                     </td>

//                     {/* สถานะ */}
//                     <td className="py-4 px-6 whitespace-nowrap">
//                       {item.is_restored_alert ? (
//                         <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
//                           <CheckCircle2 size={15} className="text-emerald-600" />
//                           ปกติแล้ว
//                         </span>
//                       ) : item.status === 'ACTIVE' ? (
//                         <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200 animate-pulse">
//                           <span className="w-2 h-2 rounded-full bg-rose-500"></span>
//                           กำลังเกิดขึ้น
//                         </span>
//                       ) : (
//                         <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
//                           <CheckCircle2 size={15} className="text-emerald-600" />
//                           สิ้นสุดแล้ว
//                         </span>
//                       )}
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// }

// AlertHistoryTable.tsx
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
  CheckCircle,
  Moon
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
  is_restored_alert?: boolean;
  anomaly_started_at?: string; // เวลาที่ anomaly เริ่ม (ใช้กับแถวไฟกลับมาปกติของแรงดัน)
  resolution_reason?: string | null; // 'recovered' | 'superseded' | 'offline' (worker เป็นคนบันทึก)
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

// ประเภทแรงดันที่ต้องแจ้ง "ไฟกลับมาปกติ" เมื่อ worker ยืนยันว่าแรงดันกลับเข้าช่วงปกติ
const VOLTAGE_TYPES = ['over_voltage', 'overvoltage', 'under_voltage', 'undervoltage'];

// ถ้าแถว "ไฟกลับมาปกติ" ของแรงดันอยู่ใกล้แถวของไฟดับ (ห่างไม่เกินนี้) ให้ตัดซ้ำ
const RESTORE_DEDUP_MS = 2 * 60 * 1000;

type DateGroup = 'today' | 'yesterday' | 'earlier' | 'all';

function isUnderType(type: string) {
  return String(type || '').toLowerCase().includes('under');
}

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
function getTypeBadge(type: string, isOffline?: boolean, isRestored?: boolean) {
  if (isRestored) {
    return {
      label: 'ไฟกลับมาปกติ',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      icon: <Zap size={17} className="text-emerald-600 shrink-0" />
    };
  }

  if (isOffline) {
    return {
      label: 'ไฟดับ / สัญญาณขาดหาย',
      className: 'bg-rose-50 text-rose-700 border-rose-200/80',
      icon: <ZapOff size={17} className="text-rose-600 shrink-0" />
    };
  }

  const normalized = type.toLowerCase().trim();

  switch (normalized) {
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
    case 'night_usage':
      return {
        label: 'มีการใช้ไฟช่วงกลางคืน (Night Usage)',
        className: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
        icon: <Moon size={17} className="text-indigo-600 shrink-0" />
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

      // anomalies (ไม่รวมไฟดับ/ออฟไลน์) + แถว "แรงดันกลับสู่ช่วงปกติ"
      // ✅ UI แสดงตามที่ worker บันทึกไว้เท่านั้น (resolved_at + resolution_reason) ไม่เดาย้อนหลัง
      const dbAlerts: AlertItem[] = [];

      (anomaliesData || [])
        .filter((item) => !OFFLINE_TYPES.includes(item.type))
        .forEach((item) => {
          const rawStatus = (item.status || '').toLowerCase();
          const isActive = ['open', 'investigating', 'active'].includes(rawStatus);

          const t = String(item.type || '').toLowerCase().trim();
          const isVolt = VOLTAGE_TYPES.includes(t);

          // แสดงแถว "ไฟกลับมาปกติ" เฉพาะเมื่อ worker ยืนยันว่า recovered จริง
          // (ข้อมูลเก่าที่มี resolved_at แต่ยังไม่มี resolution_reason ถือว่า recovered)
          const reason: string | null = item.resolution_reason ?? null;
          const isRecovered =
            isVolt && !!item.resolved_at && (reason === 'recovered' || reason === null);
          const recoveredAt: string | undefined = isRecovered ? item.resolved_at : undefined;

          dbAlerts.push({
            id: item.id,
            device_id: item.device_id,
            type: item.type || 'ความผิดปกติไฟฟ้า',
            description: item.description || 'พบค่าไฟฟ้าไม่อยู่ในเกณฑ์ปกติ',
            status: isActive ? 'ACTIVE' : 'RESOLVED',
            created_at: item.created_at,
            building_name: currentBuildingName,
            is_offline_alert: false,
            resolution_reason: reason,
          });

          if (!recoveredAt) return;

          const label = isUnderType(t) ? 'ไฟต่ำ' : 'ไฟเกิน';

          dbAlerts.push({
            id: `resolved-${item.id}`,
            device_id: item.device_id,
            type: 'ไฟกลับมาปกติ',
            description: `แรงดันกลับสู่ช่วงปกติ (${label}สิ้นสุดแล้ว)`,
            status: 'RESOLVED',
            created_at: recoveredAt,
            building_name: currentBuildingName,
            is_restored_alert: true,
            anomaly_started_at: item.created_at,
          });
        });

      const detectedOutages: AlertItem[] = [];

      if (deviceIds.length > 0) {
        const { data: outageData, error: outageErr } = await supabase.rpc('get_device_outages', {
          p_device_ids: deviceIds,
          p_min_minutes: 2,
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

            // ✅ แจ้งว่าไฟกลับมาปกติ ณ เวลาที่ข้อมูลกลับมา
            detectedOutages.push({
              id: `restored-${row.device_id}-${row.end_time}`,
              device_id: row.device_id,
              type: 'ไฟกลับมาปกติ',
              description: `ไฟกลับมาปกติ ได้รับข้อมูลอีกครั้งเมื่อ ${endDate.toLocaleString('th-TH', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })} (หลังไฟดับหรือสัญญาณขาดหาย ${displayDiff})`,
              status: 'RESOLVED',
              created_at: endDate.toISOString(),
              building_name: currentBuildingName,
              is_restored_alert: true,
            });
          });
        }
      }

      const OFFLINE_MIN = 2;
      const liveOutages: AlertItem[] = [];

      const latestRows = await Promise.all(
        deviceIds.map(async (id) => {
          const { data } = await supabase
            .from('energy_readings')
            .select('reading_time, voltage_a, voltage_b, voltage_c, voltage_system')
            .eq('device_id', id)
            .order('reading_time', { ascending: false })
            .limit(1)
            .maybeSingle();
          return { id, last: data?.reading_time as string | undefined, row: data };
        })
      );

      const nowMs = Date.now();
      latestRows.forEach(({ id, last, row }) => {
        if (!last) return;
        const lastDate = new Date(last);
        const diffMinutes = Math.floor((nowMs - lastDate.getTime()) / 60000);

        const volts = [row?.voltage_a, row?.voltage_b, row?.voltage_c, row?.voltage_system]
          .filter((v) => v !== null && v !== undefined)
          .map(Number);
        const isZeroVoltage = volts.length > 0 && volts.every((v) => v < 5);

        if (diffMinutes < OFFLINE_MIN && !isZeroVoltage) return;

        const timeStr = lastDate.toLocaleString('th-TH', {
          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
        });
        const displayDiff =
          diffMinutes >= 60
            ? `${Math.floor(diffMinutes / 60)} ชม. ${diffMinutes % 60} นาที`
            : `${diffMinutes} นาที`;

        liveOutages.push({
          id: `outage-live-${id}`,
          device_id: id,
          type: 'ไฟดับ / สัญญาณขาดหาย',
          description: isZeroVoltage
            ? `ตรวจพบแรงดันเป็น 0 V ไฟดับ (ตั้งแต่ ${timeStr} ถึงปัจจุบัน)`
            : `ตรวจพบไฟดับหรือสัญญาณขาดหายเป็นเวลา ${displayDiff} (ตั้งแต่ ${timeStr} ถึงปัจจุบัน ยังไม่ได้รับข้อมูลใหม่)`,
          status: 'ACTIVE',
          created_at: lastDate.toISOString(),
          building_name: currentBuildingName,
          is_offline_alert: true,
        });
      });

      // ✅ ตัดแถว "ไฟกลับมาปกติ" ของแรงดันที่ซ้ำกับ "ไฟกลับมาปกติ" จากไฟดับ
      //    ตัดเฉพาะกรณี anomaly เริ่ม "ก่อน" ไฟกลับ (เหตุการณ์เดียวกัน)
      //    ถ้า anomaly เริ่มหลังไฟกลับ (เช่น ไฟกระชากตอนไฟมา) เป็นเหตุการณ์ใหม่ ต้องแสดง
      const outageRestores = detectedOutages
        .filter((o) => o.is_restored_alert)
        .map((o) => ({ device_id: o.device_id, ms: new Date(o.created_at).getTime() }));

      const dedupedDbAlerts = dbAlerts.filter((a) => {
        if (!a.is_restored_alert) return true;
        const ms = new Date(a.created_at).getTime();
        const startedMs = a.anomaly_started_at
          ? new Date(a.anomaly_started_at).getTime()
          : Number.POSITIVE_INFINITY;
        return !outageRestores.some(
          (o) =>
            o.device_id === a.device_id &&
            Math.abs(o.ms - ms) < RESTORE_DEDUP_MS &&
            startedMs < o.ms
        );
      });

      const combinedAlerts = [...liveOutages, ...detectedOutages, ...dedupedDbAlerts].sort(
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

      {/* Filter Tabs */}
      <div className="px-5 py-3 bg-slate-100/60 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-sm font-medium">
        <button
          onClick={() => setSelectedTab('today')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${selectedTab === 'today'
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
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${selectedTab === 'yesterday'
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
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${selectedTab === 'earlier'
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
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ml-auto whitespace-nowrap ${selectedTab === 'all'
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
                <th className="py-3.5 px-6 min-w-[260px]">ประเภทเหตุการณ์</th>
                <th className="py-3.5 px-6 min-w-[300px]">รายละเอียด</th>
                <th className="py-3.5 px-6 w-[180px] whitespace-nowrap">เวลาที่เกิด</th>
                <th className="py-3.5 px-6 w-[140px] whitespace-nowrap">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 text-base">
              {filteredAlerts.map((item) => {
                const badge = getTypeBadge(item.type, item.is_offline_alert, item.is_restored_alert);
                return (
                  <tr key={item.id} className="hover:bg-slate-50/90 transition-colors">
                    <td className="py-4 px-6 min-w-[260px] font-semibold whitespace-nowrap align-top">
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold border ${badge.className}`}>
                        {badge.icon}
                        {badge.label}
                      </span>
                    </td>

                    <td className="py-4 px-6 min-w-[300px] leading-relaxed text-slate-700 font-normal align-top">
                      {item.description}
                    </td>

                    <td className="py-4 px-6 text-sm text-slate-600 whitespace-nowrap align-top">
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

                    <td className="py-4 px-6 whitespace-nowrap align-top">
                      {item.is_restored_alert ? (
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={15} className="text-emerald-600" />
                          ปกติแล้ว
                        </span>
                      ) : item.status === 'ACTIVE' ? (
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