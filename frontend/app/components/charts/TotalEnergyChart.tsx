"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { BarChart3 } from "lucide-react";
import theme from "@/config/theme.js";
import { totalEnergyWeekly } from "@/data/mockData";

export default function TotalEnergyChart() {
  const panel = theme.panels.totalEnergy;
  const gridColor = theme.chartLines.gridLine;

  return (
    <div className="rounded-card overflow-hidden shadow-card bg-white flex-1">
      <div
        className="flex items-center gap-[10px] text-white font-medium text-[22px] px-[20px]"
        style={{
          background: `linear-gradient(90deg, ${panel.headerFrom} 0%, ${panel.headerTo} 100%)`,
        }}
      >
        <BarChart3 size={26} />
        Total Energy Used (kwh)
      </div>

      <div className="p-[4px] ">
        <ResponsiveContainer width="100%" height={250} >
          <BarChart data={totalEnergyWeekly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid stroke={gridColor} vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <Bar dataKey="kwh" fill={panel.barColor} radius={[4, 4, 0, 0]} barSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
