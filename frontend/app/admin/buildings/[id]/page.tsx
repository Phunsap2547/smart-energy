"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  Zap,
  Activity,
  Gauge,
  Radio,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

import OverviewCard from "@/components/admin/building/overview/OverviewCard";
import ActiveEnergyChart from "@/components/admin/building/overview/ActiveEnergyChart";
import PhaseTable from "@/components/admin/building/overview/PhaseTable";
import THDChart from "@/components/admin/building/overview/THDChart";

import BuildingSidebar from "@/components/admin/building/shared/BuildingSidebar";
import RealtimeClock from "@/components/admin/building/shared/RealtimeClock";

import { supabase } from "@/lib/supabase";
import { EnergyIngest } from "@/types/energy";
import { formatNumber } from "@/lib/formatter";

export type TimeFilter = "1D" | "7D" | "30D" | "12M";

export default function BuildingOverviewPage() {
  const params = useParams();
  const buildingId = params?.id ? Number(params.id) : null;

  const [ingestData, setIngestData] = useState<EnergyIngest[]>([]);
  const [loading, setLoading] = useState(true);

  // รวมตัวกรองเวลาเป็น State เดียวกันทั้งหน้า (ค่าเริ่มต้น 1D)
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("1D");

  const fetchIngestData = useCallback(async () => {
    if (!buildingId) return;

    try {
      // 1. ดึง device_id ทั้งหมดของอาคารนี้
      const { data: devices, error: deviceError } = await supabase
        .from("devices")
        .select("id")
        .eq("building_id", buildingId);

      if (deviceError) {
        console.error("Device fetch error:", deviceError);
        return;
      }

      const deviceIds = devices?.map((d) => d.id) || [];
      if (deviceIds.length === 0) {
        setIngestData([]);
        return;
      }

      // 2. คำนวณวันที่เริ่มต้นย้อนหลังตามวันและเวลาจริง ณ ตอนนั้น
      const now = new Date();
      let startDate = new Date();

      if (timeFilter === "1D") {
        // ย้อนหลัง 24 ชั่วโมงจากเวลาปัจจุบัน ณ ตอนนั้น
        startDate.setTime(now.getTime() - 24 * 60 * 60 * 1000);
      } else if (timeFilter === "7D") {
        // ย้อนหลัง 7 วัน
        startDate.setDate(now.getDate() - 7);
      } else if (timeFilter === "30D") {
        // ย้อนหลัง 30 วัน
        startDate.setDate(now.getDate() - 30);
      } else if (timeFilter === "12M") {
        // ย้อนหลัง 1 ปี (12 เดือน)
        startDate.setFullYear(now.getFullYear() - 1);
      }

      // 3. Query ข้อมูลย้อนหลังตามช่วงเวลาที่กรอง
      const { data, error } = await supabase
        .from("energy_readings")
        .select("*")
        .in("device_id", deviceIds)
        .gte("reading_time", startDate.toISOString())
        .order("reading_time", { ascending: true });

      if (error) {
        console.error("Supabase Error Details:", error);
        return;
      }

      if (data) setIngestData(data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [buildingId, timeFilter]);

  // Realtime & Polling Data Fetching
  useEffect(() => {
    // ดึงข้อมูลครั้งแรก
    fetchIngestData();

    // Supabase Realtime Subscription
    const channel = supabase
      .channel(`energy_readings_b${buildingId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "energy_readings",
        },
        () => fetchIngestData()
      )
      .subscribe();

    // Polling ดึงข้อมูลใหม่ทุกๆ 5 วินาที
    const interval = setInterval(fetchIngestData, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [buildingId, fetchIngestData]);

  const latest = ingestData[ingestData.length - 1] || null;

  // -------------------------------------------------------------
  // เงื่อนไขตรวจสอบสถานะผิดปกติ (Threshold Checking)
  // -------------------------------------------------------------
  const voltage = latest?.voltage_system ?? 0;
  const current = latest?.current_system ?? 0;
  const pf = latest?.power_factor ?? 1;
  const freq = latest?.frequency_hz ?? 50;

  const isVoltageAnomaly = latest ? voltage < 380 || voltage > 440 : false;
  const isCurrentAnomaly = latest ? current >= 100 : false;
  const isPfAnomaly = latest ? pf < 0.8 : false;
  const isFreqAnomaly = latest ? freq < 49 || freq > 51 : false;

  const hasAnyAnomaly =
    isVoltageAnomaly || isCurrentAnomaly || isPfAnomaly || isFreqAnomaly;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500 font-medium">
        กำลังโหลดข้อมูลระบบ...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <BuildingSidebar buildingId={buildingId} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Main Content Area */}
        <div className="p-6 space-y-6">
          {/* Header & Realtime Clock */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ภาพรวมระบบ</h1>
              <p className="text-sm text-gray-500">
                สรุปสถานะระบบไฟฟ้าแบบ Real-time
              </p>
            </div>
            <RealtimeClock />
          </div>

          {/* Warning Banner */}
          {hasAnyAnomaly && (
            <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl text-red-900">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-red-600 shrink-0" size={20} />
                <span className="font-medium text-sm">
                  พบค่าความผิดปกติในระบบไฟฟ้า —{" "}
                  {isPfAnomaly &&
                    `Power factor รวมต่ำ (${formatNumber(pf, 2)}) `}
                  {isVoltageAnomaly &&
                    `แรงดันไม่อยู่ในช่วง 380-440V (${formatNumber(
                      voltage,
                      1
                    )}V) `}
                  {isCurrentAnomaly &&
                    `กระแสเกินเกณฑ์ (${formatNumber(current, 1)}A) `}
                  {isFreqAnomaly &&
                    `ความถี่ไม่อยู่ในช่วง 49-51Hz (${formatNumber(freq, 1)}Hz) `}
                  — ควรตรวจสอบโหลด
                </span>
              </div>
              <button className="flex items-center gap-1 text-sm font-medium text-red-700 hover:text-red-800 transition">
                ดูรายละเอียดเพิ่มเติม <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* Top 4 Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <OverviewCard
              title="System voltage"
              value={formatNumber(voltage, 1)}
              unit="V"
              subtitle="แรงดันระบบ"
              statusLabel={isVoltageAnomaly ? "ผิดปกติ" : "ปกติ"}
              statusRange="ช่วงปกติ 380 - 440 V"
              isError={isVoltageAnomaly}
              icon={
                <Zap
                  size={20}
                  className={
                    isVoltageAnomaly ? "text-red-600" : "text-emerald-600"
                  }
                />
              }
            />

            <OverviewCard
              title="System current"
              value={formatNumber(current, 2)}
              unit="A"
              subtitle="กระแสรวม"
              statusLabel={isCurrentAnomaly ? "ผิดปกติ" : "ปกติ"}
              statusRange="ช่วงปกติ < 100 A"
              isError={isCurrentAnomaly}
              icon={
                <Activity
                  size={20}
                  className={
                    isCurrentAnomaly ? "text-red-600" : "text-emerald-600"
                  }
                />
              }
            />

            <OverviewCard
              title="Total power factor"
              value={formatNumber(pf, 2)}
              subtitle="เพาเวอร์แฟคเตอร์รวม"
              statusLabel={isPfAnomaly ? "ผิดปกติ" : "ปกติ"}
              statusRange="เกณฑ์ปกติ ≥ 0.80"
              isError={isPfAnomaly}
              icon={
                <Gauge
                  size={20}
                  className={isPfAnomaly ? "text-red-600" : "text-emerald-600"}
                />
              }
            />

            <OverviewCard
              title="Frequency"
              value={formatNumber(freq, 0)}
              unit="Hz"
              subtitle="ความถี่"
              statusLabel={isFreqAnomaly ? "ผิดปกติ" : "ปกติ"}
              statusRange="ช่วงปกติ 49 - 51 Hz"
              isError={isFreqAnomaly}
              icon={
                <Radio
                  size={20}
                  className={
                    isFreqAnomaly ? "text-red-600" : "text-emerald-600"
                  }
                />
              }
            />
          </div>

          {/* Phase Table */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <PhaseTable latestData={latest} />
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Energy */}
            <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-gray-200 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Active energy สะสม
                  </p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-bold text-gray-900">
                      {formatNumber(latest?.energy_kwh ?? 0, 0)}
                    </span>
                    <span className="text-sm text-gray-500 font-medium">
                      kWh
                    </span>
                  </div>
                  <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1">
                    <TrendingUp size={14} /> พลังงานไฟฟ้ารวม
                  </p>
                </div>
                {/* ปุ่ม Filter ของ Active Energy */}
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg text-xs font-medium text-gray-600">
                  {(["1D", "7D", "30D", "12M"] as const).map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeFilter(range)}
                      className={`px-3 py-1 rounded-md transition ${
                        timeFilter === range
                          ? "bg-white text-emerald-600 font-semibold shadow-sm"
                          : "hover:text-gray-900"
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
              <ActiveEnergyChart data={ingestData} filter={timeFilter} />
            </div>

            {/* THD Voltage */}
            <div className="lg:col-span-1 bg-white rounded-xl p-5 border border-gray-200 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    THD voltage เฉลี่ย
                  </p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold text-gray-900">
                      {formatNumber(latest?.thd_voltage_l1_pct ?? 0, 1)}
                    </span>
                    <span className="text-sm text-gray-500 font-medium">%</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    ค่าความเพี้ยนแรงดันเฉลี่ย
                  </p>
                </div>
                {/* ปุ่ม Filter ของ THD Chart */}
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg text-xs font-medium text-gray-600">
                  {(["1D", "7D", "30D", "12M"] as const).map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeFilter(range)}
                      className={`px-2.5 py-1 rounded-md transition ${
                        timeFilter === range
                          ? "bg-white text-emerald-600 font-semibold shadow-sm"
                          : "hover:text-gray-900"
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
              <THDChart data={ingestData} filter={timeFilter} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}