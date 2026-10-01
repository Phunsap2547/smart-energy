"use client";

import React from "react";
import { EnergyIngest } from "@/types/energy";
import { formatNumber } from "@/lib/formatter";
import Link from "next/link";
import { useParams } from "next/navigation";

interface PhaseTableProps {
  latestData: EnergyIngest | null;
  isOffline?: boolean; // ✅ เพิ่ม Prop รับสถานะ Offline
}

export default function PhaseTable({ latestData, isOffline = false }: PhaseTableProps) {
  const params = useParams();
  const buildingId = params?.id;

  // ⚡ ถ้า Offline ให้บังคับทุกค่าเป็น 0 ทั้งหมด
  const phases = [
    {
      phase: "L1",
      voltage: isOffline ? 0 : (latestData?.voltage_a ?? latestData?.voltage_l1 ?? 0),
      current: isOffline ? 0 : (latestData?.current_a ?? latestData?.current_l1 ?? 0),
      pf: isOffline ? 0 : (latestData?.power_a ?? latestData?.pf_l1 ?? 0),
      thdV: isOffline ? 0 : (latestData?.thd_voltage_l1_pct ?? 0),
      thdI: isOffline ? 0 : (latestData?.thd_current_l1_pct ?? 0),
      isError: false,
    },
    {
      phase: "L2",
      voltage: isOffline ? 0 : (latestData?.voltage_b ?? latestData?.voltage_l2 ?? 0),
      current: isOffline ? 0 : (latestData?.current_b ?? latestData?.current_l2 ?? 0),
      pf: isOffline ? 0 : (latestData?.power_b ?? latestData?.pf_l2 ?? 0),
      thdV: isOffline ? 0 : (latestData?.thd_voltage_l2_pct ?? 0),
      thdI: isOffline ? 0 : (latestData?.thd_current_l2_pct ?? 0),
      isError: false,
    },
    {
      phase: "L3",
      voltage: isOffline ? 0 : (latestData?.voltage_c ?? latestData?.voltage_l3 ?? 0),
      current: isOffline ? 0 : (latestData?.current_c ?? latestData?.current_l3 ?? 0),
      pf: isOffline ? 0 : (latestData?.power_c ?? latestData?.pf_l3 ?? 0),
      thdV: isOffline ? 0 : (latestData?.thd_voltage_l3_pct ?? 0),
      thdI: isOffline ? 0 : (latestData?.thd_current_l3_pct ?? 0),
      isError: false,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-base font-semibold text-gray-800">
          รายเฟส — เปรียบเทียบความสมดุลของโหลด
        </h2>
        <Link
          href={`/admin/buildings/${buildingId}/phase`}
          className="text-xs bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1 hover:bg-emerald-100 transition"
        >
          📊 ดูรายเฟสแบบกราฟ
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500 font-medium text-xs">
              <th className="py-2.5 px-3">เฟส</th>
              <th className="py-2.5 px-3">แรงดัน (V)</th>
              <th className="py-2.5 px-3">กระแส (A)</th>
              <th className="py-2.5 px-3">PF</th>
              <th className="py-2.5 px-3">THD-V (%)</th>
              <th className="py-2.5 px-3">THD-I (%)</th>
              <th className="py-2.5 px-3 text-center">สถานะ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 font-medium">
            {phases.map((p) => {
              const statusText = isOffline ? "Offline" : p.isError ? "ผิดปกติ" : "ปกติ";
              const isBadgeRed = isOffline || p.isError;

              return (
                <tr
                  key={p.phase}
                  className={isBadgeRed ? "bg-red-50/30 text-red-600" : "text-gray-700"}
                >
                  <td className="py-3 px-3 font-semibold">{p.phase}</td>
                  <td className="py-3 px-3">{formatNumber(p.voltage, 0)} V</td>
                  <td className="py-3 px-3">{formatNumber(p.current, 1)} A</td>
                  <td className="py-3 px-3">{formatNumber(p.pf, 2)}</td>
                  <td className="py-3 px-3">{formatNumber(p.thdV, 1)} %</td>
                  <td className="py-3 px-3">{formatNumber(p.thdI, 1)} %</td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        isBadgeRed
                          ? "bg-red-100 text-red-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isBadgeRed ? "bg-red-500" : "bg-emerald-500"
                        }`}
                      />
                      {statusText}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}