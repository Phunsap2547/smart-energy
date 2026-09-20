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

interface THDChartProps {
  data: EnergyIngest[];
  filter: TimeFilter;
}

function bucketKey(date: Date, filter: TimeFilter): string {
  if (filter === "12M") {
    return `${date.getFullYear()}-${date.getMonth() + 1}`;
  }
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function labelFor(date: Date, filter: TimeFilter): string {
  if (filter === "12M") {
    return date.toLocaleDateString("th-TH", {
      month: "short",
      year: "2-digit",
    });
  }
  return date.toLocaleDateString("th-TH", {
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

  // 1. เรียงลำดับตามเวลา (แทนที่เว้นวรรคด้วย T รองรับ Safari)
  const sorted = [...data].sort((a, b) => {
    const rawA = (a.reading_time || a.created_at || "").replace(" ", "T");
    const rawB = (b.reading_time || b.created_at || "").replace(" ", "T");
    return new Date(rawA).getTime() - new Date(rawB).getTime();
  });

  // 2. รวบรวมข้อมูลและหาค่าเฉลี่ยลง Bucket
  const buckets = new Map<string, { rawTime: string; date: Date; sum: number; count: number }>();
  for (const item of sorted) {
    const raw = item.reading_time || item.created_at;
    if (!raw) continue;

    const safeRaw = raw.replace(" ", "T");
    const d = new Date(safeRaw);
    const key = filter === "1D" ? (isNaN(d.getTime()) ? raw : d.getTime().toString()) : bucketKey(d, filter);

    const thdVal = Number(item.thd_voltage_l1_pct ?? 0);

    const existing = buckets.get(key);
    if (existing) {
      existing.sum += thdVal;
      existing.count += 1;
    } else {
      buckets.set(key, { rawTime: raw, date: d, sum: thdVal, count: 1 });
    }
  }

  // 3. แปลงเวลาสำหรับแกน X
  const chartData = Array.from(buckets.values())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map(({ rawTime, date, sum, count }) => ({
      time: filter === "1D" ? formatChartTime(rawTime) : labelFor(date, filter),
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