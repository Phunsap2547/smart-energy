// components/user/buildings/BuildingHeader.tsx
// แถบบนสุด + ชื่ออาคาร + เลือกมิเตอร์ + สลับแท็บ + ปุ่มเลือกช่วงเวลา
"use client";

import React from "react";
import Link from "next/link";
import theme from "@/config/theme.js";
import type { BuildingTab, RangeMode } from "./types";

const RANGES: RangeMode[] = ["Day", "Month", "Year", "Total"];

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
        className="mb-[18px] flex items-center justify-between rounded-[10px] px-5 py-2.5"
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

        {/* Range Selector (เฉพาะแท็บภาพรวม) */}
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
    </>
  );
}
