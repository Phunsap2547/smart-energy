// components/user/buildings/DynamicBuildingMap.tsx
// โหลดแผนที่ (Leaflet) เฉพาะฝั่ง client — ใช้ซ้ำได้ทั้งแท็บภาพรวมและแท็บแจ้งเตือน
"use client";

import dynamic from "next/dynamic";

const DynamicBuildingMap = dynamic(() => import("./BuildingMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[180px] items-center justify-center text-[13px] text-gray-500">
      กำลังโหลดแผนที่...
    </div>
  ),
});

export default DynamicBuildingMap;
