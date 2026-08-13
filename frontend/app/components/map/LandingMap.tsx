"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import { useRouter } from "next/navigation";
import { buildings } from "@/data/buildings";
import theme from "@/config/theme.js";
import Link from "next/link"; 
import { UserCircle2 } from "lucide-react"; 

// กำหนด Custom Marker Icon เพื่อแก้ปัญหาหมุดแสดงผลไม่ถูกต้องใน Next.js
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// สีของ Status Badge
const statusColorMap: Record<string, string> = {
  Normal: theme.stats?.energyToday?.border || "#10b981",
  Warning: theme.stats?.powerFactor?.border || "#f59e0b",
  Critical: theme.stats?.status?.background || "#ef4444",
};

export default function LandingMap() {
  const router = useRouter();

  // กำหนดพิกัดเริ่มต้น พร้อม Fallback ป้องกันเว็บล่มกรณีที่ยังไม่มีข้อมูลในอาร์เรย์ buildings
  const defaultCenter: [number, number] =
    buildings.length > 0
      ? [buildings[0].lat, buildings[0].lng]
      : [13.7563, 100.5018];

  return (
    <div className="w-full h-screen relative">
      {/* Topbar ลอยด้านบนแผนที่ */}
      <div
        className="absolute top-0 left-0 right-0 z-[1000] px-6 py-3 shadow-md pointer-events-auto flex items-center justify-between "
        style={{
          background: `linear-gradient(90deg, ${theme.topbar.gradientFrom} 0%, ${theme.topbar.gradientTo} 100%)`,
        }}
      >
        {/* ฝั่งซ้าย: หัวข้อและรายละเอียด */}
        <div>
          <h1 className="text-white font-bold text-lg ml-10">
            Smart Energy Management System
          </h1>
          <p className="text-white/80 text-xs sm:text-sm ml-12">
            เลือกอาคารบนแผนที่เพื่อดูข้อมูลพลังงาน
          </p>
        </div>

        {/* ฝั่งขวา: ปุ่ม Admin */}
        <Link
          href="/admin"
          className="flex items-center justify-center gap-1.5 px-4 h-[36px] text-sm font-semibold transition-opacity hover:opacity-90 shrink-0"
          style={{
            background: theme.topbar.adminPillBg,
            color: theme.topbar.adminText,
            borderRadius: theme.radius.pill,
          }}
        >
          <UserCircle2 size={18} />
          <span>Admin</span>
        </Link>
      </div>

      {/* ตัวแสดงผลแผนที่ Leaflet */}
      <MapContainer
        center={defaultCenter}
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
            <Tooltip
              direction="top"
              offset={[0, -35]}
              opacity={1}
              permanent
              className="!bg-white !border-none !shadow-lg !rounded-lg"
            >
              <div className="text-sm min-w-[140px] p-1">
                <p className="font-semibold text-gray-800">{building.name}</p>
                {building.status && (
                  <span
                    className="inline-block text-[11px] font-bold px-2 py-0.5 rounded text-white mt-1"
                    style={{
                      backgroundColor:
                        statusColorMap[building.status] || "#6b7280",
                    }}
                  >
                    {building.status}
                  </span>
                )}
              </div>
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}