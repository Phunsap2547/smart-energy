// "use client";

// import "leaflet/dist/leaflet.css";
// import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
// import L from "leaflet";
// import { useRouter } from "next/navigation";
// import { buildings } from "@/data/buildings";
// import theme from "@/config/theme.js";
// import Link from "next/link"; 
// import { UserCircle2 } from "lucide-react"; 

// // กำหนด Custom Marker Icon เพื่อแก้ปัญหาหมุดแสดงผลไม่ถูกต้องใน Next.js
// const markerIcon = new L.Icon({
//   iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
//   iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
//   shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
//   popupAnchor: [1, -34],
// });

// // สีของ Status Badge
// const statusColorMap: Record<string, string> = {
//   Normal: theme.stats?.energyToday?.border || "#10b981",
//   Warning: theme.stats?.powerFactor?.border || "#f59e0b",
//   Critical: theme.stats?.status?.background || "#ef4444",
// };

// export default function LandingMap() {
//   const router = useRouter();

//   // กำหนดพิกัดเริ่มต้น พร้อม Fallback ป้องกันเว็บล่มกรณีที่ยังไม่มีข้อมูลในอาร์เรย์ buildings
//   const defaultCenter: [number, number] =
//     buildings.length > 0
//       ? [buildings[0].lat, buildings[0].lng]
//       : [13.7563, 100.5018];

//   return (
//     <div className="w-full h-screen relative">
//       {/* Topbar ลอยด้านบนแผนที่ */}
//       <div
//         className="absolute top-0 left-0 right-0 z-[1000] px-6 py-3 shadow-md pointer-events-auto flex items-center justify-between "
//         style={{
//           background: `linear-gradient(90deg, ${theme.topbar.gradientFrom} 0%, ${theme.topbar.gradientTo} 100%)`,
//         }}
//       >
//         {/* ฝั่งซ้าย: หัวข้อและรายละเอียด */}
//         <div>
//           <h1 className="text-white font-bold text-lg ml-10">
//             Smart Energy Management System
//           </h1>
//           <p className="text-white/80 text-xs sm:text-sm ml-12">
//             เลือกอาคารบนแผนที่เพื่อดูข้อมูลพลังงาน
//           </p>
//         </div>

//         {/* ฝั่งขวา: ปุ่ม Admin */}
//         <Link
//           href="/admin/login"
//           className="flex items-center justify-center gap-1.5 px-4 h-[36px] text-sm font-semibold transition-opacity hover:opacity-90 shrink-0"
//           style={{
//             background: theme.topbar.adminPillBg,
//             color: theme.topbar.adminText,
//             borderRadius: theme.radius.pill,
//           }}
//         >
//           <UserCircle2 size={18} />
//           <span>Admin</span>
//         </Link>
//       </div>

//       {/* ตัวแสดงผลแผนที่ Leaflet */}
//       <MapContainer
//         center={defaultCenter}
//         zoom={16}
//         scrollWheelZoom={true}
//         className="w-full h-full"
//       >
//         <TileLayer
//           attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//         />

//         {buildings.map((building) => (
//           <Marker
//             key={building.id}
//             position={[building.lat, building.lng]}
//             icon={markerIcon}
//             eventHandlers={{
//               click: () => router.push(`/building/${building.id}`),
//             }}
//           >
//             <Tooltip
//               direction="top"
//               offset={[0, -35]}
//               opacity={1}
//               permanent
//               className="!bg-white !border-none !shadow-lg !rounded-lg"
//             >
//               <div className="text-sm min-w-[140px] p-1">
//                 <p className="font-semibold text-gray-800">{building.name}</p>
//                 {building.status && (
//                   <span
//                     className="inline-block text-[11px] font-bold px-2 py-0.5 rounded text-white mt-1"
//                     style={{
//                       backgroundColor:
//                         statusColorMap[building.status] || "#6b7280",
//                     }}
//                   >
//                     {building.status}
//                   </span>
//                 )}
//               </div>
//             </Tooltip>
//           </Marker>
//         ))}
//       </MapContainer>
//     </div>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import { useRouter } from "next/navigation";
import theme from "@/config/theme.js";
import Link from "next/link";
import { UserCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Building {
  id: string | number;
  name: string;
  lat: number;
  lng: number;
  status?: string;
}

// ✅ สีตามสถานะ (key เป็นตัวพิมพ์เล็กให้ตรงกับค่าใน buildings.status)
// ปรับสีตรงนี้ที่เดียว มีผลทั้งหมุดและ badge
const STATUS_COLOR: Record<string, string> = {
  normal: "#16a34a",   // เขียว
  warning: "#f59e0b",  // ส้ม/เหลือง
  critical: "#dc2626", // แดง
};
const DEFAULT_COLOR = "#6b7280"; // เทา (สถานะที่ไม่รู้จัก)

const STATUS_LABEL: Record<string, string> = {
  normal: "Normal",
  warning: "Warning",
  critical: "Critical",
};

// ทำให้ key เป็นตัวพิมพ์เล็กและตัดช่องว่าง กันค่าจาก DB ตัวพิมพ์ไม่ตรง
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

export default function LandingMap() {
  const router = useRouter();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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

    // ✅ รีเฟรชสถานะอาคารทุก 30 วินาที สีจะเปลี่ยนเองเมื่อสถานะเปลี่ยน
    const timer = setInterval(async () => {
      const { data } = await supabase.from("buildings").select("*");
      if (data) setBuildings(data);
    }, 30000);
    return () => clearInterval(timer);
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
              icon={getPinIcon(building.status)}
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
                  <p className="font-semibold text-gray-800">{building.name}</p>
                  {building.status && (
                    <span
                      className="inline-block text-[11px] font-bold px-2 py-0.5 rounded text-white mt-1"
                      style={{ backgroundColor: getStatusColor(building.status) }}
                    >
                      {STATUS_LABEL[normalizeStatus(building.status)] ??
                        building.status}
                    </span>
                  )}
                </div>
              </Tooltip>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  );
}