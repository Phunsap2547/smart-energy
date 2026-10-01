// "use client";

// import React from "react";

// interface OverviewCardProps {
//   title: string;
//   value: string | number;
//   unit?: string;
//   icon?: React.ReactNode;
//   subtitle?: string;
//   trend?: {
//     value: number;
//     isUp: boolean;
//   };
//   borderColor?: string;
// }

// export default function OverviewCard({
//   title,
//   value,
//   unit,
//   icon,
//   subtitle,
//   trend,
//   borderColor = "#3b82f6",
// }: OverviewCardProps) {
//   return (
//     <div
//       className="bg-white rounded-xl shadow-sm border p-4 transition-all hover:shadow-md flex flex-col justify-between"
//       style={{ borderLeft: `4px solid ${borderColor}` }}
//     >
//       <div className="flex items-center justify-between text-gray-500 mb-2">
//         <span className="text-xs font-semibold uppercase tracking-wider">{title}</span>
//         {icon && <div className="p-2 rounded-lg bg-gray-50 text-gray-700">{icon}</div>}
//       </div>

//       <div className="flex items-baseline gap-2">
//         <span className="text-2xl font-bold text-gray-900">
//           {typeof value === "number" ? value.toLocaleString("th-TH") : value}
//         </span>
//         {unit && <span className="text-sm font-medium text-gray-500">{unit}</span>}
//       </div>

//       {(subtitle || trend) && (
//         <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
//           {subtitle && <span>{subtitle}</span>}
//           {trend && (
//             <span
//               className={`font-semibold ${
//                 trend.isUp ? "text-emerald-600" : "text-rose-600"
//               }`}
//             >
//               {trend.isUp ? "▲" : "▼"} {Math.abs(trend.value)}%
//             </span>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }


"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface OverviewCardProps {
  title: string;
  value: string | number | null | undefined;
  unit?: string;
  icon?: React.ReactNode;
  subtitle?: string;
  trend?: {
    value: number;
    isUp: boolean;
    isGood?: boolean; // true = สีเขียว, false = สีแดง (ถ้าไม่ส่งจะอิงตาม isUp)
  };
  borderColor?: string;
  isLoading?: boolean;
}

export default function OverviewCard({
  title,
  value,
  unit,
  icon,
  subtitle,
  trend,
  borderColor = "#3b82f6",
  isLoading = false,
}: OverviewCardProps) {
  // คำนวณสีของ Trend
  const getTrendColor = () => {
    if (!trend) return "";
    const isPositive = trend.isGood !== undefined ? trend.isGood : trend.isUp;
    return isPositive ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50";
  };

  return (
    <div
      className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 transition-all hover:shadow-md flex flex-col justify-between relative overflow-hidden"
      style={{ borderLeft: `4px solid ${borderColor}` }}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between text-slate-500 mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
          {title}
        </span>
        {icon && (
          <div className="p-2 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>

      {/* Main Value & Skeleton Loader */}
      <div className="my-1">
        {isLoading ? (
          <div className="flex items-center gap-2 h-8">
            <div className="h-7 w-28 bg-slate-200 animate-pulse rounded-md" />
            <div className="h-4 w-10 bg-slate-100 animate-pulse rounded-md" />
          </div>
        ) : (
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {value !== null && value !== undefined
                ? typeof value === "number"
                  ? value.toLocaleString("th-TH")
                  : value
                : "-"}
            </span>
            {unit && (
              <span className="text-xs font-semibold text-slate-500">
                {unit}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Subtitle & Trend */}
      {(subtitle || trend) && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          {subtitle && <span className="truncate max-w-[60%]">{subtitle}</span>}
          {trend && !isLoading && (
            <span
              className={`font-bold px-2 py-0.5 rounded-full text-[11px] flex items-center gap-0.5 shrink-0 ${getTrendColor()}`}
            >
              {trend.isUp ? "▲" : "▼"} {Math.abs(trend.value)}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}