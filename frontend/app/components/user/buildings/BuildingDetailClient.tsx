"use client";

import React, { useState, useMemo } from "react";
import theme from "@/config/theme.js";
import dynamic from "next/dynamic";
import Link from "next/link";
import Buildingrightpanel from "./Buildingrightpanel";
import EnergyConsumptionChart from "@/components/user/charts/EnergyConsumptionChart";
import TotalEnergyChart, { CostIcon } from "@/components/user/charts/TotalEnergyChart";
import ActivePowerChart from "@/components/user/charts/ActivePowerChart";
import {
  ENERGY_TODAY,
  COST_ESTIMATE,
  PEAK_DEMAND,
  consumptionSeries,
  usageSeries,
  costSeries,
  devices,
  type RangeMode,
} from "@/data/mockData";

const BuildingMap = dynamic(() => import("./BuildingMap"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: "100%",
        minHeight: 180,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#6b7280",
        fontSize: 13,
      }}
    >
      กำลังโหลดแผนที่...
    </div>
  ),
});

export interface BuildingData {
  id: string;
  name: string;
  locationName?: string;
  lat: number;
  lng: number;
}

interface Props {
  building: BuildingData;
}

export default function BuildingDetailClient({ building }: Props) {
  // State หลักสำหรับ Dashboard
  const [activeTab, setActiveTab] = useState<"overview" | "alerts">("overview");
  const [range, setRange] = useState<RangeMode>("Day");
  const [darkMode, setDarkMode] = useState(false);

  // State สำหรับ Alerts Page
  const [statusFilter, setStatusFilter] = useState("all");

  const energyToday = ENERGY_TODAY[range];
  const cost = COST_ESTIMATE[range];
  const peak = PEAK_DEMAND[range];
  const consumption = consumptionSeries[range];
  const usage = usageSeries[range];
  const costTrend = costSeries[range];

  const alertsLog = [
    { id: 1, date: "27/08/2026 14:20", isNew: true, issue: "Power Factor ต่ำกว่าค่ามาตรฐาน", value: "0.48 (เกณฑ์ ≥ 0.80)", status: "Active", location: "Panel MDB 2 / Floor 3" },
    { id: 2, date: "26/08/2026 09:15", isNew: false, issue: "กระแสไฟฟ้าเกินค่ามาตรฐาน", value: "125 A (เกณฑ์ ≤ 100 A)", status: "Solved", location: "Panel MDB 1 / Floor 1" },
    { id: 3, date: "24/08/2026 18:00", isNew: false, issue: "อุณหภูมิสูงผิดปกติ", value: "42.5 °C (เกณฑ์ ≤ 40 °C)", status: "Solved", location: "Transformer Room" },
  ];

  const filteredAlerts = useMemo(() => {
    if (statusFilter === "all") return alertsLog;
    return alertsLog.filter((item) => item.status.toLowerCase() === statusFilter.toLowerCase());
  }, [statusFilter, alertsLog]);

  const activeAlert = alertsLog.find((alert) => alert.status === "Active");

  const rangeLabel = useMemo(() => {
    switch (range) {
      case "Day":
        return "วันนี้";
      case "Month":
        return "เดือนนี้";
      case "Year":
        return "ปีนี้";
      default:
        return "ทั้งหมด";
    }
  }, [range]);

  return (
    <div
      className={darkMode ? "dark" : ""}
      style={
        {
          minHeight: "100vh",
          width: "100%",
          padding: "20px 28px",
          boxSizing: "border-box",
          "--card-bg": darkMode ? "#191b21" : "#ffffff",
          "--border-color": darkMode ? "#2a2d36" : "#e5e7eb",
          "--text-primary": darkMode ? "#f3f4f6" : "#111827",
          "--text-secondary": darkMode ? "#9ca3af" : "#6b7280",
          background: darkMode ? "#0f1115" : "#f4f6f8",
          color: darkMode ? "#f3f4f6" : "#111827",
          fontFamily: "sans-serif",
        } as React.CSSProperties
      }
    >
      {/* 1. TOP NAV BAR */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 18,
          padding: "10px 20px",
          borderRadius: 10,
          background: `linear-gradient(90deg, ${theme.topbar.gradientFrom} 0%, ${theme.topbar.gradientTo} 100%)`,
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "#ffffff",
            fontSize: 14,
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          ← กลับไปหน้าแผนที่
        </Link>
        <span style={{ color: "#fff", fontSize: 13, opacity: 0.9 }}>
          {building.name} — Smart Energy Management
        </span>
      </div>

      {/* 2. HEADER BAR & NAVIGATION TABS */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{building.name}</h1>
          
          {/* Main View Switcher */}
          <div style={{ display: "flex", background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: 8, padding: 2 }}>
            <button
              onClick={() => setActiveTab("overview")}
              style={{
                border: "none",
                padding: "6px 14px",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                background: activeTab === "overview" ? "#1E9E5A" : "transparent",
                color: activeTab === "overview" ? "#fff" : "var(--text-secondary)",
              }}
            >
              📊 ภาพรวมวิเคราะห์
            </button>
            <button
              onClick={() => setActiveTab("alerts")}
              style={{
                border: "none",
                padding: "6px 14px",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                background: activeTab === "alerts" ? "#1E9E5A" : "transparent",
                color: activeTab === "alerts" ? "#fff" : "var(--text-secondary)",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              ⚡ ประวัติการแจ้งเตือน
              {activeAlert && (
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#E54D42" }} />
              )}
            </button>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Range Selector */}
          {activeTab === "overview" && (
            <div
              style={{
                display: "flex",
                background: "var(--card-bg)",
                border: "1px solid var(--border-color)",
                borderRadius: 20,
                padding: 4,
                width: 280,
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              {(["Day", "Month", "Year", "Total"] as RangeMode[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  style={{
                    flex: 1,
                    border: "none",
                    padding: "6px 0",
                    borderRadius: 16,
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: "pointer",
                    background: range === r ? "#1E9E5A" : "transparent",
                    color: range === r ? "#fff" : "var(--text-secondary)",
                    transition: "all 0.2s ease",
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          )}

          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode((d) => !d)}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "1px solid var(--border-color)",
              background: "var(--card-bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </div>

      {/* 3. TAB CONTENT */}
      {activeTab === "overview" ? (
        /* OVERVIEW DASHBOARD TAB */
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "calc(100% - 380px) 360px",
            gap: 20,
            alignItems: "start",
          }}
        >
          {/* LEFT COLUMN */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Section A: Map & Building Image */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div
                style={{
                  height: 180,
                  borderRadius: 14,
                  overflow: "hidden",
                  border: "1px solid var(--border-color)",
                  background: "var(--card-bg)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                }}
              >
                <BuildingMap name={building.name} lat={building.lat} lng={building.lng} />
              </div>

              <div
                style={{
                  height: 180,
                  borderRadius: 14,
                  overflow: "hidden",
                  border: "1px solid var(--border-color)",
                  position: "relative",
                  background: "var(--card-bg)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=400&fit=crop"
                  alt={building.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
                <span
                  style={{
                    position: "absolute",
                    left: 12,
                    bottom: 12,
                    background: "rgba(18,24,31,0.8)",
                    backdropFilter: "blur(4px)",
                    color: "#fff",
                    fontSize: 12,
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontWeight: 500,
                  }}
                >
                  {building.name}
                </span>
              </div>
            </div>

            {/* Section B: Mid Charts Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <EnergyConsumptionChart data={consumption} rangeLabel={rangeLabel} darkMode={darkMode} />
              <TotalEnergyChart
                data={usage}
                dataKey="kwh"
                title="Total Energy Used (kWh)"
                color="#7c5fd0"
                darkMode={darkMode}
              />
            </div>

            {/* Section C: Active Power Chart */}
            <ActivePowerChart
              data={costTrend}
              title="กำลังไฟฟ้าใช้งาน (Active Power)"
              color="#1E9E5A"
              headerIcon={<CostIcon size={16} />}
              darkMode={darkMode}
              valueSuffix="kW"
            />
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ position: "sticky", top: 20 }}>
            <Buildingrightpanel
              range={range}
              rangeLabel={rangeLabel}
              energyToday={energyToday}
              cost={cost}
              peak={peak}
              powerFactor={0.48}
              devices={devices}
              onNavigateToAlerts={() => setActiveTab("alerts")}
            />
          </div>
        </div>
      ) : (
        /* ALERTS LOG TAB */
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Top Grid: Map & Real-time Alert */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
            <div style={{ background: "var(--card-bg)", borderRadius: 14, padding: 16, border: "1px solid var(--border-color)" }}>
              <div style={{ height: 160, borderRadius: 10, overflow: "hidden", marginBottom: 10 }}>
                <BuildingMap name={building.name} lat={building.lat} lng={building.lng} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{building.name}</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                {building.locationName || "มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตเฉลิมพระเกียรติ จังหวัดสกลนคร"}
              </div>
            </div>

            <div style={{ background: activeAlert ? "#E54D42" : "#1E9E5A", color: "#fff", borderRadius: 14, padding: 20, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>
                  {activeAlert ? "⚠ REAL-TIME ALERT" : "✓ STATUS NORMAL"}
                </div>
                <h2 style={{ fontSize: 22, margin: "10px 0 16px" }}>
                  {activeAlert ? "1 อุปกรณ์พบความผิดปกติ" : "ระบบทำงานปกติ"}
                </h2>
                {activeAlert && (
                  <div style={{ background: "rgba(255,255,255,0.95)", color: "#111", padding: 14, borderRadius: 10, fontSize: 13 }}>
                    <strong style={{ color: "#D6493A" }}>• {activeAlert.location}</strong>
                    <div style={{ marginTop: 4, color: "#4b5563" }}>{activeAlert.issue} ({activeAlert.value})</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Table Log */}
          <div style={{ background: "var(--card-bg)", borderRadius: 14, padding: 20, border: "1px solid var(--border-color)" }}>
            <h3 style={{ fontSize: 16, margin: "0 0 16px" }}>⚡ ประวัติการแจ้งเตือนย้อนหลัง (HISTORICAL ALERTS LOG)</h3>

            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--border-color)",
                  background: "var(--card-bg)",
                  color: "var(--text-primary)",
                  fontSize: 13,
                }}
              >
                <option value="all">สถานะ: ทั้งหมด</option>
                <option value="active">Active (รอดำเนินการ)</option>
                <option value="solved">Solved (แก้ไขแล้ว)</option>
              </select>
              <input
                type="text"
                value="20/08/2026 - 27/08/2026"
                readOnly
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--border-color)",
                  fontSize: 13,
                  background: darkMode ? "#111" : "#f8fafc",
                  color: "var(--text-secondary)",
                }}
              />
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
                <thead>
                  <tr style={{ background: darkMode ? "#111" : "#f8fafc", borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)" }}>
                    <th style={{ padding: 12 }}>วัน-เวลา</th>
                    <th style={{ padding: 12 }}>รายละเอียดปัญหา</th>
                    <th style={{ padding: 12 }}>ค่าที่ผิดปกติ</th>
                    <th style={{ padding: 12 }}>สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAlerts.map((row) => (
                    <tr key={row.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                      <td style={{ padding: 12, whiteSpace: "nowrap" }}>
                        {row.date} {row.isNew && <span style={{ background: "#FBE7E4", color: "#D6493A", fontSize: 10, padding: "2px 6px", borderRadius: 4, marginLeft: 6 }}>ใหม่</span>}
                      </td>
                      <td style={{ padding: 12, fontWeight: 600 }}>{row.issue}</td>
                      <td style={{ padding: 12, color: row.status === "Active" ? "#D6493A" : "inherit", fontWeight: 600 }}>{row.value}</td>
                      <td style={{ padding: 12 }}>
                        <span style={{ padding: "4px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600, background: row.status === "Active" ? "#FBE7E4" : "#E6F6EC", color: row.status === "Active" ? "#D6493A" : "#1E9E5A" }}>
                          ● {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}