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
import { EnergyIngest } from "../../../../types/energy";
import { formatNumber } from "@/lib/formatter";

interface ActiveEnergyChartProps {
  data: EnergyIngest[];
}

export default function ActiveEnergyChart({ data }: ActiveEnergyChartProps) {
  // แปลง ISO Timestamp ให้แสดงเวลาสั้นๆ เช่น 14:30
  const chartData = data.map((item) => ({
    time: new Date(item.created_at).toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    power: item.active_power,
    energy: item.active_energy,
  }));

  return (
    <div className="bg-white p-5 rounded-xl border shadow-sm w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-gray-800">
            Active Power & Energy Trend
          </h3>
          <p className="text-xs text-gray-500">
            แนวโน้มการใช้งานกำลังไฟฟ้าในช่วงเวลาที่ผ่านมา
          </p>
        </div>
      </div>

      <div className="h-[280px] w-full">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            ไม่มีข้อมูลสำหรับแสดงกราฟ
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="powerGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "12px",
                }}
                formatter={(val) => [
                  `${formatNumber(Number(val ?? 0), 2)} kW`,
                  "Active Power",
                ]}
              />
              <Area
                type="monotone"
                dataKey="power"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#powerGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}