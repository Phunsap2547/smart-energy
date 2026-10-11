// // EnergyTrendChart.tsx
// 'use client';

// import React, { useEffect, useState, useCallback } from 'react';
// import {
//   ResponsiveContainer,
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
// } from 'recharts';
// import { supabase } from '@/lib/supabase';

// interface EnergyTrendChartProps {
//   buildingId: string;
// }

// interface RealtimeDataPoint {
//   time: string;
//   current_system: number;
// }

// export default function EnergyTrendChart({ buildingId }: EnergyTrendChartProps) {
//   const [data, setData] = useState<RealtimeDataPoint[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);

//   // 1. ดึงข้อมูล 15 ค่าล่าสุดมาแสดงเริ่มต้น
//   const fetchInitialData = useCallback(async () => {
//     if (!buildingId) return;

//     try {
//       setLoading(true);

//       const { data: devices } = await supabase
//         .from('devices')
//         .select('id')
//         .eq('building_id', buildingId);

//       if (!devices || devices.length === 0) {
//         setData([]);
//         return;
//       }

//       const deviceIds = devices.map((d) => d.id);

//       const { data: readings, error } = await supabase
//         .from('energy_readings')
//         .select('reading_time, current_system')
//         .in('device_id', deviceIds)
//         .order('reading_time', { ascending: false })
//         .limit(15);

//       if (error || !readings) {
//         console.error('Error fetching initial trend:', error);
//         return;
//       }

//       // เรียงเวลาจากอดีตไปปัจจุบันเพื่อวาดกราฟ
//       const formatted = readings.reverse().map((item) => {
//         const timeStr = new Date(item.reading_time).toLocaleTimeString('th-TH', {
//           hour: '2-digit',
//           minute: '2-digit',
//           second: '2-digit',
//         });
//         return {
//           time: timeStr,
//           current_system: item.current_system ?? 0,
//         };
//       });

//       setData(formatted);
//     } catch (err) {
//       console.error('Realtime chart fetch error:', err);
//     } finally {
//       setLoading(false);
//     }
//   }, [buildingId]);

//   useEffect(() => {
//     fetchInitialData();

//     if (!buildingId) return;

//     // 2. ดักฟังข้อมูลใหม่แบบ Realtime WebSocket จาก Supabase
//     const channel = supabase
//       .channel(`realtime-current-${buildingId}`)
//       .on(
//         'postgres_changes',
//         {
//           event: 'INSERT',
//           schema: 'public',
//           table: 'energy_readings',
//         },
//         (payload) => {
//           const newReading = payload.new;
//           if (newReading && newReading.current_system !== undefined) {
//             const timeStr = new Date(newReading.reading_time || Date.now()).toLocaleTimeString('th-TH', {
//               hour: '2-digit',
//               minute: '2-digit',
//               second: '2-digit',
//             });

//             const newPoint: RealtimeDataPoint = {
//               time: timeStr,
//               current_system: Number(newReading.current_system ?? 0),
//             };

//             // ดันข้อมูลใหม่เข้ากราฟ และเก็บเฉพาะ 15 จุดล่าสุด
//             setData((prev) => [...prev.slice(-14), newPoint]);
//           }
//         }
//       )
//       .subscribe();

//     return () => {
//       supabase.removeChannel(channel);
//     };
//   }, [buildingId, fetchInitialData]);

//   const latestCurrent = data.length > 0 ? data[data.length - 1].current_system : 0;

//   return (
//     <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
//       <div className="flex items-center justify-between mb-4">
//         <div>
//           <div className="flex items-center gap-2">
//             <h3 className="font-bold text-slate-800 text-sm">กระแสไฟฟ้ารวม Real-time (A)</h3>
//             <span className="relative flex h-2 w-2">
//               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
//               <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
//             </span>
//           </div>
//           <p className="text-xs text-slate-400 mt-0.5">อัปเดตข้อมูลสดเมื่อ ESP32 ส่งค่าเข้ามา</p>
//         </div>
//         <div className="text-right">
//           <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
//             ปัจจุบัน: {latestCurrent.toFixed(2)} A
//           </span>
//         </div>
//       </div>

//       <div className="h-64 w-full flex items-center justify-center">
//         {loading ? (
//           <div className="text-xs text-slate-400">กำลังเชื่อมต่อข้อมูล Real-time...</div>
//         ) : data.length === 0 ? (
//           <div className="text-xs text-slate-400">รอรับข้อมูล Real-time จากมิเตอร์...</div>
//         ) : (
//           <ResponsiveContainer width="100%" height="100%">
//             <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
//               <defs>
//                 <linearGradient id="realtimeCurrent" x1="0" y1="0" x2="0" y2="1">
//                   <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
//                   <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
//                 </linearGradient>
//               </defs>
//               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
//               <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
//               <YAxis
//                 tickLine={false}
//                 axisLine={false}
//                 tick={{ fontSize: 11, fill: '#64748b' }}
//                 tickFormatter={(value) => `${value}A`}
//               />
//               <Tooltip
//                 formatter={(value: number) => [`${value} A`, 'กระแสไฟฟ้า']}
//                 contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
//               />
//               <Area
//                 type="monotone"
//                 dataKey="current_system"
//                 stroke="#10b981"
//                 strokeWidth={2.5}
//                 fillOpacity={1}
//                 fill="url(#realtimeCurrent)"
//                 isAnimationActive={false}
//               />
//             </AreaChart>
//           </ResponsiveContainer>
//         )}
//       </div>
//     </div>
//   );
// }


//CurrentChart.tsx
"use client";

import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { EnergyIngest } from "@/types/energy";
import { formatNumber, formatChartTime } from "@/lib/formatter";

type TimeFilter = "1D" | "7D" | "30D" | "12M";

interface CurrentChartProps {
  data: EnergyIngest[];
  filter?: string; // เก็บไว้เพื่อความเข้ากันได้กับโค้ดเดิม
  timeRange?: "day" | "7d" | "30d" | string;
}

const CURRENT_FIELD = "current_system" as keyof EnergyIngest;
const COLOR = "#10b981";
const PEAK_COLOR = "#f59e0b";

const FILTER_FROM_RANGE: Record<string, TimeFilter> = {
  day: "1D",
  "7d": "7D",
  "30d": "30D",
};

function bucketKey(date: Date, filter: TimeFilter): string {
  if (filter === "12M") {
    return `${date.getFullYear()}-${date.getMonth() + 1}`;
  }
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function labelFor(date: Date, filter: TimeFilter): string {
  if (filter === "12M") {
    return date.toLocaleDateString("th-TH", { month: "short", year: "2-digit" });
  }
  return date.toLocaleDateString("th-TH", { day: "2-digit", month: "2-digit" });
}

// ข้อความเต็มสำหรับ Tooltip / Badge เช่น "9 ต.ค. 2569 11:25"
function fullDateTime(d: Date): string {
  if (isNaN(d.getTime())) return "-";
  const date = d.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${date} ${time}`;
}

function fullDateOnly(d: Date): string {
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface Bucket {
  rawTime: string;
  date: Date;
  sum: number;
  count: number;
  max: number;
  maxDate: Date;
}

export default function CurrentChart({ data, filter, timeRange }: CurrentChartProps) {
  const activeFilter: TimeFilter =
    (timeRange && FILTER_FROM_RANGE[timeRange]) ||
    (filter as TimeFilter | undefined) ||
    "1D";

  const isMultiDay = activeFilter !== "1D";

  // ค่ากระแสล่าสุดสำหรับ Header การ์ด
  const latestValue =
    data && data.length > 0
      ? Number(data[data.length - 1][CURRENT_FIELD] ?? 0)
      : 0;

  const { chartData, peakValue, peakTime } = useMemo(() => {
    if (!data || data.length === 0) {
      return { chartData: [], peakValue: 0, peakTime: "-" };
    }

    // 1. Sort เรียงลำดับเวลา
    const sorted = [...data].sort((a, b) => {
      const rawA = (a.reading_time || a.created_at || "").replace(" ", "T");
      const rawB = (b.reading_time || b.created_at || "").replace(" ", "T");
      return new Date(rawA).getTime() - new Date(rawB).getTime();
    });

    // 2. จัดกลุ่มข้อมูล (Buckets) + หา Peak ของแต่ละกลุ่ม และของทั้งช่วงเวลา
    const buckets = new Map<string, Bucket>();
    let overallPeak = 0;
    let overallPeakDate: Date | null = null;

    for (const item of sorted) {
      const raw = item.reading_time || item.created_at;
      if (!raw) continue;

      const d = new Date(raw.replace(" ", "T"));
      const key =
        activeFilter === "1D"
          ? isNaN(d.getTime())
            ? raw
            : d.getTime().toString()
          : bucketKey(d, activeFilter);

      const val = Number(item[CURRENT_FIELD] ?? 0);

      if (val > overallPeak) {
        overallPeak = val;
        overallPeakDate = d;
      }

      const existing = buckets.get(key);
      if (existing) {
        existing.sum += val;
        existing.count += 1;
        if (val > existing.max) {
          existing.max = val;
          existing.maxDate = d;
        }
      } else {
        buckets.set(key, {
          rawTime: raw,
          date: d,
          sum: val,
          count: 1,
          max: val,
          maxDate: d,
        });
      }
    }

    // 3. แปลงเป็นข้อมูลกราฟ
    const rows = Array.from(buckets.values())
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map((b) => ({
        time:
          activeFilter === "1D"
            ? formatChartTime(b.rawTime)
            : labelFor(b.date, activeFilter),
        fullTime:
          activeFilter === "1D" ? fullDateTime(b.date) : fullDateOnly(b.date),
        current: Number((b.sum / b.count).toFixed(2)),
        peak: Number(b.max.toFixed(2)),
        peakAt: fullDateTime(b.maxDate),
      }));

    return {
      chartData: rows,
      peakValue: Number(overallPeak.toFixed(2)),
      peakTime: overallPeakDate ? fullDateTime(overallPeakDate) : "-",
    };
  }, [data, activeFilter]);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-full flex flex-col justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">System Current</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-bold text-slate-800">0.00</span>
            <span className="text-sm font-semibold text-slate-500">A</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">กระแสรวมของระบบ</p>
        </div>
        <div className="h-64 flex items-center justify-center text-sm text-gray-400">
          ไม่มีข้อมูลกระแสรวม
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-full flex flex-col justify-between">
      {/* --- Header --- */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-slate-500">System Current</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-bold text-slate-800">
              {formatNumber(latestValue, 2)}
            </span>
            <span className="text-sm font-semibold text-slate-500">A</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">กระแสรวมของระบบ</p>
        </div>

        {/* Badge Peak สูงสุด */}
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg self-start">
          <span className="text-sm text-amber-700 font-medium">Peak สูงสุด:</span>
          <span className="text-base font-bold text-amber-600">
            {peakValue.toLocaleString()} A
          </span>
          <span className="text-xs text-amber-500 font-normal">({peakTime})</span>
        </div>
      </div>

      {/* --- Chart Area --- */}
      <div className="h-64 w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="currentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLOR} stopOpacity={0.25} />
                <stop offset="95%" stopColor={COLOR} stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              interval={isMultiDay ? 0 : "preserveStartEnd"}
              minTickGap={isMultiDay ? 0 : 40}
              angle={activeFilter === "30D" ? -45 : 0}
              textAnchor={activeFilter === "30D" ? "end" : "middle"}
              height={activeFilter === "30D" ? 45 : 30}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickFormatter={(value) => `${value}A`}
              domain={[0, "auto"]}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const row = payload[0].payload;
                  return (
                    <div className="bg-[#111827] text-white px-3 py-2 rounded-xl shadow-lg text-xs">
                      <p className="font-medium text-gray-300">{row.fullTime}</p>
                      {isMultiDay ? (
                        <>
                          <p className="text-amber-400 font-semibold mt-0.5">
                            Peak: {formatNumber(row.peak, 2)} A
                            <span className="text-amber-300/70 font-normal"> ({row.peakAt})</span>
                          </p>
                          <p className="text-emerald-400 font-semibold mt-0.5">
                            เฉลี่ย: {formatNumber(row.current, 2)} A
                          </p>
                        </>
                      ) : (
                        <p className="text-emerald-400 font-semibold mt-0.5">
                          กระแส: {formatNumber(row.current, 2)} A
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* ค่าเฉลี่ย (รายวันเมื่อเลือก 7/30 วัน) */}
            <Area
              type="monotone"
              dataKey="current"
              stroke={COLOR}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#currentGradient)"
            />

            {/* เส้น Peak รายวัน แสดงเฉพาะตอนเลือก 7 / 30 วัน */}
            {isMultiDay && (
              <Area
                type="monotone"
                dataKey="peak"
                stroke={PEAK_COLOR}
                strokeWidth={2}
                strokeDasharray="4 3"
                fill="none"
                dot={{ r: 3, fill: PEAK_COLOR, strokeWidth: 0 }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {isMultiDay && (
        <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-emerald-500 inline-block" /> เฉลี่ยรายวัน
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-amber-500 inline-block" /> Peak รายวัน
          </span>
        </div>
      )}
    </div>
  );
}