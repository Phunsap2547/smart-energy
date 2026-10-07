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

// ความสูงขั้นต่ำของพื้นที่กราฟ (ถ้าการ์ดถูกยืดให้สูงกว่านี้ กราฟจะขยายตามเอง)
const MIN_CHART_HEIGHT = 280;

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

  const gridColor = darkMode ? "#2a2d36" : "#eef0f3";
  const textColor = darkMode ? "#9ca3af" : "#94a3b8";
  const titleColor = darkMode ? "#f3f4f6" : "#1f2937";
  const tooltipBg = darkMode ? "#1f2937" : "#ffffff";
  const tooltipBorder = darkMode ? "#374151" : "#e2e8f0";

  // Ticks แกน X โหมดรายวัน: เว้นระยะไม่ให้เบียดกัน
  const DAY_TICKS = ["00:00", "03:00", "06:00", "09:00", "12:00", "15:00", "18:00", "21:00", "23:00"];
  const formatDayTick = (v: string) => (v === "23:00" ? "23:59" : v);
  const isDayMode = data?.length === 24 && (data[0] as any)?.label === "00:00";

  const centerMsg: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: textColor,
    fontSize: 13,
  };

  return (
    <div
      style={{
        background: "var(--card-bg, #fff)",
        border: `1px solid var(--border-color, ${darkMode ? "#2a2d36" : "#eceff3"})`,
        borderRadius: 16,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "100%", // ยืดเต็มกล่องที่ครอบอยู่
        width: "100%",
      }}
    >
      {/* Header: มินิมอล พื้นขาว + จุดสีเล็กๆ แทนแถบสีเต็ม */}
      <div
        style={{
          padding: "16px 20px 0",
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: titleColor,
          fontWeight: 600,
          fontSize: 15,
        }}
      >
        {headerIcon ? (
          <span style={{ display: "inline-flex", color }}>{headerIcon}</span>
        ) : (
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: color,
              flexShrink: 0,
            }}
          />
        )}
        <span>{title}</span>
      </div>

      {/* Chart Body: flex-1 เพื่อกินพื้นที่ที่เหลือทั้งหมด ไม่เหลือที่ว่างข้างล่าง */}
      <div
        style={{
          flex: 1,
          minHeight: MIN_CHART_HEIGHT,
          position: "relative",
          padding: "8px 12px 12px 4px",
        }}
      >
        {/* ชั้นใน absolute เพื่อให้ ResponsiveContainer วัดขนาดจากกล่องที่ยืดได้ถูกต้อง */}
        <div style={{ position: "absolute", inset: "8px 12px 12px 4px" }}>
          {isMounted ? (
            data && data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data as any[]} margin={{ top: 12, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 4" stroke={gridColor} vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fill: textColor }}
                    ticks={isDayMode ? DAY_TICKS : undefined}
                    tickFormatter={isDayMode ? formatDayTick : undefined}
                    interval={isDayMode ? 0 : "preserveStartEnd"}
                    axisLine={false}
                    tickLine={false}
                    dy={8}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: textColor }}
                    axisLine={false}
                    tickLine={false}
                    dx={-4}
                  />
                  <Tooltip
                    cursor={{ fill: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)" }}
                    contentStyle={{
                      backgroundColor: tooltipBg,
                      borderColor: tooltipBorder,
                      borderRadius: "10px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      fontSize: "12px",
                      color: darkMode ? "#f3f4f6" : "#1f2937",
                    }}
                    formatter={(value: any) => {
                      const num = typeof value === "number" ? value : Number(value);
                      const formatted = num.toLocaleString();
                      return [valueSuffix ? `${formatted} ${valueSuffix}` : formatted, "ค่าที่บันทึก"];
                    }}
                    labelStyle={{ fontWeight: "bold", marginBottom: "4px" }}
                  />
                  <Bar
                    dataKey={dataKey as string}
                    fill={color}
                    fillOpacity={0.9}
                    radius={[6, 6, 0, 0]}
                    maxBarSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={centerMsg}>ไม่มีข้อมูลสำหรับแสดงผล</div>
            )
          ) : (
            <div style={centerMsg}>กำลังโหลดกราฟ...</div>
          )}
        </div>
      </div>
    </div>
  );
}

export { Wallet as CostIcon };