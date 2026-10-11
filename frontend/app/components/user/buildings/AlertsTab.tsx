// // components/user/buildings/AlertsTab.tsx
// // แท็บ "ประวัติการแจ้งเตือน": แผนที่ + สถานะ real-time + ตารางประวัติ (ข้อมูลจริงจาก /api/alerts)
// "use client";

// import React, { useEffect, useMemo, useState } from "react";
// import BuildingMap from "./DynamicBuildingMap";
// import {
//   type AlertRow,
//   isOpenAlert,
//   formatThaiDateTime,
//   bangkokDateKey,
// } from "@/lib/alertUtils";

// interface Props {
//   buildingName: string;
//   locationName?: string;
//   latitude: number;
//   longitude: number;
//   alerts: AlertRow[];
//   loading: boolean;
//   error: boolean;
// }

// const DEFAULT_LOCATION = "มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตเฉลิมพระเกียรติ จังหวัดสกลนคร";
// const PAGE_SIZE = 20;
// const DAY_MS = 24 * 60 * 60 * 1000;

// const STATUS_OPTIONS = [
//   { value: "all", label: "สถานะ: ทั้งหมด" },
//   { value: "open", label: "เปิดอยู่ (รอดำเนินการ)" },
//   { value: "investigating", label: "กำลังตรวจสอบ" },
//   { value: "resolved", label: "แก้ไขแล้ว" },
//   { value: "dismissed", label: "ปิดรายการ" },
// ];

// const FALLBACK = { label: "-", cls: "bg-gray-100 text-gray-500" };

// const SEVERITY: Record<string, { label: string; cls: string }> = {
//   critical: { label: "วิกฤต", cls: "bg-[#FBE7E4] text-[#D6493A]" },
//   high: { label: "สูง", cls: "bg-[#FBEDDD] text-[#D9822B]" },
//   warning: { label: "เตือน", cls: "bg-[#FEF6D8] text-[#B7791F]" },
// };

// const STATUS: Record<string, { label: string; cls: string }> = {
//   open: { label: "เปิดอยู่", cls: "bg-[#FBE7E4] text-[#D6493A]" },
//   investigating: { label: "กำลังตรวจสอบ", cls: "bg-[#FBEDDD] text-[#D9822B]" },
//   resolved: { label: "แก้ไขแล้ว", cls: "bg-[#E6F6EC] text-[#1E9E5A]" },
//   dismissed: { label: "ปิดรายการ", cls: "bg-gray-100 text-gray-500" },
// };

// const deviceName = (a: AlertRow) => a.devices?.name || `มิเตอร์ ${a.device_id}`;

// export default function AlertsTab({
//   buildingName,
//   locationName,
//   latitude,
//   longitude,
//   alerts,
//   loading,
//   error,
// }: Props) {
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [dateFrom, setDateFrom] = useState("");
//   const [dateTo, setDateTo] = useState("");
//   const [visible, setVisible] = useState(PAGE_SIZE);

//   // เปลี่ยนตัวกรองแล้วเริ่มนับหน้าใหม่
//   useEffect(() => setVisible(PAGE_SIZE), [statusFilter, dateFrom, dateTo]);

//   const filteredAlerts = useMemo(
//     () =>
//       alerts.filter((a) => {
//         if (statusFilter !== "all" && a.status !== statusFilter) return false;
//         const day = bangkokDateKey(a.created_at);
//         if (dateFrom && day < dateFrom) return false;
//         if (dateTo && day > dateTo) return false;
//         return true;
//       }),
//     [alerts, statusFilter, dateFrom, dateTo]
//   );

//   // กล่อง real-time: ดูจากรายการที่ยังไม่ปิดเรื่อง (ไม่ขึ้นกับตัวกรองตาราง)
//   const openAlerts = useMemo(() => alerts.filter(isOpenAlert), [alerts]);
//   const issueDeviceCount = new Set(openAlerts.map((a) => a.device_id)).size;
//   const hasIssue = openAlerts.length > 0;

//   const shown = filteredAlerts.slice(0, visible);
//   const hasDateFilter = Boolean(dateFrom || dateTo);

//   return (
//     <div className="flex flex-col gap-5">
//       {/* Top Grid: Map & Real-time Alert */}
//       <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-5">
//         <div className="rounded-[14px] border border-gray-200 bg-white p-4">
//           <div className="mb-2.5 h-40 overflow-hidden rounded-[10px]">
//             <BuildingMap name={buildingName} lat={latitude} lng={longitude} />
//           </div>
//           <div className="text-sm font-bold">{buildingName}</div>
//           <div className="text-xs text-gray-500">{locationName || DEFAULT_LOCATION}</div>
//         </div>

//         <div
//           className={`flex flex-col justify-between rounded-[14px] p-5 text-white ${
//             hasIssue ? "bg-[#E54D42]" : "bg-[#1E9E5A]"
//           }`}
//         >
//           <div>
//             <div className="text-xs font-bold tracking-wider">
//               {hasIssue ? "⚠ REAL-TIME ALERT" : "✓ STATUS NORMAL"}
//             </div>
//             <h2 className="mb-4 mt-2.5 text-[22px]">
//               {loading && alerts.length === 0
//                 ? "กำลังตรวจสอบสถานะ..."
//                 : hasIssue
//                 ? `${issueDeviceCount} อุปกรณ์พบความผิดปกติ`
//                 : "ระบบทำงานปกติ"}
//             </h2>

//             {hasIssue && (
//               <div className="flex flex-col gap-2">
//                 {openAlerts.slice(0, 3).map((a) => (
//                   <div key={a.id} className="rounded-[10px] bg-white/95 p-3.5 text-[13px] text-gray-900">
//                     <strong className="text-[#D6493A]">• {deviceName(a)}</strong>
//                     <div className="mt-1 text-gray-600">{a.description || a.type}</div>
//                     <div className="mt-0.5 text-[11px] text-gray-500">{formatThaiDateTime(a.created_at)}</div>
//                   </div>
//                 ))}
//                 {openAlerts.length > 3 && (
//                   <div className="text-xs text-white/90">และอีก {openAlerts.length - 3} รายการที่ยังไม่ปิดเรื่อง</div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Table Log */}
//       <div className="rounded-[14px] border border-gray-200 bg-white p-5">
//         <h3 className="mb-4 mt-0 text-base">⚡ ประวัติการแจ้งเตือนย้อนหลัง (HISTORICAL ALERTS LOG)</h3>

//         <div className="mb-4 flex flex-wrap items-center gap-3">
//           <select
//             value={statusFilter}
//             onChange={(e) => setStatusFilter(e.target.value)}
//             className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] text-gray-900"
//           >
//             {STATUS_OPTIONS.map((o) => (
//               <option key={o.value} value={o.value}>
//                 {o.label}
//               </option>
//             ))}
//           </select>

//           <div className="flex items-center gap-2 text-[13px] text-gray-500">
//             <input
//               type="date"
//               value={dateFrom}
//               max={dateTo || undefined}
//               onChange={(e) => setDateFrom(e.target.value)}
//               className="rounded-lg border border-gray-200 bg-slate-50 px-3 py-2 text-[13px] text-gray-700"
//             />
//             <span>ถึง</span>
//             <input
//               type="date"
//               value={dateTo}
//               min={dateFrom || undefined}
//               onChange={(e) => setDateTo(e.target.value)}
//               className="rounded-lg border border-gray-200 bg-slate-50 px-3 py-2 text-[13px] text-gray-700"
//             />
//             {hasDateFilter && (
//               <button
//                 type="button"
//                 onClick={() => {
//                   setDateFrom("");
//                   setDateTo("");
//                 }}
//                 className="cursor-pointer border-none bg-transparent p-0 text-xs font-semibold text-[#5B6BD6]"
//               >
//                 ล้างวันที่
//               </button>
//             )}
//           </div>

//           <span className="ml-auto text-xs text-gray-500">{filteredAlerts.length} รายการ</span>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full border-collapse text-left text-[13px]">
//             <thead>
//               <tr className="border-b border-gray-200 bg-slate-50 text-gray-500">
//                 <th className="p-3">วัน-เวลา</th>
//                 <th className="p-3">รายละเอียดปัญหา</th>
//                 <th className="p-3">อุปกรณ์</th>
//                 <th className="p-3">ระดับ</th>
//                 <th className="p-3">สถานะ</th>
//               </tr>
//             </thead>
//             <tbody>
//               {shown.map((row) => {
//                 const sev = SEVERITY[row.severity ?? ""] ?? { ...FALLBACK, label: row.severity || "-" };
//                 const st = STATUS[row.status ?? ""] ?? { ...FALLBACK, label: row.status || "-" };
//                 const isNew = isOpenAlert(row) && Date.now() - new Date(row.created_at).getTime() < DAY_MS;

//                 return (
//                   <tr key={row.id} className="border-b border-gray-200">
//                     <td className="whitespace-nowrap p-3">
//                       {formatThaiDateTime(row.created_at)}{" "}
//                       {isNew && (
//                         <span className="ml-1.5 rounded bg-[#FBE7E4] px-1.5 py-0.5 text-[10px] text-[#D6493A]">
//                           ใหม่
//                         </span>
//                       )}
//                     </td>
//                     <td className="p-3 font-semibold">{row.description || row.type || "-"}</td>
//                     <td className="whitespace-nowrap p-3 text-gray-600">{deviceName(row)}</td>
//                     <td className="p-3">
//                       <span className={`rounded-xl px-2.5 py-1 text-[11px] font-semibold ${sev.cls}`}>{sev.label}</span>
//                     </td>
//                     <td className="p-3">
//                       <span className={`whitespace-nowrap rounded-xl px-2.5 py-1 text-[11px] font-semibold ${st.cls}`}>
//                         ● {st.label}
//                       </span>
//                     </td>
//                   </tr>
//                 );
//               })}

//               {loading && alerts.length === 0 && (
//                 <tr>
//                   <td colSpan={5} className="p-6 text-center text-gray-500">
//                     กำลังโหลด...
//                   </td>
//                 </tr>
//               )}
//               {!loading && error && alerts.length === 0 && (
//                 <tr>
//                   <td colSpan={5} className="p-6 text-center text-[#D6493A]">
//                     โหลดประวัติการแจ้งเตือนไม่สำเร็จ
//                   </td>
//                 </tr>
//               )}
//               {!loading && !error && filteredAlerts.length === 0 && (
//                 <tr>
//                   <td colSpan={5} className="p-6 text-center text-gray-500">
//                     ไม่พบรายการแจ้งเตือน
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         {filteredAlerts.length > visible && (
//           <div className="mt-4 text-center">
//             <button
//               type="button"
//               onClick={() => setVisible((v) => v + PAGE_SIZE)}
//               className="cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-2 text-[13px] font-semibold text-[#5B6BD6] hover:bg-slate-50"
//             >
//               แสดงเพิ่ม ({filteredAlerts.length - visible} รายการ)
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // components/user/buildings/AlertsTab.tsx
// // แท็บ "ประวัติการแจ้งเตือน": แผนที่ + สถานะ real-time + ตารางประวัติ (ข้อมูลจริงจาก /api/alerts)
// "use client";

// import React, { useEffect, useMemo, useState } from "react";
// import BuildingMap from "./DynamicBuildingMap";
// import {
//   type AlertRow,
//   isOpenAlert,
//   formatThaiDateTime,
//   bangkokDateKey,
// } from "@/lib/alertUtils";

// interface Props {
//   buildingName: string;
//   locationName?: string;
//   latitude: number;
//   longitude: number;
//   alerts: AlertRow[];
//   loading: boolean;
//   error: boolean;
// }

// const DEFAULT_LOCATION = "มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตเฉลิมพระเกียรติ จังหวัดสกลนคร";
// const PAGE_SIZE = 20;
// const DAY_MS = 24 * 60 * 60 * 1000;

// const STATUS_OPTIONS = [
//   { value: "all", label: "สถานะ: ทั้งหมด" },
//   { value: "ongoing", label: "กำลังเกิด" },
//   { value: "ended", label: "สิ้นสุดแล้ว" },
// ];

// const FALLBACK = { label: "-", cls: "bg-gray-100 text-gray-500" };

// const SEVERITY: Record<string, { label: string; cls: string }> = {
//   critical: { label: "วิกฤต", cls: "bg-[#FBE7E4] text-[#D6493A]" },
//   high: { label: "สูง", cls: "bg-[#FBEDDD] text-[#D9822B]" },
//   warning: { label: "เตือน", cls: "bg-[#FEF6D8] text-[#B7791F]" },
// };

// const STATE = {
//   ongoing: { label: "กำลังเกิด", cls: "bg-[#FBE7E4] text-[#D6493A]" },
//   ended: { label: "สิ้นสุดแล้ว", cls: "bg-[#E6F6EC] text-[#1E9E5A]" },
// };

// const deviceName = (a: AlertRow) => a.devices?.name || `มิเตอร์ ${a.device_id}`;
// export default function AlertsTab({
//   buildingName,
//   locationName,
//   latitude,
//   longitude,
//   alerts,
//   loading,
//   error,
// }: Props) {
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [dateFrom, setDateFrom] = useState("");
//   const [dateTo, setDateTo] = useState("");
//   const [visible, setVisible] = useState(PAGE_SIZE);

//   // เปลี่ยนตัวกรองแล้วเริ่มนับหน้าใหม่
//   useEffect(() => setVisible(PAGE_SIZE), [statusFilter, dateFrom, dateTo]);

//   // เวลาปัจจุบัน (อัปเดตทุก 1 นาที) ใช้แสดงในแถว "ระบบทำงานปกติ"
//   const [nowIso, setNowIso] = useState(() => new Date().toISOString());
//   useEffect(() => {
//     const t = setInterval(() => setNowIso(new Date().toISOString()), 60_000);
//     return () => clearInterval(t);
//   }, []);

//   const filteredAlerts = useMemo(
//     () =>
//       alerts.filter((a) => {
//         if (statusFilter === "ongoing" && !isOpenAlert(a)) return false;
//         if (statusFilter === "ended" && isOpenAlert(a)) return false;
//         const day = bangkokDateKey(a.created_at);
//         if (dateFrom && day < dateFrom) return false;
//         if (dateTo && day > dateTo) return false;
//         return true;
//       }),
//     [alerts, statusFilter, dateFrom, dateTo]
//   );

//   // กล่อง real-time: ดูจากรายการที่ยังไม่ปิดเรื่อง (ไม่ขึ้นกับตัวกรองตาราง)
//   const openAlerts = useMemo(() => alerts.filter(isOpenAlert), [alerts]);
//   const issueDeviceCount = new Set(openAlerts.map((a) => a.device_id)).size;
//   const hasIssue = openAlerts.length > 0;

//   const shown = filteredAlerts.slice(0, visible);
//   const hasDateFilter = Boolean(dateFrom || dateTo);

//   // แถว "ระบบทำงานปกติ" บนสุดของตาราง: แสดงเมื่อไม่มีรายการค้างอยู่ และไม่ได้กรองวันที่/สถานะ "สิ้นสุดแล้ว"
//   const showNormalRow =
//     !hasIssue &&
//     !error &&
//     !(loading && alerts.length === 0) &&
//     !hasDateFilter &&
//     statusFilter !== "ended";

//   return (
//     <div className="flex flex-col gap-5">
//       {/* Top Grid: Map & Real-time Alert */}
//       <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-5">
//         <div className="rounded-[14px] border border-gray-200 bg-white p-4">
//           <div className="mb-2.5 h-40 overflow-hidden rounded-[10px]">
//             <BuildingMap name={buildingName} lat={latitude} lng={longitude} />
//           </div>
//           <div className="text-sm font-bold">{buildingName}</div>
//           <div className="text-xs text-gray-500">{locationName || DEFAULT_LOCATION}</div>
//         </div>

//         <div
//           className={`flex flex-col justify-between rounded-[14px] p-5 text-white ${
//             hasIssue ? "bg-[#E54D42]" : "bg-[#1E9E5A]"
//           }`}
//         >
//           <div>
//             <div className="text-xs font-bold tracking-wider">
//               {hasIssue ? "⚠ REAL-TIME ALERT" : "✓ STATUS NORMAL"}
//             </div>
//             <h2 className="mb-4 mt-2.5 text-[22px]">
//               {loading && alerts.length === 0
//                 ? "กำลังตรวจสอบสถานะ..."
//                 : hasIssue
//                 ? `${issueDeviceCount} อุปกรณ์พบความผิดปกติ`
//                 : "ระบบทำงานปกติ"}
//             </h2>

//             {hasIssue && (
//               <div className="flex flex-col gap-2">
//                 {openAlerts.slice(0, 3).map((a) => (
//                   <div key={a.id} className="rounded-[10px] bg-white/95 p-3.5 text-[13px] text-gray-900">
//                     <strong className="text-[#D6493A]">• {deviceName(a)}</strong>
//                     <div className="mt-1 text-gray-600">{a.description || a.type}</div>
//                     <div className="mt-0.5 text-[11px] text-gray-500">{formatThaiDateTime(a.created_at)}</div>
//                   </div>
//                 ))}
//                 {openAlerts.length > 3 && (
//                   <div className="text-xs text-white/90">และอีก {openAlerts.length - 3} รายการที่ยังไม่ปิดเรื่อง</div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Table Log */}
//       <div className="rounded-[14px] border border-gray-200 bg-white p-5">
//         <h3 className="mb-4 mt-0 text-base">⚡ ประวัติการแจ้งเตือนย้อนหลัง (HISTORICAL ALERTS LOG)</h3>

//         <div className="mb-4 flex flex-wrap items-center gap-3">
//           <select
//             value={statusFilter}
//             onChange={(e) => setStatusFilter(e.target.value)}
//             className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] text-gray-900"
//           >
//             {STATUS_OPTIONS.map((o) => (
//               <option key={o.value} value={o.value}>
//                 {o.label}
//               </option>
//             ))}
//           </select>

//           <div className="flex items-center gap-2 text-[13px] text-gray-500">
//             <input
//               type="date"
//               value={dateFrom}
//               max={dateTo || undefined}
//               onChange={(e) => setDateFrom(e.target.value)}
//               className="rounded-lg border border-gray-200 bg-slate-50 px-3 py-2 text-[13px] text-gray-700"
//             />
//             <span>ถึง</span>
//             <input
//               type="date"
//               value={dateTo}
//               min={dateFrom || undefined}
//               onChange={(e) => setDateTo(e.target.value)}
//               className="rounded-lg border border-gray-200 bg-slate-50 px-3 py-2 text-[13px] text-gray-700"
//             />
//             {hasDateFilter && (
//               <button
//                 type="button"
//                 onClick={() => {
//                   setDateFrom("");
//                   setDateTo("");
//                 }}
//                 className="cursor-pointer border-none bg-transparent p-0 text-xs font-semibold text-[#5B6BD6]"
//               >
//                 ล้างวันที่
//               </button>
//             )}
//           </div>

//           <span className="ml-auto text-xs text-gray-500">{filteredAlerts.length} รายการ</span>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full border-collapse text-left text-[13px]">
//             <thead>
//               <tr className="border-b border-gray-200 bg-slate-50 text-gray-500">
//                 <th className="p-3">เวลาที่เกิดปัญหา</th>
//                 <th className="p-3">รายละเอียดปัญหา</th>
//                 <th className="p-3">ระดับ</th>
//                 <th className="p-3">สถานะ</th>
//               </tr>
//             </thead>
//             <tbody>
//               {showNormalRow && (
//                 <tr className="border-b border-gray-200 bg-[#F4FBF7]">
//                   <td className="whitespace-nowrap p-3">{formatThaiDateTime(nowIso)}</td>
//                   <td className="p-3 font-semibold text-[#1E9E5A]">✓ ระบบทำงานปกติ</td>
//                   <td className="p-3">
//                     <span className="rounded-xl bg-[#E6F6EC] px-2.5 py-1 text-[11px] font-semibold text-[#1E9E5A]">
//                       ปกติ
//                     </span>
//                   </td>
//                   <td className="p-3">
//                     <span className="whitespace-nowrap rounded-xl bg-[#E6F6EC] px-2.5 py-1 text-[11px] font-semibold text-[#1E9E5A]">
//                       ● กำลังเกิดขึ้น
//                     </span>
//                   </td>
//                 </tr>
//               )}
//               {shown.map((row) => {
//                 const sev = SEVERITY[row.severity ?? ""] ?? { ...FALLBACK, label: row.severity || "-" };
//                 const st = isOpenAlert(row) ? STATE.ongoing : STATE.ended;
//                 const isNew = isOpenAlert(row) && Date.now() - new Date(row.created_at).getTime() < DAY_MS;

//                 return (
//                   <tr key={row.id} className="border-b border-gray-200">
//                     <td className="whitespace-nowrap p-3">
//                       {formatThaiDateTime(row.created_at)}{" "}
//                       {isNew && (
//                         <span className="ml-1.5 rounded bg-[#FBE7E4] px-1.5 py-0.5 text-[10px] text-[#D6493A]">
//                           ใหม่
//                         </span>
//                       )}
//                     </td>
//                     <td className="p-3 font-semibold">{row.description || row.type || "-"}</td>
//                     <td className="p-3">
//                       <span className={`rounded-xl px-2.5 py-1 text-[11px] font-semibold ${sev.cls}`}>{sev.label}</span>
//                     </td>
//                     <td className="p-3">
//                       <div className="flex items-center gap-2 whitespace-nowrap">
//                         <span className={`rounded-xl px-2.5 py-1 text-[11px] font-semibold ${st.cls}`}>
//                           ● {st.label}
//                         </span>
//                         {/* {!isOpenAlert(row) && (
//                           // <span className="rounded-xl bg-[#E6F6EC] px-2.5 py-1 text-[11px] font-semibold text-[#1E9E5A]">
//                           //   ● ไฟมาปกติแล้ว · ระบบทำงานปกติ
//                           // </span>
//                         )} */}
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })}

//               {loading && alerts.length === 0 && (
//                 <tr>
//                   <td colSpan={4} className="p-6 text-center text-gray-500">
//                     กำลังโหลด...
//                   </td>
//                 </tr>
//               )}
//               {!loading && error && alerts.length === 0 && (
//                 <tr>
//                   <td colSpan={4} className="p-6 text-center text-[#D6493A]">
//                     โหลดประวัติการแจ้งเตือนไม่สำเร็จ
//                   </td>
//                 </tr>
//               )}
//               {!loading && !error && filteredAlerts.length === 0 && (
//                 <tr>
//                   <td colSpan={4} className="p-6 text-center text-gray-500">
//                     ไม่พบรายการแจ้งเตือน
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         {filteredAlerts.length > visible && (
//           <div className="mt-4 text-center">
//             <button
//               type="button"
//               onClick={() => setVisible((v) => v + PAGE_SIZE)}
//               className="cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-2 text-[13px] font-semibold text-[#5B6BD6] hover:bg-slate-50"
//             >
//               แสดงเพิ่ม ({filteredAlerts.length - visible} รายการ)
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


// components/user/buildings/AlertsTab.tsx
// แท็บ "ประวัติการแจ้งเตือน": แผนที่ + สถานะ real-time + ตารางประวัติ
// ตารางรวม 5 แหล่ง: anomalies (/api/alerts), ไฟดับ/สัญญาณขาดหาย (RPC), ไฟกลับมาปกติ (หลังไฟดับ),
// แรงดันกลับสู่ช่วงปกติ (worker เป็นคนบันทึก resolved_at + resolution_reason), ไฟดับที่ยังเกิดอยู่
"use client";

import React, { useEffect, useMemo, useState } from "react";
import BuildingMap from "./DynamicBuildingMap";
import { useDeviceStatus } from "@/hooks/useDeviceStatus";
import { useLatestReading } from "@/hooks/useLatestReading";
import { useOutageHistory } from "@/hooks/useOutageHistory";
import {
  type AlertRow,
  isOpenAlert,
  formatThaiDateTime,
  bangkokDateKey,
} from "@/lib/alertUtils";

// คอลัมน์ที่ worker บันทึกเพิ่ม (ต้องให้ /api/alerts ส่งกลับมาด้วย)
type AlertRowEx = AlertRow & {
  resolved_at?: string | null;
  resolution_reason?: string | null; // 'recovered' | 'superseded' | 'offline'
};

interface Props {
  buildingId: string | number; // ใช้ดึงข้อมูลล่าสุด + ประวัติไฟดับของอาคาร
  buildingName: string;
  locationName?: string;
  latitude: number;
  longitude: number;
  alerts: AlertRow[];
  loading: boolean;
  error: boolean;
}

const DEFAULT_LOCATION = "มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตเฉลิมพระเกียรติ จังหวัดสกลนคร";
const PAGE_SIZE = 20;
const DAY_MS = 24 * 60 * 60 * 1000;

// anomalies ประเภทไฟดับ/ออฟไลน์ ถูกแทนที่ด้วยแถวที่สร้างจาก RPC (กันซ้ำ เหมือนหน้า admin)
// ถ้าอยากเห็นแถว "ไฟดับ (Power Outage) เฟส L2, L3" จาก anomalies ด้วย ให้ลบ 'power_outage' ออกจากลิสต์นี้
const OFFLINE_TYPES = [
  "device_offline",
  "power_outage",
  "คาดว่าระบบไฟดับ / สัญญาณขาดหาย (Offline)",
  "ตรวจพบไฟดับหรือสัญญาณขาดหาย",
];

// ประเภทแรงดันที่แสดงแถว "ไฟกลับมาปกติ" เมื่อ worker ยืนยันว่ากลับเข้าช่วงปกติจริง
const VOLTAGE_TYPES = ["over_voltage", "overvoltage", "under_voltage", "undervoltage"];

// ถ้าแถว "ไฟกลับมาปกติ" ของแรงดันอยู่ใกล้แถวไฟกลับหลังไฟดับ (ห่างไม่เกินนี้) ให้ตัดซ้ำ
const RESTORE_DEDUP_MS = 2 * 60 * 1000;

const STATUS_OPTIONS = [
  { value: "all", label: "สถานะ: ทั้งหมด" },
  { value: "ongoing", label: "กำลังเกิด" },
  { value: "ended", label: "สิ้นสุดแล้ว" },
];

const FALLBACK = { label: "-", cls: "bg-gray-100 text-gray-500" };

const SEVERITY: Record<string, { label: string; cls: string }> = {
  critical: { label: "วิกฤต", cls: "bg-[#FBE7E4] text-[#D6493A]" },
  high: { label: "สูง", cls: "bg-[#FBEDDD] text-[#D9822B]" },
  warning: { label: "เตือน", cls: "bg-[#FEF6D8] text-[#B7791F]" },
};

const SEV_CRITICAL = SEVERITY.critical;
const SEV_NORMAL = { label: "ปกติ", cls: "bg-[#E6F6EC] text-[#1E9E5A]" };

const STATE = {
  ongoing: { label: "กำลังเกิด", cls: "bg-[#FBE7E4] text-[#D6493A]" },
  ended: { label: "สิ้นสุดแล้ว", cls: "bg-[#E6F6EC] text-[#1E9E5A]" },
  restored: { label: "ปกติแล้ว", cls: "bg-[#E6F6EC] text-[#1E9E5A]" },
};

const deviceName = (a: AlertRow) => a.devices?.name || `มิเตอร์ ${a.device_id}`;

const formatDuration = (minutes: number) =>
  minutes >= 60 ? `${Math.floor(minutes / 60)} ชม. ${minutes % 60} นาที` : `${minutes} นาที`;

// แถวในตารางประวัติ (รวมทุกแหล่งให้อยู่รูปแบบเดียวกัน)
interface LogRow {
  key: string;
  created_at: string; // ISO
  description: string;
  severity: { label: string; cls: string };
  open: boolean; // กำลังเกิดอยู่หรือไม่
  kind: "alert" | "outage" | "restored";
  device_id?: number;
  fromVoltage?: boolean; // แถวไฟกลับมาปกติที่มาจากแรงดัน (ไม่ใช่หลังไฟดับ)
  anomalyStartedAt?: string; // เวลาที่ anomaly เริ่ม (ใช้ตัดแถวซ้ำ)
}

export default function AlertsTab({
  buildingId,
  buildingName,
  locationName,
  latitude,
  longitude,
  alerts,
  loading,
  error,
}: Props) {
  // ---------- สถานะ real-time (ตัวเดียวกับหน้า admin) ----------
  const { latestData, loading: latestLoading } = useLatestReading(buildingId);
  const status = useDeviceStatus(latestData);
  const { diffMinutes, lastDate } = status;

  // ระหว่างรอข้อมูลล่าสุดครั้งแรก (latestData ยังเป็น null) อย่าเพิ่งฟันธงว่า offline
  const statusReady = !latestLoading && latestData != null;
  const isOffline = statusReady && status.isOffline;
  const isStale = statusReady && status.isStale;
  const isPowerOutage = statusReady && status.isPowerOutage;

  // ---------- ประวัติไฟดับย้อนหลัง (RPC) ----------
  const { outages } = useOutageHistory(buildingId);

  // ---------- state ตัวกรอง ----------
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);

  // เปลี่ยนตัวกรองแล้วเริ่มนับหน้าใหม่
  useEffect(() => setVisible(PAGE_SIZE), [statusFilter, dateFrom, dateTo]);

  // เวลาปัจจุบัน (อัปเดตทุก 1 นาที) ใช้แสดงในแถว "ระบบทำงานปกติ"
  const [nowIso, setNowIso] = useState(() => new Date().toISOString());
  useEffect(() => {
    const t = setInterval(() => setNowIso(new Date().toISOString()), 60_000);
    return () => clearInterval(t);
  }, []);

  // ---------- anomalies ที่ไม่ใช่ไฟดับ/ออฟไลน์ ----------
  const baseAlerts = useMemo(
    () => (alerts as AlertRowEx[]).filter((a) => !OFFLINE_TYPES.includes(a.type)),
    [alerts]
  );

  // กล่อง real-time: ดูจากรายการที่ยังไม่ปิดเรื่อง (ไม่ขึ้นกับตัวกรองตาราง)
  const openAlerts = useMemo(() => baseAlerts.filter(isOpenAlert), [baseAlerts]);
  const issueDeviceCount = new Set(openAlerts.map((a) => a.device_id)).size;

  const hasDeviceIssue = Boolean(isOffline || isPowerOutage);
  const hasIssue = openAlerts.length > 0 || hasDeviceIssue;
  const isWaiting = !hasIssue && Boolean(isStale);

  // เวลาที่ไฟดับเริ่ม = เวลาข้อมูลล่าสุด (ถ้าอ่านไม่ได้ ใช้ now - diffMinutes)
  const outageStart: Date | null =
    lastDate && !isNaN(lastDate.getTime())
      ? lastDate
      : diffMinutes > 0 && diffMinutes < 999999 / 60
      ? new Date(Date.now() - diffMinutes * 60_000)
      : null;
  const lastTimeString = outageStart ? formatThaiDateTime(outageStart.toISOString()) : "-";

  // ---------- รวมทุกแหล่งเป็นรายการเดียว ----------
  const allRows = useMemo<LogRow[]>(() => {
    const rows: LogRow[] = [];

    // 1) anomalies + แถว "แรงดันกลับสู่ช่วงปกติ"
    //    แสดงตามที่ worker บันทึกไว้เท่านั้น ไม่เดาย้อนหลัง
    baseAlerts.forEach((a) => {
      rows.push({
        key: `alert-${a.id}`,
        created_at: a.created_at,
        description: a.description || a.type || "-",
        severity: SEVERITY[a.severity ?? ""] ?? { ...FALLBACK, label: a.severity || "-" },
        open: isOpenAlert(a),
        kind: "alert",
        device_id: Number(a.device_id),
      });

      const t = String(a.type || "").toLowerCase().trim();
      if (!VOLTAGE_TYPES.includes(t) || !a.resolved_at) return;

      // superseded (สลับไฟต่ำ<->ไฟเกิน) / offline ไม่ใช่ "ไฟกลับมาปกติ"
      // ข้อมูลเก่าที่ยังไม่มี resolution_reason ถือว่า recovered
      const reason = a.resolution_reason ?? null;
      if (reason !== null && reason !== "recovered") return;

      const label = t.includes("under") ? "ไฟต่ำ" : "ไฟเกิน";
      rows.push({
        key: `resolved-${a.id}`,
        created_at: a.resolved_at,
        description: `แรงดันกลับสู่ช่วงปกติ (${label}สิ้นสุดแล้ว)`,
        severity: SEV_NORMAL,
        open: false,
        kind: "restored",
        device_id: Number(a.device_id),
        fromVoltage: true,
        anomalyStartedAt: a.created_at,
      });
    });

    // 2) ไฟดับ/สัญญาณขาดหาย + ไฟกลับมาปกติ (จาก RPC)
    const outageRestores: { device_id: number; ms: number }[] = [];

    outages.forEach((o) => {
      const startIso = new Date(o.start_time).toISOString();
      const endIso = new Date(o.end_time).toISOString();
      const dur = formatDuration(o.gap_minutes);

      rows.push({
        key: `outage-${o.device_id}-${o.start_time}`,
        created_at: startIso,
        description: `ตรวจพบไฟดับหรือสัญญาณขาดหายเป็นเวลา ${dur} (ตั้งแต่ ${formatThaiDateTime(
          startIso
        )} ถึง ${formatThaiDateTime(endIso)})`,
        severity: SEV_CRITICAL,
        open: false,
        kind: "outage",
      });

      rows.push({
        key: `restored-${o.device_id}-${o.end_time}`,
        created_at: endIso,
        description: `ไฟกลับมาปกติ ได้รับข้อมูลอีกครั้งเมื่อ ${formatThaiDateTime(
          endIso
        )} (หลังไฟดับหรือสัญญาณขาดหาย ${dur})`,
        severity: SEV_NORMAL,
        open: false,
        kind: "restored",
      });

      outageRestores.push({ device_id: Number(o.device_id), ms: new Date(endIso).getTime() });
    });

    // 3) ไฟดับที่ยังเกิดอยู่ตอนนี้ (จาก useDeviceStatus)
    if (hasDeviceIssue && outageStart) {
      rows.push({
        key: "live-outage",
        created_at: outageStart.toISOString(),
        description: isOffline
          ? `ตรวจพบไฟดับหรือสัญญาณขาดหายเป็นเวลา ${formatDuration(
              diffMinutes
            )} (ตั้งแต่ ${formatThaiDateTime(outageStart.toISOString())} ถึงปัจจุบัน ยังไม่ได้รับข้อมูลใหม่)`
          : `ตรวจพบแรงดันเป็น 0 V ไฟดับ (ตั้งแต่ ${formatThaiDateTime(
              outageStart.toISOString()
            )} ถึงปัจจุบัน)`,
        severity: SEV_CRITICAL,
        open: true,
        kind: "outage",
      });
    }

    // ตัดแถว "แรงดันกลับสู่ช่วงปกติ" ที่ซ้ำกับ "ไฟกลับมาปกติ" หลังไฟดับ
    // ตัดเฉพาะกรณี anomaly เริ่ม "ก่อน" ไฟกลับ (เหตุการณ์เดียวกัน)
    // ถ้า anomaly เริ่มหลังไฟกลับ (เช่น ไฟกระชากตอนไฟมา) เป็นเหตุการณ์ใหม่ ต้องแสดง
    const deduped = rows.filter((r) => {
      if (!r.fromVoltage) return true;
      const ms = new Date(r.created_at).getTime();
      const startedMs = r.anomalyStartedAt
        ? new Date(r.anomalyStartedAt).getTime()
        : Number.POSITIVE_INFINITY;
      return !outageRestores.some(
        (o) =>
          o.device_id === r.device_id &&
          Math.abs(o.ms - ms) < RESTORE_DEDUP_MS &&
          startedMs < o.ms
      );
    });

    return deduped.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [baseAlerts, outages, hasDeviceIssue, isOffline, diffMinutes, outageStart?.getTime()]);

  const filteredRows = useMemo(
    () =>
      allRows.filter((r) => {
        if (statusFilter === "ongoing" && !r.open) return false;
        if (statusFilter === "ended" && r.open) return false;
        const day = bangkokDateKey(r.created_at);
        if (dateFrom && day < dateFrom) return false;
        if (dateTo && day > dateTo) return false;
        return true;
      }),
    [allRows, statusFilter, dateFrom, dateTo]
  );

  const shown = filteredRows.slice(0, visible);
  const hasDateFilter = Boolean(dateFrom || dateTo);

  // ---------- ข้อความ/สีของกล่อง real-time ----------
  const heading = (() => {
    if (loading && alerts.length === 0) return "กำลังตรวจสอบสถานะ...";
    if (isOffline) return "คาดว่าระบบไฟดับ / สัญญาณขาดหาย (Offline)";
    if (isPowerOutage) return "ตรวจพบไฟดับ / ค่าไฟฟ้าเป็น 0";
    if (openAlerts.length > 0) return `${issueDeviceCount} อุปกรณ์พบความผิดปกติ`;
    if (isStale) return "กำลังรอข้อมูลใหม่...";
    if (!statusReady) return latestLoading ? "กำลังตรวจสอบสถานะ..." : "ไม่พบข้อมูลล่าสุดของอาคาร";
    return "ระบบทำงานปกติ";
  })();

  const boxColor = hasIssue
    ? "bg-[#E54D42]"
    : isWaiting
    ? "bg-[#D9822B]"
    : !statusReady
    ? "bg-gray-500"
    : "bg-[#1E9E5A]";
  const boxLabel = hasIssue
    ? "⚠ REAL-TIME ALERT"
    : isWaiting
    ? "⏳ WAITING FOR DATA"
    : !statusReady
    ? "… NO LIVE DATA"
    : "✓ STATUS NORMAL";

  // แถว "ระบบทำงานปกติ" บนสุดของตาราง: แสดงเมื่อไม่มีปัญหา ข้อมูลไม่ค้าง และไม่ได้กรองวันที่/สถานะ "สิ้นสุดแล้ว"
  // ถ้าวันนี้มีแถว "ไฟกลับมาปกติ" อยู่แล้ว (จากไฟดับหรือแรงดัน) ไม่ต้องแสดงแถว "ระบบทำงานปกติ" ซ้ำ (ตรงกับหน้า admin)
  const todayKey = bangkokDateKey(nowIso);
  const hasRestoredToday = allRows.some(
    (r) => r.kind === "restored" && bangkokDateKey(r.created_at) === todayKey
  );

  const showNormalRow =
    statusReady &&
    !hasRestoredToday &&
    !hasIssue &&
    !isStale &&
    !error &&
    !(loading && alerts.length === 0) &&
    !hasDateFilter &&
    statusFilter !== "ended";

  return (
    <div className="flex flex-col gap-5">
      {/* Top Grid: Map & Real-time Alert */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-5">
        <div className="rounded-[14px] border border-gray-200 bg-white p-4">
          <div className="mb-2.5 h-40 overflow-hidden rounded-[10px]">
            <BuildingMap name={buildingName} lat={latitude} lng={longitude} />
          </div>
          <div className="text-sm font-bold">{buildingName}</div>
          <div className="text-xs text-gray-500">{locationName || DEFAULT_LOCATION}</div>
        </div>

        <div className={`flex flex-col justify-between rounded-[14px] p-5 text-white ${boxColor}`}>
          <div>
            <div className="text-xs font-bold tracking-wider">{boxLabel}</div>
            <h2 className="mb-4 mt-2.5 text-[22px]">{heading}</h2>

            {(hasIssue || isWaiting) && (
              <div className="flex flex-col gap-2">
                {/* รายละเอียดจากสถานะอุปกรณ์ (offline / ไฟดับ / ข้อมูลค้าง) */}
                {isOffline && (
                  <div className="rounded-[10px] bg-white/95 p-3.5 text-[13px] text-gray-900">
                    <strong className="text-[#D6493A]">• {buildingName}</strong>
                    <div className="mt-1 text-gray-600">
                      ไม่ได้รับข้อมูลส่งเข้ามานานเกิน {formatDuration(diffMinutes)}
                    </div>
                    <div className="mt-0.5 text-[11px] text-gray-500">
                      อัปเดตล่าสุดเมื่อ {lastTimeString}
                    </div>
                  </div>
                )}
                {!isOffline && isPowerOutage && (
                  <div className="rounded-[10px] bg-white/95 p-3.5 text-[13px] text-gray-900">
                    <strong className="text-[#D6493A]">• {buildingName}</strong>
                    <div className="mt-1 text-gray-600">ตรวจพบแรงดันหรือกระแสไฟฟ้าเป็น 0</div>
                    <div className="mt-0.5 text-[11px] text-gray-500">
                      อัปเดตล่าสุดเมื่อ {lastTimeString}
                    </div>
                  </div>
                )}
                {isWaiting && (
                  <div className="rounded-[10px] bg-white/95 p-3.5 text-[13px] text-gray-900">
                    <div className="text-gray-600">
                      ค่าที่แสดงเป็นข้อมูลล่าสุดเมื่อ {lastTimeString} ไม่ใช่ค่า ณ ปัจจุบัน
                    </div>
                  </div>
                )}

                {/* รายการ anomaly ที่ยังไม่ปิดเรื่อง */}
                {openAlerts.slice(0, 3).map((a) => (
                  <div key={a.id} className="rounded-[10px] bg-white/95 p-3.5 text-[13px] text-gray-900">
                    <strong className="text-[#D6493A]">• {deviceName(a)}</strong>
                    <div className="mt-1 text-gray-600">{a.description || a.type}</div>
                    <div className="mt-0.5 text-[11px] text-gray-500">{formatThaiDateTime(a.created_at)}</div>
                  </div>
                ))}
                {openAlerts.length > 3 && (
                  <div className="text-xs text-white/90">และอีก {openAlerts.length - 3} รายการที่ยังไม่ปิดเรื่อง</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table Log */}
      <div className="rounded-[14px] border border-gray-200 bg-white p-5">
        <h3 className="mb-4 mt-0 text-base">⚡ ประวัติการแจ้งเตือนย้อนหลัง (HISTORICAL ALERTS LOG)</h3>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] text-gray-900"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 text-[13px] text-gray-500">
            <input
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-lg border border-gray-200 bg-slate-50 px-3 py-2 text-[13px] text-gray-700"
            />
            <span>ถึง</span>
            <input
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-lg border border-gray-200 bg-slate-50 px-3 py-2 text-[13px] text-gray-700"
            />
            {hasDateFilter && (
              <button
                type="button"
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                }}
                className="cursor-pointer border-none bg-transparent p-0 text-xs font-semibold text-[#5B6BD6]"
              >
                ล้างวันที่
              </button>
            )}
          </div>

          <span className="ml-auto text-xs text-gray-500">{filteredRows.length} รายการ</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-gray-200 bg-slate-50 text-gray-500">
                <th className="p-3">เวลาที่เกิดปัญหา</th>
                <th className="p-3">รายละเอียดปัญหา</th>
                <th className="p-3">ระดับ</th>
                <th className="p-3">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {showNormalRow && (
                <tr className="border-b border-gray-200 bg-[#F4FBF7]">
                  <td className="whitespace-nowrap p-3">{formatThaiDateTime(nowIso)}</td>
                  <td className="p-3 font-semibold text-[#1E9E5A]">✓ ระบบทำงานปกติ</td>
                  <td className="p-3">
                    <span className="rounded-xl bg-[#E6F6EC] px-2.5 py-1 text-[11px] font-semibold text-[#1E9E5A]">
                      ปกติ
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="whitespace-nowrap rounded-xl bg-[#E6F6EC] px-2.5 py-1 text-[11px] font-semibold text-[#1E9E5A]">
                      ● กำลังเกิดขึ้น
                    </span>
                  </td>
                </tr>
              )}

              {shown.map((row) => {
                const st =
                  row.kind === "restored" ? STATE.restored : row.open ? STATE.ongoing : STATE.ended;
                const isNew = row.open && Date.now() - new Date(row.created_at).getTime() < DAY_MS;
                const isRestored = row.kind === "restored";

                return (
                  <tr
                    key={row.key}
                    className={`border-b border-gray-200 ${isRestored ? "bg-[#F4FBF7]" : ""}`}
                  >
                    <td className="whitespace-nowrap p-3">
                      {formatThaiDateTime(row.created_at)}{" "}
                      {isNew && (
                        <span className="ml-1.5 rounded bg-[#FBE7E4] px-1.5 py-0.5 text-[10px] text-[#D6493A]">
                          ใหม่
                        </span>
                      )}
                    </td>
                    <td
                      className={`p-3 font-semibold ${isRestored ? "text-[#1E9E5A]" : ""}`}
                    >
                      {isRestored ? "⚡ " : ""}
                      {row.description}
                    </td>
                    <td className="p-3">
                      <span
                        className={`rounded-xl px-2.5 py-1 text-[11px] font-semibold ${row.severity.cls}`}
                      >
                        {row.severity.label}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <span className={`rounded-xl px-2.5 py-1 text-[11px] font-semibold ${st.cls}`}>
                          ● {st.label}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {loading && alerts.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-gray-500">
                    กำลังโหลด...
                  </td>
                </tr>
              )}
              {!loading && error && alerts.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-[#D6493A]">
                    โหลดประวัติการแจ้งเตือนไม่สำเร็จ
                  </td>
                </tr>
              )}
              {!loading && !error && filteredRows.length === 0 && !showNormalRow && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-gray-500">
                    ไม่พบรายการแจ้งเตือน
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredRows.length > visible && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              className="cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-2 text-[13px] font-semibold text-[#5B6BD6] hover:bg-slate-50"
            >
              แสดงเพิ่ม ({filteredRows.length - visible} รายการ)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}