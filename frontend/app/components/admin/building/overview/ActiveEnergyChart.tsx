
//แผนภูมิแท่ง
"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { supabase } from "@/lib/supabase";
import { formatNumber } from "@/lib/formatter";

export type TimeFilter = "1D" | "7D" | "30D" | "12M";

interface ActiveEnergyChartProps {
  buildingId: string | number | null;
  filter: TimeFilter;
  selectedDate?: string;
}

interface ChartDataItem {
  label: string;
  energy: number;
  cost: number;
}

// แปลง Date Object เป็น YYYY-MM-DD
const formatDateStr = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// แกะชั่วโมงจาก Timestamp
const extractHourFromTimestamp = (readingTimeStr: string): string => {
  if (!readingTimeStr) return "00:00";
  let timePart = "";
  if (readingTimeStr.includes("T")) {
    timePart = readingTimeStr.split("T")[1];
  } else if (readingTimeStr.includes(" ")) {
    timePart = readingTimeStr.split(" ")[1];
  }
  if (timePart) {
    const hour = timePart.split(":")[0];
    if (hour && !isNaN(Number(hour))) {
      return `${String(Number(hour)).padStart(2, "0")}:00`;
    }
  }
  return "00:00";
};

export default function ActiveEnergyChart({
  buildingId,
  filter,
  selectedDate,
}: ActiveEnergyChartProps) {
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchChartData = useCallback(async () => {
    if (!buildingId) return;

    try {
      setLoading(true);

      // 1. ดึง Device IDs
      const { data: devices, error: deviceError } = await supabase
        .from("devices")
        .select("id")
        .eq("building_id", buildingId);

      if (deviceError || !devices || devices.length === 0) {
        setChartData([]);
        return;
      }

      const deviceIds = devices.map((d) => d.id);

      // 2. คำนวณช่วงเวลา Start - End แบบเดียวกับ DailyEnergyChart
      const targetDateObj = selectedDate ? new Date(selectedDate) : new Date();
      const endDateObj = new Date(targetDateObj);
      const startDateObj = new Date(targetDateObj);

      if (filter === "1D") {
        // รายวัน
        startDateObj.setHours(0, 0, 0, 0);
      } else if (filter === "7D") {
        startDateObj.setDate(targetDateObj.getDate() - 6);
      } else if (filter === "30D") {
        startDateObj.setDate(targetDateObj.getDate() - 29);
      } else if (filter === "12M") {
        startDateObj.setFullYear(targetDateObj.getFullYear() - 1);
      }

      const startDateStr = `${formatDateStr(startDateObj)} 00:00:00`;
      const endDateStr = `${formatDateStr(endDateObj)} 23:59:59`;

      // 3. ดึงข้อมูลแบบ Pagination Loop
      let allReadings: any[] = [];
      let page = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const from = page * pageSize;
        const to = from + pageSize - 1;

        const { data: batch, error: batchError } = await supabase
          .from("energy_readings")
          .select("reading_time, energy_kwh")
          .in("device_id", deviceIds)
          .gte("reading_time", startDateStr)
          .lte("reading_time", endDateStr)
          .order("reading_time", { ascending: true })
          .range(from, to);

        if (batchError || !batch || batch.length === 0) {
          hasMore = false;
        } else {
          allReadings = [...allReadings, ...batch];
          if (batch.length < pageSize) {
            hasMore = false;
          } else {
            page++;
          }
        }
      }

      // 4. สร้าง Skeleton รอ
      const groupedMap: {
        [key: string]: {
          min: number | null;
          max: number | null;
          label: string;
        };
      } = {};

      if (filter === "1D") {
        for (let h = 0; h < 24; h++) {
          const hourStr = `${String(h).padStart(2, "0")}:00`;
          groupedMap[hourStr] = { min: null, max: null, label: hourStr };
        }
      } else if (filter === "7D" || filter === "30D") {
        const totalDays = filter === "7D" ? 7 : 30;
        for (let i = totalDays - 1; i >= 0; i--) {
          const d = new Date(targetDateObj);
          d.setDate(d.getDate() - i);
          const dateKey = formatDateStr(d);
          const label = `${String(d.getDate()).padStart(2, "0")}/${String(
            d.getMonth() + 1
          ).padStart(2, "0")}`;
          groupedMap[dateKey] = { min: null, max: null, label };
        }
      }

      // 5. จัดกลุ่มข้อมูลลง groupedMap
      allReadings.forEach((item) => {
        if (item.energy_kwh === null || item.energy_kwh === undefined) return;

        let groupKey = "";

        if (filter === "1D") {
          groupKey = extractHourFromTimestamp(item.reading_time);
        } else {
          const datePart = item.reading_time.replace("T", " ").split(" ")[0];
          groupKey = datePart;
        }

        if (groupedMap[groupKey]) {
          const val = Number(item.energy_kwh);
          const currentMin = groupedMap[groupKey].min;
          const currentMax = groupedMap[groupKey].max;

          groupedMap[groupKey].min =
            currentMin === null ? val : Math.min(currentMin, val);
          groupedMap[groupKey].max =
            currentMax === null ? val : Math.max(currentMax, val);
        }
      });

      const ELECTRICITY_RATE = 4.3;

      // 6. คำนวณพลังงาน (Max - Min)
      const result: ChartDataItem[] = Object.keys(groupedMap)
        .sort()
        .map((key) => {
          const item = groupedMap[key];
          const diff =
            item.max !== null && item.min !== null
              ? Math.max(0, item.max - item.min)
              : 0;
          const energyKwh = Number(diff.toFixed(1));
          return {
            label: item.label,
            energy: energyKwh,
            cost: Number((energyKwh * ELECTRICITY_RATE).toFixed(2)),
          };
        });

      setChartData(result);
    } catch (err) {
      console.error("Active energy chart fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [buildingId, filter, selectedDate]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  if (loading) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
        กำลังโหลดข้อมูล...
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
        ไม่มีข้อมูลสำหรับแสดงกราฟ
      </div>
    );
  }

  return (
    <div className="h-48 w-full pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            interval={filter === "1D" ? 0 : "preserveStartEnd"}
          />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const energy = Number(payload[0].value ?? 0);
                return (
                  <div className="bg-gray-900 text-white p-2.5 rounded-lg shadow-md text-xs space-y-1">
                    <p className="font-medium text-gray-300">{payload[0].payload.label}</p>
                    <p className="text-emerald-400 font-semibold">
                      Energy: {formatNumber(energy, 1)} kWh
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="energy" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}