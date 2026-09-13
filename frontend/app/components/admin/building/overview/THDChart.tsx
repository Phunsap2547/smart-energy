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

interface THDChartProps {
  data: EnergyIngest[];
}

export default function THDChart({ data }: THDChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-gray-400">
        ไม่มีข้อมูล THD Voltage
      </div>
    );
  }

  const chartData = data.map((item) => {
    const rawDate = item.reading_time || item.created_at;
    const date = rawDate ? new Date(rawDate) : new Date();

    const timeLabel = date.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const thdValue = item.thd_voltage_l1_pct ?? 0;
    return {
      time: timeLabel,
      thd: Number(Number(thdValue).toFixed(1)),
    };
  });

  return (
    <div className="h-48 w-full pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
        >
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