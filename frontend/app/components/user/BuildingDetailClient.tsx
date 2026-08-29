"use client";

import React, { useMemo, useState } from "react";
import theme from "@/config/theme.js";
import dynamic from "next/dynamic";
import Link from "next/link";
import Buildingrightpanel from "./Buildingrightpanel";
import EnergyConsumptionChart from "@/components/charts/EnergyConsumptionChart";
import TotalEnergyChart, { CostIcon } from "@/components/charts/TotalEnergyChart";
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
import type { Building } from "@/data/buildings";

const BuildingMap = dynamic(() => import("./BuildingMap"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: 220,
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

interface Props {
  building: Building;
}

export default function BuildingDetailClient({ building }: Props) {
  const [range, setRange] = useState<RangeMode>("Day");
  const [darkMode, setDarkMode] = useState(false);

  const energyToday = ENERGY_TODAY[range];
  const cost = COST_ESTIMATE[range];
  const peak = PEAK_DEMAND[range];
  const consumption = consumptionSeries[range];
  const usage = usageSeries[range];
  const costTrend = costSeries[range];

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
          padding: 20,
          "--card-bg": darkMode ? "#191b21" : "#ffffff",
          "--border-color": darkMode ? "#2a2d36" : "#e5e7eb",
          "--text-primary": darkMode ? "#f3f4f6" : "#111827",
          "--text-secondary": darkMode ? "#9ca3af" : "#6b7280",
          background: darkMode ? "#0f1115" : "#f5f6f8",
          color: darkMode ? "#f3f4f6" : "#111827",
        } as React.CSSProperties
      }
    >
      {/* HEADER: ปุ่มกลับ + range selector + dark mode toggle */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 25,
          padding: "10px 16px",
          borderRadius: 8,
          background: `linear-gradient(90deg, ${theme.topbar.gradientFrom} 0%, ${theme.topbar.gradientTo} 100%)`,
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "#9ba8c2",
            fontSize: 20,
            textDecoration: "none",
            
          }}
        >
          ← กลับไปหน้าแผนที่
        </Link>
      </div>

     <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 16px" }}>{building.name}</h1>

      {/* Main Layout Grid (Left / Right) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 18 }}>
        
        {/* LEFT column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ height: 220, borderRadius: 12, overflow: "hidden" }}>
            <BuildingMap name={building.name} lat={building.lat} lng={building.lng} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <EnergyConsumptionChart data={consumption} rangeLabel={rangeLabel} darkMode={darkMode} />
            <TotalEnergyChart
              data={usage}
              dataKey="kwh"
              title="Total Energy Used (kWh)"
              color="#7c5fd0"
              darkMode={darkMode}
            />
          </div>

          <TotalEnergyChart
            data={costTrend}
            dataKey="cost"
            title="Cost Trend (บาท)"
            color="#16a34a"
            headerIcon={<CostIcon size={16} />}
            darkMode={darkMode}
            valueSuffix="บาท"
          />
        </div>

        {/* RIGHT column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          
          {/* ชุดปุ่มเปลี่ยนช่วงเวลา + Dark Mode อยู่ด้านบนของ Right Panel */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <div
              style={{
                display: "flex",
                flex: 1,
                justifyContent: "space-between",
                background: "var(--card-bg)",
                border: "1px solid var(--border-color)",
                borderRadius: 20,
                padding: 3,
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
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    background: range === r ? "#2563eb" : "transparent",
                    color: range === r ? "#fff" : "var(--text-secondary)",
                    transition: "all 0.2s",
                  }}
                >
                  {r}
                </button>
              ))}
            </div>

            <button
              onClick={() => setDarkMode((d) => !d)}
              style={{
                width: 34,
                height: 34,
                flexShrink: 0,
                borderRadius: "50%",
                border: "1px solid var(--border-color)",
                background: "var(--card-bg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>

          {/* Panel ข้อมูลเดิม */}
          <Buildingrightpanel
            range={range}
            rangeLabel={rangeLabel}
            energyToday={energyToday}
            cost={cost}
            peak={peak}
            powerFactor={0.48}
            devices={devices}
          />
        </div>

      </div>
    </div>
  );
}