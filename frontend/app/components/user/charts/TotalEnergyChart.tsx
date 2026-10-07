"use client";

import React, { useEffect, useState } from "react";
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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const gridColor = darkMode ? "#2a2d36" : "#f1f5f9";
  const textColor = darkMode ? "#9ca3af" : "#64748b";
  const tooltipBg = darkMode ? "#1f2937" : "#ffffff";
  const tooltipBorder = darkMode ? "#374151" : "#e2e8f0";

  // ปรับTicks แกน X ให้ไม่เบียดกันเกินไป (เอาบางช่วงออกเพื่อให้มีระยะห่างสมดุล)
  const DAY_TICKS = [
    "00:00", "03:00", "06:00", "09:00", "12:00", "15:00", "18:00", "21:00", "23:00"
  ];
  const formatDayTick = (v: string) => (v === "23:00" ? "23:59" : v);
  const isDayMode = data?.length === 24 && (data[0] as any)?.label === "00:00";

  return (
    <div
      style={{
        background: "var(--card-bg, #fff)",
        border: "1px solid var(--border-color, #e5e7eb)",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: darkMode
          ? "0 4px 6px -1px rgba(0, 0, 0, 0.3)"
          : "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: color,
          color: "#fff",
          padding: "12px 18px",
          fontWeight: 600,
          fontSize: 15,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        {headerIcon}
        <span>{title}</span>
      </div>

      {/* Chart Body */}
      <div style={{ padding: "16px 12px 12px 4px", height: 260, width: "100%", position: "relative" }}>
        {isMounted ? (
          data && data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data as any[]}
                margin={{ top: 10, right: 16, left: -16, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: textColor }}
                  ticks={isDayMode ? DAY_TICKS : undefined}
                  tickFormatter={isDayMode ? formatDayTick : undefined}
                  interval={isDayMode ? 0 : "preserveStartEnd"}
                  axisLine={{ stroke: gridColor }}
                  tickLine={false}
                  dy={6}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: textColor }}
                  axisLine={false}
                  tickLine={false}
                  dx={-4}
                />
                <Tooltip
                  cursor={{ fill: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)" }}
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    borderColor: tooltipBorder,
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    fontSize: "12px",
                    color: darkMode ? "#f3f4f6" : "#1f2937",
                  }}
                  formatter={(value: any) => {
                    const num = typeof value === "number" ? value : Number(value);
                    const formatted = num.toLocaleString();
                    return [
                      valueSuffix ? `${formatted} ${valueSuffix}` : formatted,
                      "ค่าที่บันทึก",
                    ];
                  }}
                  labelStyle={{ fontWeight: "bold", marginBottom: "4px" }}
                />
                <Bar
                  dataKey={dataKey as string}
                  fill={color}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: textColor,
                fontSize: 13,
              }}
            >
              ไม่มีข้อมูลสำหรับแสดงผล
            </div>
          )
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: textColor,
              fontSize: 13,
            }}
          >
            กำลังโหลดกราฟ...
          </div>
        )}
      </div>
    </div>
  );
}

export { Wallet as CostIcon };