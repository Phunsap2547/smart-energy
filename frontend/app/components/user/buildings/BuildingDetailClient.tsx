// "use client";

// import React, { useState, useMemo } from "react";
// import theme from "@/config/theme.js";
// import dynamic from "next/dynamic";
// import Link from "next/link";
// import Buildingrightpanel from "./Buildingrightpanel";
// import EnergyConsumptionChart from "@/components/user/charts/EnergyConsumptionChart";
// import TotalEnergyChart, { CostIcon } from "@/components/user/charts/TotalEnergyChart";
// import ActivePowerChart from "@/components/user/charts/ActivePowerChart";
// import {
//   ENERGY_TODAY,
//   COST_ESTIMATE,
//   PEAK_DEMAND,
//   consumptionSeries,
//   usageSeries,
//   costSeries,
//   devices,
//   type RangeMode,
// } from "@/data/mockData";

// const BuildingMap = dynamic(() => import("./BuildingMap"), {
//   ssr: false,
//   loading: () => (
//     <div
//       style={{
//         height: "100%",
//         minHeight: 180,
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         color: "#6b7280",
//         fontSize: 13,
//       }}
//     >
//       กำลังโหลดแผนที่...
//     </div>
//   ),
// });

// export interface BuildingData {
//   id: string;
//   name: string;
//   locationName?: string;
//   lat: number;
//   lng: number;
// }

// interface Props {
//   building: BuildingData;
// }

// export default function BuildingDetailClient({ building }: Props) {
//   // State หลักสำหรับ Dashboard
//   const [activeTab, setActiveTab] = useState<"overview" | "alerts">("overview");
//   const [range, setRange] = useState<RangeMode>("Day");
//   const [darkMode, setDarkMode] = useState(false);

//   // State สำหรับ Alerts Page
//   const [statusFilter, setStatusFilter] = useState("all");

//   const energyToday = ENERGY_TODAY[range];
//   const cost = COST_ESTIMATE[range];
//   const peak = PEAK_DEMAND[range];
//   const consumption = consumptionSeries[range];
//   const usage = usageSeries[range];
//   const costTrend = costSeries[range];

//   const alertsLog = [
//     { id: 1, date: "27/08/2026 14:20", isNew: true, issue: "Power Factor ต่ำกว่าค่ามาตรฐาน", value: "0.48 (เกณฑ์ ≥ 0.80)", status: "Active", location: "Panel MDB 2 / Floor 3" },
//     { id: 2, date: "26/08/2026 09:15", isNew: false, issue: "กระแสไฟฟ้าเกินค่ามาตรฐาน", value: "125 A (เกณฑ์ ≤ 100 A)", status: "Solved", location: "Panel MDB 1 / Floor 1" },
//     { id: 3, date: "24/08/2026 18:00", isNew: false, issue: "อุณหภูมิสูงผิดปกติ", value: "42.5 °C (เกณฑ์ ≤ 40 °C)", status: "Solved", location: "Transformer Room" },
//   ];

//   const filteredAlerts = useMemo(() => {
//     if (statusFilter === "all") return alertsLog;
//     return alertsLog.filter((item) => item.status.toLowerCase() === statusFilter.toLowerCase());
//   }, [statusFilter, alertsLog]);

//   const activeAlert = alertsLog.find((alert) => alert.status === "Active");

//   const rangeLabel = useMemo(() => {
//     switch (range) {
//       case "Day":
//         return "วันนี้";
//       case "Month":
//         return "เดือนนี้";
//       case "Year":
//         return "ปีนี้";
//       default:
//         return "ทั้งหมด";
//     }
//   }, [range]);

//   return (
//     <div
//       className={darkMode ? "dark" : ""}
//       style={
//         {
//           minHeight: "100vh",
//           width: "100%",
//           padding: "20px 28px",
//           boxSizing: "border-box",
//           "--card-bg": darkMode ? "#191b21" : "#ffffff",
//           "--border-color": darkMode ? "#2a2d36" : "#e5e7eb",
//           "--text-primary": darkMode ? "#f3f4f6" : "#111827",
//           "--text-secondary": darkMode ? "#9ca3af" : "#6b7280",
//           background: darkMode ? "#0f1115" : "#f4f6f8",
//           color: darkMode ? "#f3f4f6" : "#111827",
//           fontFamily: "sans-serif",
//         } as React.CSSProperties
//       }
//     >
//       {/* 1. TOP NAV BAR */}
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           marginBottom: 18,
//           padding: "10px 20px",
//           borderRadius: 10,
//           background: `linear-gradient(90deg, ${theme.topbar.gradientFrom} 0%, ${theme.topbar.gradientTo} 100%)`,
//         }}
//       >
//         <Link
//           href="/"
//           style={{
//             display: "flex",
//             alignItems: "center",
//             gap: 6,
//             color: "#ffffff",
//             fontSize: 14,
//             fontWeight: 500,
//             textDecoration: "none",
//           }}
//         >
//           ← กลับไปหน้าแผนที่
//         </Link>
//         <span style={{ color: "#fff", fontSize: 13, opacity: 0.9 }}>
//           {building.name} — Smart Energy Management
//         </span>
//       </div>

//       {/* 2. HEADER BAR & NAVIGATION TABS */}
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           marginBottom: 20,
//           flexWrap: "wrap",
//           gap: 12,
//         }}
//       >
//         <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
//           <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{building.name}</h1>

//           {/* Main View Switcher */}
//           <div style={{ display: "flex", background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: 8, padding: 2 }}>
//             <button
//               onClick={() => setActiveTab("overview")}
//               style={{
//                 border: "none",
//                 padding: "6px 14px",
//                 borderRadius: 6,
//                 fontSize: 13,
//                 fontWeight: 600,
//                 cursor: "pointer",
//                 background: activeTab === "overview" ? "#1E9E5A" : "transparent",
//                 color: activeTab === "overview" ? "#fff" : "var(--text-secondary)",
//               }}
//             >
//               📊 ภาพรวมวิเคราะห์
//             </button>
//             <button
//               onClick={() => setActiveTab("alerts")}
//               style={{
//                 border: "none",
//                 padding: "6px 14px",
//                 borderRadius: 6,
//                 fontSize: 13,
//                 fontWeight: 600,
//                 cursor: "pointer",
//                 background: activeTab === "alerts" ? "#1E9E5A" : "transparent",
//                 color: activeTab === "alerts" ? "#fff" : "var(--text-secondary)",
//                 display: "flex",
//                 alignItems: "center",
//                 gap: 6,
//               }}
//             >
//               ⚡ ประวัติการแจ้งเตือน
//               {activeAlert && (
//                 <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#E54D42" }} />
//               )}
//             </button>
//           </div>
//         </div>

//         <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
//           {/* Range Selector */}
//           {activeTab === "overview" && (
//             <div
//               style={{
//                 display: "flex",
//                 background: "var(--card-bg)",
//                 border: "1px solid var(--border-color)",
//                 borderRadius: 20,
//                 padding: 4,
//                 width: 280,
//                 boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
//               }}
//             >
//               {(["Day", "Month", "Year", "Total"] as RangeMode[]).map((r) => (
//                 <button
//                   key={r}
//                   onClick={() => setRange(r)}
//                   style={{
//                     flex: 1,
//                     border: "none",
//                     padding: "6px 0",
//                     borderRadius: 16,
//                     fontSize: 12.5,
//                     fontWeight: 600,
//                     cursor: "pointer",
//                     background: range === r ? "#1E9E5A" : "transparent",
//                     color: range === r ? "#fff" : "var(--text-secondary)",
//                     transition: "all 0.2s ease",
//                   }}
//                 >
//                   {r}
//                 </button>
//               ))}
//             </div>
//           )}

//           {/* Theme Toggle */}
//           <button
//             onClick={() => setDarkMode((d) => !d)}
//             style={{
//               width: 36,
//               height: 36,
//               borderRadius: "50%",
//               border: "1px solid var(--border-color)",
//               background: "var(--card-bg)",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               cursor: "pointer",
//               boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
//             }}
//           >
//             {darkMode ? "☀️" : "🌙"}
//           </button>
//         </div>
//       </div>

//       {/* 3. TAB CONTENT */}
//       {activeTab === "overview" ? (
//         /* OVERVIEW DASHBOARD TAB */
//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "calc(100% - 380px) 360px",
//             gap: 20,
//             alignItems: "start",
//           }}
//         >
//           {/* LEFT COLUMN */}
//           <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
//             {/* Section A: Map & Building Image */}
//             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
//               <div
//                 style={{
//                   height: 180,
//                   borderRadius: 14,
//                   overflow: "hidden",
//                   border: "1px solid var(--border-color)",
//                   background: "var(--card-bg)",
//                   boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
//                 }}
//               >
//                 <BuildingMap name={building.name} lat={building.lat} lng={building.lng} />
//               </div>

//               <div
//                 style={{
//                   height: 180,
//                   borderRadius: 14,
//                   overflow: "hidden",
//                   border: "1px solid var(--border-color)",
//                   position: "relative",
//                   background: "var(--card-bg)",
//                   boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
//                 }}
//               >
//                 <img
//                   src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=400&fit=crop"
//                   alt={building.name}
//                   style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
//                 />
//                 <span
//                   style={{
//                     position: "absolute",
//                     left: 12,
//                     bottom: 12,
//                     background: "rgba(18,24,31,0.8)",
//                     backdropFilter: "blur(4px)",
//                     color: "#fff",
//                     fontSize: 12,
//                     padding: "4px 10px",
//                     borderRadius: 6,
//                     fontWeight: 500,
//                   }}
//                 >
//                   {building.name}
//                 </span>
//               </div>
//             </div>

//             {/* Section B: Mid Charts Grid */}
//             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
//               <EnergyConsumptionChart data={consumption} rangeLabel={rangeLabel} darkMode={darkMode} />
//               <TotalEnergyChart
//                 data={usage}
//                 dataKey="kwh"
//                 title="Total Energy Used (kWh)"
//                 color="#7c5fd0"
//                 darkMode={darkMode}
//               />
//             </div>

//             {/* Section C: Active Power Chart */}
//             <ActivePowerChart
//               data={costTrend}
//               title="กำลังไฟฟ้าใช้งาน (Active Power)"
//               color="#1E9E5A"
//               headerIcon={<CostIcon size={16} />}
//               darkMode={darkMode}
//               valueSuffix="kW"
//             />
//           </div>

//           {/* RIGHT COLUMN */}
//           <div style={{ position: "sticky", top: 20 }}>
//             <Buildingrightpanel
//               range={range}
//               rangeLabel={rangeLabel}
//               energyToday={energyToday}
//               cost={cost}
//               peak={peak}
//               powerFactor={0.48}
//               devices={devices}
//               onNavigateToAlerts={() => setActiveTab("alerts")}
//             />
//           </div>
//         </div>
//       ) : (
//         /* ALERTS LOG TAB */
//         <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
//           {/* Top Grid: Map & Real-time Alert */}
//           <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
//             <div style={{ background: "var(--card-bg)", borderRadius: 14, padding: 16, border: "1px solid var(--border-color)" }}>
//               <div style={{ height: 160, borderRadius: 10, overflow: "hidden", marginBottom: 10 }}>
//                 <BuildingMap name={building.name} lat={building.lat} lng={building.lng} />
//               </div>
//               <div style={{ fontSize: 14, fontWeight: 700 }}>{building.name}</div>
//               <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
//                 {building.locationName || "มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตเฉลิมพระเกียรติ จังหวัดสกลนคร"}
//               </div>
//             </div>

//             <div style={{ background: activeAlert ? "#E54D42" : "#1E9E5A", color: "#fff", borderRadius: 14, padding: 20, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
//               <div>
//                 <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>
//                   {activeAlert ? "⚠ REAL-TIME ALERT" : "✓ STATUS NORMAL"}
//                 </div>
//                 <h2 style={{ fontSize: 22, margin: "10px 0 16px" }}>
//                   {activeAlert ? "1 อุปกรณ์พบความผิดปกติ" : "ระบบทำงานปกติ"}
//                 </h2>
//                 {activeAlert && (
//                   <div style={{ background: "rgba(255,255,255,0.95)", color: "#111", padding: 14, borderRadius: 10, fontSize: 13 }}>
//                     <strong style={{ color: "#D6493A" }}>• {activeAlert.location}</strong>
//                     <div style={{ marginTop: 4, color: "#4b5563" }}>{activeAlert.issue} ({activeAlert.value})</div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Table Log */}
//           <div style={{ background: "var(--card-bg)", borderRadius: 14, padding: 20, border: "1px solid var(--border-color)" }}>
//             <h3 style={{ fontSize: 16, margin: "0 0 16px" }}>⚡ ประวัติการแจ้งเตือนย้อนหลัง (HISTORICAL ALERTS LOG)</h3>

//             <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
//               <select
//                 value={statusFilter}
//                 onChange={(e) => setStatusFilter(e.target.value)}
//                 style={{
//                   padding: "8px 12px",
//                   borderRadius: 8,
//                   border: "1px solid var(--border-color)",
//                   background: "var(--card-bg)",
//                   color: "var(--text-primary)",
//                   fontSize: 13,
//                 }}
//               >
//                 <option value="all">สถานะ: ทั้งหมด</option>
//                 <option value="active">Active (รอดำเนินการ)</option>
//                 <option value="solved">Solved (แก้ไขแล้ว)</option>
//               </select>
//               <input
//                 type="text"
//                 value="20/08/2026 - 27/08/2026"
//                 readOnly
//                 style={{
//                   padding: "8px 12px",
//                   borderRadius: 8,
//                   border: "1px solid var(--border-color)",
//                   fontSize: 13,
//                   background: darkMode ? "#111" : "#f8fafc",
//                   color: "var(--text-secondary)",
//                 }}
//               />
//             </div>

//             <div style={{ overflowX: "auto" }}>
//               <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
//                 <thead>
//                   <tr style={{ background: darkMode ? "#111" : "#f8fafc", borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)" }}>
//                     <th style={{ padding: 12 }}>วัน-เวลา</th>
//                     <th style={{ padding: 12 }}>รายละเอียดปัญหา</th>
//                     <th style={{ padding: 12 }}>ค่าที่ผิดปกติ</th>
//                     <th style={{ padding: 12 }}>สถานะ</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredAlerts.map((row) => (
//                     <tr key={row.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
//                       <td style={{ padding: 12, whiteSpace: "nowrap" }}>
//                         {row.date} {row.isNew && <span style={{ background: "#FBE7E4", color: "#D6493A", fontSize: 10, padding: "2px 6px", borderRadius: 4, marginLeft: 6 }}>ใหม่</span>}
//                       </td>
//                       <td style={{ padding: 12, fontWeight: 600 }}>{row.issue}</td>
//                       <td style={{ padding: 12, color: row.status === "Active" ? "#D6493A" : "inherit", fontWeight: 600 }}>{row.value}</td>
//                       <td style={{ padding: 12 }}>
//                         <span style={{ padding: "4px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600, background: row.status === "Active" ? "#FBE7E4" : "#E6F6EC", color: row.status === "Active" ? "#D6493A" : "#1E9E5A" }}>
//                           ● {row.status}
//                         </span>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



// "use client";

// import React, { useState, useMemo, useEffect } from "react";
// import theme from "@/config/theme.js";
// import dynamic from "next/dynamic";
// import Link from "next/link";
// import Buildingrightpanel from "./Buildingrightpanel";
// import { CostIcon } from "@/components/user/charts/TotalEnergyChart";
// import { formatNumber } from "@/lib/formatter";
// import { useDeviceStatus } from "@/hooks/useDeviceStatus";

// // --- Dynamic Imports (ย้ายมาไว้ด้านนอก Component ทั้งหมด) ---
// const BuildingMap = dynamic(() => import("./BuildingMap"), {
//   ssr: false,
//   loading: () => (
//     <div
//       style={{
//         height: "100%",
//         minHeight: 180,
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         color: "#6b7280",
//         fontSize: 13,
//       }}
//     >
//       กำลังโหลดแผนที่...
//     </div>
//   ),
// });

// // Import Charts แบบ Disable SSR ด้านนอก Component Body
// const EnergyConsumptionChart = dynamic(
//   () => import("@/components/user/charts/EnergyConsumptionChart"),
//   { ssr: false }
// );
// const TotalEnergyChart = dynamic(
//   () => import("@/components/user/charts/TotalEnergyChart"),
//   { ssr: false }
// );
// const ActivePowerChart = dynamic(
//   () => import("@/components/user/charts/ActivePowerChart"),
//   { ssr: false }
// );

// export interface BuildingData {
//   id: string | number;
//   name?: string;
//   building_name?: string;
//   locationName?: string;
//   lat?: number;
//   lng?: number;
// }

// export type RangeMode = "Day" | "Month" | "Year" | "Total";

// interface Props {
//   building: BuildingData;
//   devices?: any[];
// }

// export default function BuildingDetailClient({ building, devices = [] }: Props) {
//   // State หลักสำหรับ Dashboard
//   const [activeTab, setActiveTab] = useState<"overview" | "alerts">("overview");
//   const [range, setRange] = useState<RangeMode>("Day");

//   // State สำหรับการเลือก Device และ Real-time Chart Data
//   const [selectedDeviceId, setSelectedDeviceId] = useState<string>(devices[0]?.id || "");
//   const [chartData, setChartData] = useState<{ label: string; cost: number }[]>([]);
//   const [latestReading, setLatestReading] = useState<any>(null);

//   // State สำหรับ Alerts Page
//   const [statusFilter, setStatusFilter] = useState("all");

//   // เช็คสถานะการออนไลน์ของ Device ที่เลือก
//   const { isOnline } = useDeviceStatus(selectedDeviceId);

//   // ดึงข้อมูล Real-time Active Power Chart จาก Backend API (/api/readings/chart)
//   useEffect(() => {
//     if (!selectedDeviceId) return;

//     const res = await fetch(`/api/readings/chart?device_id=${selectedDeviceId}&limit=24`);
//     if (res.ok) {
//       const rawData = await res.json();

//       // แปลงข้อมูลจาก API ให้มี key: label และ cost ตามที่กราฟต้องการ
//       const formattedData = rawData.map((item: any) => ({
//         // แปลงเวลาให้เป็นรูปแบบ HH:mm หรือใช้ค่า label ที่มีอยู่
//         label: item.label || new Date(item.created_at || item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//         // ดึงค่าพลังงาน เช่น active_power, kwh หรือ cost
//         cost: Number(item.cost || item.active_power || item.kwh || 0),
//       }));

//       setChartData(formattedData);
//     }

//     fetchChartAndLatest();
//     const interval = setInterval(fetchChartAndLatest, 10000); // อัปเดตทุก 10 วินาที

//     return () => clearInterval(interval);
//   }, [selectedDeviceId]);

//   // ประวัติการแจ้งเตือน
//   const alertsLog = [
//     { id: 1, date: "27/08/2026 14:20", isNew: true, issue: "Power Factor ต่ำกว่าค่ามาตรฐาน", value: "0.48 (เกณฑ์ ≥ 0.80)", status: "Active", location: "Panel MDB 2 / Floor 3" },
//     { id: 2, date: "26/08/2026 09:15", isNew: false, issue: "กระแสไฟฟ้าเกินค่ามาตรฐาน", value: "125 A (เกณฑ์ ≤ 100 A)", status: "Solved", location: "Panel MDB 1 / Floor 1" },
//     { id: 3, date: "24/08/2026 18:00", isNew: false, issue: "อุณหภูมิสูงผิดปกติ", value: "42.5 °C (เกณฑ์ ≤ 40 °C)", status: "Solved", location: "Transformer Room" },
//   ];

//   const filteredAlerts = useMemo(() => {
//     if (statusFilter === "all") return alertsLog;
//     return alertsLog.filter((item) => item.status.toLowerCase() === statusFilter.toLowerCase());
//   }, [statusFilter, alertsLog]);

//   const activeAlert = alertsLog.find((alert) => alert.status === "Active");

//   const rangeLabel = useMemo(() => {
//     switch (range) {
//       case "Day":
//         return "วันนี้";
//       case "Month":
//         return "เดือนนี้";
//       case "Year":
//         return "ปีนี้";
//       default:
//         return "ทั้งหมด";
//     }
//   }, [range]);

//   const buildingName = building.name || building.building_name || "อาคารไม่ระบุชื่อ";
//   const latitude = building.lat ?? 17.2882;
//   const longitude = building.lng ?? 104.1132;

//   return (
//     <div
//       style={{
//         minHeight: "100vh",
//         width: "100%",
//         padding: "20px 28px",
//         boxSizing: "border-box",
//         background: "#f4f6f8",
//         color: "#111827",
//         fontFamily: "sans-serif",
//       }}
//     >
//       {/* 1. TOP NAV BAR */}
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           marginBottom: 18,
//           padding: "10px 20px",
//           borderRadius: 10,
//           background: `linear-gradient(90deg, ${theme.topbar.gradientFrom} 0%, ${theme.topbar.gradientTo} 100%)`,
//         }}
//       >
//         <Link
//           href="/"
//           style={{
//             display: "flex",
//             alignItems: "center",
//             gap: 6,
//             color: "#ffffff",
//             fontSize: 14,
//             fontWeight: 500,
//             textDecoration: "none",
//           }}
//         >
//           ← กลับไปหน้าแผนที่
//         </Link>
//         <span style={{ color: "#fff", fontSize: 13, opacity: 0.9 }}>
//           {buildingName} — Smart Energy Management
//         </span>
//       </div>

//       {/* 2. HEADER BAR & NAVIGATION TABS */}
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           marginBottom: 20,
//           flexWrap: "wrap",
//           gap: 12,
//         }}
//       >
//         <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
//           <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{buildingName}</h1>

//           {/* Device Dropdown Selector */}
//           {devices.length > 0 && (
//             <select
//               value={selectedDeviceId}
//               onChange={(e) => setSelectedDeviceId(e.target.value)}
//               style={{
//                 padding: "6px 12px",
//                 borderRadius: 8,
//                 border: "1px solid #e5e7eb",
//                 background: "#ffffff",
//                 color: "#111827",
//                 fontSize: 13,
//                 fontWeight: 600,
//               }}
//             >
//               {devices.map((dev) => (
//                 <option key={dev.id} value={dev.id}>
//                   {dev.name || `มิเตอร์ ${dev.id}`}
//                 </option>
//               ))}
//             </select>
//           )}

//           {/* Main View Switcher */}
//           <div style={{ display: "flex", background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 8, padding: 2 }}>
//             <button
//               onClick={() => setActiveTab("overview")}
//               style={{
//                 border: "none",
//                 padding: "6px 14px",
//                 borderRadius: 6,
//                 fontSize: 13,
//                 fontWeight: 600,
//                 cursor: "pointer",
//                 background: activeTab === "overview" ? "#1E9E5A" : "transparent",
//                 color: activeTab === "overview" ? "#fff" : "#6b7280",
//               }}
//             >
//               📊 ภาพรวมวิเคราะห์
//             </button>
//             <button
//               onClick={() => setActiveTab("alerts")}
//               style={{
//                 border: "none",
//                 padding: "6px 14px",
//                 borderRadius: 6,
//                 fontSize: 13,
//                 fontWeight: 600,
//                 cursor: "pointer",
//                 background: activeTab === "alerts" ? "#1E9E5A" : "transparent",
//                 color: activeTab === "alerts" ? "#fff" : "#6b7280",
//                 display: "flex",
//                 alignItems: "center",
//                 gap: 6,
//               }}
//             >
//               ⚡ ประวัติการแจ้งเตือน
//               {activeAlert && (
//                 <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#E54D42" }} />
//               )}
//             </button>
//           </div>
//         </div>

//         <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
//           {/* Range Selector */}
//           {activeTab === "overview" && (
//             <div
//               style={{
//                 display: "flex",
//                 background: "#ffffff",
//                 border: "1px solid #e5e7eb",
//                 borderRadius: 20,
//                 padding: 4,
//                 width: 280,
//                 boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
//               }}
//             >
//               {(["Day", "Month", "Year", "Total"] as RangeMode[]).map((r) => (
//                 <button
//                   key={r}
//                   onClick={() => setRange(r)}
//                   style={{
//                     flex: 1,
//                     border: "none",
//                     padding: "6px 0",
//                     borderRadius: 16,
//                     fontSize: 12.5,
//                     fontWeight: 600,
//                     cursor: "pointer",
//                     background: range === r ? "#1E9E5A" : "transparent",
//                     color: range === r ? "#fff" : "#6b7280",
//                     transition: "all 0.2s ease",
//                   }}
//                 >
//                   {r}
//                 </button>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* 3. TAB CONTENT */}
//       {activeTab === "overview" ? (
//         /* OVERVIEW DASHBOARD TAB */
//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "calc(100% - 380px) 360px",
//             gap: 20,
//             alignItems: "start",
//           }}
//         >
//           {/* LEFT COLUMN */}
//           <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
//             {/* Section A: Map & Building Image */}
//             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
//               <div
//                 style={{
//                   height: 180,
//                   borderRadius: 14,
//                   overflow: "hidden",
//                   border: "1px solid #e5e7eb",
//                   background: "#ffffff",
//                   boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
//                 }}
//               >
//                 <BuildingMap name={buildingName} lat={latitude} lng={longitude} />
//               </div>

//               <div
//                 style={{
//                   height: 180,
//                   borderRadius: 14,
//                   overflow: "hidden",
//                   border: "1px solid #e5e7eb",
//                   position: "relative",
//                   background: "#ffffff",
//                   boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
//                 }}
//               >
//                 <img
//                   src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=400&fit=crop"
//                   alt={buildingName}
//                   style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
//                 />
//                 <span
//                   style={{
//                     position: "absolute",
//                     left: 12,
//                     bottom: 12,
//                     background: "rgba(18,24,31,0.8)",
//                     backdropFilter: "blur(4px)",
//                     color: "#fff",
//                     fontSize: 12,
//                     padding: "4px 10px",
//                     borderRadius: 6,
//                     fontWeight: 500,
//                   }}
//                 >
//                   {buildingName}
//                 </span>
//               </div>
//             </div>

//             {/* Section B: Mid Charts Grid */}
//             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
//               <EnergyConsumptionChart data={chartData} rangeLabel={rangeLabel} />
//               <TotalEnergyChart
//                 data={chartData}
//                 dataKey="cost"
//                 title="Total Energy Used (kW)"
//                 color="#7c5fd0"
//               />
//             </div>

//             {/* Section C: Active Power Chart (ข้อมูลดึงจริงผ่าน Backend Express API) */}
//             <ActivePowerChart
//               data={chartData}
//               title="กำลังไฟฟ้าใช้งาน (Active Power Real-time)"
//               color="#1E9E5A"
//               headerIcon={<CostIcon size={16} />}
//               valueSuffix="kW"
//             />
//           </div>

//           {/* RIGHT COLUMN */}
//           <div style={{ position: "sticky", top: 20 }}>
//             <Buildingrightpanel
//               range={range}
//               rangeLabel={rangeLabel}
//               energyToday={latestReading ? `${formatNumber(latestReading.power_kw ?? 0)} kW` : "0.00 kW"}
//               cost={latestReading ? `${formatNumber((latestReading.power_kw ?? 0) * 4.2)} บาท` : "0.00 บาท"}
//               peak={latestReading ? `${formatNumber(latestReading.power_kw ?? 0)} kW` : "0.00 kW"}
//               powerFactor={0.95}
//               devices={devices}
//               onNavigateToAlerts={() => setActiveTab("alerts")}
//             />
//           </div>
//         </div>
//       ) : (
//         /* ALERTS LOG TAB */
//         <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
//           {/* Top Grid: Map & Real-time Alert */}
//           <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
//             <div style={{ background: "#ffffff", borderRadius: 14, padding: 16, border: "1px solid #e5e7eb" }}>
//               <div style={{ height: 160, borderRadius: 10, overflow: "hidden", marginBottom: 10 }}>
//                 <BuildingMap name={buildingName} lat={latitude} lng={longitude} />
//               </div>
//               <div style={{ fontSize: 14, fontWeight: 700 }}>{buildingName}</div>
//               <div style={{ fontSize: 12, color: "#6b7280" }}>
//                 {building.locationName || "มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตเฉลิมพระเกียรติ จังหวัดสกลนคร"}
//               </div>
//             </div>

//             <div style={{ background: activeAlert ? "#E54D42" : "#1E9E5A", color: "#fff", borderRadius: 14, padding: 20, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
//               <div>
//                 <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>
//                   {activeAlert ? "⚠ REAL-TIME ALERT" : "✓ STATUS NORMAL"}
//                 </div>
//                 <h2 style={{ fontSize: 22, margin: "10px 0 16px" }}>
//                   {activeAlert ? "1 อุปกรณ์พบความผิดปกติ" : "ระบบทำงานปกติ"}
//                 </h2>
//                 {activeAlert && (
//                   <div style={{ background: "rgba(255,255,255,0.95)", color: "#111", padding: 14, borderRadius: 10, fontSize: 13 }}>
//                     <strong style={{ color: "#D6493A" }}>• {activeAlert.location}</strong>
//                     <div style={{ marginTop: 4, color: "#4b5563" }}>{activeAlert.issue} ({activeAlert.value})</div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Table Log */}
//           <div style={{ background: "#ffffff", borderRadius: 14, padding: 20, border: "1px solid #e5e7eb" }}>
//             <h3 style={{ fontSize: 16, margin: "0 0 16px" }}>⚡ ประวัติการแจ้งเตือนย้อนหลัง (HISTORICAL ALERTS LOG)</h3>

//             <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
//               <select
//                 value={statusFilter}
//                 onChange={(e) => setStatusFilter(e.target.value)}
//                 style={{
//                   padding: "8px 12px",
//                   borderRadius: 8,
//                   border: "1px solid #e5e7eb",
//                   background: "#ffffff",
//                   color: "#111827",
//                   fontSize: 13,
//                 }}
//               >
//                 <option value="all">สถานะ: ทั้งหมด</option>
//                 <option value="active">Active (รอดำเนินการ)</option>
//                 <option value="solved">Solved (แก้ไขแล้ว)</option>
//               </select>
//               <input
//                 type="text"
//                 value="20/08/2026 - 27/08/2026"
//                 readOnly
//                 style={{
//                   padding: "8px 12px",
//                   borderRadius: 8,
//                   border: "1px solid #e5e7eb",
//                   fontSize: 13,
//                   background: "#f8fafc",
//                   color: "#6b7280",
//                 }}
//               />
//             </div>

//             <div style={{ overflowX: "auto" }}>
//               <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
//                 <thead>
//                   <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e5e7eb", color: "#6b7280" }}>
//                     <th style={{ padding: 12 }}>วัน-เวลา</th>
//                     <th style={{ padding: 12 }}>รายละเอียดปัญหา</th>
//                     <th style={{ padding: 12 }}>ค่าที่ผิดปกติ</th>
//                     <th style={{ padding: 12 }}>สถานะ</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredAlerts.map((row) => (
//                     <tr key={row.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
//                       <td style={{ padding: 12, whiteSpace: "nowrap" }}>
//                         {row.date} {row.isNew && <span style={{ background: "#FBE7E4", color: "#D6493A", fontSize: 10, padding: "2px 6px", borderRadius: 4, marginLeft: 6 }}>ใหม่</span>}
//                       </td>
//                       <td style={{ padding: 12, fontWeight: 600 }}>{row.issue}</td>
//                       <td style={{ padding: 12, color: row.status === "Active" ? "#D6493A" : "inherit", fontWeight: 600 }}>{row.value}</td>
//                       <td style={{ padding: 12 }}>
//                         <span style={{ padding: "4px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600, background: row.status === "Active" ? "#FBE7E4" : "#E6F6EC", color: row.status === "Active" ? "#D6493A" : "#1E9E5A" }}>
//                           ● {row.status}
//                         </span>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

//BuildingDetailClient.tsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
import theme from "@/config/theme.js";
import dynamic from "next/dynamic";
import Link from "next/link";
import Buildingrightpanel from "./Buildingrightpanel";
import { CostIcon } from "@/components/user/charts/TotalEnergyChart";
import { formatNumber, formatEnergy, formatPower } from "@/lib/formatter";
import { useDeviceStatus } from "@/hooks/useDeviceStatus";
import { getPowerChart, getLatestReading, getEnergyCompare } from "@/lib/readingsApi.ts";
import { getPeakPower } from "@/lib/peakApi.ts";

export type RangeMode = "Day" | "Month" | "Year" | "Total";

// --- Helper Function เติมเวลาให้ครบทั้งวัน (00:00 - 23:59) ---
function formatFullDayPowerData(rawData: { label: string; cost: number }[]) {
  const dataMap = new Map<string, number>();

  rawData?.forEach((d) => {
    dataMap.set(d.label, d.cost);
  });

  const fullDayResult: { label: string; cost: number | null }[] = [];

  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m++) {
      const timeLabel = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

      fullDayResult.push({
        label: timeLabel,
        cost: dataMap.has(timeLabel) ? dataMap.get(timeLabel)! : null,
      });
    }
  }

  return fullDayResult;
}

// จำนวนชั่วโมงของแต่ละ bucket เพื่อแปลง kWh -> kW เฉลี่ย
// Day = รายชั่วโมง (1) / Month = รายวัน (24) / Year = รายเดือน (วันในเดือน x 24) / Total = ประมาณ 30 วัน
function bucketHours(range: RangeMode, index: number): number {
  const now = new Date();
  if (range === "Day") return 1;
  if (range === "Month") return 24;
  if (range === "Year") return new Date(now.getFullYear(), index + 1, 0).getDate() * 24;
  return 30 * 24;
}

// --- Dynamic Imports ---
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

const EnergyConsumptionChart = dynamic(
  () => import("@/components/user/charts/EnergyConsumptionChart"),
  { ssr: false }
);
const TotalEnergyChart = dynamic(
  () => import("@/components/user/charts/TotalEnergyChart"),
  { ssr: false }
);
const ActivePowerChart = dynamic(
  () => import("@/components/user/charts/ActivePowerChart"),
  { ssr: false }
);

export interface BuildingData {
  id: string | number;
  name?: string;
  building_name?: string;
  locationName?: string;
  lat?: number;
  lng?: number;
}

interface Props {
  building: BuildingData;
  devices?: any[];
}

export default function BuildingDetailClient({ building, devices = [] }: Props) {
  // State หลักสำหรับ Dashboard
  const [activeTab, setActiveTab] = useState<"overview" | "alerts">("overview");
  const [range, setRange] = useState<RangeMode>("Day");

  // State สำหรับการเลือก Device และ Real-time Chart Data
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(
    devices[0]?.id || ""
  );
  // ข้อมูล Active Power (kW) แบบ real-time
  const [chartData, setChartData] = useState<{ label: string; cost: number }[]>([]);
  // ข้อมูลพลังงานที่ใช้ (kWh) ตามช่วงเวลา (Max - Min)
  const [energyCompare, setEnergyCompare] = useState<{ label: string; today: number | null; yesterday: number }[]>([]);
  const [energyLoading, setEnergyLoading] = useState<boolean>(false);
  const [latestReading, setLatestReading] = useState<any>(null);
  // Peak kW ของโหมด Month / Year / Total (โหมด Day คิดจากกราฟ Power Real-time)
  const [peakOther, setPeakOther] = useState<{ value: number; time: string } | null>(null);

  // State สำหรับ Alerts Page
  const [statusFilter, setStatusFilter] = useState("all");

  // เช็คสถานะการออนไลน์ของ Device ที่เลือก
  const { isOnline } = useDeviceStatus(selectedDeviceId);

  // ดึงข้อมูล Active Power (เฉพาะโหมด Day) + ค่าล่าสุด
  useEffect(() => {
    const targetId = selectedDeviceId || building.id;
    if (!targetId) return;

    const fetchChartAndLatest = async () => {
      try {
        if (range === "Day") {
          const points = await getPowerChart(String(targetId));
          setChartData(points);
          if (points.length === 0) {
            console.warn("⚠️ [DEBUG] ไม่พบข้อมูล power_kw ของ device_id:", targetId);
          }
        }

        const latest = await getLatestReading(String(targetId));
        setLatestReading(latest);
      } catch (err) {
        console.error("❌ [DEBUG] Fetch device reading error:", err);
      }
    };

    fetchChartAndLatest();
    const interval = setInterval(fetchChartAndLatest, 10000);

    return () => clearInterval(interval);
  }, [selectedDeviceId, building.id, range]);

  // ดึงข้อมูลพลังงาน (kWh) จาก Supabase energy_readings ตาม range ที่เลือก
  useEffect(() => {
    if (!selectedDeviceId) {
      console.warn("⚠️ [DEBUG] ไม่มี selectedDeviceId (devices ว่าง?) จึงไม่ดึงข้อมูลพลังงาน");
      setEnergyCompare([]);
      return;
    }

    let cancelled = false;

    const fetchEnergy = async (showLoading: boolean) => {
      try {
        if (showLoading) setEnergyLoading(true);
        const result = await getEnergyCompare(selectedDeviceId, range);
        if (!cancelled) setEnergyCompare(result);
      } catch (err) {
        console.error("❌ [DEBUG] Fetch energy error:", err);
      } finally {
        if (!cancelled && showLoading) setEnergyLoading(false);
      }
    };

    fetchEnergy(true);
    const interval = setInterval(() => fetchEnergy(false), 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [selectedDeviceId, range]);

  // ดึง Peak kW ของเดือนนี้ / ปีนี้ / ทั้งหมด (max power_kw ในช่วงนั้น)
  useEffect(() => {
    setPeakOther(null);
    if (range === "Day" || !selectedDeviceId) return;

    let cancelled = false;

    const fetchPeak = async () => {
      try {
        const result = await getPeakPower(selectedDeviceId, range);
        if (!cancelled) setPeakOther(result);
      } catch (err) {
        console.error("❌ [DEBUG] Fetch peak error:", err);
      }
    };

    fetchPeak();
    const interval = setInterval(fetchPeak, 60000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [selectedDeviceId, range]);

  // ประวัติการแจ้งเตือน
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

  const buildingName = building.name || building.building_name || "อาคารไม่ระบุชื่อ";
  const latitude = building.lat ?? 17.2882;
  const longitude = building.lng ?? 104.1132;

  // ✅ Power chart: Day = รายนาที (00:00-23:59) / อื่นๆ = kW เฉลี่ยต่อ bucket (kWh ÷ ชั่วโมง)
  const isDay = range === "Day";

  const powerChartData = useMemo(() => {
    if (isDay) return formatFullDayPowerData(chartData);

    return energyCompare.map((d, i) => ({
      label: d.label,
      cost: d.today === null ? null : Number((d.today / bucketHours(range, i)).toFixed(2)),
    }));
  }, [isDay, chartData, energyCompare, range]);

  const powerTitle = isDay
    ? "กำลังไฟฟ้าใช้งาน (Power Real-time)"
    : `กำลังไฟฟ้าเฉลี่ย (kW) — ${rangeLabel}`;

  // TotalEnergyChart ใช้เฉพาะค่าของช่วงปัจจุบัน (kWh)
  const energyData = useMemo(
    () => energyCompare.map((d) => ({ label: d.label, energy: d.today ?? 0 })),
    [energyCompare]
  );

  // ✅ พลังงานรวมของช่วงที่เลือก (วันนี้ / เดือนนี้ / ปีนี้ / ทั้งหมด) = ผลรวมของทุก bucket ในกราฟ
  const rangeEnergyKwh = useMemo(
    () => energyCompare.reduce((sum, d) => sum + (d.today ?? 0), 0),
    [energyCompare]
  );

  // ✅ Peak kW ของช่วงที่เลือก
  // Day = ค่าสูงสุดจากกราฟ Power Real-time / อื่นๆ = max(power_kw) ของช่วงนั้นจาก Supabase
  const peakInfo = useMemo(() => {
    if (range === "Day") {
      let best: { label: string; cost: number } | null = null;
      for (const d of chartData) {
        if (best === null || d.cost > best.cost) best = d;
      }
      return best ? { value: best.cost, time: `${best.label} น.` } : null;
    }
    return peakOther;
  }, [range, chartData, peakOther]);

  return (
    <div className="min-h-screen w-full box-border bg-[#f4f6f8] px-7 py-5 font-sans text-gray-900">
      {/* 1. TOP NAV BAR */}
      <div
        className="mb-[18px] flex items-center justify-between rounded-[10px] px-5 py-2.5"
        style={{
          background: `linear-gradient(90deg, ${theme.topbar.gradientFrom} 0%, ${theme.topbar.gradientTo} 100%)`,
        }}
      >
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm font-medium text-white no-underline"
        >
          ← กลับไปหน้าแผนที่
        </Link>
        <span className="text-[13px] text-white/90">
          {buildingName} — Smart Energy Management
        </span>
      </div>

      {/* 2. HEADER BAR & NAVIGATION TABS */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <h1 className="m-0 text-2xl font-bold">{buildingName}</h1>

          {/* Device Dropdown Selector */}
          {devices.length > 1 && (
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[13px] font-semibold text-gray-900"
            >
              {devices.map((dev) => (
                <option key={dev.id} value={dev.id}>
                  {dev.name || `มิเตอร์ ${dev.id}`}
                </option>
              ))}
            </select>
          )}

          {/* Main View Switcher */}
          <div className="flex rounded-lg border border-gray-200 bg-white p-0.5">
            <button
              onClick={() => setActiveTab("overview")}
              className={`cursor-pointer rounded-md border-none px-3.5 py-1.5 text-[13px] font-semibold ${
                activeTab === "overview" ? "bg-[#1E9E5A] text-white" : "bg-transparent text-gray-500"
              }`}
            >
              📊 ภาพรวมวิเคราะห์
            </button>
            <button
              onClick={() => setActiveTab("alerts")}
              className={`flex cursor-pointer items-center gap-1.5 rounded-md border-none px-3.5 py-1.5 text-[13px] font-semibold ${
                activeTab === "alerts" ? "bg-[#1E9E5A] text-white" : "bg-transparent text-gray-500"
              }`}
            >
              ⚡ ประวัติการแจ้งเตือน
              {activeAlert && <span className="h-2 w-2 rounded-full bg-[#E54D42]" />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Range Selector */}
          {activeTab === "overview" && (
            <div className="flex w-[280px] rounded-[20px] border border-gray-200 bg-white p-1 shadow-sm">
              {(["Day", "Month", "Year", "Total"] as RangeMode[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`flex-1 cursor-pointer rounded-2xl border-none py-1.5 text-[12.5px] font-semibold transition-all duration-200 ${
                    range === r ? "bg-[#1E9E5A] text-white" : "bg-transparent text-gray-500"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. TAB CONTENT */}
      {activeTab === "overview" ? (
        /* OVERVIEW DASHBOARD TAB */
        <div className="grid grid-cols-[calc(100%-380px)_360px] items-start gap-5">
          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-5">
            {/* Section A: Map & Building Image */}
            <div className="grid grid-cols-2 gap-5">
              <div className="h-[180px] overflow-hidden rounded-[14px] border border-gray-200 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                <BuildingMap name={buildingName} lat={latitude} lng={longitude} />
              </div>

              <div className="relative h-[180px] overflow-hidden rounded-[14px] border border-gray-200 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                <img
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=400&fit=crop"
                  alt={buildingName}
                  className="block h-full w-full object-cover"
                />
                <span className="absolute bottom-3 left-3 rounded-md bg-[rgba(18,24,31,0.8)] px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                  {buildingName}
                </span>
              </div>
            </div>

            {/* Section B: Mid Charts Grid */}
            <div className="grid grid-cols-2 gap-5">
              <EnergyConsumptionChart data={energyCompare} rangeLabel={rangeLabel} />
              <TotalEnergyChart
                data={energyLoading && energyData.length === 0 ? [] : energyData}
                dataKey="energy"
                title={`การใช้พลังงานรายชั่วโมง (kWh) — ${rangeLabel}`}
                color="#7c5fd0"
                darkMode={false}
                valueSuffix="kWh"
              />
            </div>

            {/* Section C: Active Power Chart */}
            <ActivePowerChart
              data={powerChartData}
              title={powerTitle}
              color="#1E9E5A"
              headerIcon={<CostIcon size={16} />}
              valueSuffix="kW"
            />
          </div>

          {/* RIGHT COLUMN */}
          <div className="sticky top-5">
            <Buildingrightpanel
              range={range}
              rangeLabel={rangeLabel}
              energyToday={formatEnergy(rangeEnergyKwh)}
              cost={`${formatNumber(rangeEnergyKwh * 4.2)} บาท`}
              peak={peakInfo ? formatPower(peakInfo.value) : "0.00 kW"}
              peakTime={peakInfo?.time}
              powerFactor={latestReading?.power_factor ?? 0.95}
              devices={devices}
              onNavigateToAlerts={() => setActiveTab("alerts")}
            />
          </div>
        </div>
      ) : (
        /* ALERTS LOG TAB */
        <div className="flex flex-col gap-5">
          {/* Top Grid: Map & Real-time Alert */}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-5">
            <div className="rounded-[14px] border border-gray-200 bg-white p-4">
              <div className="mb-2.5 h-40 overflow-hidden rounded-[10px]">
                <BuildingMap name={buildingName} lat={latitude} lng={longitude} />
              </div>
              <div className="text-sm font-bold">{buildingName}</div>
              <div className="text-xs text-gray-500">
                {building.locationName || "มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตเฉลิมพระเกียรติ จังหวัดสกลนคร"}
              </div>
            </div>

            <div
              className={`flex flex-col justify-between rounded-[14px] p-5 text-white ${
                activeAlert ? "bg-[#E54D42]" : "bg-[#1E9E5A]"
              }`}
            >
              <div>
                <div className="text-xs font-bold tracking-wider">
                  {activeAlert ? "⚠ REAL-TIME ALERT" : "✓ STATUS NORMAL"}
                </div>
                <h2 className="mb-4 mt-2.5 text-[22px]">
                  {activeAlert ? "1 อุปกรณ์พบความผิดปกติ" : "ระบบทำงานปกติ"}
                </h2>
                {activeAlert && (
                  <div className="rounded-[10px] bg-white/95 p-3.5 text-[13px] text-gray-900">
                    <strong className="text-[#D6493A]">• {activeAlert.location}</strong>
                    <div className="mt-1 text-gray-600">
                      {activeAlert.issue} ({activeAlert.value})
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Table Log */}
          <div className="rounded-[14px] border border-gray-200 bg-white p-5">
            <h3 className="mb-4 mt-0 text-base">⚡ ประวัติการแจ้งเตือนย้อนหลัง (HISTORICAL ALERTS LOG)</h3>

            <div className="mb-4 flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] text-gray-900"
              >
                <option value="all">สถานะ: ทั้งหมด</option>
                <option value="active">Active (รอดำเนินการ)</option>
                <option value="solved">Solved (แก้ไขแล้ว)</option>
              </select>
              <input
                type="text"
                value="20/08/2026 - 27/08/2026"
                readOnly
                className="rounded-lg border border-gray-200 bg-slate-50 px-3 py-2 text-[13px] text-gray-500"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-[13px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-slate-50 text-gray-500">
                    <th className="p-3">วัน-เวลา</th>
                    <th className="p-3">รายละเอียดปัญหา</th>
                    <th className="p-3">ค่าที่ผิดปกติ</th>
                    <th className="p-3">สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAlerts.map((row) => (
                    <tr key={row.id} className="border-b border-gray-200">
                      <td className="whitespace-nowrap p-3">
                        {row.date}{" "}
                        {row.isNew && (
                          <span className="ml-1.5 rounded bg-[#FBE7E4] px-1.5 py-0.5 text-[10px] text-[#D6493A]">
                            ใหม่
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-semibold">{row.issue}</td>
                      <td
                        className={`p-3 font-semibold ${
                          row.status === "Active" ? "text-[#D6493A]" : "text-inherit"
                        }`}
                      >
                        {row.value}
                      </td>
                      <td className="p-3">
                        <span
                          className={`rounded-xl px-2.5 py-1 text-[11px] font-semibold ${
                            row.status === "Active"
                              ? "bg-[#FBE7E4] text-[#D6493A]"
                              : "bg-[#E6F6EC] text-[#1E9E5A]"
                          }`}
                        >
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