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
  data: { label: string; cost: number }[];
  title?: string;
  color?: string;
  darkMode?: boolean;
  valueSuffix?: string;
  headerIcon?: React.ReactNode;
}

export default function ActivePowerChart({
  data,
  title = "กำลังไฟฟ้าใช้งาน (Active Power)",
  color = "#1E9E5A",
  darkMode = false,
  valueSuffix = "kW",
  headerIcon,
}: ActivePowerChartProps) {
  const textColor = darkMode ? "#9ca3af" : "#6b7280";
  const gridColor = darkMode ? "#2a2d36" : "#e5e7eb";

  return (
    <div
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--border-color)",
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
        <span style={{ fontSize: 14, fontWeight: 600 }}>{title}</span>
      </div>

      {/* Area Chart Container */}
      <div style={{ width: "100%", height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="activePowerGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={color} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis dataKey="label" stroke={textColor} fontSize={12} tickLine={false} />
            <YAxis stroke={textColor} fontSize={12} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: darkMode ? "#191b21" : "#ffffff",
                borderColor: darkMode ? "#2a2d36" : "#e5e7eb",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(val: any) => [`${val} ${valueSuffix}`, title]}
            />
            <Area
              type="monotone"
              dataKey="cost"
              stroke={color}
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#activePowerGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}