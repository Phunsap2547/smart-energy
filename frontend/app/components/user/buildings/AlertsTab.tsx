// components/user/buildings/AlertsTab.tsx
// แท็บ "ประวัติการแจ้งเตือน": แผนที่ + สถานะ real-time + ตารางประวัติ (ข้อมูลจริงจาก /api/alerts)
"use client";

import React, { useEffect, useMemo, useState } from "react";
import BuildingMap from "./DynamicBuildingMap";
import {
  type AlertRow,
  isOpenAlert,
  formatThaiDateTime,
  bangkokDateKey,
} from "@/lib/alertUtils";

interface Props {
  buildingName: string;
  locationName?: string;
  latitude: number;
  longitude: number;
  alerts: AlertRow[];
  loading: boolean;
  error: boolean;
}

const DEFAULT_LOCATION = "มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตเฉลิมพระเกียรติ จังหวัดสกลนคร";
const PAGE_SIZE = 20;
const DAY_MS = 24 * 60 * 60 * 1000;

const STATUS_OPTIONS = [
  { value: "all", label: "สถานะ: ทั้งหมด" },
  { value: "open", label: "เปิดอยู่ (รอดำเนินการ)" },
  { value: "investigating", label: "กำลังตรวจสอบ" },
  { value: "resolved", label: "แก้ไขแล้ว" },
  { value: "dismissed", label: "ปิดรายการ" },
];

const FALLBACK = { label: "-", cls: "bg-gray-100 text-gray-500" };

const SEVERITY: Record<string, { label: string; cls: string }> = {
  critical: { label: "วิกฤต", cls: "bg-[#FBE7E4] text-[#D6493A]" },
  high: { label: "สูง", cls: "bg-[#FBEDDD] text-[#D9822B]" },
  warning: { label: "เตือน", cls: "bg-[#FEF6D8] text-[#B7791F]" },
};

const STATUS: Record<string, { label: string; cls: string }> = {
  open: { label: "เปิดอยู่", cls: "bg-[#FBE7E4] text-[#D6493A]" },
  investigating: { label: "กำลังตรวจสอบ", cls: "bg-[#FBEDDD] text-[#D9822B]" },
  resolved: { label: "แก้ไขแล้ว", cls: "bg-[#E6F6EC] text-[#1E9E5A]" },
  dismissed: { label: "ปิดรายการ", cls: "bg-gray-100 text-gray-500" },
};

const deviceName = (a: AlertRow) => a.devices?.name || `มิเตอร์ ${a.device_id}`;

export default function AlertsTab({
  buildingName,
  locationName,
  latitude,
  longitude,
  alerts,
  loading,
  error,
}: Props) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);

  // เปลี่ยนตัวกรองแล้วเริ่มนับหน้าใหม่
  useEffect(() => setVisible(PAGE_SIZE), [statusFilter, dateFrom, dateTo]);

  const filteredAlerts = useMemo(
    () =>
      alerts.filter((a) => {
        if (statusFilter !== "all" && a.status !== statusFilter) return false;
        const day = bangkokDateKey(a.created_at);
        if (dateFrom && day < dateFrom) return false;
        if (dateTo && day > dateTo) return false;
        return true;
      }),
    [alerts, statusFilter, dateFrom, dateTo]
  );

  // กล่อง real-time: ดูจากรายการที่ยังไม่ปิดเรื่อง (ไม่ขึ้นกับตัวกรองตาราง)
  const openAlerts = useMemo(() => alerts.filter(isOpenAlert), [alerts]);
  const issueDeviceCount = new Set(openAlerts.map((a) => a.device_id)).size;
  const hasIssue = openAlerts.length > 0;

  const shown = filteredAlerts.slice(0, visible);
  const hasDateFilter = Boolean(dateFrom || dateTo);

  return (
    <div className="flex flex-col gap-5">
      {/* Top Grid: Map & Real-time Alert */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-5">
        <div className="rounded-[14px] border border-gray-200 bg-white p-4">
          <div className="mb-2.5 h-40 overflow-hidden rounded-[10px]">
            <BuildingMap name={buildingName} lat={latitude} lng={longitude} />
          </div>
          <div className="text-sm font-bold">{buildingName}</div>
          <div className="text-xs text-gray-500">{locationName || DEFAULT_LOCATION}</div>
        </div>

        <div
          className={`flex flex-col justify-between rounded-[14px] p-5 text-white ${
            hasIssue ? "bg-[#E54D42]" : "bg-[#1E9E5A]"
          }`}
        >
          <div>
            <div className="text-xs font-bold tracking-wider">
              {hasIssue ? "⚠ REAL-TIME ALERT" : "✓ STATUS NORMAL"}
            </div>
            <h2 className="mb-4 mt-2.5 text-[22px]">
              {loading && alerts.length === 0
                ? "กำลังตรวจสอบสถานะ..."
                : hasIssue
                ? `${issueDeviceCount} อุปกรณ์พบความผิดปกติ`
                : "ระบบทำงานปกติ"}
            </h2>

            {hasIssue && (
              <div className="flex flex-col gap-2">
                {openAlerts.slice(0, 3).map((a) => (
                  <div key={a.id} className="rounded-[10px] bg-white/95 p-3.5 text-[13px] text-gray-900">
                    <strong className="text-[#D6493A]">• {deviceName(a)}</strong>
                    <div className="mt-1 text-gray-600">{a.description || a.type}</div>
                    <div className="mt-0.5 text-[11px] text-gray-500">{formatThaiDateTime(a.created_at)}</div>
                  </div>
                ))}
                {openAlerts.length > 3 && (
                  <div className="text-xs text-white/90">และอีก {openAlerts.length - 3} รายการที่ยังไม่ปิดเรื่อง</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table Log */}
      <div className="rounded-[14px] border border-gray-200 bg-white p-5">
        <h3 className="mb-4 mt-0 text-base">⚡ ประวัติการแจ้งเตือนย้อนหลัง (HISTORICAL ALERTS LOG)</h3>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] text-gray-900"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 text-[13px] text-gray-500">
            <input
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-lg border border-gray-200 bg-slate-50 px-3 py-2 text-[13px] text-gray-700"
            />
            <span>ถึง</span>
            <input
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-lg border border-gray-200 bg-slate-50 px-3 py-2 text-[13px] text-gray-700"
            />
            {hasDateFilter && (
              <button
                type="button"
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                }}
                className="cursor-pointer border-none bg-transparent p-0 text-xs font-semibold text-[#5B6BD6]"
              >
                ล้างวันที่
              </button>
            )}
          </div>

          <span className="ml-auto text-xs text-gray-500">{filteredAlerts.length} รายการ</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-gray-200 bg-slate-50 text-gray-500">
                <th className="p-3">วัน-เวลา</th>
                <th className="p-3">รายละเอียดปัญหา</th>
                <th className="p-3">อุปกรณ์</th>
                <th className="p-3">ระดับ</th>
                <th className="p-3">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((row) => {
                const sev = SEVERITY[row.severity ?? ""] ?? { ...FALLBACK, label: row.severity || "-" };
                const st = STATUS[row.status ?? ""] ?? { ...FALLBACK, label: row.status || "-" };
                const isNew = isOpenAlert(row) && Date.now() - new Date(row.created_at).getTime() < DAY_MS;

                return (
                  <tr key={row.id} className="border-b border-gray-200">
                    <td className="whitespace-nowrap p-3">
                      {formatThaiDateTime(row.created_at)}{" "}
                      {isNew && (
                        <span className="ml-1.5 rounded bg-[#FBE7E4] px-1.5 py-0.5 text-[10px] text-[#D6493A]">
                          ใหม่
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-semibold">{row.description || row.type || "-"}</td>
                    <td className="whitespace-nowrap p-3 text-gray-600">{deviceName(row)}</td>
                    <td className="p-3">
                      <span className={`rounded-xl px-2.5 py-1 text-[11px] font-semibold ${sev.cls}`}>{sev.label}</span>
                    </td>
                    <td className="p-3">
                      <span className={`whitespace-nowrap rounded-xl px-2.5 py-1 text-[11px] font-semibold ${st.cls}`}>
                        ● {st.label}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {loading && alerts.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-500">
                    กำลังโหลด...
                  </td>
                </tr>
              )}
              {!loading && error && alerts.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-[#D6493A]">
                    โหลดประวัติการแจ้งเตือนไม่สำเร็จ
                  </td>
                </tr>
              )}
              {!loading && !error && filteredAlerts.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-500">
                    ไม่พบรายการแจ้งเตือน
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredAlerts.length > visible && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              className="cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-2 text-[13px] font-semibold text-[#5B6BD6] hover:bg-slate-50"
            >
              แสดงเพิ่ม ({filteredAlerts.length - visible} รายการ)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
