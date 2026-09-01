"use client";

import React from "react";
import type { RangeMode, DeviceIssue } from "@/data/mockData";

interface Props {
  range?: RangeMode;
  rangeLabel?: string;
  energyToday?: { value: number; unit: string; changePct: number };
  cost?: { value: number; changePct: number };
  peak?: { value: number; time: string };
  powerFactor?: number;
  devices?: DeviceIssue[];
  onNavigateToAlerts?: () => void; // 👈 เรียกเพื่อสลับไปแท็บ "ประวัติการแจ้งเตือน" ในหน้าเดิม
}

export default function Buildingrightpanel({
  rangeLabel = "วันนี้",
  energyToday,
  peak,
  devices = [],
  onNavigateToAlerts,
}: Props) {
  const mockAlerts = [
    { id: "a1", text: "PF เฟส L3 ต่ำ (0.35)", time: "29 มิ.ย. 2569, 14:20", severity: "crit", icon: "!" },
    //{ id: "a2", text: "THD-I เกินเกณฑ์ทุกเฟส", time: "28 มิ.ย. 2569, 09:05", severity: "warn", icon: "△" },
    { id: "a3", text: "โหลดไม่สมดุลเกิน 5%", time: "27 มิ.ย. 2569, 20:41", severity: "warn", icon: "△" },
    { id: "a4", text: "Voltage เฟส L2 กลับสู่ปกติ", time: "26 มิ.ย. 2569, 11:02 · อ่านแล้ว", severity: "ok", icon: "✓" },
  ];

  const deviceList = devices ?? [];
  const hasIssue = deviceList.length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* ⚡ Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: 14, padding: "14px 16px" }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "#E6F6EC", color: "#1E9E5A", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10, fontSize: 15 }}>⚡</div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 }}>พลังงาน{rangeLabel}</div>
          <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "monospace", lineHeight: 1.1 }}>
            {(energyToday?.value ?? 0).toLocaleString()} <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)" }}>{energyToday?.unit ?? "kWh"}</span>
          </div>
          <div style={{ fontSize: 11, marginTop: 6, color: (energyToday?.changePct ?? 0) >= 0 ? "#1E9E5A" : "#D6493A" }}>
            {(energyToday?.changePct ?? 0) >= 0 ? `↑ +${energyToday?.changePct ?? 0}%` : `↓ ${energyToday?.changePct ?? 0}%`} เทียบช่วงก่อน
          </div>
        </div>

        <div style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: 14, padding: "14px 16px" }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "#FBEDDD", color: "#D9822B", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10, fontSize: 15 }}>📈</div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 }}>Peak Demand</div>
          <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "monospace", lineHeight: 1.1 }}>
            {peak?.value ?? 0} <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)" }}>kW</span>
          </div>
          <div style={{ fontSize: 11, marginTop: 6, color: "var(--text-secondary)" }}>เมื่อ {peak?.time ?? "-"}</div>
        </div>
      </div>

      {/* ⚠ Status Card (คลิกเพื่อสลับไปแท็บ Alert Log ในหน้าเดิม) */}
      <button
        type="button"
        onClick={onNavigateToAlerts}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--card-bg)",
          border: "1px solid var(--border-color)",
          borderRadius: 14,
          padding: "14px 16px",
          textDecoration: "none",
          color: "inherit",
          cursor: "pointer",
          font: "inherit",
          textAlign: "left",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: hasIssue ? "#FBE7E4" : "#E6F6EC", color: hasIssue ? "#D6493A" : "#1E9E5A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
            {hasIssue ? "⚠" : "✓"}
          </div>
          <div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>สถานะอุปกรณ์</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>
              {hasIssue ? `พบปัญหา ${deviceList.length} อุปกรณ์` : "อุปกรณ์ทำงานปกติ"}
            </div>
            {hasIssue && deviceList[0] && (
              <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>
                {deviceList[0].name} — {deviceList[0].issue}
              </div>
            )}
          </div>
        </div>
        <div style={{ color: "#B7C0C9", fontSize: 18 }}>›</div>
      </button>

      {/* 🔔 Alerts Card */}
      <div style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: 14, padding: "16px 18px", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 13.5, fontWeight: 600 }}>สรุปรายการแจ้งเตือนล่าสุด</span>

          {/* สลับไปแท็บ "ประวัติการแจ้งเตือน" ในหน้าเดิม */}
          <button
            type="button"
            onClick={onNavigateToAlerts}
            style={{ fontSize: 12, color: "#5B6BD6", fontWeight: 600, background: "none", border: "none", padding: 0, cursor: "pointer", font: "inherit" }}
          >
            ดูทั้งหมด ›
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {mockAlerts.map((alert, index) => {
            const getSeverityStyle = (type: string) => {
              switch (type) {
                case "crit": return { bg: "#FBE7E4", color: "#D6493A" };
                case "warn": return { bg: "#FBEDDD", color: "#D9822B" };
                case "ok": return { bg: "#E6F6EC", color: "#1E9E5A" };
                default: return { bg: "#EAECFB", color: "#5B6BD6" };
              }
            };
            const sev = getSeverityStyle(alert.severity);

            return (
              <div key={alert.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0", borderTop: index === 0 ? "none" : "1px solid var(--border-color)" }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, background: sev.bg, color: sev.color }}>
                  {alert.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.3 }}>{alert.text}</div>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>{alert.time}</div>
                </div>
                <button
                  type="button"
                  onClick={onNavigateToAlerts}
                  style={{ color: "#B7C0C9", fontSize: 16, alignSelf: "center", background: "none", border: "none", padding: 0, cursor: "pointer" }}
                >
                  ›
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}