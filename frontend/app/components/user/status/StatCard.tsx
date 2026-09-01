// "use client";

// import React from "react";
// import { ChevronRight } from "lucide-react";
// import { ChangeBadge } from "@/lib/analyzeStatus";

// export interface StatCardProps {
//   icon: React.ReactNode;
//   iconBg: string;
//   iconColor: string;
//   title: string;
//   value: React.ReactNode;
//   unit?: string;
//   sub?: string;
//   changePct?: number;
//   onClick?: () => void;
//   warn?: boolean;
// }

// export default function StatCard({
//   icon,
//   iconBg,
//   iconColor,
//   title,
//   value,
//   unit,
//   sub,
//   changePct,
//   onClick,
//   warn,
// }: StatCardProps) {
//   return (
//     <div
//       onClick={onClick}
//       style={{
//         background: "var(--card-bg, #fff)",
//         border: "1px solid var(--border-color, #e5e7eb)",
//         borderRadius: 12,
//         padding: "16px 18px",
//         cursor: onClick ? "pointer" : "default",
//         display: "flex",
//         flexDirection: "column",
//         gap: 10,
//       }}
//     >
//       <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//         <div
//           style={{
//             width: 34,
//             height: 34,
//             borderRadius: 9,
//             background: iconBg,
//             color: iconColor,
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//           }}
//         >
//           {icon}
//         </div>
//         <span style={{ fontSize: 13.5, color: "#6b7280", fontWeight: 500 }}>{title}</span>
//         {onClick && <ChevronRight size={16} color="#9ca3af" style={{ marginLeft: "auto" }} />}
//       </div>
//       <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
//         <span style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary, #111827)" }}>{value}</span>
//         {unit && <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>{unit}</span>}
//         {typeof changePct === "number" && <ChangeBadge pct={changePct} />}
//       </div>
//       {sub && (
//         <span style={{ fontSize: 12.5, color: warn ? "#dc2626" : "#9ca3af", fontWeight: warn ? 600 : 400 }}>
//           {sub}
//         </span>
//       )}
//     </div>
//   );
// }