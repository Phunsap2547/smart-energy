// BuildingDetailClient.tsx
// ตัวหลัก: เก็บ state ของหน้า แล้วประกอบชิ้นส่วนย่อยเข้าด้วยกัน
"use client";

import React, { useState } from "react";
import { useDeviceStatus } from "@/hooks/useDeviceStatus";
import { useBuildingReadings } from "@/hooks/useBuildingReadings";
import { useBuildingAlerts } from "@/hooks/useBuildingAlerts";
import { isOpenAlert } from "@/lib/alertUtils";
import BuildingHeader from "./BuildingHeader";
import OverviewTab from "./OverviewTab";
import AlertsTab from "./AlertsTab";
import type { BuildingData, BuildingTab, RangeMode } from "@/types";

// ส่งต่อ type เดิม เผื่อไฟล์อื่น import จากที่นี่อยู่
export type { BuildingData, RangeMode } from "@/types";

const RANGE_LABELS: Record<RangeMode, string> = {
  Day: "วันนี้",
  Month: "เดือนนี้",
  Year: "ปีนี้",
  Total: "ทั้งหมด",
};

interface Props {
  building: BuildingData;
  devices?: any[];
}

export default function BuildingDetailClient({ building, devices = [] }: Props) {
  const [activeTab, setActiveTab] = useState<BuildingTab>("overview");
  const [range, setRange] = useState<RangeMode>("Day");
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(devices[0]?.id || "");

  // เช็คสถานะการออนไลน์ของ Device ที่เลือก
  useDeviceStatus(selectedDeviceId);

  // ข้อมูลกราฟ/พลังงาน/Peak
  const readings = useBuildingReadings(selectedDeviceId, building.id, range);

  // รายการแจ้งเตือนของ "อาคารนี้เท่านั้น" (ใช้ทั้งจุดแดงบนแท็บ, แผงขวา และตารางประวัติ)
  const { alerts, loading: alertsLoading, error: alertsError } = useBuildingAlerts(building.id);

  const buildingName = building.name || building.building_name || "อาคารไม่ระบุชื่อ";
  const latitude = building.lat ?? 17.2882;
  const longitude = building.lng ?? 104.1132;
  const hasActiveAlert = alerts.some(isOpenAlert);

  return (
    <div className="min-h-screen w-full bg-[#f4f6f8] font-sans text-gray-900">
      {/* container: เต็มความกว้างจอ + gap สม่ำเสมอ */}
      <div className="flex w-full flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
        <BuildingHeader
          buildingName={buildingName}
          devices={devices}
          selectedDeviceId={selectedDeviceId}
          onSelectDevice={setSelectedDeviceId}
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          hasActiveAlert={hasActiveAlert}
          range={range}
          onChangeRange={setRange}
        />

        {activeTab === "overview" ? (
          <OverviewTab
            buildingName={buildingName}
            latitude={latitude}
            longitude={longitude}
            range={range}
            rangeLabel={RANGE_LABELS[range]}
            readings={readings}
            alerts={alerts}
            alertsLoading={alertsLoading}
            alertsError={alertsError}
            onNavigateToAlerts={() => setActiveTab("alerts")}
          />
        ) : (
          <AlertsTab
            buildingName={buildingName}
            locationName={building.locationName}
            latitude={latitude}
            longitude={longitude}
            alerts={alerts}
            loading={alertsLoading}
            error={alertsError}
          />
        )}
      </div>
    </div>
  );
}