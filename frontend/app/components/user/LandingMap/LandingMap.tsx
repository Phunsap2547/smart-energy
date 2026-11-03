
//LandingMap.tsx
"use client";

import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import { useRouter } from "next/navigation";
import theme from "@/config/theme.js";
import Link from "next/link";
import { UserCircle2, Loader2, Layers } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Building {
  id: string | number;
  name: string;
  lat: number;
  lng: number;
  status?: string;
}

// ⏱️ ถ้าไม่มีข้อมูลเข้ามาเกินเวลานี้ จะแสดงเป็น Offline (ปรับให้ตรงกับเกณฑ์ใน useDeviceStatus)
const OFFLINE_AFTER_MS = 3 * 60 * 1000; // 3 นาที

// ✅ สีตามสถานะ (key เป็นตัวพิมพ์เล็กให้ตรงกับค่าใน buildings.status)
const STATUS_COLOR: Record<string, string> = {
  normal: "#16a34a",   // เขียว
  warning: "#f59e0b",  // ส้ม/เหลือง
  critical: "#dc2626", // แดง
  offline: "#6b7280",  // เทา (Offline / ไม่มีข้อมูล)
};
const DEFAULT_COLOR = "#6b7280"; // เทา (สถานะที่ไม่รู้จัก)

const STATUS_LABEL: Record<string, string> = {
  normal: "Normal", 
  warning: "Warning",
  critical: "Critical",
  offline: "Offline",
};

const normalizeStatus = (s?: string) => (s ?? "").trim().toLowerCase();

const getStatusColor = (s?: string) =>
  STATUS_COLOR[normalizeStatus(s)] ?? DEFAULT_COLOR;

// ✅ หมุดแผนที่สีตามสถานะ (เก็บ cache ไม่สร้างใหม่ทุกครั้ง)
const iconCache: Record<string, L.DivIcon> = {};
const getPinIcon = (status?: string): L.DivIcon => {
  const color = getStatusColor(status);
  if (!iconCache[color]) {
    iconCache[color] = L.divIcon({
      className: "",
      html: `<svg width="30" height="42" viewBox="0 0 30 42" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 2px 2px rgba(0,0,0,.35))">
        <path d="M15 1C7.3 1 1 7.3 1 15c0 10.5 14 26 14 26s14-15.5 14-26C29 7.3 22.7 1 15 1z"
              fill="${color}" stroke="#fff" stroke-width="2"/>
        <circle cx="15" cy="15" r="5.5" fill="#fff"/>
      </svg>`,
      iconSize: [30, 42],
      iconAnchor: [15, 42],
      popupAnchor: [0, -38],
    });
  }
  return iconCache[color];
};

// ---------------------------------------------------------------------------
// ✅ ประเภทแผนที่ + ปุ่มสลับแบบกำหนดเอง
// ---------------------------------------------------------------------------
type MapType = "road" | "satellite" | "hybrid";

const MAP_TYPES: { key: MapType; label: string }[] = [
  { key: "road", label: "แผนที่" },
  { key: "satellite", label: "ดาวเทียม" },
  { key: "hybrid", label: "ดาวเทียม+ชื่อ" },
];

// 🌐 เปลี่ยนเป็น URL ของ Google Maps Tile Services
const GOOGLE_ROADMAP = "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";
const GOOGLE_SATELLITE = "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}";
const GOOGLE_HYBRID = "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}";

// แปลงพิกัดเป็นเลขกระเบื้องแผนที่ (tile) เพื่อใช้เป็นภาพตัวอย่างบนปุ่ม
function latLngToTile(lat: number, lng: number, z: number) {
  const n = 2 ** z;
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  );
  return { x, y };
}

// ภาพตัวอย่างของแต่ละประเภท (ใช้กระเบื้อง Google Maps จริง)
function Thumb({
  type,
  center,
}: {
  type: MapType;
  center: [number, number];
}) {
  const z = 16;
  const { x, y } = latLngToTile(center[0], center[1], z);
  const road = `https://mt1.google.com/vt/lyrs=m&x=${x}&y=${y}&z=${z}`;
  const sat = `https://mt1.google.com/vt/lyrs=s&x=${x}&y=${y}&z=${z}`;
  const hybrid = `https://mt1.google.com/vt/lyrs=y&x=${x}&y=${y}&z=${z}`;
  const cls = "absolute inset-0 w-full h-full object-cover";

  return (
    <div className="absolute inset-0 bg-gray-200">
      {type === "road" && <img src={road} alt="" className={cls} />}
      {type === "satellite" && <img src={sat} alt="" className={cls} />}
      {type === "hybrid" && <img src={hybrid} alt="" className={cls} />}
    </div>
  );
}

function MapTypeSwitcher({
  value,
  onChange,
  center,
}: {
  value: MapType;
  onChange: (t: MapType) => void;
  center: [number, number];
}) {
  const [open, setOpen] = useState(false);
  const current = MAP_TYPES.find((m) => m.key === value)!;

  return (
    <div className="absolute left-4 bottom-8 z-[1000] flex items-end gap-3">
      {/* ปุ่มใหญ่: แสดงประเภทที่เลือกอยู่ */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="เปลี่ยนประเภทแผนที่"
        className="relative w-[88px] h-[88px] rounded-2xl overflow-hidden border-[3px] border-white shadow-xl transition-transform hover:scale-105 shrink-0"
      >
        <Thumb type={value} center={center} />
        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent pt-5 pb-1.5 text-white text-sm font-semibold text-center">
          {current.label}
        </span>
      </button>

      {/* แผงตัวเลือก: ขยายออกมาด้านขวาของปุ่ม */}
      {open && (
        <div className="flex items-start gap-3 bg-white rounded-2xl shadow-xl p-3">
          {MAP_TYPES.map((m) => {
            const active = m.key === value;
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => {
                  onChange(m.key);
                  setOpen(false);
                }}
                className="flex flex-col items-center gap-1.5 group"
              >
                <div
                  className={`relative w-[72px] h-[72px] rounded-xl overflow-hidden border-[3px] transition ${
                    active
                      ? "border-blue-500"
                      : "border-transparent group-hover:border-gray-300"
                  }`}
                >
                  <Thumb type={m.key} center={center} />
                </div>
                <span
                  className={`text-xs text-center leading-tight max-w-[76px] ${
                    active ? "text-blue-600 font-semibold" : "text-gray-700"
                  }`}
                >
                  {m.label}
                </span>
              </button>
            );
          })}

          <div className="flex flex-col items-center gap-1.5 opacity-40 select-none">
            <div className="w-[72px] h-[72px] rounded-xl bg-gray-100 flex items-center justify-center">
              <Layers size={26} className="text-gray-700" />
            </div>
            <span className="text-xs text-gray-700">เพิ่มเติม</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LandingMap() {
  const router = useRouter();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [mapType, setMapType] = useState<MapType>("road");

  // ✅ เวลาข้อมูลล่าสุดของแต่ละอาคาร (ms) ใช้เช็คสถานะ Offline
  const [lastSeen, setLastSeen] = useState<Record<number, number | null>>({});
  const [seenLoaded, setSeenLoaded] = useState(false);

  // ✅ ดึงเวลาข้อมูลล่าสุดของแต่ละอุปกรณ์ แล้วรวมเป็นรายอาคาร
  const fetchLastSeen = async () => {
    try {
      const { data: devices } = await supabase
        .from("devices")
        .select("id, building_id");
      if (!devices) return;

      const results = await Promise.all(
        devices.map(async (d) => {
          const { data } = await supabase
            .from("energy_readings")
            .select("reading_time")
            .eq("device_id", d.id)
            .order("reading_time", { ascending: false })
            .limit(1)
            .maybeSingle();
          return {
            buildingId: Number(d.building_id),
            t: data?.reading_time ? new Date(data.reading_time).getTime() : null,
          };
        })
      );

      const map: Record<number, number | null> = {};
      results.forEach(({ buildingId, t }) => {
        const prev = map[buildingId];
        if (t != null && (prev == null || t > prev)) map[buildingId] = t;
        else if (!(buildingId in map)) map[buildingId] = null;
      });
      setLastSeen(map);
      setSeenLoaded(true);
    } catch (e) {
      console.error("fetchLastSeen error:", e);
    }
  };

  // ✅ สถานะที่ใช้แสดงจริง: ถ้าข้อมูลเงียบเกินกำหนดให้เป็น offline
  const getEffectiveStatus = (b: Building) => {
    if (!seenLoaded) return b.status; // ยังโหลดไม่เสร็จ ใช้ค่าเดิมไปก่อน ไม่ให้กระพริบ
    const t = lastSeen[Number(b.id)];
    if (t == null || Date.now() - t > OFFLINE_AFTER_MS) return "offline";
    return b.status;
  };

  useEffect(() => {
    async function fetchBuildings() {
      try {
        setLoading(true);
        const { data, error } = await supabase.from("buildings").select("*");

        if (error) {
          console.error("Error fetching buildings:", error);
        } else if (data) {
          setBuildings(data);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchBuildings();
    fetchLastSeen();

    // ✅ รีเฟรชข้อมูลอาคารทุก 30 วินาที
    const timer = setInterval(async () => {
      const { data } = await supabase.from("buildings").select("*");
      if (data) setBuildings(data);
    }, 30000);

    // ✅ รีเฟรชเวลาข้อมูลล่าสุด (สถานะ Offline) ทุก 15 วินาที
    const seenTimer = setInterval(fetchLastSeen, 15000);

    return () => {
      clearInterval(timer);
      clearInterval(seenTimer);
    };
  }, []);

  const defaultCenter: [number, number] =
    buildings.length > 0
      ? [buildings[0].lat, buildings[0].lng]
      : [13.7563, 100.5018];

  return (
    <div className="w-full h-screen relative">
      <div
        className="absolute top-0 left-0 right-0 z-[1000] px-6 py-3 shadow-md pointer-events-auto flex items-center justify-between"
        style={{
          background: `linear-gradient(90deg, ${theme.topbar.gradientFrom} 0%, ${theme.topbar.gradientTo} 100%)`,
        }}
      >
        <div>
          <h1 className="text-white font-bold text-lg ml-10">
            Smart Energy Management System
          </h1>
          <p className="text-white/80 text-xs sm:text-sm ml-12">
            เลือกอาคารบนแผนที่เพื่อดูข้อมูลพลังงาน
          </p>
        </div>

        <Link
          href="/admin/login"
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

      {loading ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-600">กำลังโหลดข้อมูลแผนที่...</span>
        </div>
      ) : (
        <>
          <MapContainer
            center={defaultCenter}
            zoom={16}
            maxZoom={20}
            scrollWheelZoom={true}
            className="w-full h-full"
          >
            {/* 📍 แผนที่ถนน Google Maps */}
            {mapType === "road" && (
              <TileLayer
                key="google-road"
                attribution="&copy; Google Maps"
                url={GOOGLE_ROADMAP}
                maxZoom={20}
              />
            )}

            {/* 🛰️ ภาพดาวเทียม Google Maps */}
            {mapType === "satellite" && (
              <TileLayer
                key="google-satellite"
                attribution="&copy; Google Maps"
                url={GOOGLE_SATELLITE}
                maxZoom={20}
              />
            )}

            {/* 🏷️ ภาพดาวเทียม + ป้ายชื่อสถานที่ Google Maps */}
            {mapType === "hybrid" && (
              <TileLayer
                key="google-hybrid"
                attribution="&copy; Google Maps"
                url={GOOGLE_HYBRID}
                maxZoom={20}
              />
            )}

            {buildings.map((building) => {
              const status = getEffectiveStatus(building);
              return (
                <Marker
                  key={building.id}
                  position={[building.lat, building.lng]}
                  icon={getPinIcon(status)}
                  eventHandlers={{
                    click: () => router.push(`/building/${building.id}`),
                  }}
                >
                  <Tooltip
                    direction="top"
                    offset={[0, -40]}
                    opacity={1}
                    permanent
                    className="!bg-white !border-none !shadow-lg !rounded-lg"
                  >
                    <div className="text-sm min-w-[140px] p-1">
                      <p className="font-semibold text-gray-800">
                        {building.name}
                      </p>
                      {status && (
                        <span
                          className="inline-block text-[11px] font-bold px-2 py-0.5 rounded text-white mt-1"
                          style={{
                            backgroundColor: getStatusColor(status),
                          }}
                        >
                          {STATUS_LABEL[normalizeStatus(status)] ?? status}
                        </span>
                      )}
                    </div>
                  </Tooltip>
                </Marker>
              );
            })}
          </MapContainer>

          {/* ปุ่มสลับประเภทแผนที่ */}
          <MapTypeSwitcher
            value={mapType}
            onChange={setMapType}
            center={defaultCenter}
          />
        </>
      )}
    </div>
  );
}