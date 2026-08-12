// "use client";

// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   ResponsiveContainer,
//   Dot,
// } from "recharts";
// import { LineChart as LineChartIcon } from "lucide-react";
// import theme from "@/config/theme.js";
// import { energyConsumptionSeries } from "@/data/mockData";

// export default function EnergyConsumptionChart() {
//   const panel = theme.panels.energyConsumption;
//   const lines = theme.chartLines;

//   return (
//     <div className="rounded-card overflow-hidden shadow-card bg-white flex-1">
//       <div
//         className="flex items-center justify-between px-[4px] py-[3px] text-[22px]"
//         style={{
//           background: `linear-gradient(90deg, ${panel.headerFrom} 0%, ${panel.headerTo} 100%)`,
//         }}
//       >
//         <div className="flex items-center gap-[10px] text-white font-medium text-sm px-[20px]">
//           <LineChartIcon size={26} />
//           Energy Consumption
//         </div>
//         <span
//           className="text-xs font-bold px-2 py-0.5 rounded"
//           style={{ backgroundColor: panel.liveBadgeBg, color: panel.liveBadgeText }}
//         >
//           LIVE
//         </span>
//       </div>

//       <div className="p-4 ">
//         <ResponsiveContainer width="100%" height={250}>
//           <LineChart data={energyConsumptionSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
//             <CartesianGrid stroke={lines.gridLine} vertical={false} />
//             <XAxis dataKey="time" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
//             <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
//             <Line
//               type="monotone"
//               dataKey="voltage"
//               stroke={lines.voltage}
//               strokeWidth={2}
//               dot={{ r: 3, fill: "#111827" }}
//             />
//             <Line
//               type="monotone"
//               dataKey="current"
//               stroke={lines.current}
//               strokeWidth={2}
//               dot={{ r: 3, fill: "#111827" }}
//             />
//             <Line
//               type="monotone"
//               dataKey="power"
//               stroke={lines.power}
//               strokeWidth={2}
//               dot={(props) => {
//                 // ไฮไลต์จุดสีแดงที่ค่าต่ำสุด (เช่นค่าที่ต้องเฝ้าระวัง) เหมือนดีไซน์ต้นฉบับ
//                 const isLowest = props.payload.time === "10.00 AM";
//                 return (
//                   <Dot
//                     key={props.index}
//                     cx={props.cx}
//                     cy={props.cy}
//                     r={isLowest ? 6 : 3}
//                     fill={isLowest ? lines.marker : "#111827"}
//                   />
//                 );
//               }}
//             />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// }

"use client";


import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface Props {
  data: { label: string; today: number; yesterday: number }[];
  rangeLabel: string;
  darkMode: boolean;
}

export default function EnergyConsumptionChart({ data, rangeLabel, darkMode }: Props) {
  const gridColor = darkMode ? "#2a2d36" : "#eee";
  const textColor = darkMode ? "#9ca3af" : "#6b7280";

  return (
    <div style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: 12, overflow: "hidden" }}>
      <div
        style={{
          background: "#5aa9b3",
          color: "#fff",
          padding: "10px 16px",
          fontWeight: 600,
          fontSize: 14,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        Energy Consumption
        <span style={{ background: "#dc2626", fontSize: 10, padding: "2px 8px", borderRadius: 4 }}>LIVE</span>
      </div>
      <div style={{ padding: "14px 10px 6px" }}>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: textColor }} />
            <YAxis tick={{ fontSize: 11, fill: textColor }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="today" name={rangeLabel} stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="yesterday" name="ก่อนหน้า" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
