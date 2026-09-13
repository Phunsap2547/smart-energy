"use client";

import React from "react";
import { EnergyIngest } from "@/types/energy";
import { formatNumber } from "@/lib/formatter";

interface PhaseTableProps {
  latestData: EnergyIngest | null;
}

export default function PhaseTable({ latestData }: PhaseTableProps) {
  const phases = [
    {
      phase: "L1",
      voltage: latestData?.voltage_a ?? 0,
      current: latestData?.current_a ?? 0,
      pf: latestData?.power_factor ?? 0,
      thd: latestData?.thd_voltage_l1_pct ?? 0,
      isError: false,
    },
    {
      phase: "L2",
      voltage: latestData?.voltage_b ?? 0,
      current: latestData?.current_b ?? 0,
      pf: latestData?.power_factor ?? 0,
      thd: latestData?.thd_voltage_l1_pct ?? 0,
      isError: false,
    },
    {
      phase: "L3",
      voltage: latestData?.voltage_c ?? 0,
      current: latestData?.current_c ?? 0,
      pf: latestData?.power_factor ?? 0,
      thd: latestData?.thd_voltage_l1_pct ?? 0,
      isError: false,
      // isError: (latestData?.voltage_c ?? 0) === 0 || (latestData?.power_factor ?? 1) < 0.5,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-base font-semibold text-gray-800">
          รายเฟส — เปรียบเทียบความสมดุลของโหลด
        </h2>
        <button className="text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition">
          📈 ดูรายเฟสแบบกราฟ
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500 font-medium text-xs">
              <th className="py-2.5 px-3">เฟส</th>
              <th className="py-2.5 px-3">แรงดัน (V)</th>
              <th className="py-2.5 px-3">กระแส (A)</th>
              <th className="py-2.5 px-3">PF</th>
              <th className="py-2.5 px-3">THD-I (%)</th>
              <th className="py-2.5 px-3 text-center">สถานะ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 font-medium">
            {phases.map((p) => (
              <tr
                key={p.phase}
                className={p.isError ? "bg-red-50/50 text-red-600" : "text-gray-700"}
              >
                <td className="py-3 px-3 font-semibold">{p.phase}</td>
                <td className="py-3 px-3">{formatNumber(p.voltage, 0)} V</td>
                <td className="py-3 px-3">{formatNumber(p.current, 1)} A</td>
                <td className="py-3 px-3">{formatNumber(p.pf, 2)}</td>
                <td className="py-3 px-3">{formatNumber(p.thd, 0)} %</td>
                <td className="py-3 px-3 text-center">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      p.isError
                        ? "bg-red-100 text-red-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        p.isError ? "bg-red-500" : "bg-emerald-500"
                      }`}
                    />
                    {p.isError ? "ผิดปกติ" : "ปกติ"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}