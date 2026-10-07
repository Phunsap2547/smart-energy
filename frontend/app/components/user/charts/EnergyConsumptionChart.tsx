// // EnergyConsumptionChart.tsx
// "use client";

// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// interface Props {
//   // today = null หมายถึงช่วงเวลาที่ยังมาไม่ถึง (ไม่วาดเส้น)
//   data: { label: string; today: number | null; yesterday: number }[];
//   rangeLabel: string;
//   darkMode?: boolean;
// }

// export default function EnergyConsumptionChart({ data, rangeLabel, darkMode = false }: Props) {
//   const gridColor = darkMode ? "#2a2d36" : "#f1f5f9";
//   const textColor = darkMode ? "#9ca3af" : "#64748b";
//   const tooltipBg = darkMode ? "#1f2937" : "#ffffff";
//   const tooltipBorder = darkMode ? "#374151" : "#e2e8f0";

//   return (
//     <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color, #e5e7eb)", borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
//       {/* Inline Animation Style สำหรับจุด Pulse Real-time */}
//       <style>{`
//         @keyframes livePulse {
//           0% { opacity: 1; transform: scale(1); }
//           50% { opacity: 0.4; transform: scale(0.85); }
//           100% { opacity: 1; transform: scale(1); }
//         }
//         .live-dot {
//           animation: livePulse 2s infinite ease-in-out;
//         }
//       `}</style>

//       {/* Header */}
//       <div
//         style={{
//           background: "linear-gradient(135deg, #4fa3ad 0%, #3b82f6 100%)",
//           color: "#fff",
//           padding: "12px 18px",
//           fontWeight: 600,
//           fontSize: 14,
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//         }}
//       >
//         <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
//           ⚡ Energy Consumption (kWh)
//         </span>

//         {/* LIVE Badge แบบมินิมอล/ละมุนตา */}
//         <div
//           style={{
//             display: "inline-flex",
//             alignItems: "center",
//             gap: 6,
//             background: "rgba(255, 255, 255, 0.18)",
//             backdropFilter: "blur(4px)",
//             padding: "3px 10px",
//             borderRadius: 20,
//             border: "1px solid rgba(255, 255, 255, 0.25)",
//             fontSize: 11,
//             fontWeight: 500,
//             color: "rgba(255, 255, 255, 0.95)",
//             letterSpacing: "0.5px",
//           }}
//         >
//           <span
//             className="live-dot"
//             style={{
//               width: 7,
//               height: 7,
//               borderRadius: "50%",
//               backgroundColor: "#ef4444",
//               display: "inline-block",
//               boxShadow: "0 0 6px #ef4444",
//             }}
//           />
//           LIVE
//         </div>
//       </div>

//       {/* Body / Chart */}
//       <div style={{ padding: "16px 12px 10px" }}>
//         {data && data.length > 0 ? (
//           <ResponsiveContainer width="100%" height={230}>
//             <LineChart data={data} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
//               <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />

//               <XAxis 
//                 dataKey="label" 
//                 tick={{ fontSize: 11, fill: textColor }} 
//                 axisLine={{ stroke: gridColor }}
//                 tickLine={false}
//               />
//               <YAxis 
//                 tick={{ fontSize: 11, fill: textColor }} 
//                 axisLine={false}
//                 tickLine={false}
//               />

//               <Tooltip
//                 formatter={(value: any) => [`${Number(value).toLocaleString()} kWh`]}
//                 contentStyle={{
//                   backgroundColor: tooltipBg,
//                   borderColor: tooltipBorder,
//                   borderRadius: 10,
//                   fontSize: 12,
//                   color: textColor,
//                   boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
//                   padding: "8px 12px",
//                 }}
//               />

//               <Legend 
//                 wrapperStyle={{ fontSize: 12, color: textColor, paddingTop: "8px" }} 
//                 iconType="circle"
//               />

//               {/* เส้นก่อนหน้า (อยู่ด้านหลัง) */}
//               <Line 
//                 type="monotone" 
//                 dataKey="yesterday" 
//                 name="ก่อนหน้า" 
//                 stroke="#94a3b8" 
//                 strokeWidth={2} 
//                 strokeDasharray="4 4"
//                 dot={false}
//                 activeDot={{ r: 4 }}
//               />

//               {/* เส้นวันนี้ (อยู่ด้านหน้า) */}
//               <Line 
//                 type="monotone" 
//                 dataKey="today" 
//                 name={rangeLabel} 
//                 stroke="#f59e0b" 
//                 strokeWidth={3} 
//                 dot={{ r: 3, fill: "#f59e0b", strokeWidth: 2, stroke: "#fff" }} 
//                 activeDot={{ r: 6, strokeWidth: 0 }}
//                 connectNulls={false} 
//               />
//             </LineChart>
//           </ResponsiveContainer>
//         ) : (
//           <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 230, color: textColor, fontSize: 13 }}>
//             ไม่มีข้อมูลสำหรับแสดงผล
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // EnergyConsumptionChart.tsx
// "use client";

// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";

// interface Props {
//   // today = null หมายถึงช่วงเวลาที่ยังมาไม่ถึง
//   data: { label: string; today: number | null; yesterday: number }[];
//   rangeLabel: string;
//   darkMode?: boolean;
// }

// export default function EnergyConsumptionChart({ data, rangeLabel, darkMode = false }: Props) {
//   const gridColor = darkMode ? "#2a2d36" : "#f1f5f9";
//   const textColor = darkMode ? "#9ca3af" : "#64748b";
//   const tooltipBg = darkMode ? "#1f2937" : "#ffffff";
//   const tooltipBorder = darkMode ? "#374151" : "#e2e8f0";

//   // หา Label ของเวลาปัจจุบัน (จุดสุดท้ายที่มีค่า today)
//   const currentDataPoint = data ? [...data].reverse().find((d) => d.today !== null) : null;
//   const currentLabel = currentDataPoint?.label;

//   return (
//     <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color, #e5e7eb)", borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
//       {/* Dynamic Keyframe Style */}
//       <style>{`
//         @keyframes livePulse {
//           0% { opacity: 1; transform: scale(1); }
//           50% { opacity: 0.4; transform: scale(0.85); }
//           100% { opacity: 1; transform: scale(1); }
//         }
//         .live-dot {
//           animation: livePulse 2s infinite ease-in-out;
//         }
//       `}</style>

//       {/* Header */}
//       <div
//         style={{
//           background: "linear-gradient(135deg, #4fa3ad 0%, #3b82f6 100%)",
//           color: "#fff",
//           padding: "12px 18px",
//           fontWeight: 600,
//           fontSize: 14,
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//         }}
//       >
//         <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
//           ⚡ Real-time Trend (kWh)
//         </span>

//         {/* LIVE Badge */}
//         <div
//           style={{
//             display: "inline-flex",
//             alignItems: "center",
//             gap: 6,
//             background: "rgba(255, 255, 255, 0.18)",
//             backdropFilter: "blur(4px)",
//             padding: "3px 10px",
//             borderRadius: 20,
//             border: "1px solid rgba(255, 255, 255, 0.25)",
//             fontSize: 11,
//             fontWeight: 500,
//             color: "rgba(255, 255, 255, 0.95)",
//           }}
//         >
//           <span
//             className="live-dot"
//             style={{
//               width: 7,
//               height: 7,
//               borderRadius: "50%",
//               backgroundColor: "#ef4444",
//               display: "inline-block",
//               boxShadow: "0 0 6px #ef4444",
//             }}
//           />
//           LIVE
//         </div>
//       </div>

//       {/* Chart */}
//       <div style={{ padding: "16px 12px 10px" }}>
//         {data && data.length > 0 ? (
//           <ResponsiveContainer width="100%" height={230}>
//             <LineChart data={data} margin={{ top: 15, right: 15, left: -20, bottom: 0 }}>
//               <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />

//               <XAxis 
//                 dataKey="label" 
//                 tick={{ fontSize: 11, fill: textColor }} 
//                 axisLine={{ stroke: gridColor }}
//                 tickLine={false}
//               />
//               <YAxis 
//                 tick={{ fontSize: 11, fill: textColor }} 
//                 axisLine={false}
//                 tickLine={false}
//               />

//               <Tooltip
//                 formatter={(value: any) => [`${Number(value).toLocaleString()} kWh`]}
//                 contentStyle={{
//                   backgroundColor: tooltipBg,
//                   borderColor: tooltipBorder,
//                   borderRadius: 10,
//                   fontSize: 12,
//                   color: textColor,
//                   boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
//                   padding: "8px 12px",
//                 }}
//               />

//               <Legend 
//                 wrapperStyle={{ fontSize: 12, color: textColor, paddingTop: "8px" }} 
//                 iconType="circle"
//               />

//               {/* เส้นแนวตั้งบอกตำแหน่งเวลาปัจจุบัน */}
//               {currentLabel && (
//                 <ReferenceLine 
//                   x={currentLabel} 
//                   stroke="#ef4444" 
//                   strokeDasharray="3 3" 
//                   label={{ 
//                     value: "ตอนนี้", 
//                     position: "top", 
//                     fill: "#ef4444", 
//                     fontSize: 10,
//                     fontWeight: 600
//                   }} 
//                 />
//               )}

//               {/* เส้นก่อนหน้า (อยู่ด้านหลัง) */}
//               <Line 
//                 type="monotone" 
//                 dataKey="yesterday" 
//                 name="ก่อนหน้า" 
//                 stroke="#94a3b8" 
//                 strokeWidth={2} 
//                 strokeDasharray="4 4"
//                 dot={false}
//                 activeDot={{ r: 4 }}
//               />

//               {/* เส้นวันนี้ (Real-time Trend) */}
//               <Line 
//                 type="monotone" 
//                 dataKey="today" 
//                 name={rangeLabel} 
//                 stroke="#f59e0b" 
//                 strokeWidth={3} 
//                 dot={{ r: 3, fill: "#f59e0b", strokeWidth: 2, stroke: "#fff" }} 
//                 activeDot={{ r: 6, strokeWidth: 0 }}
//                 connectNulls={false} 
//               />
//             </LineChart>
//           </ResponsiveContainer>
//         ) : (
//           <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 230, color: textColor, fontSize: 13 }}>
//             ไม่มีข้อมูลสำหรับแสดงผล
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// EnergyConsumptionChart.tsx
"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Props {
  // today = null หมายถึงช่วงเวลาที่ยังมาไม่ถึง
  data: { label: string; today: number | null; yesterday: number }[];
  rangeLabel: string;
  darkMode?: boolean;
}

export default function EnergyConsumptionChart({ data, rangeLabel, darkMode = false }: Props) {
  const gridColor = darkMode ? "#2a2d36" : "#f1f5f9";
  const textColor = darkMode ? "#9ca3af" : "#94a3b8";
  const tooltipBg = darkMode ? "#1f2937" : "#ffffff";
  const tooltipBorder = darkMode ? "#374151" : "#e2e8f0";

  // คำนวณหาค่า Peak (สูงสุด) ของวันนี้
  const validTodayValues = data?.map((d) => d.today).filter((v): v is number => v !== null) || [];
  const maxTodayValue = validTodayValues.length > 0 ? Math.max(...validTodayValues) : null;
  const peakDataPoint = data?.find((d) => d.today === maxTodayValue);

  const DAY_TICKS = [
    "00:00", "02:00", "04:00", "06:00", "08:00", "10:00",
    "12:00", "14:00", "16:00", "18:00", "20:00", "22:00", "23:00",
  ];
  const formatDayTick = (v: string) => (v === "23:00" ? "23:59" : v);
  const isDayMode = data?.length === 24 && (data[0] as any)?.label === "00:00";

  return (
    <div
      style={{
        background: darkMode ? "#111827" : "#fff",
        border: `1px solid ${darkMode ? "#1f2937" : "#e5e7eb"}`,
        borderRadius: 16,
        padding: "20px 24px 16px",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
      }}
    >
      {/* Header สไตล์คลีนตามตัวอย่าง */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 16,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 18, fontWeight: 700, color: darkMode ? "#f3f4f6" : "#1f2937" }}>
            <span style={{ color: "#f59e0b" }}>⚡</span> Energy Consumption (kWh)
          </div>
          <div style={{ fontSize: 12, color: textColor, marginTop: 2 }}>
            เปรียบเทียบการใช้งานพลังงานไฟฟ้าวันนี้กับเมื่อวาน
          </div>
        </div>

        {/* Badge แสดง Peak สูงสุด เหมือนในตัวอย่าง */}
        {maxTodayValue !== null && (
          <div
            style={{
              background: darkMode ? "rgba(245, 158, 11, 0.15)" : "#fffbe8",
              border: "1px solid #fde68a",
              borderRadius: 8,
              padding: "6px 12px",
              fontSize: 12,
              color: "#d97706",
              fontWeight: 500,
            }}
          >
            Peak สูงสุด: <strong style={{ fontSize: 13 }}>{maxTodayValue.toLocaleString()} kWh</strong>{" "}
            <span style={{ fontSize: 11, opacity: 0.8 }}>({peakDataPoint?.label})</span>
          </div>
        )}
      </div>

      {/* Area Chart */}
      <div style={{ width: "100%", height: 260 }}>
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                {/* Gradient แรเงาสีส้มใต้อนาคตกราฟของ "วันนี้" */}
                <linearGradient id="todayGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="2 2" stroke={gridColor} vertical={false} />

              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: textColor }}
                axisLine={{ stroke: gridColor }}
                tickLine={false}
                ticks={isDayMode ? DAY_TICKS : undefined}
                tickFormatter={isDayMode ? formatDayTick : undefined}
                interval={isDayMode ? 0 : "preserveStartEnd"}
              />
              <YAxis
                tick={{ fontSize: 11, fill: textColor }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                formatter={(value: any) => [`${Number(value).toLocaleString()} kWh`]}
                contentStyle={{
                  backgroundColor: tooltipBg,
                  borderColor: tooltipBorder,
                  borderRadius: 8,
                  fontSize: 12,
                  color: textColor,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              />

              <Legend
                wrapperStyle={{ fontSize: 12, color: textColor, paddingTop: "12px" }}
                iconType="circle"
              />

              {/* 1. เส้นเมื่อวาน (อยู่ด้านหลัง - เส้นประสีเทา/ฟ้า คลีนๆ) */}
              <Area
                type="monotone"
                dataKey="yesterday"
                name="ก่อนหน้า"
                stroke="#94a3b8"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fill="none"
                dot={false}
                activeDot={{ r: 4 }}
              />

              {/* 2. เส้นวันนี้ (อยู่ด้านหน้า - Area Gradient สีส้ม) */}
              <Area
                type="monotone"
                dataKey="today"
                name={rangeLabel}
                stroke="#f59e0b"
                strokeWidth={2}
                fill="url(#todayGradient)"
                dot={false}
                activeDot={{ r: 5, fill: "#f59e0b", stroke: "#fff", strokeWidth: 2 }}
                connectNulls={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: textColor, fontSize: 13 }}>
            ไม่มีข้อมูลสำหรับแสดงผล
          </div>
        )}
      </div>
    </div>
  );
}