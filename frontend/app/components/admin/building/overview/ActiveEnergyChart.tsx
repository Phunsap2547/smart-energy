// "use client";

// import React from "react";
// import {
//   ResponsiveContainer,
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
// } from "recharts";
// import { EnergyIngest } from "@/types/energy";
// import { formatNumber, formatChartTime } from "@/lib/formatter";

// type TimeFilter = "1D" | "7D" | "30D" | "12M";

// interface ActiveEnergyChartProps {
//   data: EnergyIngest[];
//   filter: TimeFilter;
// }

// // ช่วยเติม Z บังคับให้ JS อ่านค่าเป็น UTC เสมอ
// function ensureUTC(raw: string): string {
//   let s = raw.trim().replace(" ", "T");
//   if (!s.endsWith("Z") && !/[+-]\d{2}:\d{2}$/.test(s)) {
//     s += "Z";
//   }
//   return s;
// }

// function bucketKey(date: Date, filter: TimeFilter): string {
//   if (filter === "12M") {
//     return `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}`;
//   }
//   return `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`;
// }

// function labelFor(date: Date, filter: TimeFilter): string {
//   if (filter === "12M") {
//     return date.toLocaleDateString("th-TH", {
//       month: "short",
//       year: "2-digit",
//       timeZone: "Asia/Bangkok",
//     });
//   }
//   return date.toLocaleDateString("th-TH", {
//     day: "2-digit",
//     month: "2-digit",
//     timeZone: "Asia/Bangkok",
//   });
// }

// export default function ActiveEnergyChart({ data, filter }: ActiveEnergyChartProps) {
//   if (!data || data.length === 0) {
//     return (
//       <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
//         ไม่มีข้อมูลสำหรับแสดงกราฟ
//       </div>
//     );
//   }

//   // 1. เรียงลำดับตามเวลาแบบ UTC
//   const sorted = [...data].sort((a, b) => {
//     const rawA = ensureUTC(a.reading_time || a.created_at || "");
//     const rawB = ensureUTC(b.reading_time || b.created_at || "");
//     return new Date(rawA).getTime() - new Date(rawB).getTime();
//   });

//   // 2. รวบรวมข้อมูลลง Bucket
//   const buckets = new Map<string, { rawTime: string; date: Date; value: number }>();
//   for (const item of sorted) {
//     const raw = item.reading_time || item.created_at;
//     if (!raw) continue;

//     const safeRaw = ensureUTC(raw);
//     const d = new Date(safeRaw);
//     const key = filter === "1D" ? (isNaN(d.getTime()) ? raw : d.getTime().toString()) : bucketKey(d, filter);
//     const value = Number(item.energy_kwh ?? item.power_kw ?? 0);

//     buckets.set(key, { rawTime: raw, date: d, value });
//   }

//   // 3. แปลงเวลาสำหรับแกน X
//   const chartData = Array.from(buckets.values())
//     .sort((a, b) => a.date.getTime() - b.date.getTime())
//     .map(({ rawTime, date, value }) => ({
//       time: filter === "1D" ? formatChartTime(rawTime) : labelFor(date, filter),
//       energy: value,
//     }));

//   return (
//     <div className="h-48 w-full pt-2">
//       <ResponsiveContainer width="100%" height="100%">
//         <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
//           <defs>
//             <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
//               <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
//               <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
//             </linearGradient>
//           </defs>

//           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

//           <XAxis
//             dataKey="time"
//             tickLine={false}
//             axisLine={false}
//             tick={{ fontSize: 11, fill: "#9ca3af" }}
//             interval="preserveStartEnd"
//           />

//           <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} />

//           <Tooltip
//             content={({ active, payload }) => {
//               if (active && payload && payload.length) {
//                 return (
//                   <div className="bg-gray-900 text-white p-2 rounded-lg shadow-md text-xs">
//                     <p className="font-medium text-gray-300">{payload[0].payload.time}</p>
//                     <p className="text-emerald-400 font-semibold mt-0.5">
//                       Energy: {formatNumber(Number(payload[0].value ?? 0), 1)} kWh
//                     </p>
//                   </div>
//                 );
//               }
//               return null;
//             }}
//           />

//           <Area
//             type="monotone"
//             dataKey="energy"
//             stroke="#10b981"
//             strokeWidth={2}
//             fillOpacity={1}
//             fill="url(#energyGradient)"
//           />
//         </AreaChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }






//กราฟ
// "use client";

// import React from "react";
// import {
//   ResponsiveContainer,
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
// } from "recharts";
// import { EnergyIngest } from "@/types/energy";
// import { formatNumber } from "@/lib/formatter";

// type TimeFilter = "1D" | "7D" | "30D" | "12M";

// interface ActiveEnergyChartProps {
//   data: EnergyIngest[];
//   filter: TimeFilter;
// }

// // แกะข้อความวันที่/เวลาจาก String ตรงๆ โดยไม่ผ่าน Timezone Conversion
// function parseLocalDateTime(raw: string): { dateStr: string; hourStr: string; monthStr: string; fullDate: Date } {
//   const clean = raw.trim().replace("T", " ");
//   const [datePart = "", timePart = ""] = clean.split(" ");
//   const [year = "1970", month = "01", day = "01"] = datePart.split("-");
//   const [hour = "00"] = timePart.split(":");

//   const d = new Date(Number(year), Number(month) - 1, Number(day), Number(hour));

//   return {
//     dateStr: `${year}-${month}-${day}`,
//     hourStr: `${hour.padStart(2, "0")}:00`,
//     monthStr: `${year}-${month}`,
//     fullDate: d,
//   };
// }

// export default function ActiveEnergyChart({ data, filter }: ActiveEnergyChartProps) {
//   if (!data || data.length === 0) {
//     return (
//       <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
//         ไม่มีข้อมูลสำหรับแสดงกราฟ
//       </div>
//     );
//   }

//   // 1. เรียงลำดับตามเวลาดิบ
//   const sorted = [...data].sort((a, b) => {
//     const rawA = a.reading_time || a.created_at || "";
//     const rawB = b.reading_time || b.created_at || "";
//     return rawA.localeCompare(rawB);
//   });

//   // 2. ถ้าเป็น 1D ดึงเฉพาะข้อมูลของวันที่ล่าสุดเท่านั้น (ป้องกันข้อมูลคนละวันปนกัน)
//   let targetData = sorted;
//   if (filter === "1D" && sorted.length > 0) {
//     const lastItem = sorted[sorted.length - 1];
//     const lastRaw = lastItem.reading_time || lastItem.created_at || "";
//     const { dateStr: latestDate } = parseLocalDateTime(lastRaw);
//     targetData = sorted.filter((item) => {
//       const raw = item.reading_time || item.created_at || "";
//       return parseLocalDateTime(raw).dateStr === latestDate;
//     });
//   }

//   // 3. จัดกลุ่มข้อมูล (Grouping) เพื่อคำนวณหน่วยไฟจริง (Max - Min)
//   const groupMap = new Map<string, { label: string; min: number | null; max: number | null; sortTime: number }>();

//   // เตรียม Skeleton สำหรับ 1D ให้ครบ 24 ชั่วโมง (00:00 - 23:00)
//   if (filter === "1D") {
//     for (let h = 0; h < 24; h++) {
//       const hStr = `${String(h).padStart(2, "0")}:00`;
//       groupMap.set(hStr, { label: hStr, min: null, max: null, sortTime: h });
//     }
//   }

//   for (const item of targetData) {
//     const raw = item.reading_time || item.created_at;
//     if (!raw) continue;

//     const val = Number(item.energy_kwh ?? item.power_kw ?? 0);
//     if (isNaN(val) || val <= 0) continue;

//     const { dateStr, hourStr, monthStr, fullDate } = parseLocalDateTime(raw);

//     let key = "";
//     let label = "";

//     if (filter === "1D") {
//       key = hourStr;
//       label = hourStr;
//     } else if (filter === "7D" || filter === "30D") {
//       key = dateStr;
//       label = `${fullDate.getDate().toString().padStart(2, "0")}/${(fullDate.getMonth() + 1).toString().padStart(2, "0")}`;
//     } else if (filter === "12M") {
//       key = monthStr;
//       label = fullDate.toLocaleDateString("th-TH", { month: "short", year: "2-digit" });
//     }

//     if (!groupMap.has(key)) {
//       groupMap.set(key, {
//         label,
//         min: val,
//         max: val,
//         sortTime: fullDate.getTime(),
//       });
//     } else {
//       const current = groupMap.get(key)!;
//       groupMap.set(key, {
//         ...current,
//         min: current.min === null ? val : Math.min(current.min, val),
//         max: current.max === null ? val : Math.max(current.max, val),
//       });
//     }
//   }

//   // 4. แปลงเป็นข้อมูลสำหรับกราฟ (คำนวณพลังงานที่ใช้จริง = Max - Min)
//   const chartData = Array.from(groupMap.values())
//     .sort((a, b) => a.sortTime - b.sortTime)
//     .map((item) => {
//       const diff = (item.max !== null && item.min !== null) ? Math.max(0, item.max - item.min) : 0;
//       return {
//         time: item.label,
//         energy: Number(diff.toFixed(2)),
//       };
//     });

//   return (
//     <div className="h-48 w-full pt-2">
//       <ResponsiveContainer width="100%" height="100%">
//         <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
//           <defs>
//             <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
//               <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
//               <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
//             </linearGradient>
//           </defs>

//           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

//           <XAxis
//             dataKey="time"
//             tickLine={false}
//             axisLine={false}
//             tick={{ fontSize: 11, fill: "#9ca3af" }}
//             interval={filter === "1D" ? 1 : "preserveStartEnd"}
//           />

//           <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} />

//           <Tooltip
//             content={({ active, payload }) => {
//               if (active && payload && payload.length) {
//                 return (
//                   <div className="bg-gray-900 text-white p-2 rounded-lg shadow-md text-xs">
//                     <p className="font-medium text-gray-300">{payload[0].payload.time}</p>
//                     <p className="text-emerald-400 font-semibold mt-0.5">
//                       Energy: {formatNumber(Number(payload[0].value ?? 0), 1)} kWh
//                     </p>
//                   </div>
//                 );
//               }
//               return null;
//             }}
//           />

//           <Area
//             type="monotone"
//             dataKey="energy"
//             stroke="#10b981"
//             strokeWidth={2}
//             fillOpacity={1}
//             fill="url(#energyGradient)"
//           />
//         </AreaChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }




//แผนภูมิแท่ง
"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { supabase } from "@/lib/supabase";
import { formatNumber } from "@/lib/formatter";

export type TimeFilter = "1D" | "7D" | "30D" | "12M";

interface ActiveEnergyChartProps {
  buildingId: string | number | null;
  filter: TimeFilter;
  selectedDate?: string;
}

interface ChartDataItem {
  label: string;
  energy: number;
  cost: number;
}

// แปลง Date Object เป็น YYYY-MM-DD
const formatDateStr = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// แกะชั่วโมงจาก Timestamp
const extractHourFromTimestamp = (readingTimeStr: string): string => {
  if (!readingTimeStr) return "00:00";
  let timePart = "";
  if (readingTimeStr.includes("T")) {
    timePart = readingTimeStr.split("T")[1];
  } else if (readingTimeStr.includes(" ")) {
    timePart = readingTimeStr.split(" ")[1];
  }
  if (timePart) {
    const hour = timePart.split(":")[0];
    if (hour && !isNaN(Number(hour))) {
      return `${String(Number(hour)).padStart(2, "0")}:00`;
    }
  }
  return "00:00";
};

export default function ActiveEnergyChart({
  buildingId,
  filter,
  selectedDate,
}: ActiveEnergyChartProps) {
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchChartData = useCallback(async () => {
    if (!buildingId) return;

    try {
      setLoading(true);

      // 1. ดึง Device IDs
      const { data: devices, error: deviceError } = await supabase
        .from("devices")
        .select("id")
        .eq("building_id", buildingId);

      if (deviceError || !devices || devices.length === 0) {
        setChartData([]);
        return;
      }

      const deviceIds = devices.map((d) => d.id);

      // 2. คำนวณช่วงเวลา Start - End แบบเดียวกับ DailyEnergyChart
      const targetDateObj = selectedDate ? new Date(selectedDate) : new Date();
      const endDateObj = new Date(targetDateObj);
      const startDateObj = new Date(targetDateObj);

      if (filter === "1D") {
        // รายวัน
        startDateObj.setHours(0, 0, 0, 0);
      } else if (filter === "7D") {
        startDateObj.setDate(targetDateObj.getDate() - 6);
      } else if (filter === "30D") {
        startDateObj.setDate(targetDateObj.getDate() - 29);
      } else if (filter === "12M") {
        startDateObj.setFullYear(targetDateObj.getFullYear() - 1);
      }

      const startDateStr = `${formatDateStr(startDateObj)} 00:00:00`;
      const endDateStr = `${formatDateStr(endDateObj)} 23:59:59`;

      // 3. ดึงข้อมูลแบบ Pagination Loop
      let allReadings: any[] = [];
      let page = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const from = page * pageSize;
        const to = from + pageSize - 1;

        const { data: batch, error: batchError } = await supabase
          .from("energy_readings")
          .select("reading_time, energy_kwh")
          .in("device_id", deviceIds)
          .gte("reading_time", startDateStr)
          .lte("reading_time", endDateStr)
          .order("reading_time", { ascending: true })
          .range(from, to);

        if (batchError || !batch || batch.length === 0) {
          hasMore = false;
        } else {
          allReadings = [...allReadings, ...batch];
          if (batch.length < pageSize) {
            hasMore = false;
          } else {
            page++;
          }
        }
      }

      // 4. สร้าง Skeleton รอ
      const groupedMap: {
        [key: string]: {
          min: number | null;
          max: number | null;
          label: string;
        };
      } = {};

      if (filter === "1D") {
        for (let h = 0; h < 24; h++) {
          const hourStr = `${String(h).padStart(2, "0")}:00`;
          groupedMap[hourStr] = { min: null, max: null, label: hourStr };
        }
      } else if (filter === "7D" || filter === "30D") {
        const totalDays = filter === "7D" ? 7 : 30;
        for (let i = totalDays - 1; i >= 0; i--) {
          const d = new Date(targetDateObj);
          d.setDate(d.getDate() - i);
          const dateKey = formatDateStr(d);
          const label = `${String(d.getDate()).padStart(2, "0")}/${String(
            d.getMonth() + 1
          ).padStart(2, "0")}`;
          groupedMap[dateKey] = { min: null, max: null, label };
        }
      }

      // 5. จัดกลุ่มข้อมูลลง groupedMap
      allReadings.forEach((item) => {
        if (item.energy_kwh === null || item.energy_kwh === undefined) return;

        let groupKey = "";

        if (filter === "1D") {
          groupKey = extractHourFromTimestamp(item.reading_time);
        } else {
          const datePart = item.reading_time.replace("T", " ").split(" ")[0];
          groupKey = datePart;
        }

        if (groupedMap[groupKey]) {
          const val = Number(item.energy_kwh);
          const currentMin = groupedMap[groupKey].min;
          const currentMax = groupedMap[groupKey].max;

          groupedMap[groupKey].min =
            currentMin === null ? val : Math.min(currentMin, val);
          groupedMap[groupKey].max =
            currentMax === null ? val : Math.max(currentMax, val);
        }
      });

      const ELECTRICITY_RATE = 4.3;

      // 6. คำนวณพลังงาน (Max - Min)
      const result: ChartDataItem[] = Object.keys(groupedMap)
        .sort()
        .map((key) => {
          const item = groupedMap[key];
          const diff =
            item.max !== null && item.min !== null
              ? Math.max(0, item.max - item.min)
              : 0;
          const energyKwh = Number(diff.toFixed(1));
          return {
            label: item.label,
            energy: energyKwh,
            cost: Number((energyKwh * ELECTRICITY_RATE).toFixed(2)),
          };
        });

      setChartData(result);
    } catch (err) {
      console.error("Active energy chart fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [buildingId, filter, selectedDate]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  if (loading) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
        กำลังโหลดข้อมูล...
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
        ไม่มีข้อมูลสำหรับแสดงกราฟ
      </div>
    );
  }

  return (
    <div className="h-48 w-full pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            interval={filter === "1D" ? 0 : "preserveStartEnd"}
          />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const energy = Number(payload[0].value ?? 0);
                return (
                  <div className="bg-gray-900 text-white p-2.5 rounded-lg shadow-md text-xs space-y-1">
                    <p className="font-medium text-gray-300">{payload[0].payload.label}</p>
                    <p className="text-emerald-400 font-semibold">
                      Energy: {formatNumber(energy, 1)} kWh
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="energy" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}