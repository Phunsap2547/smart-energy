// 'use client';

// import React, { useState, useEffect } from 'react';
// import {
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   ReferenceLine,
// } from 'recharts';
// import {
//   Gauge,
//   AlertTriangle,
//   CheckCircle2,
//   RefreshCw,
//   ShieldAlert,
//   TrendingUp,
// } from 'lucide-react';
// import { supabase } from '@/lib/supabase';

// interface PowerFactorChartProps {
//   buildingId: string;
//   selectedDate?: string;
//   timeRange?: 'day' | 'week';
//   pfThreshold?: number;
// }

// interface PFPoint {
//   time: string;
//   fullTime: string;
//   pfSystem: number;
//   pfA: number | null;
//   pfB: number | null;
//   pfC: number | null;
//   isAnomaly: boolean;
// }

// export default function PowerFactorChart({
//   buildingId,
//   selectedDate,
//   timeRange = 'day',
//   pfThreshold = 0.85,
// }: PowerFactorChartProps) {
//   const [loading, setLoading] = useState<boolean>(true);
//   const [chartData, setChartData] = useState<PFPoint[]>([]);
//   const [avgPf, setAvgPf] = useState<number>(0);
//   const [minPf, setMinPf] = useState<number>(1);
//   const [maxPf, setMaxPf] = useState<number>(0);
//   const [anomalyCount, setAnomalyCount] = useState<number>(0);

//   useEffect(() => {
//     const fetchPFData = async () => {
//       if (!buildingId) return;
//       setLoading(true);

//       try {
//         // 1. ดึง Device IDs
//         const { data: devices } = await supabase
//           .from('devices')
//           .select('id')
//           .eq('building_id', buildingId);

//         const deviceIds = devices?.map((d) => d.id) || [];
//         if (deviceIds.length === 0) {
//           setChartData([]);
//           setLoading(false);
//           return;
//         }

//         // 2. คำนวณช่วงเวลาแบบกำหนด Timezone ประเทศไทย (+07:00) ⚙️ [จุดแก้ที่ 1]
//         const baseDate = selectedDate ? new Date(selectedDate) : new Date();
//         const year = baseDate.getFullYear();
//         const month = String(baseDate.getMonth() + 1).padStart(2, '0');
//         const day = String(baseDate.getDate()).padStart(2, '0');

//         let startDateStr = '';
//         let endDateStr = '';

//         if (timeRange === 'day') {
//           startDateStr = `${year}-${month}-${day}T00:00:00.000+07:00`;
//           endDateStr = `${year}-${month}-${day}T23:59:59.999+07:00`;
//         } else {
//           const pastDate = new Date(baseDate);
//           pastDate.setDate(baseDate.getDate() - 6);
//           const pYear = pastDate.getFullYear();
//           const pMonth = String(pastDate.getMonth() + 1).padStart(2, '0');
//           const pDay = String(pastDate.getDate()).padStart(2, '0');

//           startDateStr = `${pYear}-${pMonth}-${pDay}T00:00:00.000+07:00`;
//           endDateStr = `${year}-${month}-${day}T23:59:59.999+07:00`;
//         }

//         // 3. ดึงข้อมูลจาก Supabase พร้อมเพิ่ม Limit ⚙️ [จุดแก้ที่ 2]
//         const { data: readings, error } = await supabase
//           .from('energy_readings')
//           .select('reading_time, power_factor, pf_a, pf_b, pf_c')
//           .in('device_id', deviceIds)
//           .gte('reading_time', startDateStr)
//           .lte('reading_time', endDateStr)
//           .order('reading_time', { ascending: true })
//           .limit(10000); // 👈 ปลดล็อคลิมิต 1,000 แถวของ Supabase

//         if (error || !readings || readings.length === 0) {
//           setChartData([]);
//           setLoading(false);
//           return;
//         }

//         // 4. คำนวณค่าทางสถิติ (Min, Max, Avg, Anomaly)
//         let sumPf = 0;
//         let lowestPf = 1;
//         let highestPf = 0;
//         let anomalies = 0;

//         const formattedData: PFPoint[] = readings.map((r) => {
//           const date = new Date(r.reading_time);

//           const timeStr = timeRange === 'week'
//             ? date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) + ' ' + date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
//             : date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

//           const fullTimeStr = date.toLocaleString('th-TH', {
//             dateStyle: 'short',
//             timeStyle: 'medium',
//           });

//           const pf = Math.min(1, Math.max(0, Number(r.power_factor ?? 0)));
//           const isBelow = pf < pfThreshold;

//           sumPf += pf;
//           if (pf < lowestPf) lowestPf = pf;
//           if (pf > highestPf) highestPf = pf;
//           if (isBelow) anomalies++;

//           return {
//             time: timeStr,
//             fullTime: fullTimeStr,
//             pfSystem: pf,
//             pfA: r.pf_a ? Number(r.pf_a) : null,
//             pfB: r.pf_b ? Number(r.pf_b) : null,
//             pfC: r.pf_c ? Number(r.pf_c) : null,
//             isAnomaly: isBelow,
//           };
//         });

//         setChartData(formattedData);
//         setAvgPf(readings.length > 0 ? sumPf / readings.length : 0);
//         setMinPf(readings.length > 0 ? lowestPf : 0);
//         setMaxPf(readings.length > 0 ? highestPf : 0);
//         setAnomalyCount(anomalies);
//       } catch (err) {
//         console.error('Fetch Power Factor Error:', err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPFData();
//   }, [buildingId, selectedDate, timeRange, pfThreshold]);

//   const formatNum = (val: number, decimals = 3) =>
//     val.toLocaleString('th-TH', {
//       minimumFractionDigits: decimals,
//       maximumFractionDigits: decimals,
//     });

//   return (
//     <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
//       {/* Header Section */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//         <div className="flex items-center gap-2.5">
//           <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
//             <Gauge className="w-5 h-5" />
//           </div>
//           <div>
//             <h2 className="text-base font-bold text-slate-800">
//               Power Factor (PF) Report & Anomaly Detection
//             </h2>
//             <p className="text-xs text-slate-500">
//               วิเคราะห์ประสิทธิภาพตัวประกอบกำลังไฟฟ้า ({timeRange === 'day' ? 'รายวัน' : 'รายสัปดาห์'}) เทียบเกณฑ์มาตรฐาน ({pfThreshold})
//             </p>
//           </div>
//         </div>

//         {/* Anomaly Badge */}
//         {anomalyCount > 0 ? (
//           <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl animate-pulse">
//             <AlertTriangle className="w-4 h-4 text-amber-600" />
//             <span className="text-xs font-bold">
//               พบ PF ต่ำกว่าเกณฑ์ {anomalyCount} ครั้ง
//             </span>
//           </div>
//         ) : (
//           <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl">
//             <CheckCircle2 className="w-4 h-4 text-emerald-600" />
//             <span className="text-xs font-bold">คุณภาพ Power Factor ปกติ</span>
//           </div>
//         )}
//       </div>

//       {loading ? (
//         <div className="h-64 flex items-center justify-center text-slate-400 gap-2">
//           <RefreshCw className="w-5 h-5 animate-spin" />
//           <span className="text-xs font-medium">กำลังวิเคราะห์ข้อมูล Power Factor...</span>
//         </div>
//       ) : chartData.length === 0 ? (
//         <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
//           ไม่พบข้อมูล Power Factor ในช่วงเวลาที่เลือก
//         </div>
//       ) : (
//         <>
//           {/* Chart Container */}
//           <div className="h-64 w-full">
//             <ResponsiveContainer width="100%" height="100%">
//               <AreaChart
//                 data={chartData}
//                 margin={{ top: 20, right: 20, left: -20, bottom: 0 }}
//               >
//                 <defs>
//                   <linearGradient id="colorPf" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
//                     <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
//                   </linearGradient>
//                 </defs>
//                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
//                 <XAxis
//                   dataKey="time"
//                   tick={{ fontSize: 11, fill: '#94a3b8' }}
//                   axisLine={false}
//                   tickLine={false}
//                 />
//                 <YAxis
//                   domain={[0.5, 1.0]}
//                   tick={{ fontSize: 11, fill: '#94a3b8' }}
//                   axisLine={false}
//                   tickLine={false}
//                 />
//                 <Tooltip
//                   content={({ active, payload }) => {
//                     if (active && payload && payload.length) {
//                       const data = payload[0].payload as PFPoint;
//                       return (
//                         <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs shadow-xl space-y-1">
//                           <p className="text-slate-400 text-[10px]">{data.fullTime}</p>
//                           <p className="font-semibold flex items-center gap-1.5">
//                             <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />
//                             Power Factor: {formatNum(data.pfSystem)}
//                           </p>
//                           {data.isAnomaly && (
//                             <span className="inline-block px-1.5 py-0.5 bg-amber-500/30 text-amber-300 font-bold text-[10px] rounded">
//                               ⚠️ ต่ำกว่าเกณฑ์ {pfThreshold}
//                             </span>
//                           )}
//                         </div>
//                       );
//                     }
//                     return null;
//                   }}
//                 />

//                 <ReferenceLine
//                   y={pfThreshold}
//                   stroke="#f59e0b"
//                   strokeDasharray="4 4"
//                   strokeWidth={1.5}
//                   label={{
//                     value: `เกณฑ์มาตรฐาน: ${pfThreshold}`,
//                     fill: '#d97706',
//                     fontSize: 10,
//                     position: 'top',
//                   }}
//                 />

//                 <Area
//                   type="monotone"
//                   dataKey="pfSystem"
//                   stroke="#6366f1"
//                   strokeWidth={2}
//                   fillOpacity={1}
//                   fill="url(#colorPf)"
//                 />
//               </AreaChart>
//             </ResponsiveContainer>
//           </div>

//           {/* Cards สรุปสถานะ PF (4 การ์ด) */}
//           <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
//             <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
//               <Gauge className="w-4 h-4 text-indigo-500" />
//               <div>
//                 <p className="text-[11px] text-slate-500">PF เฉลี่ยรวม</p>
//                 <p className="text-xs font-bold text-slate-800">
//                   {formatNum(avgPf)}
//                 </p>
//               </div>
//             </div>

//             <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
//               <ShieldAlert className="w-4 h-4 text-amber-500" />
//               <div>
//                 <p className="text-[11px] text-slate-500">PF ต่ำสุดที่พบ</p>
//                 <p
//                   className={`text-xs font-bold ${
//                     minPf < pfThreshold ? 'text-amber-600' : 'text-slate-800'
//                   }`}
//                 >
//                   {formatNum(minPf)}
//                 </p>
//               </div>
//             </div>

//             <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
//               <TrendingUp className="w-4 h-4 text-emerald-500" />
//               <div>
//                 <p className="text-[11px] text-slate-500">PF สูงสุดที่พบ</p>
//                 <p className="text-xs font-bold text-emerald-600">
//                   {formatNum(maxPf)}
//                 </p>
//               </div>
//             </div>

//             <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
//               <AlertTriangle
//                 className={`w-4 h-4 ${
//                   anomalyCount > 0 ? 'text-rose-500' : 'text-emerald-500'
//                 }`}
//               />
//               <div>
//                 <p className="text-[11px] text-slate-500">ผลประเมินค่าปรับ PF</p>
//                 <p
//                   className={`text-xs font-bold ${
//                     anomalyCount > 0 ? 'text-rose-600' : 'text-emerald-600'
//                   }`}
//                 >
//                   {anomalyCount > 0 ? 'เสี่ยงถูกคิดค่าปรับ VAR' : 'อยู่ในเกณฑ์ปกติ'}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { EnergyIngest } from '@/types/energy';
import { getTimeRangeIso, processEnergyReadings } from '@/lib/energyUtils';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Activity, AlertTriangle } from 'lucide-react';

interface PowerFactorChartProps {
  buildingId: string | number;
  timeRange?: 'day' | '7d' | '30d' | string;
  selectedDate?: string;
}

export const PowerFactorChart: React.FC<PowerFactorChartProps> = ({
  buildingId,
  timeRange = 'day',
  selectedDate,
}) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [avgPf, setAvgPf] = useState<number>(0);
  const [maxPf, setMaxPf] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const isMultiDay = timeRange === '7d' || timeRange === '30d';

  useEffect(() => {
    async function fetchPfData() {
      if (!buildingId) return;

      try {
        setLoading(true);

        // 1. ดึง device_id ทั้งหมดของอาคารนี้
        const { data: devices, error: deviceError } = await supabase
          .from('devices')
          .select('id')
          .eq('building_id', buildingId);

        if (deviceError) throw deviceError;

        const deviceIds = devices?.map((d) => d.id) || [];
        if (deviceIds.length === 0) {
          setChartData([]);
          setAvgPf(0);
          setMaxPf(0);
          return;
        }

        if (isMultiDay) {
          // โหมด 7 วัน หรือ 30 วัน: ดึงค่า PF สูงสุดของแต่ละวัน
          const daysCount = timeRange === '30d' ? 30 : 7;
          const baseDate = selectedDate ? new Date(selectedDate) : new Date();

          const dayPromises = [];
          for (let i = daysCount - 1; i >= 0; i--) {
            const d = new Date(baseDate);
            d.setDate(d.getDate() - i);

            const startOfDay = new Date(d);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(d);
            endOfDay.setHours(23, 59, 59, 999);

            dayPromises.push(
              supabase
                .from('energy_readings')
                .select('power_factor, reading_time')
                .in('device_id', deviceIds)
                .gte('reading_time', startOfDay.toISOString())
                .lte('reading_time', endOfDay.toISOString())
                .order('power_factor', { ascending: false })
                .limit(1)
                .then(({ data }) => {
                  const dayLabel = d.toLocaleDateString('th-TH', {
                    day: 'numeric',
                    month: 'short',
                  });
                  const fullDateLabel = d.toLocaleDateString('th-TH', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  });

                  const maxRead = data && data.length > 0 ? data[0] : null;
                  return {
                    time: dayLabel,
                    fullTime: fullDateLabel,
                    power_factor: maxRead ? Number(maxRead.power_factor) || 0 : 0,
                  };
                })
            );
          }

          const results = await Promise.all(dayPromises);
          setChartData(results);

          const validItems = results.filter((item) => item.power_factor > 0);
          if (validItems.length > 0) {
            const highestPf = Math.max(...validItems.map((item) => item.power_factor));
            const totalPf = validItems.reduce((sum, item) => sum + item.power_factor, 0);
            setMaxPf(Number(highestPf.toFixed(2)));
            setAvgPf(Number((totalPf / validItems.length).toFixed(2)));
          } else {
            setMaxPf(0);
            setAvgPf(0);
          }
        } else {
          // โหมด 1 วัน (รายวัน): ดึงข้อมูล Intraday
          const { startIso, endIso } = getTimeRangeIso('day', selectedDate);

          const { data, error } = await supabase
            .from('energy_readings')
            .select('*')
            .in('device_id', deviceIds)
            .gte('reading_time', startIso)
            .lte('reading_time', endIso)
            .order('reading_time', { ascending: true })
            .limit(3000);

          if (error) throw error;

          if (data && data.length > 0) {
            const processed = processEnergyReadings(data as EnergyIngest[], 'day');
            setChartData(processed);

            const validItems = processed.filter((item) => item.power_factor > 0);
            if (validItems.length > 0) {
              const highestPf = Math.max(...validItems.map((item) => item.power_factor));
              const totalPf = validItems.reduce((sum, item) => sum + item.power_factor, 0);
              setMaxPf(Number(highestPf.toFixed(2)));
              setAvgPf(Number((totalPf / validItems.length).toFixed(2)));
            } else {
              setMaxPf(0);
              setAvgPf(0);
            }
          } else {
            setChartData([]);
            setAvgPf(0);
            setMaxPf(0);
          }
        }
      } catch (err) {
        console.error('Error loading Power Factor chart:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPfData();
  }, [buildingId, timeRange, selectedDate, isMultiDay]);

  if (loading) {
    return <div className="h-72 flex items-center justify-center text-slate-400">กำลังโหลดข้อมูล...</div>;
  }

  const hasData = chartData.some((item) => item.power_factor > 0);
  const isPenaltyRisk = avgPf < 0.85 && avgPf > 0;

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <div>
          <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" /> Power Factor (PF)
          </h3>
          <p className="text-xs text-slate-500">
            {isMultiDay
              ? 'ค่าตัวประกอบกำลังไฟฟ้าสูงสุดประจำวัน (เป้าหมาย ≥ 0.85)'
              : 'ค่าตัวประกอบกำลังไฟฟ้า (เป้าหมาย ≥ 0.85)'}
          </p>
        </div>

        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
            isPenaltyRisk
              ? 'bg-rose-50 border-rose-200 text-rose-700'
              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}
        >
          <span className="text-xs font-medium">{isMultiDay ? 'PF สูงสุด:' : 'PF เฉลี่ย:'}</span>
          <span className="text-sm font-bold">{isMultiDay ? maxPf : avgPf}</span>
          {isPenaltyRisk && <span className="text-[10px] font-semibold text-rose-600">(เสี่ยงค่าปรับ)</span>}
        </div>
      </div>

      {!hasData ? (
        <div className="h-60 flex flex-col items-center justify-center text-slate-400 gap-2">
          <AlertTriangle className="w-8 h-8 text-slate-300" />
          <span>ไม่พบข้อมูล Power Factor ในช่วงเวลานี้</span>
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {isMultiDay ? (
              // โหมดหลายวัน (7d / 30d): ใช้ LineChart แบบมีจุด Marker
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                <YAxis domain={[0, 1]} tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white text-xs p-2.5 rounded-lg shadow-lg border border-slate-700">
                          <p className="font-medium text-slate-300 mb-1">{data.fullTime}</p>
                          <p className="text-blue-400 font-bold">PF สูงสุด: {data.power_factor}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="power_factor"
                  name="PF System"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#2563eb' }}
                />
              </LineChart>
            ) : (
              // โหมดรายวัน (day): ใช้ AreaChart สไตล์กึ่งโปร่งแสง ปิดจุดวงกลมหนาแน่น ทำให้เส้นกราฟเรียบเนียน สะอาดตา
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                <YAxis domain={[0, 1]} tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white text-xs p-2.5 rounded-lg shadow-lg border border-slate-700">
                          <p className="font-medium text-slate-300 mb-1">{data.fullTime}</p>
                          <p className="text-blue-400 font-bold">PF รวม: {data.power_factor}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="power_factor"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPf)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#2563eb' }}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};