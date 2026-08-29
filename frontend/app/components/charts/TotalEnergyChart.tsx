
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