// components/user/buildings/OverviewTab.tsx
// แท็บ "ภาพรวมวิเคราะห์": แผนที่ + รูปอาคาร + กราฟ 3 ตัว + แผงด้านขวา
"use client";

import React from "react";
import dynamic from "next/dynamic";
import { CostIcon } from "@/components/user/charts/TotalEnergyChart";
import { formatNumber, formatEnergy, formatPower } from "@/lib/formatter";
import type { BuildingReadings } from "@/hooks/useBuildingReadings.ts";
import BuildingMap from "@/components/user/buildings/DynamicBuildingMap";
import Buildingrightpanel from "./Buildingrightpanel";
import type { AlertRow } from "@/lib/alertUtils";
import type { RangeMode } from "./types";

const EnergyConsumptionChart = dynamic(
  () => import("@/components/user/charts/EnergyConsumptionChart"),
  { ssr: false }
);
const TotalEnergyChart = dynamic(() => import("@/components/user/charts/TotalEnergyChart"), {
  ssr: false,
});
const ActivePowerChart = dynamic(() => import("@/components/user/charts/ActivePowerChart"), {
  ssr: false,
});

const CARD_SHADOW = "shadow-[0_2px_8px_rgba(0,0,0,0.04)]";

// ความสูงของแต่ละแถว (แก้ตรงนี้ที่เดียวเพื่อปรับสัดส่วนทั้งหน้า)
const H_TOP = "h-[220px] md:h-[280px]"; // แผนที่ + รูปอาคาร
// กราฟด้านล่างไม่กำหนดความสูงตายตัว: ให้สูงตามเนื้อกราฟ และกราฟคู่กลางยืดให้เท่ากันเอง
// (ถ้าอยากให้กราฟสูงขึ้น ต้องแก้ความสูงในไฟล์กราฟแต่ละตัว)
const STRETCH = "flex min-w-0 [&>*]:min-w-0 [&>*]:flex-1";

interface Props {
  buildingName: string;
  latitude: number;
  longitude: number;
  range: RangeMode;
  rangeLabel: string;
  readings: BuildingReadings;
  alerts: AlertRow[];
  alertsLoading: boolean;
  alertsError: boolean;
  onNavigateToAlerts: () => void;
}

export default function OverviewTab({
  buildingName,
  latitude,
  longitude,
  range,
  rangeLabel,
  readings,
  alerts,
  alertsLoading,
  alertsError,
  onNavigateToAlerts,
}: Props) {
  const {
    latestReading,
    energyCompare,
    energyLoading,
    energyData,
    rangeEnergyKwh,
    powerChartData,
    peakInfo,
  } = readings;

  const powerTitle =
    range === "Day" ? "กำลังไฟฟ้าใช้งาน (Power Real-time)" : `กำลังไฟฟ้าเฉลี่ย (kW) — ${rangeLabel}`;

  return (
    // จอเล็ก: เรียงลงมาทีละส่วน | จอ xl ขึ้นไป: ซ้ายยืดตามพื้นที่ + ขวากว้างคงที่ 400px
    <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
      {/* LEFT COLUMN */}
      <div className="flex min-w-0 flex-col gap-5">
        {/* Section A: Map & Building Image */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div
            className={`${H_TOP} overflow-hidden rounded-2xl border border-gray-200 bg-white ${CARD_SHADOW}`}
          >
            <BuildingMap name={buildingName} lat={latitude} lng={longitude} />
          </div>

          <div
            className={`${H_TOP} relative overflow-hidden rounded-2xl border border-gray-200 bg-white ${CARD_SHADOW}`}
          >
            <img
              src="https://lh3.googleusercontent.com/gps-cs-s/AHRPTWkDTAjaNL0dew2Y_nVGAAv1MwnRweM8zhVcjBKOzDbsH8EyobxS1WL7r9GyRPRpP1VmtY9Iu7oxmscoDYp5Bjjn7sVVdVrfQDLuTO6Nt0ZnHTX60juvJgZxKwPpseNJJYQoT1yu=s680-w680-h510-rw"
              alt={buildingName}
              className="block h-full w-full object-cover"
            />
            <span className="absolute bottom-3 left-3 rounded-md bg-[rgba(18,24,31,0.8)] px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
              {buildingName}
            </span>
          </div>
        </div>

        {/* Section B: Mid Charts Grid
            ครอบด้วย div ความสูงคงที่ แล้วบังคับลูกให้สูงเต็มกล่อง (ให้กราฟ 2 ตัวสูงเท่ากันเสมอ) */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className={STRETCH}>
            <EnergyConsumptionChart data={energyCompare} rangeLabel={rangeLabel} />
          </div>
          <div className={STRETCH}>
            <TotalEnergyChart
              data={energyLoading && energyData.length === 0 ? [] : energyData}
              dataKey="energy"
              title={`การใช้พลังงานรายชั่วโมง (kWh) — ${rangeLabel}`}
              subtitle="ปริมาณพลังงานไฟฟ้าที่ใช้ในแต่ละชั่วโมง"
              color="#7c5fd0"
              darkMode={false}
              valueSuffix="kWh"
            />
          </div>
        </div>

        {/* Section C: Active Power Chart */}
        <div className={STRETCH}>
          <ActivePowerChart
            data={powerChartData}
            title={powerTitle}
            color="#1E9E5A"
            headerIcon={<CostIcon size={16} />}
            valueSuffix="kW"
          />
        </div>
      </div>

      {/* RIGHT COLUMN: จอใหญ่ให้ติดตามเลื่อน, จอเล็กเป็นการ์ดปกติ */}
      <div className="min-w-0 xl:sticky xl:top-5">
        <Buildingrightpanel
          range={range}
          rangeLabel={rangeLabel}
          energyToday={formatEnergy(rangeEnergyKwh)}
          cost={`${formatNumber(rangeEnergyKwh * 4.2)} บาท`}
          peak={peakInfo ? formatPower(peakInfo.value) : "0.00 kW"}
          peakTime={peakInfo?.time}
          powerFactor={latestReading?.power_factor ?? 0.95}
          alerts={alerts}
          alertsLoading={alertsLoading}
          alertsError={alertsError}
          onNavigateToAlerts={onNavigateToAlerts}
        />
      </div>
    </div>
  );
}