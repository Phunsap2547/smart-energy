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

interface THDChartProps {
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
  if (filter === "1D") return date.toISOString();
  if (filter === "12M") return `${date.getFullYear()}-${date.getMonth()}`;
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

export default function THDChart({ data, filter }: THDChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-gray-400">
        ไม่มีข้อมูล THD Voltage
      </div>
    );
  }

  const cutoff = getCutoffDate(filter);

  const filtered = data.filter((item) => {
    const raw = item.reading_time || item.created_at;
    if (!raw) return false;
    const d = new Date(raw);
    return d >= cutoff;
  });

  // THD เป็นค่า instant -> ใช้ค่าเฉลี่ยต่อ bucket
  const buckets = new Map<string, { date: Date; sum: number; count: number }>();
  for (const item of filtered) {
    const raw = item.reading_time || item.created_at;
    const d = raw ? new Date(raw) : new Date();
    const key = bucketKey(d, filter);
    const value = Number(item.thd_voltage_l1_pct ?? 0);

    const existing = buckets.get(key);
    if (existing) {
      existing.sum += value;
      existing.count += 1;
    } else {
      buckets.set(key, { date: d, sum: value, count: 1 });
    }
  }

  const chartData = Array.from(buckets.values())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map(({ date, sum, count }) => ({
      time: labelFor(date, filter),
      thd: Number((sum / count).toFixed(1)),
    }));

  if (chartData.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-gray-400">
        ไม่มีข้อมูลในช่วงเวลาที่เลือก
      </div>
    );
  }

  return (
    <div className="h-48 w-full pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="thdGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
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

          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            tickFormatter={(value) => `${value}%`}
            domain={[0, "auto"]}
          />

          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-gray-900 text-white p-2 rounded-lg shadow-md text-xs">
                    <p className="font-medium text-gray-300">{payload[0].payload.time}</p>
                    <p className="text-emerald-400 font-semibold mt-0.5">
                      THD: {formatNumber(Number(payload[0].value ?? 0), 1)}%
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />

          <Area
            type="monotone"
            dataKey="thd"
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#thdGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}