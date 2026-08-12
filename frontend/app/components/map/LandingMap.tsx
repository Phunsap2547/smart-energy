"use client";

import "leaflet/dist/leaflet.css";
//import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import { useRouter } from "next/navigation";
import { buildings } from "@/data/buildings";
import theme from "@/config/theme.js";

// ไอคอนหมุดของ leaflet เริ่มต้นไม่โหลดถูกต้องใน Next.js (ปัญหาที่พบบ่อย)
// เลยต้องระบุ path ของรูปไอคอนเองแบบนี้
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// สีของ status badge ใน popup — ดึงจาก theme.js ตัวเดิม ไม่ hardcode สีใหม่
const statusColorMap: Record<string, string> = {
  Normal: theme.stats.energyToday.border,
  Warning: theme.stats.powerFactor.border,
  Critical: theme.stats.status.background,
};

export default function LandingMap() {
  const router = useRouter();
  const centerBuilding = buildings[0];

  return (
    <div className="w-full h-screen relative">
      {/* หัวข้อลอยด้านบนแผนที่ */}
      <div
        className="absolute top-0 left-0 right-0 z-[1000] px-6 py-4 shadow-md"
        style={{
          background: `linear-gradient(90deg, ${theme.topbar.gradientFrom} 0%, ${theme.topbar.gradientTo} 100%)`,
        }}
      >
        <h1 className="text-white font-bold text-lg px-10">
          Smart Energy Management System
        </h1>
        <p className="text-white/80 text-sm px-12">เลือกอาคารบนแผนที่เพื่อดูข้อมูลพลังงาน</p>
      </div>

      <MapContainer
        center={[centerBuilding.lat, centerBuilding.lng]}
        zoom={16}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {buildings.map((building) => (
          <Marker
            key={building.id}
            position={[building.lat, building.lng]}
            icon={markerIcon}
            eventHandlers={{
              click: () => router.push(`/building/${building.id}`),
            }}
          >
            {/* <Popup>
              <div className="text-sm">
                <p className="font-semibold mb-1">{building.name}</p>
                <span
                  className="inline-block text-xs font-bold px-2 py-0.5 rounded text-white mb-2"
                  style={{ backgroundColor: statusColorMap[building.status] }}
                >
                  {building.status}
                </span>
                <p className="text-blue-600 underline cursor-pointer">
                  คลิกหมุดเพื่อดูรายละเอียด
                </p>
              </div>
            </Popup> */}
            <Tooltip
              direction="top"
              offset={[0, -35]}
              opacity={1}
              permanent
              className="!bg-white !border-none !shadow-lg !rounded-lg"
            >
              <div className="text-sm min-w-[150px] p-1">
                <p className="font-semibold mb-1 text-gray-800">{building.name}</p>
                {/* <span
                  className="inline-block text-xs font-bold px-2 py-0.5 rounded text-white"
                  style={{ backgroundColor: statusColorMap[building.status] }}
                >
                  {building.status}
                </span> */}
              </div>
            </Tooltip>
            {/* <Marker
              key={building.id}
              position={[building.lat, building.lng]}
              icon={markerIcon}
              eventHandlers={{
                click: () => router.push(`/building/${building.id}`),
              }}
            >
              <Tooltip direction="top" offset={[0, -35]} opacity={1}>
                <div className="text-sm">
                  <p className="font-semibold mb-1">{building.name}</p>
                  <span
                    className="inline-block text-xs font-bold px-2 py-0.5 rounded text-white mb-2"
                    style={{ backgroundColor: statusColorMap[building.status] }}
                  >
                    {building.status}
                  </span>
                  <p className="text-blue-600">คลิกหมุดเพื่อดูรายละเอียด</p>
                </div>
              </Tooltip>
            </Marker> */}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}