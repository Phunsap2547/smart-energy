// // components/admin/building/energy/HourlyAverageChart.tsx
// 'use client';

// import React, { useEffect, useState, useCallback, useMemo } from 'react';
// import {
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Cell,
// } from 'recharts';
// import { supabase } from '@/lib/supabase';

// interface HourlyAverageChartProps {
//   buildingId: string;
//   selectedDate?: string; // YYYY-MM-DD
// }

// type ViewMode = 'day' | 'week';

// interface ChartDataItem {
//   label: string;   // เช่น "08:00"
//   energy: number;  // kWh (รายวัน = ค่าของชั่วโมงนั้น, รายสัปดาห์ = ค่าเฉลี่ยข้ามวัน)
//   daysUsed: number; // จำนวนวันที่มีข้อมูลในชั่วโมงนั้น
// }

// // ช่วงเวลาที่ต้องการวิเคราะห์ (08:00 - 18:00 น.)
// // แท่ง 08:00 = 08:00-08:59 ... แท่ง 17:00 = 17:00-17:59  → ครอบคลุมถึง 18:00 น.
// // ถ้าอยากให้มีแท่ง 18:00 ด้วย ให้เปลี่ยน END_HOUR เป็น 18 แล้วใช้ h <= END_HOUR
// const START_HOUR = 8;
// const END_HOUR = 19; // ไม่รวมชั่วโมงนี้
// const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

// const WEEK_DAYS = 7;

// const MONTHS_TH = [
//   'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
//   'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
// ];

// const todayStr = (): string => {
//   const d = new Date();
//   const y = d.getFullYear();
//   const m = String(d.getMonth() + 1).padStart(2, '0');
//   const day = String(d.getDate()).padStart(2, '0');
//   return `${y}-${m}-${day}`;
// };

// // บวก/ลบวันจากสตริง YYYY-MM-DD (ใช้ UTC กันวันเพี้ยน)
// const addDays = (dateStr: string, delta: number): string => {
//   const d = new Date(`${dateStr}T00:00:00Z`);
//   d.setUTCDate(d.getUTCDate() + delta);
//   return d.toISOString().split('T')[0];
// };

// const thaiShortDate = (dateStr: string): string => {
//   const [y, m, d] = dateStr.split('-').map(Number);
//   return `${d} ${MONTHS_TH[m - 1]} ${y + 543}`;
// };

// // แยก "วันที่" และ "ชั่วโมง" จาก reading_time (รองรับทั้ง 'T' และเว้นวรรค)
// const splitTimestamp = (ts: string): { date: string; hour: number } | null => {
//   if (!ts) return null;
//   const normalized = ts.replace('T', ' ');
//   const [datePart, timePart] = normalized.split(' ');
//   if (!datePart || !timePart) return null;
//   const hour = Number(timePart.split(':')[0]);
//   if (isNaN(hour)) return null;
//   return { date: datePart, hour };
// };

// export default function HourlyAverageChart({
//   buildingId,
//   selectedDate,
// }: HourlyAverageChartProps) {
//   const [mode, setMode] = useState<ViewMode>('day');
//   const [data, setData] = useState<ChartDataItem[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);

//   const targetDate = selectedDate || todayStr();

//   const fetchData = useCallback(async () => {
//     if (!buildingId) return;

//     try {
//       setLoading(true);

//       const { data: devices, error: deviceError } = await supabase
//         .from('devices')
//         .select('id')
//         .eq('building_id', buildingId);

//       if (deviceError || !devices || devices.length === 0) {
//         setData([]);
//         return;
//       }
//       const deviceIds = devices.map((d) => d.id);

//       // รายวัน = วันที่เลือกวันเดียว / รายสัปดาห์ = 7 วันย้อนหลังนับถึงวันที่เลือก
//       const startDate = mode === 'week' ? addDays(targetDate, -(WEEK_DAYS - 1)) : targetDate;
//       const startStr = `${startDate} 00:00:00`;
//       const endStr = `${targetDate} 23:59:59`;

//       // ดึงข้อมูลแบบ pagination (Supabase จำกัด 1000 แถว/ครั้ง)
//       let allReadings: { reading_time: string; energy_kwh: number | null }[] = [];
//       const pageSize = 1000;
//       for (let page = 0; ; page++) {
//         const from = page * pageSize;
//         const to = from + pageSize - 1;

//         const { data: batch, error } = await supabase
//           .from('energy_readings')
//           .select('reading_time, energy_kwh')
//           .in('device_id', deviceIds)
//           .gte('reading_time', startStr)
//           .lte('reading_time', endStr)
//           .order('reading_time', { ascending: true })
//           .range(from, to);

//         if (error || !batch || batch.length === 0) break;
//         allReadings = allReadings.concat(batch as any[]);
//         if (batch.length < pageSize) break;
//       }

//       // 1) หา min/max ของ energy_kwh ในแต่ละ (วัน, ชั่วโมง) เฉพาะ 08:00-18:00
//       //    พลังงานที่ใช้ในชั่วโมงนั้น = max - min  (วิธีเดียวกับ DailyEnergyChart)
//       const perDayHour: Record<string, { min: number; max: number }> = {};

//       allReadings.forEach((item) => {
//         if (item.energy_kwh === null || item.energy_kwh === undefined) return;
//         const parsed = splitTimestamp(item.reading_time);
//         if (!parsed) return;
//         if (parsed.hour < START_HOUR || parsed.hour >= END_HOUR) return;

//         const key = `${parsed.date}|${parsed.hour}`;
//         const cur = perDayHour[key];
//         if (!cur) {
//           perDayHour[key] = { min: item.energy_kwh, max: item.energy_kwh };
//         } else {
//           cur.min = Math.min(cur.min, item.energy_kwh);
//           cur.max = Math.max(cur.max, item.energy_kwh);
//         }
//       });

//       // 2) รวมต่อชั่วโมง: รายวัน = ค่าของวันนั้น / รายสัปดาห์ = เฉลี่ยเฉพาะวันที่มีข้อมูล
//       const result: ChartDataItem[] = HOURS.map((h) => {
//         let sum = 0;
//         let count = 0;

//         Object.keys(perDayHour).forEach((key) => {
//           const [, hourStr] = key.split('|');
//           if (Number(hourStr) !== h) return;
//           const { min, max } = perDayHour[key];
//           sum += Math.max(0, max - min);
//           count += 1;
//         });

//         const avg = count > 0 ? sum / count : 0;
//         return {
//           label: `${String(h).padStart(2, '0')}:00`,
//           energy: Number(avg.toFixed(1)),
//           daysUsed: count,
//         };
//       });

//       setData(result);
//     } catch (err) {
//       console.error('Hourly average chart fetch error:', err);
//       setData([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [buildingId, targetDate, mode]);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   // ค่าเฉลี่ยรวม และชั่วโมงที่ใช้สูงสุด
//   const { avgEnergy, peak, hasData } = useMemo(() => {
//     const valid = data.filter((d) => d.daysUsed > 0);
//     if (valid.length === 0) return { avgEnergy: 0, peak: null as ChartDataItem | null, hasData: false };
//     const total = valid.reduce((s, d) => s + d.energy, 0);
//     const peakItem = valid.reduce((a, b) => (b.energy > a.energy ? b : a));
//     return {
//       avgEnergy: Number((total / valid.length).toFixed(1)),
//       peak: peakItem,
//       hasData: true,
//     };
//   }, [data]);

//   const rangeText =
//     mode === 'day'
//       ? thaiShortDate(targetDate)
//       : `${thaiShortDate(addDays(targetDate, -(WEEK_DAYS - 1)))} - ${thaiShortDate(targetDate)}`;

//   const title =
//     mode === 'day'
//       ? 'การใช้พลังงานรายชั่วโมง ช่วงเวลาทำการ (kWh)'
//       : 'ค่าเฉลี่ยการใช้พลังงานรายชั่วโมง ช่วงเวลาทำการ (kWh)';

//   return (
//     <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
//       <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
//         <div>
//           <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
//           <p className="text-xs text-slate-400 mt-0.5">
//             {String(START_HOUR).padStart(2, '0')}:00 - {String(END_HOUR).padStart(2, '0')}:00 น. · {rangeText}
//           </p>
//         </div>

//         <div className="flex items-center gap-2">
//           {/* สลับ รายวัน / รายสัปดาห์ */}
//           <div className="flex bg-slate-100 rounded-full p-0.5">
//             {(['day', 'week'] as ViewMode[]).map((m) => (
//               <button
//                 key={m}
//                 type="button"
//                 onClick={() => setMode(m)}
//                 className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors cursor-pointer ${
//                   mode === m
//                     ? 'bg-white text-sky-600 shadow-sm'
//                     : 'text-slate-500 hover:text-slate-700'
//                 }`}
//               >
//                 {m === 'day' ? 'รายวัน' : 'รายสัปดาห์'}
//               </button>
//             ))}
//           </div>

//           <span className="text-xs font-semibold text-sky-600 bg-sky-50 px-3 py-1 rounded-full whitespace-nowrap">
//             {loading ? 'กำลังคำนวณ...' : `เฉลี่ย ${avgEnergy} kWh/ชั่วโมง`}
//           </span>
//         </div>
//       </div>

//       {/* ชั่วโมงที่ใช้สูงสุด */}
//       {!loading && peak && (
//         <p className="text-xs text-slate-500 mb-2">
//           ชั่วโมงที่ใช้สูงสุด:{' '}
//           <span className="font-semibold text-slate-700">
//             {peak.label} น. ({peak.energy} kWh)
//           </span>
//         </p>
//       )}

//       <div className="h-64 w-full flex items-center justify-center">
//         {loading ? (
//           <div className="text-xs text-slate-400">กำลังโหลดข้อมูล...</div>
//         ) : !hasData ? (
//           <div className="text-xs text-slate-400">ไม่มีข้อมูลการใช้พลังงานในช่วงเวลานี้</div>
//         ) : (
//           <ResponsiveContainer width="100%" height="100%">
//             <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barCategoryGap="20%">
//               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
//               <XAxis
//                 dataKey="label"
//                 tickLine={false}
//                 axisLine={false}
//                 tick={{ fontSize: 11, fill: '#64748b' }}
//                 interval={0}
//               />
//               <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
//               <Tooltip
//                 labelFormatter={(label, payload) => {
//                   const days = payload?.[0]?.payload?.daysUsed ?? 0;
//                   return mode === 'week'
//                     ? `${label} น. (เฉลี่ยจาก ${days} วัน)`
//                     : `${label} น.`;
//                 }}
//                 formatter={(value: number) => [
//                   `${value} kWh`,
//                   mode === 'week' ? 'ค่าเฉลี่ยต่อชั่วโมง' : 'ปริมาณการใช้ไฟ',
//                 ]}
//                 contentStyle={{
//                   borderRadius: '12px',
//                   border: 'none',
//                   boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
//                   fontSize: '12px',
//                 }}
//               />
//               <Bar dataKey="energy" radius={[6, 6, 0, 0]} maxBarSize={40}>
//                 {data.map((entry, index) => (
//                   <Cell
//                     key={`cell-${index}`}
//                     fill={peak && entry.label === peak.label ? '#0369a1' : '#0ea5e9'}
//                   />
//                 ))}
//               </Bar>
//             </BarChart>
//           </ResponsiveContainer>
//         )}
//       </div>
//     </div>
//   );
// }



// components/admin/building/energy/HourlyAverageChart.tsx
'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell,
} from 'recharts';
import { supabase } from '@/lib/supabase';

interface HourlyAverageChartProps {
  buildingId: string;
  selectedDate?: string; // YYYY-MM-DD
}

type ViewMode = 'day' | 'week';

// ช่วงเวลาทำงาน 08:00 - 18:00 น.
// แท่ง 08:00 = 08:00-08:59 ... แท่ง 17:00 = 17:00-17:59 (ครบถึง 18:00 น.)
const START_HOUR = 8;
const END_HOUR = 18; // ไม่รวมชั่วโมงนี้
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);
const WEEK_DAYS = 7;

// ถ้า Peak ไม่เกินเฉลี่ยกี่เท่า ถือว่า "ใกล้เคียงกัน"
const CLOSE_RATIO = 1.2;

const DAYS_TH_SHORT = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
const MONTHS_TH = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
];

const todayStr = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const addDays = (dateStr: string, delta: number): string => {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().split('T')[0];
};

const thaiShortDate = (dateStr: string): string => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${d} ${MONTHS_TH[m - 1]} ${y + 543}`;
};

const dayOfWeek = (dateStr: string): number => new Date(`${dateStr}T00:00:00Z`).getUTCDay();

const splitTimestamp = (ts: string): { date: string; hour: number } | null => {
  if (!ts) return null;
  const [datePart, timePart] = ts.replace('T', ' ').split(' ');
  if (!datePart || !timePart) return null;
  const hour = Number(timePart.split(':')[0]);
  if (isNaN(hour)) return null;
  return { date: datePart, hour };
};

// kWh ที่ใช้ในแต่ละชั่วโมงของแต่ละวัน: { '2026-10-16': { 8: 12.3, 9: 15.1, ... } }
type HourlyByDate = Record<string, Record<number, number>>;

interface HourBar {
  label: string;
  energy: number;
  hasData: boolean;
}

interface DayBar {
  label: string;     // เช่น "ศ. 16/10"
  fullDate: string;
  avg: number;       // เฉลี่ย kWh/ชั่วโมง ในช่วง 08-18
  peak: number;      // ชั่วโมงที่ใช้สูงสุด (kWh)
  peakHour: string;  // เช่น "14:00"
  hasData: boolean;
}

interface Summary {
  avg: number;
  peak: number;
  peakLabel: string; // เวลา/วันที่เกิด Peak
}

export default function HourlyAverageChart({ buildingId, selectedDate }: HourlyAverageChartProps) {
  const [mode, setMode] = useState<ViewMode>('day');
  const [byDate, setByDate] = useState<HourlyByDate>({});
  const [loading, setLoading] = useState<boolean>(true);

  const targetDate = selectedDate || todayStr();

  const dates = useMemo(() => {
    if (mode === 'day') return [targetDate];
    return Array.from({ length: WEEK_DAYS }, (_, i) => addDays(targetDate, i - (WEEK_DAYS - 1)));
  }, [mode, targetDate]);

  const fetchData = useCallback(async () => {
    if (!buildingId) return;

    try {
      setLoading(true);

      const { data: devices, error: deviceError } = await supabase
        .from('devices')
        .select('id')
        .eq('building_id', buildingId);

      if (deviceError || !devices || devices.length === 0) {
        setByDate({});
        return;
      }
      const deviceIds = devices.map((d) => d.id);

      const startStr = `${dates[0]} 00:00:00`;
      const endStr = `${targetDate} 23:59:59`;

      let all: { reading_time: string; energy_kwh: number | null }[] = [];
      const pageSize = 1000;
      for (let page = 0; ; page++) {
        const from = page * pageSize;
        const { data: batch, error } = await supabase
          .from('energy_readings')
          .select('reading_time, energy_kwh')
          .in('device_id', deviceIds)
          .gte('reading_time', startStr)
          .lte('reading_time', endStr)
          .order('reading_time', { ascending: true })
          .range(from, from + pageSize - 1);

        if (error || !batch || batch.length === 0) break;
        all = all.concat(batch as any[]);
        if (batch.length < pageSize) break;
      }

      // หา min/max ของแต่ละ (วัน, ชั่วโมง) เฉพาะ 08:00-18:00 แล้วใช้ Max - Min (เหมือน DailyEnergyChart)
      const minMax: Record<string, Record<number, { min: number; max: number }>> = {};
      all.forEach((item) => {
        if (item.energy_kwh === null || item.energy_kwh === undefined) return;
        const p = splitTimestamp(item.reading_time);
        if (!p || p.hour < START_HOUR || p.hour >= END_HOUR) return;

        minMax[p.date] = minMax[p.date] || {};
        const cur = minMax[p.date][p.hour];
        if (!cur) {
          minMax[p.date][p.hour] = { min: item.energy_kwh, max: item.energy_kwh };
        } else {
          cur.min = Math.min(cur.min, item.energy_kwh);
          cur.max = Math.max(cur.max, item.energy_kwh);
        }
      });

      const result: HourlyByDate = {};
      Object.keys(minMax).forEach((date) => {
        result[date] = {};
        Object.keys(minMax[date]).forEach((h) => {
          const { min, max } = minMax[date][Number(h)];
          result[date][Number(h)] = Math.max(0, max - min);
        });
      });

      setByDate(result);
    } catch (err) {
      console.error('Hourly average chart fetch error:', err);
      setByDate({});
    } finally {
      setLoading(false);
    }
  }, [buildingId, dates, targetDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ----- ข้อมูลกราฟ -----
  // โหมดรายวัน: 1 แท่ง = 1 ชั่วโมง
  const hourBars: HourBar[] = useMemo(() => {
    const day = byDate[targetDate] || {};
    return HOURS.map((h) => ({
      label: `${String(h).padStart(2, '0')}:00`,
      energy: Number((day[h] ?? 0).toFixed(1)),
      hasData: day[h] !== undefined,
    }));
  }, [byDate, targetDate]);

  // โหมดรายสัปดาห์: 1 กลุ่มแท่ง = 1 วัน (เฉลี่ย vs Peak)
  const dayBars: DayBar[] = useMemo(() => {
    return dates.map((date) => {
      const hours = byDate[date] || {};
      const entries = Object.keys(hours).map((h) => ({ hour: Number(h), kwh: hours[Number(h)] }));
      const [, m, d] = date.split('-').map(Number);
      const label = `${DAYS_TH_SHORT[dayOfWeek(date)]} ${d}/${m}`;

      if (entries.length === 0) {
        return { label, fullDate: thaiShortDate(date), avg: 0, peak: 0, peakHour: '-', hasData: false };
      }
      const avg = entries.reduce((s, e) => s + e.kwh, 0) / entries.length;
      const top = entries.reduce((a, b) => (b.kwh > a.kwh ? b : a));
      return {
        label,
        fullDate: thaiShortDate(date),
        avg: Number(avg.toFixed(1)),
        peak: Number(top.kwh.toFixed(1)),
        peakHour: `${String(top.hour).padStart(2, '0')}:00`,
        hasData: true,
      };
    });
  }, [byDate, dates]);

  // ----- สรุปตัวเลข -----
  const summary: Summary | null = useMemo(() => {
    if (mode === 'day') {
      const valid = hourBars.filter((b) => b.hasData);
      if (valid.length === 0) return null;
      const avg = valid.reduce((s, b) => s + b.energy, 0) / valid.length;
      const top = valid.reduce((a, b) => (b.energy > a.energy ? b : a));
      return { avg: Number(avg.toFixed(1)), peak: top.energy, peakLabel: `${top.label} น.` };
    }
    const valid = dayBars.filter((b) => b.hasData);
    if (valid.length === 0) return null;
    const avg = valid.reduce((s, b) => s + b.avg, 0) / valid.length;
    const top = valid.reduce((a, b) => (b.peak > a.peak ? b : a));
    return {
      avg: Number(avg.toFixed(1)),
      peak: top.peak,
      peakLabel: `${top.label} เวลา ${top.peakHour} น.`,
    };
  }, [mode, hourBars, dayBars]);

  const ratio = summary && summary.avg > 0 ? summary.peak / summary.avg : 0;
  const loadFactor = summary && summary.peak > 0 ? (summary.avg / summary.peak) * 100 : 0;
  const isClose = ratio > 0 && ratio <= CLOSE_RATIO;

  const rangeText =
    mode === 'day'
      ? thaiShortDate(targetDate)
      : `${thaiShortDate(dates[0])} - ${thaiShortDate(targetDate)}`;

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">
            การใช้พลังงานเฉลี่ยรายชั่วโมง ช่วงเวลาทำงาน (kWh)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {String(START_HOUR).padStart(2, '0')}:00 - {String(END_HOUR).padStart(2, '0')}:00 น. · {rangeText}
          </p>
        </div>

        <div className="flex bg-slate-100 rounded-full p-0.5 self-start">
          {(['day', 'week'] as ViewMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors cursor-pointer ${
                mode === m ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {m === 'day' ? 'รายวัน' : 'รายสัปดาห์'}
            </button>
          ))}
        </div>
      </div>

      {/* สรุป: เฉลี่ย / Peak / เทียบกัน */}
      {!loading && summary && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            <div className="rounded-xl bg-sky-50 px-3 py-2">
              <p className="text-[11px] text-slate-500">เฉลี่ย (kWh/ชั่วโมง)</p>
              <p className="text-lg font-bold text-sky-700">{summary.avg}</p>
            </div>
            <div className="rounded-xl bg-amber-50 px-3 py-2">
              <p className="text-[11px] text-slate-500">Peak (kWh/ชั่วโมง)</p>
              <p className="text-lg font-bold text-amber-600">{summary.peak}</p>
              <p className="text-[10px] text-slate-400">{summary.peakLabel}</p>
            </div>
            <div className="rounded-xl bg-slate-50 px-3 py-2">
              <p className="text-[11px] text-slate-500">Peak ÷ เฉลี่ย</p>
              <p className="text-lg font-bold text-slate-700">{ratio.toFixed(2)} เท่า</p>
            </div>
            <div className="rounded-xl bg-slate-50 px-3 py-2">
              <p className="text-[11px] text-slate-500">เฉลี่ย ÷ Peak</p>
              <p className="text-lg font-bold text-slate-700">{loadFactor.toFixed(0)}%</p>
            </div>
          </div>
          <p
            className={`text-xs mb-2 font-medium ${isClose ? 'text-emerald-600' : 'text-amber-600'}`}
          >
            {isClose
              ? 'Peak ใกล้เคียงค่าเฉลี่ย — การใช้ไฟสม่ำเสมอตลอดช่วงเวลาทำงาน'
              : 'Peak สูงกว่าค่าเฉลี่ยชัดเจน — มีบางช่วงใช้ไฟพุ่งสูงกว่าปกติ'}
          </p>
        </>
      )}

      {/* Chart */}
      <div className="h-64 w-full flex items-center justify-center">
        {loading ? (
          <div className="text-xs text-slate-400">กำลังโหลดข้อมูล...</div>
        ) : !summary ? (
          <div className="text-xs text-slate-400">ไม่มีข้อมูลการใช้พลังงานในช่วงเวลานี้</div>
        ) : mode === 'day' ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourBars} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} interval={0} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                formatter={(v: number) => [`${v} kWh`, 'ปริมาณการใช้ไฟ']}
                labelFormatter={(l) => `${l} น.`}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '12px' }}
              />
              <ReferenceLine
                y={summary.avg}
                stroke="#0369a1"
                strokeDasharray="4 4"
                label={{ value: `เฉลี่ย ${summary.avg}`, position: 'insideTopRight', fontSize: 11, fill: '#0369a1' }}
              />
              <Bar dataKey="energy" radius={[6, 6, 0, 0]} maxBarSize={40}>
                {hourBars.map((b, i) => (
                  <Cell key={i} fill={b.hasData && b.energy === summary.peak ? '#f59e0b' : '#0ea5e9'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dayBars} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} interval={0} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                labelFormatter={(_, payload) => payload?.[0]?.payload?.fullDate ?? ''}
                formatter={(v: number, name: string, item: any) =>
                  name === 'peak'
                    ? [`${v} kWh (เวลา ${item?.payload?.peakHour} น.)`, 'Peak']
                    : [`${v} kWh/ชั่วโมง`, 'เฉลี่ย']
                }
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '12px' }}
              />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: 11 }}
                formatter={(v) => (v === 'avg' ? 'เฉลี่ยต่อชั่วโมง' : 'Peak (ชั่วโมงสูงสุด)')}
              />
              <Bar dataKey="avg" name="avg" fill="#0ea5e9" radius={[6, 6, 0, 0]} maxBarSize={26} />
              <Bar dataKey="peak" name="peak" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={26} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}