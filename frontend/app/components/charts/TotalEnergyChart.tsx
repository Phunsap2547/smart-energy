// "use client";

// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
// import { BarChart3 } from "lucide-react";
// import theme from "@/config/theme.js";
// import { totalEnergyWeekly } from "@/data/mockData";

// export default function TotalEnergyChart() {
//   const panel = theme.panels.totalEnergy;
//   const gridColor = theme.chartLines.gridLine;

//   return (
//     <div className="rounded-card overflow-hidden shadow-card bg-white flex-1">
//       <div
//         className="flex items-center gap-[10px] text-white font-medium text-[22px] px-[20px]"
//         style={{
//           background: `linear-gradient(90deg, ${panel.headerFrom} 0%, ${panel.headerTo} 100%)`,
//         }}
//       >
//         <BarChart3 size={26} />
//         Total Energy Used (kwh)
//       </div>

//       <div className="p-[4px] ">
//         <ResponsiveContainer width="100%" height={250} >
//           <BarChart data={totalEnergyWeekly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
//             <CartesianGrid stroke={gridColor} vertical={false} />
//             <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
//             <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
//             <Bar dataKey="kwh" fill={panel.barColor} radius={[4, 4, 0, 0]} barSize={28} />
//           </BarChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// }


"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Wallet } from "lucide-react";

interface Props<T extends { label: string }> {
  data: T[];
  dataKey: keyof T;
  title: string;
  color: string;
  headerIcon?: React.ReactNode;
  darkMode: boolean;
  valueSuffix?: string;
}

export default function TotalEnergyChart<T extends { label: string }>({
  data,
  dataKey,
  title,
  color,
  headerIcon,
  darkMode,
  valueSuffix,
}: Props<T>) {
  const gridColor = darkMode ? "#2a2d36" : "#eee";
  const textColor = darkMode ? "#9ca3af" : "#6b7280";

  return (
    <div style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ background: color, color: "#fff", padding: "10px 16px", fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
        {headerIcon}
        {title}
      </div>
      <div style={{ padding: "14px 10px 6px" }}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data as any[]}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: textColor }} />
            <YAxis tick={{ fontSize: 11, fill: textColor }} />
            <Tooltip
              formatter={(value) => {
                const num = typeof value === "number" ? value : Number(value);
                return valueSuffix ? `${num.toLocaleString()} ${valueSuffix}` : num.toLocaleString();
              }}
            />            <Bar dataKey={dataKey as string} fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export { Wallet as CostIcon };