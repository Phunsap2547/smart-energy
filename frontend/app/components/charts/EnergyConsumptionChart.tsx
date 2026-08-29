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
