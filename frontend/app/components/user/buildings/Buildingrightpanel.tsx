//Buildingrightpanel.tsx
"use client";

import React, { useEffect, useState } from "react";
import { type AlertRow, isOpenAlert, formatThaiDateTime } from "@/lib/alertUtils";

// เก็บสถานะ "อ่านแล้ว" ฝั่งผู้ใช้ไว้ในเบราว์เซอร์ (ไม่กระทบหน้า Admin)
const READ_KEY = "readAlertIds_v1";
const MAX_STORED = 500;

function loadReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(READ_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function saveReadIds(ids: Set<string>) {
  try {
    localStorage.setItem(READ_KEY, JSON.stringify([...ids].slice(-MAX_STORED)));
  } catch {
    /* ignore */
  }
}

interface Props {
  range?: string;
  rangeLabel?: string;
  energyToday?: string; // พลังงานรวมของช่วงที่เลือก เช่น "569.2 kWh"
  cost?: string; // เช่น "2,390.81 บาท"
  peak?: string; // Peak kW ของช่วงที่เลือก เช่น "15.78 kW"
  peakTime?: string; // เวลาที่เกิดพีค
  powerFactor?: number;
  alerts?: AlertRow[]; // แจ้งเตือนของอาคารนี้ (ดึงที่ parent)
  alertsLoading?: boolean;
  alertsError?: boolean;
  onNavigateToAlerts?: () => void;
}

type Tone = "crit" | "warn" | "ok";

const TONE: Record<Tone, { icon: string; cls: string }> = {
  crit: { icon: "!", cls: "bg-[#FBE7E4] text-[#D6493A]" },
  warn: { icon: "△", cls: "bg-[#FBEDDD] text-[#D9822B]" },
  ok: { icon: "✓", cls: "bg-[#E6F6EC] text-[#1E9E5A]" },
};

function toTone(a: AlertRow): Tone {
  if (!isOpenAlert(a)) return "ok";
  return a.severity === "critical" ? "crit" : "warn";
}

export default function Buildingrightpanel({
  rangeLabel = "วันนี้",
  energyToday,
  cost,
  peak,
  peakTime,
  alerts = [],
  alertsLoading = false,
  alertsError = false,
  onNavigateToAlerts,
}: Props) {
  // สถานะอ่านแล้ว/ยังไม่อ่าน (localStorage)
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [readReady, setReadReady] = useState(false);

  useEffect(() => {
    setReadIds(loadReadIds());
    setReadReady(true);
  }, []);

  const markRead = (ids: (string | number)[]) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(String(id)));
      saveReadIds(next);
      return next;
    });
  };

  const isUnread = (a: AlertRow) => readReady && !readIds.has(String(a.id));
  const unreadAlerts = alerts.filter(isUnread);
  const unreadCount = unreadAlerts.length;

  const openAlerts = alerts.filter(isOpenAlert);
  const issueDeviceCount = new Set(openAlerts.map((a) => a.device_id)).size;
  const hasIssue = issueDeviceCount > 0;
  const firstIssue = openAlerts[0];
  const recent = alerts.slice(0, 4);

  const card = "rounded-[14px] border border-gray-200 bg-white";

  return (
    <div className="flex flex-col gap-3.5">
      {/* ⚡ Stat Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`${card} px-4 py-3.5`}>
          <div className="mb-2.5 flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-[#E6F6EC] text-[15px] text-[#1E9E5A]">
            ⚡
          </div>
          <div className="mb-1 text-xs text-gray-500">พลังงาน{rangeLabel}</div>
          <div className="font-mono text-[22px] font-bold leading-[1.1]">{energyToday ?? "0.0 kWh"}</div>
          <div className="mt-1.5 text-[11px] text-gray-500">≈ {cost ?? "0.00 บาท"}</div>
        </div>

        <div className={`${card} px-4 py-3.5`}>
          <div className="mb-2.5 flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-[#FBEDDD] text-[15px] text-[#D9822B]">
            📈
          </div>
          <div className="mb-1 text-xs text-gray-500">Peak Demand {rangeLabel}</div>
          <div className="font-mono text-[22px] font-bold leading-[1.1]">{peak ?? "0.00 kW"}</div>
          <div className="mt-1.5 text-[11px] text-gray-500">เมื่อ {peakTime ?? "-"}</div>
        </div>
      </div>

      {/* ⚠ Status Card */}
      <button
        type="button"
        onClick={onNavigateToAlerts}
        className={`${card} flex w-full cursor-pointer items-center justify-between px-4 py-3.5 text-left`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] text-base ${
              hasIssue ? "bg-[#FBE7E4] text-[#D6493A]" : "bg-[#E6F6EC] text-[#1E9E5A]"
            }`}
          >
            {hasIssue ? "⚠" : "✓"}
          </div>
          <div>
            <div className="text-xs text-gray-500">สถานะอุปกรณ์</div>
            <div className="text-[15px] font-bold">
              {hasIssue ? `พบปัญหา ${issueDeviceCount} อุปกรณ์` : "อุปกรณ์ทำงานปกติ"}
            </div>
            {hasIssue && firstIssue && (
              <div className="mt-0.5 text-[11px] text-gray-500">
                {firstIssue.devices?.name ?? `มิเตอร์ ${firstIssue.device_id}`} —{" "}
                {firstIssue.description || firstIssue.type}
              </div>
            )}
          </div>
        </div>
        <div className="text-lg text-[#B7C0C9]">›</div>
      </button>

      {/* 🔔 Alerts Card */}
      <div className={`${card} flex flex-col px-[18px] py-4`}>
        <div className="mb-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[13.5px] font-semibold">สรุปรายการแจ้งเตือนล่าสุด</span>

            {/* 🔴 ตัวเลขแจ้งเตือนที่ยังไม่อ่าน */}
            {unreadCount > 0 && (
              <span className="relative inline-flex">
                <span className="absolute inset-0 animate-ping rounded-full bg-[#E54D42] opacity-40" />
                <span className="relative inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#E54D42] px-1.5 text-[11px] font-bold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markRead(unreadAlerts.map((a) => a.id))}
                className="cursor-pointer border-none bg-transparent p-0 text-xs text-gray-500 hover:text-gray-700"
              >
                อ่านทั้งหมด
              </button>
            )}
            <button
              type="button"
              onClick={onNavigateToAlerts}
              className="cursor-pointer border-none bg-transparent p-0 text-xs font-semibold text-[#5B6BD6]"
            >
              ดูทั้งหมด ›
            </button>
          </div>
        </div>

        <div className="flex flex-col">
          {alertsLoading && alerts.length === 0 && (
            <div className="py-3 text-center text-xs text-gray-500">กำลังโหลด...</div>
          )}
          {!alertsLoading && alertsError && alerts.length === 0 && (
            <div className="py-3 text-center text-xs text-[#D6493A]">โหลดการแจ้งเตือนไม่สำเร็จ</div>
          )}
          {!alertsLoading && !alertsError && recent.length === 0 && (
            <div className="py-3 text-center text-xs text-gray-500">ไม่มีรายการแจ้งเตือน</div>
          )}

          {recent.map((alert, index) => {
            const tone = TONE[toTone(alert)];
            const unread = isUnread(alert);

            return (
              <button
                key={alert.id}
                type="button"
                onClick={() => {
                  markRead([alert.id]);
                  onNavigateToAlerts?.();
                }}
                className={`flex w-full cursor-pointer items-start gap-2.5 border-x-0 border-b-0 bg-transparent px-0 py-2.5 text-left ${
                  index === 0 ? "border-t-0" : "border-t border-gray-200"
                }`}
              >
                <div
                  className={`mt-px flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[7px] text-xs font-bold ${tone.cls}`}
                >
                  {tone.icon}
                </div>

                <div className="min-w-0 flex-1">
                  <div
                    className={`text-[12.5px] leading-[1.3] ${
                      unread ? "font-bold text-gray-900" : "font-medium text-gray-600"
                    }`}
                  >
                    {alert.description || alert.type || "ไม่ระบุรายละเอียด"}
                  </div>
                  <div className="mt-0.5 text-[11px] text-gray-500">
                    {alert.devices?.name ? `${alert.devices.name} · ` : ""}
                    {formatThaiDateTime(alert.created_at)} ·{" "}
                    {unread ? (
                      <span className="font-semibold text-[#5B6BD6]">ยังไม่อ่าน</span>
                    ) : (
                      "อ่านแล้ว"
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5 self-center">
                  {unread && <span className="h-2 w-2 rounded-full bg-[#5B6BD6]" />}
                  <span className="text-base text-[#B7C0C9]">›</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}