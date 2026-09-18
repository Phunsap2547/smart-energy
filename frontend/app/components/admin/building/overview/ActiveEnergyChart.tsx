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
import { formatNumber } from "@/lib/formatter";

type TimeFilter = "1D" | "7D" | "30D" | "12M";

interface ActiveEnergyChartProps {
  data: EnergyIngest[];
  filter: TimeFilter;
}

function getCutoffDate(filter: TimeFilter): Date {
  const now = new Date();
  const cutoff = new Date(now);
  switch (filter) {
    case "1D":
      cutoff.setHours(now.getHours() - 24);
      break;
    case "7D":
      cutoff.setDate(now.getDate() - 7);
      break;
    case "30D":
      cutoff.setDate(now.getDate() - 30);
      break;
    case "12M":
      cutoff.setMonth(now.getMonth() - 12);
      break;
  }
  return cutoff;
}

function bucketKey(date: Date, filter: TimeFilter): string {
  if (filter === "1D") {
    // group by hour:minute (no aggregation, raw points)
    return date.toISOString();
  }
  if (filter === "12M") {
    return `${date.getFullYear()}-${date.getMonth()}`;
  }
  // 7D / 30D -> group by day
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function labelFor(date: Date, filter: TimeFilter): string {
  if (filter === "1D") {
    return date.toLocaleTimeString("th-TH", {
      timeZone: "Asia/Bangkok",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }
  if (filter === "12M") {
    return date.toLocaleDateString("th-TH", {
      timeZone: "Asia/Bangkok",
      month: "short",
      year: "2-digit",
    });
  }
  return date.toLocaleDateString("th-TH", {
    timeZone: "Asia/Bangkok",
    day: "2-digit",
    month: "2-digit",
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

  const cutoff = getCutoffDate(filter);

  // filter by range
  const filtered = data.filter((item) => {
    const raw = item.reading_time || item.created_at;
    if (!raw) return false;
    const d = new Date(raw);
    return d >= cutoff;
  });

  // sort chronologically
  const sorted = [...filtered].sort((a, b) => {
    const da = new Date(a.reading_time || a.created_at || 0).getTime();
    const db = new Date(b.reading_time || b.created_at || 0).getTime();
    return da - db;
  });

  // energy_kwh มักเป็นค่าสะสม (cumulative) -> เอาค่าล่าสุดของแต่ละ bucket
  const buckets = new Map<string, { date: Date; value: number }>();
  for (const item of sorted) {
    const raw = item.reading_time || item.created_at;
    const d = raw ? new Date(raw) : new Date();
    const key = bucketKey(d, filter);
    const value = Number(item.energy_kwh ?? item.power_kw ?? 0);
    buckets.set(key, { date: d, value }); // overwrite -> last value wins
  }

  const chartData = Array.from(buckets.values()).map(({ date, value }) => ({
    time: labelFor(date, filter),
    energy: value,
  }));

  if (chartData.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
        ไม่มีข้อมูลในช่วงเวลาที่เลือก
      </div>
    );
  }

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