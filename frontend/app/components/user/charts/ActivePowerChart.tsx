// "use client";

// import React from "react";
// import {
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";

// interface ActivePowerChartProps {
//   data: { label: string; cost: number }[];
//   title?: string;
//   color?: string;
//   darkMode?: boolean;
//   valueSuffix?: string;
//   headerIcon?: React.ReactNode;
// }

// export default function ActivePowerChart({
//   data,
//   title = "กำลังไฟฟ้าใช้งาน (Active Power)",
//   color = "#1E9E5A",
//   darkMode = false,
//   valueSuffix = "kW",
//   headerIcon,
// }: ActivePowerChartProps) {
//   const textColor = darkMode ? "#9ca3af" : "#6b7280";
//   const gridColor = darkMode ? "#2a2d36" : "#e5e7eb";

//   return (
//     <div
//       style={{
//         background: "var(--card-bg)",
//         border: "1px solid var(--border-color)",
//         borderRadius: 14,
//         padding: "16px 20px",
//         display: "flex",
//         flexDirection: "column",
//         gap: 12,
//       }}
//     >
//       {/* Chart Header */}
//       <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//         {headerIcon && (
//           <div
//             style={{
//               width: 24,
//               height: 24,
//               borderRadius: 6,
//               background: "#E6F6EC",
//               color: color,
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//             }}
//           >
//             {headerIcon}
//           </div>
//         )}
//         <span style={{ fontSize: 14, fontWeight: 600 }}>{title}</span>
//       </div>

//       {/* Area Chart Container */}
//       <div style={{ width: "100%", height: 200 }}>
//         <ResponsiveContainer width="100%" height="100%">
//           <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
//             <defs>
//               <linearGradient id="activePowerGradient" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="5%" stopColor={color} stopOpacity={0.4} />
//                 <stop offset="95%" stopColor={color} stopOpacity={0.05} />
//               </linearGradient>
//             </defs>
//             <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
//             <XAxis dataKey="label" stroke={textColor} fontSize={12} tickLine={false} />
//             <YAxis stroke={textColor} fontSize={12} tickLine={false} />
//             <Tooltip
//               contentStyle={{
//                 background: darkMode ? "#191b21" : "#ffffff",
//                 borderColor: darkMode ? "#2a2d36" : "#e5e7eb",
//                 borderRadius: 8,
//                 fontSize: 12,
//               }}
//               formatter={(val: any) => [`${val} ${valueSuffix}`, title]}
//             />
//             <Area
//               type="monotone"
//               dataKey="cost"
//               stroke={color}
//               strokeWidth={2.5}
//               fillOpacity={1}
//               fill="url(#activePowerGradient)"
//             />
//           </AreaChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// }

// // ActivePowerChart.tsx
// "use client";

// import React from "react";
// import {
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";

// interface ActivePowerChartProps {
//   // cost: number | null (null หมายถึงช่วงเวลาอนาคตที่ยังมาไม่ถึง)
//   data: { label: string; cost: number | null }[];
//   title?: string;
//   color?: string;
//   darkMode?: boolean;
//   valueSuffix?: string;
//   headerIcon?: React.ReactNode;
// }

// export default function ActivePowerChart({
//   data,
//   title = "กำลังไฟฟ้าใช้งาน (Power Real-time)",
//   color = "#1E9E5A",
//   darkMode = false,
//   valueSuffix = "kW",
//   headerIcon,
// }: ActivePowerChartProps) {
//   const textColor = darkMode ? "#9ca3af" : "#6b7280";
//   const gridColor = darkMode ? "#2a2d36" : "#e5e7eb";

//   // กำหนดช่วงเวลาหลักบนแกน X ให้โชว์ครอบคลุมทั้งวัน (เช่น ทุกๆ 2-3 ชั่วโมง) หาก data มีความละเอียดสูง
//   const defaultTicks = [
//     "00:00", "02:00", "04:00", "06:00", "08:00", "10:00",
//     "12:00", "14:00", "16:00", "18:00", "20:00", "22:00", "23:59"
//   ];

//   // ตรวจสอบว่าใน data มี label ตรงกับ ticks ไหม ถ้ามีให้ใช้ ticks เพื่อให้แกน X สวยงามไม่ซ้อนกัน
//   const availableLabels = new Set(data?.map((d) => d.label));
//   const xAxisTicks = defaultTicks.filter((tick) => availableLabels.has(tick));

  

//   return (
//     <div
//       style={{
//         background: "var(--card-bg, #fff)",
//         border: "1px solid var(--border-color, #e5e7eb)",
//         borderRadius: 14,
//         padding: "16px 20px",
//         display: "flex",
//         flexDirection: "column",
//         gap: 12,
//       }}
//     >
//       {/* Chart Header */}
//       <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//         {headerIcon && (
//           <div
//             style={{
//               width: 24,
//               height: 24,
//               borderRadius: 6,
//               background: "#E6F6EC",
//               color: color,
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//             }}
//           >
//             {headerIcon}
//           </div>
//         )}
//         <span style={{ fontSize: 14, fontWeight: 600, color: darkMode ? "#f3f4f6" : "#1f2937" }}>
//           {title}
//         </span>
//       </div>

//       {/* Area Chart Container */}
//       <div style={{ width: "100%", height: 200 }}>
//         <ResponsiveContainer width="100%" height="100%">
//           <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
//             <defs>
//               <linearGradient id="activePowerGradient" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="5%" stopColor={color} stopOpacity={0.4} />
//                 <stop offset="95%" stopColor={color} stopOpacity={0.02} />
//               </linearGradient>
//             </defs>
            
//             <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            
//             <XAxis
//               dataKey="label"
//               stroke={textColor}
//               fontSize={11}
//               tickLine={false}
//               axisLine={{ stroke: gridColor }}
//               // กำหนด ticks เฉพาะช่วงเวลาหลัก เพื่อไม่ให้ตัวหนังสือเวลาแน่นเกินไปเมื่อเป็นนาที
//               ticks={xAxisTicks.length > 0 ? xAxisTicks : undefined}
//             />
            
//             <YAxis stroke={textColor} fontSize={11} tickLine={false} axisLine={false} />
            
//             <Tooltip
//               contentStyle={{
//                 background: darkMode ? "#191b21" : "#ffffff",
//                 borderColor: darkMode ? "#2a2d36" : "#e5e7eb",
//                 borderRadius: 8,
//                 fontSize: 12,
//                 color: textColor,
//                 boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
//               }}
//               formatter={(val: any) => [
//                 val !== null ? `${val} ${valueSuffix}` : "ไม่มีข้อมูล",
//                 title,
//               ]}
//             />
            
//             <Area
//               type="monotone"
//               dataKey="cost"
//               stroke={color}
//               strokeWidth={2}
//               fillOpacity={1}
//               fill="url(#activePowerGradient)"
//               connectNulls={false} // ห้ามลากเส้นต่อช่วงที่เป็น null
//               dot={false}
//               activeDot={{ r: 4, fill: color, stroke: "#fff", strokeWidth: 2 }}
//             />
//           </AreaChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// }


//ActivePowerChart.tsx
"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ActivePowerChartProps {
  data: { label: string; cost: number | null }[];
  title?: string;
  color?: string;
  darkMode?: boolean;
  valueSuffix?: string;
  headerIcon?: React.ReactNode;
}

export default function ActivePowerChart({
  data = [],
  title = "กำลังไฟฟ้าใช้งาน (Power Real-time)",
  color = "#1E9E5A",
  darkMode = false,
  valueSuffix = "kW",
  headerIcon,
}: ActivePowerChartProps) {
  const textColor = darkMode ? "#9ca3af" : "#6b7280";
  const gridColor = darkMode ? "#2a2d36" : "#e5e7eb";

  // 1. กำหนดช่วงเวลาหลักบนแกน X ยามปกติ
  const defaultTicks = [
    "00:00", "02:00", "04:00", "06:00", "08:00", "10:00",
    "12:00", "14:00", "16:00", "18:00", "20:00", "22:00", "23:59"
  ];

  // 2. ตรวจสอบว่าใน data มี label ตรงกับ ticks ไหม
  const availableLabels = new Set(data?.map((d) => d.label));
  const xAxisTicks = defaultTicks.filter((tick) => availableLabels.has(tick));

  return (
    <div
      style={{
        background: "var(--card-bg, #fff)",
        border: "1px solid var(--border-color, #e5e7eb)",
        borderRadius: 14,
        padding: "16px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {/* Chart Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {headerIcon && (
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              background: "#E6F6EC",
              color: color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {headerIcon}
          </div>
        )}
        <span style={{ fontSize: 14, fontWeight: 600, color: darkMode ? "#f3f4f6" : "#1f2937" }}>
          {title}
        </span>
      </div>

      {/* Area Chart Container */}
      <div style={{ width: "100%", height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="activePowerGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />

            <XAxis
              dataKey="label"
              stroke={textColor}
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: gridColor }}
              ticks={xAxisTicks.length > 0 ? xAxisTicks : undefined}
              interval="preserveStartEnd"
            />

            <YAxis
              stroke={textColor}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={[0, "auto"]}
            />

            <Tooltip
              contentStyle={{
                background: darkMode ? "#191b21" : "#ffffff",
                borderColor: darkMode ? "#2a2d36" : "#e5e7eb",
                borderRadius: 8,
                fontSize: 12,
                color: textColor,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
              formatter={(val: any) => [
                val !== null && val !== undefined ? `${val} ${valueSuffix}` : "ไม่มีข้อมูล",
                title,
              ]}
            />

            <Area
              type="monotone"
              dataKey="cost"
              stroke={color}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#activePowerGradient)"
              connectNulls={true}
              dot={false}
              activeDot={{ r: 4, fill: color, stroke: "#fff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}