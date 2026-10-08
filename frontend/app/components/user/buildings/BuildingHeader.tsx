// components/user/buildings/BuildingHeader.tsx
// แถบบนสุด + ชื่ออาคาร + เลือกมิเตอร์ + สลับแท็บ + ปุ่มเลือกช่วงเวลา
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import theme from "@/config/theme.js";
import type { BuildingTab, RangeMode } from "./types";

const RANGES: RangeMode[] = ["Day", "Month", "Year", "Total"];

// ✅ นาฬิกาแสดงวัน เวลาปัจจุบัน (เวลาไทย) อัปเดตทุกวินาที
function LiveClock() {
  // เริ่มเป็น null เพื่อกัน hydration mismatch ระหว่าง server กับ client
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!now) return <span className="text-[13px]">&nbsp;</span>;

  const date = now.toLocaleDateString("th-TH", {
    timeZone: "Asia/Bangkok",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric", // ปี พ.ศ.
  });
  const time = now.toLocaleTimeString("th-TH", {
    timeZone: "Asia/Bangkok",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  return (
    <span className="flex items-center gap-2 rounded-[20px] border border-gray-200 bg-white px-4 py-2 text-[13px] font-medium text-gray-700 shadow-sm">
      <span>🗓️ {date}</span>
      <span className="font-semibold tabular-nums text-[#1E9E5A]">🕐 {time}</span>
    </span>
  );
}

interface Props {
  buildingName: string;
  devices: { id: string | number; name?: string }[];
  selectedDeviceId: string;
  onSelectDevice: (id: string) => void;
  activeTab: BuildingTab;
  onChangeTab: (tab: BuildingTab) => void;
  hasActiveAlert: boolean;
  range: RangeMode;
  onChangeRange: (range: RangeMode) => void;
}

export default function BuildingHeader({
  buildingName,
  devices,
  selectedDeviceId,
  onSelectDevice,
  activeTab,
  onChangeTab,
  hasActiveAlert,
  range,
  onChangeRange,
}: Props) {
  return (
    <>
      {/* TOP NAV BAR */}
      <div
        className="mb-[18px] flex flex-wrap items-center justify-between gap-2 rounded-[10px] px-5 py-2.5"
        style={{
          background: `linear-gradient(90deg, ${theme.topbar.gradientFrom} 0%, ${theme.topbar.gradientTo} 100%)`,
        }}
      >
        <Link href="/" className="flex items-center gap-1.5 text-sm font-medium text-white no-underline">
          ← กลับไปหน้าแผนที่
        </Link>
        <span className="text-[13px] text-white/90">{buildingName} — Smart Energy Management</span>
      </div>

      {/* HEADER BAR & NAVIGATION TABS */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <h1 className="m-0 text-2xl font-bold">{buildingName}</h1>

          {/* Device Dropdown Selector */}
          {devices.length > 1 && (
            <select
              value={selectedDeviceId}
              onChange={(e) => onSelectDevice(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[13px] font-semibold text-gray-900"
            >
              {devices.map((dev) => (
                <option key={dev.id} value={dev.id}>
                  {dev.name || `มิเตอร์ ${dev.id}`}
                </option>
              ))}
            </select>
          )}

          {/* Main View Switcher */}
          <div className="flex rounded-lg border border-gray-200 bg-white p-0.5">
            <button
              onClick={() => onChangeTab("overview")}
              className={`cursor-pointer rounded-md border-none px-3.5 py-1.5 text-[13px] font-semibold ${
                activeTab === "overview" ? "bg-[#1E9E5A] text-white" : "bg-transparent text-gray-500"
              }`}
            >
              📊 ภาพรวมวิเคราะห์
            </button>
            <button
              onClick={() => onChangeTab("alerts")}
              className={`flex cursor-pointer items-center gap-1.5 rounded-md border-none px-3.5 py-1.5 text-[13px] font-semibold ${
                activeTab === "alerts" ? "bg-[#1E9E5A] text-white" : "bg-transparent text-gray-500"
              }`}
            >
              ⚡ ประวัติการแจ้งเตือน
              {hasActiveAlert && <span className="h-2 w-2 rounded-full bg-[#E54D42]" />}
            </button>
          </div>
        </div>

        {/* นาฬิกา + Range Selector (นาฬิกาแสดงทุกแท็บ ส่วนปุ่มช่วงเวลาเฉพาะแท็บภาพรวม) */}
        <div className="flex flex-wrap items-center gap-3">
          <LiveClock />
          {activeTab === "overview" && (
            <div className="flex w-[280px] rounded-[20px] border border-gray-200 bg-white p-1 shadow-sm">
              {RANGES.map((r) => (
                <button
                  key={r}
                  onClick={() => onChangeRange(r)}
                  className={`flex-1 cursor-pointer rounded-2xl border-none py-1.5 text-[12.5px] font-semibold transition-all duration-200 ${
                    range === r ? "bg-[#1E9E5A] text-white" : "bg-transparent text-gray-500"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}