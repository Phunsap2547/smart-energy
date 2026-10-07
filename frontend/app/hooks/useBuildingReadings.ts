// hooks/useBuildingReadings.ts
// รวมการดึงข้อมูลของหน้าอาคารไว้ที่เดียว: Power chart, ค่าล่าสุด, พลังงาน (kWh), Peak kW
"use client";

import { useEffect, useMemo, useState } from "react";
import { getPowerChart, getLatestReading, getEnergyCompare } from "@/lib/readingsApi.ts";
import type { RangeMode } from "@/lib/readingsApi.ts";
import { getPeakPower } from "@/lib/peakApi";
import {
  formatFullDayPowerData,
  toAveragePowerData,
  type PowerPoint,
  type EnergyComparePoint,
} from "@/lib/powerChartUtils";

export function useBuildingReadings(
  deviceId: string,
  buildingId: string | number,
  range: RangeMode
) {
  const [chartData, setChartData] = useState<PowerPoint[]>([]); // kW รายนาที (เฉพาะ Day)
  const [latestReading, setLatestReading] = useState<any>(null);
  const [energyCompare, setEnergyCompare] = useState<EnergyComparePoint[]>([]);
  const [energyLoading, setEnergyLoading] = useState(false);
  const [peakOther, setPeakOther] = useState<{ value: number; time: string } | null>(null);

  // 1) Active Power (เฉพาะ Day) + ค่าล่าสุด — อัปเดตทุก 10 วินาที
  useEffect(() => {
    const targetId = deviceId || buildingId;
    if (!targetId) return;

    const fetchChartAndLatest = async () => {
      try {
        if (range === "Day") {
          const points = await getPowerChart(String(targetId));
          setChartData(points);
          if (points.length === 0) {
            console.warn("⚠️ [DEBUG] ไม่พบข้อมูล power_kw ของ device_id:", targetId);
          }
        }
        const latest = await getLatestReading(String(targetId));
        setLatestReading(latest);
      } catch (err) {
        console.error("❌ [DEBUG] Fetch device reading error:", err);
      }
    };

    fetchChartAndLatest();
    const interval = setInterval(fetchChartAndLatest, 10000);
    return () => clearInterval(interval);
  }, [deviceId, buildingId, range]);

  // 2) พลังงาน (kWh) ตามช่วงที่เลือก — อัปเดตทุก 30 วินาที
  useEffect(() => {
    if (!deviceId) {
      console.warn("⚠️ [DEBUG] ไม่มี selectedDeviceId (devices ว่าง?) จึงไม่ดึงข้อมูลพลังงาน");
      setEnergyCompare([]);
      return;
    }

    let cancelled = false;

    const fetchEnergy = async (showLoading: boolean) => {
      try {
        if (showLoading) setEnergyLoading(true);
        const result = await getEnergyCompare(deviceId, range);
        if (!cancelled) setEnergyCompare(result);
      } catch (err) {
        console.error("❌ [DEBUG] Fetch energy error:", err);
      } finally {
        if (!cancelled && showLoading) setEnergyLoading(false);
      }
    };

    fetchEnergy(true);
    const interval = setInterval(() => fetchEnergy(false), 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [deviceId, range]);

  // 3) Peak kW ของเดือนนี้ / ปีนี้ / ทั้งหมด (โหมด Day คิดจากกราฟ Power ด้านล่าง)
  useEffect(() => {
    setPeakOther(null);
    if (range === "Day" || !deviceId) return;

    let cancelled = false;

    const fetchPeak = async () => {
      try {
        const result = await getPeakPower(deviceId, range);
        if (!cancelled) setPeakOther(result);
      } catch (err) {
        console.error("❌ [DEBUG] Fetch peak error:", err);
      }
    };

    fetchPeak();
    const interval = setInterval(fetchPeak, 60000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [deviceId, range]);

  // ---------- ค่าที่คำนวณต่อ ----------

  // กราฟ Power: Day = รายนาที / อื่นๆ = kW เฉลี่ยต่อ bucket
  const powerChartData = useMemo(
    () => (range === "Day" ? formatFullDayPowerData(chartData) : toAveragePowerData(energyCompare, range)),
    [range, chartData, energyCompare]
  );

  // TotalEnergyChart ใช้เฉพาะค่าของช่วงปัจจุบัน (kWh)
  const energyData = useMemo(
    () => energyCompare.map((d) => ({ label: d.label, energy: d.today ?? 0 })),
    [energyCompare]
  );

  // พลังงานรวมของช่วงที่เลือก = ผลรวมทุก bucket
  const rangeEnergyKwh = useMemo(
    () => energyCompare.reduce((sum, d) => sum + (d.today ?? 0), 0),
    [energyCompare]
  );

  // Peak kW: Day = ค่าสูงสุดจากกราฟ Power Real-time / อื่นๆ = max(power_kw) จาก Supabase
  const peakInfo = useMemo(() => {
    if (range === "Day") {
      let best: PowerPoint | null = null;
      for (const d of chartData) {
        if (best === null || d.cost > best.cost) best = d;
      }
      return best ? { value: best.cost, time: `${best.label} น.` } : null;
    }
    return peakOther;
  }, [range, chartData, peakOther]);

  return {
    latestReading,
    energyCompare,
    energyLoading,
    energyData,
    rangeEnergyKwh,
    powerChartData,
    peakInfo,
  };
}

export type BuildingReadings = ReturnType<typeof useBuildingReadings>;
