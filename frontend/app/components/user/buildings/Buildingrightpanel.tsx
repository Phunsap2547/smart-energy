// //Buildingrightpanel.tsx
// "use client";

// import React from "react";
// import type { RangeMode, DeviceIssue } from "@/data/mockData";

// interface Props {
//   range?: RangeMode;
//   rangeLabel?: string;
//   energyToday?: { value: number; unit: string; changePct: number };
//   cost?: { value: number; changePct: number };
//   peak?: { value: number; time: string };
//   powerFactor?: number;
//   devices?: DeviceIssue[];
//   onNavigateToAlerts?: () => void; // 👈 เรียกเพื่อสลับไปแท็บ "ประวัติการแจ้งเตือน" ในหน้าเดิม
// }

// export default function Buildingrightpanel({
//   rangeLabel = "วันนี้",
//   energyToday,
//   peak,
//   devices = [],
//   onNavigateToAlerts,
// }: Props) {
//   const mockAlerts = [
//     { id: "a1", text: "PF เฟส L3 ต่ำ (0.35)", time: "29 มิ.ย. 2569, 14:20", severity: "crit", icon: "!" },
//     //{ id: "a2", text: "THD-I เกินเกณฑ์ทุกเฟส", time: "28 มิ.ย. 2569, 09:05", severity: "warn", icon: "△" },
//     { id: "a3", text: "โหลดไม่สมดุลเกิน 5%", time: "27 มิ.ย. 2569, 20:41", severity: "warn", icon: "△" },
//     { id: "a4", text: "Voltage เฟส L2 กลับสู่ปกติ", time: "26 มิ.ย. 2569, 11:02 · อ่านแล้ว", severity: "ok", icon: "✓" },
//   ];

//   const deviceList = devices ?? [];
//   const hasIssue = deviceList.length > 0;

//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
//       {/* ⚡ Stat Cards */}
//       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
//         <div style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: 14, padding: "14px 16px" }}>
//           <div style={{ width: 30, height: 30, borderRadius: 8, background: "#E6F6EC", color: "#1E9E5A", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10, fontSize: 15 }}>⚡</div>
//           <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 }}>พลังงาน{rangeLabel}</div>
//           <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "monospace", lineHeight: 1.1 }}>
//             {(energyToday?.value ?? 0).toLocaleString()} <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)" }}>{energyToday?.unit ?? "kWh"}</span>
//           </div>
//           <div style={{ fontSize: 11, marginTop: 6, color: (energyToday?.changePct ?? 0) >= 0 ? "#1E9E5A" : "#D6493A" }}>
//             {(energyToday?.changePct ?? 0) >= 0 ? `↑ +${energyToday?.changePct ?? 0}%` : `↓ ${energyToday?.changePct ?? 0}%`} เทียบช่วงก่อน
//           </div>
//         </div>

//         <div style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: 14, padding: "14px 16px" }}>
//           <div style={{ width: 30, height: 30, borderRadius: 8, background: "#FBEDDD", color: "#D9822B", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10, fontSize: 15 }}>📈</div>
//           <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 }}>Peak Demand</div>
//           <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "monospace", lineHeight: 1.1 }}>
//             {peak?.value ?? 0} <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)" }}>kW</span>
//           </div>
//           <div style={{ fontSize: 11, marginTop: 6, color: "var(--text-secondary)" }}>เมื่อ {peak?.time ?? "-"}</div>
//         </div>
//       </div>

//       {/* ⚠ Status Card (คลิกเพื่อสลับไปแท็บ Alert Log ในหน้าเดิม) */}
//       <button
//         type="button"
//         onClick={onNavigateToAlerts}
//         style={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           background: "var(--card-bg)",
//           border: "1px solid var(--border-color)",
//           borderRadius: 14,
//           padding: "14px 16px",
//           textDecoration: "none",
//           color: "inherit",
//           cursor: "pointer",
//           font: "inherit",
//           textAlign: "left",
//           width: "100%",
//         }}
//       >
//         <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
//           <div style={{ width: 34, height: 34, borderRadius: 9, background: hasIssue ? "#FBE7E4" : "#E6F6EC", color: hasIssue ? "#D6493A" : "#1E9E5A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
//             {hasIssue ? "⚠" : "✓"}
//           </div>
//           <div>
//             <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>สถานะอุปกรณ์</div>
//             <div style={{ fontSize: 15, fontWeight: 700 }}>
//               {hasIssue ? `พบปัญหา ${deviceList.length} อุปกรณ์` : "อุปกรณ์ทำงานปกติ"}
//             </div>
//             {hasIssue && deviceList[0] && (
//               <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>
//                 {deviceList[0].name} — {deviceList[0].issue}
//               </div>
//             )}
//           </div>
//         </div>
//         <div style={{ color: "#B7C0C9", fontSize: 18 }}>›</div>
//       </button>

//       {/* 🔔 Alerts Card */}
//       <div style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: 14, padding: "16px 18px", display: "flex", flexDirection: "column" }}>
//         <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
//           <span style={{ fontSize: 13.5, fontWeight: 600 }}>สรุปรายการแจ้งเตือนล่าสุด</span>

//           {/* สลับไปแท็บ "ประวัติการแจ้งเตือน" ในหน้าเดิม */}
//           <button
//             type="button"
//             onClick={onNavigateToAlerts}
//             style={{ fontSize: 12, color: "#5B6BD6", fontWeight: 600, background: "none", border: "none", padding: 0, cursor: "pointer", font: "inherit" }}
//           >
//             ดูทั้งหมด ›
//           </button>
//         </div>

//         <div style={{ display: "flex", flexDirection: "column" }}>
//           {mockAlerts.map((alert, index) => {
//             const getSeverityStyle = (type: string) => {
//               switch (type) {
//                 case "crit": return { bg: "#FBE7E4", color: "#D6493A" };
//                 case "warn": return { bg: "#FBEDDD", color: "#D9822B" };
//                 case "ok": return { bg: "#E6F6EC", color: "#1E9E5A" };
//                 default: return { bg: "#EAECFB", color: "#5B6BD6" };
//               }
//             };
//             const sev = getSeverityStyle(alert.severity);

//             return (
//               <div key={alert.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0", borderTop: index === 0 ? "none" : "1px solid var(--border-color)" }}>
//                 <div style={{ width: 26, height: 26, borderRadius: 7, flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, background: sev.bg, color: sev.color }}>
//                   {alert.icon}
//                 </div>
//                 <div style={{ flex: 1 }}>
//                   <div style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.3 }}>{alert.text}</div>
//                   <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>{alert.time}</div>
//                 </div>
//                 <button
//                   type="button"
//                   onClick={onNavigateToAlerts}
//                   style={{ color: "#B7C0C9", fontSize: 16, alignSelf: "center", background: "none", border: "none", padding: 0, cursor: "pointer" }}
//                 >
//                   ›
//                 </button>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// }

//Buildingrightpanel.tsx
"use client";

import React, { useEffect, useState } from "react";

// Base URL ของ Express (ตั้งใน .env.local เช่น NEXT_PUBLIC_API_URL=http://localhost:5000)
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

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

interface AlertRow {
  id: string | number;
  device_id: string | number;
  type?: string | null;
  severity?: string | null; // critical | high | warning
  description?: string | null;
  status?: string | null; // open | investigating | resolved | dismissed
  created_at: string;
  devices?: { name?: string | null } | null;
}

interface DeviceLite {
  id: string | number;
  name?: string;
}

interface Props {
  range?: string;
  rangeLabel?: string;
  energyToday?: string; // พลังงานรวมของช่วงที่เลือก เช่น "569.2 kWh"
  cost?: string; // เช่น "2,390.81 บาท"
  peak?: string; // Peak kW ของช่วงที่เลือก เช่น "15.78 kW"
  peakTime?: string; // เวลาที่เกิดพีค
  powerFactor?: number;
  devices?: DeviceLite[];
  onNavigateToAlerts?: () => void;
}

type Tone = "crit" | "warn" | "ok";

const TONE: Record<Tone, { icon: string; cls: string }> = {
  crit: { icon: "!", cls: "bg-[#FBE7E4] text-[#D6493A]" },
  warn: { icon: "△", cls: "bg-[#FBEDDD] text-[#D9822B]" },
  ok: { icon: "✓", cls: "bg-[#E6F6EC] text-[#1E9E5A]" },
};

const isOpen = (a: AlertRow) => a.status === "open" || a.status === "investigating";

function toTone(a: AlertRow): Tone {
  if (!isOpen(a)) return "ok";
  return a.severity === "critical" ? "crit" : "warn";
}

function formatThaiDateTime(iso: string) {
  try {
    return new Intl.DateTimeFormat("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      timeZone: "Asia/Bangkok",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function Buildingrightpanel({
  rangeLabel = "วันนี้",
  energyToday,
  cost,
  peak,
  peakTime,
  devices = [],
  onNavigateToAlerts,
}: Props) {
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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

  // key ของ device ทั้งหมดในอาคาร (ใช้เป็น dependency เพื่อไม่ให้ effect วนทุก render)
  const deviceIdsKey = devices.map((d) => String(d.id)).join(",");

  useEffect(() => {
    if (!deviceIdsKey) {
      setAlerts([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/alerts?device_ids=${encodeURIComponent(deviceIdsKey)}&limit=50`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!cancelled) {
          setAlerts(json.data ?? []);
          setError(false);
        }
      } catch (err) {
        console.error("❌ [DEBUG] Fetch alerts error:", err);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    setLoading(true);
    load();
    const interval = setInterval(load, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [deviceIdsKey]);

  const isUnread = (a: AlertRow) => readReady && !readIds.has(String(a.id));
  const unreadAlerts = alerts.filter(isUnread);
  const unreadCount = unreadAlerts.length;

  const openAlerts = alerts.filter(isOpen);
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
          {loading && alerts.length === 0 && (
            <div className="py-3 text-center text-xs text-gray-500">กำลังโหลด...</div>
          )}
          {!loading && error && alerts.length === 0 && (
            <div className="py-3 text-center text-xs text-[#D6493A]">โหลดการแจ้งเตือนไม่สำเร็จ</div>
          )}
          {!loading && !error && recent.length === 0 && (
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