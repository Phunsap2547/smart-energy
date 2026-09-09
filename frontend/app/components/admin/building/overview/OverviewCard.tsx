"use client";

import React from "react";

interface OverviewCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  subtitle?: string;
  trend?: {
    value: number;
    isUp: boolean;
  };
  borderColor?: string;
}

export default function OverviewCard({
  title,
  value,
  unit,
  icon,
  subtitle,
  trend,
  borderColor = "#3b82f6",
}: OverviewCardProps) {
  return (
    <div
      className="bg-white rounded-xl shadow-sm border p-4 transition-all hover:shadow-md flex flex-col justify-between"
      style={{ borderLeft: `4px solid ${borderColor}` }}
    >
      <div className="flex items-center justify-between text-gray-500 mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider">{title}</span>
        {icon && <div className="p-2 rounded-lg bg-gray-50 text-gray-700">{icon}</div>}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-gray-900">
          {typeof value === "number" ? value.toLocaleString("th-TH") : value}
        </span>
        {unit && <span className="text-sm font-medium text-gray-500">{unit}</span>}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          {subtitle && <span>{subtitle}</span>}
          {trend && (
            <span
              className={`font-semibold ${
                trend.isUp ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {trend.isUp ? "▲" : "▼"} {Math.abs(trend.value)}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}