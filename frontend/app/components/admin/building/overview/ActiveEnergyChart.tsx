"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { EnergyIngest } from "@/types/energy";
import { formatNumber, formatChartTime } from "@/lib/formatter";

type TimeFilter = "1D" | "7D" | "30D" | "12M";

interface ActiveEnergyChartProps {
  data: EnergyIngest[];
  filter: TimeFilter;
}

// ช่วยเติม Z บังคับให้ JS อ่านค่าเป็น UTC เสมอ
function ensureUTC(raw: string): string {
  let s = raw.trim().replace(" ", "T");
  if (!s.endsWith("Z") && !/[+-]\d{2}:\d{2}$/.test(s)) {
    s += "Z";
  }
  return s;
}

function bucketKey(date: Date, filter: TimeFilter): string {
  if (filter === "12M") {
    return `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}`;
  }
  return `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`;
}

function labelFor(date: Date, filter: TimeFilter): string {
  if (filter === "12M") {
    return date.toLocaleDateString("th-TH", {
      month: "short",
      year: "2-digit",
      timeZone: "Asia/Bangkok",
    });
  }
  return date.toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Bangkok",
  });
}

export default function ActiveEnergyChart({ data, filter }: ActiveEnergyChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
        ไม่มีข้อมูลสำหรับแสดงกราฟ
      </div>
    );
  }

  // 1. เรียงลำดับตามเวลาแบบ UTC
  const sorted = [...data].sort((a, b) => {
    const rawA = ensureUTC(a.reading_time || a.created_at || "");
    const rawB = ensureUTC(b.reading_time || b.created_at || "");
    return new Date(rawA).getTime() - new Date(rawB).getTime();
  });

  // 2. รวบรวมข้อมูลลง Bucket
  const buckets = new Map<string, { rawTime: string; date: Date; value: number }>();
  for (const item of sorted) {
    const raw = item.reading_time || item.created_at;
    if (!raw) continue;

    const safeRaw = ensureUTC(raw);
    const d = new Date(safeRaw);
    const key = filter === "1D" ? (isNaN(d.getTime()) ? raw : d.getTime().toString()) : bucketKey(d, filter);
    const value = Number(item.energy_kwh ?? item.power_kw ?? 0);

    buckets.set(key, { rawTime: raw, date: d, value });
  }

  // 3. แปลงเวลาสำหรับแกน X
  const chartData = Array.from(buckets.values())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map(({ rawTime, date, value }) => ({
      time: filter === "1D" ? formatChartTime(rawTime) : labelFor(date, filter),
      energy: value,
    }));

  return (
    <div className="h-48 w-full pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

          <XAxis
            dataKey="time"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            interval="preserveStartEnd"
          />

          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} />

          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-gray-900 text-white p-2 rounded-lg shadow-md text-xs">
                    <p className="font-medium text-gray-300">{payload[0].payload.time}</p>
                    <p className="text-emerald-400 font-semibold mt-0.5">
                      Energy: {formatNumber(Number(payload[0].value ?? 0), 1)} kWh
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />

          <Area
            type="monotone"
            dataKey="energy"
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#energyGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}