"use client";

import React from "react";
import { EnergyIngest } from "../../../../types/energy";

interface PhaseTableProps {
  latestData: EnergyIngest | null;
}

export default function PhaseTable({ latestData }: PhaseTableProps) {
  if (!latestData) {
    return (
      <div className="bg-white p-5 rounded-xl border shadow-sm text-center text-gray-400 text-sm">
        กำลังโหลดข้อมูล Phase...
      </div>
    );
  }

  const avgVoltage = (
    (latestData.voltage_l1 + latestData.voltage_l2 + latestData.voltage_l3) /
    3
  ).toFixed(1);

  const totalCurrent = (
    latestData.current_l1 +
    latestData.current_l2 +
    latestData.current_l3
  ).toFixed(1);

  return (
    <div className="bg-white p-5 rounded-xl border shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-bold text-gray-800">3-Phase Status</h3>
        <p className="text-xs text-gray-500">สถานะไฟฟ้าแยกเฟส L1, L2, L3 ล่าสุด</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
              <th className="py-2.5 px-3">เฟส (Phase)</th>
              <th className="py-2.5 px-3">แรงดัน (Voltage - V)</th>
              <th className="py-2.5 px-3">กระแส (Current - A)</th>
              <th className="py-2.5 px-3">Power Factor (PF)</th>
            </tr>
          </thead>
          <tbody className="divide-y text-gray-700">
            <tr>
              <td className="py-2.5 px-3 font-semibold text-blue-600">Phase L1</td>
              <td className="py-2.5 px-3">{latestData.voltage_l1?.toFixed(1) ?? "-"} V</td>
              <td className="py-2.5 px-3">{latestData.current_l1?.toFixed(2) ?? "-"} A</td>
              <td className="py-2.5 px-3">{latestData.pf_l1?.toFixed(2) ?? "-"}</td>
            </tr>
            <tr>
              <td className="py-2.5 px-3 font-semibold text-amber-600">Phase L2</td>
              <td className="py-2.5 px-3">{latestData.voltage_l2?.toFixed(1) ?? "-"} V</td>
              <td className="py-2.5 px-3">{latestData.current_l2?.toFixed(2) ?? "-"} A</td>
              <td className="py-2.5 px-3">{latestData.pf_l2?.toFixed(2) ?? "-"}</td>
            </tr>
            <tr>
              <td className="py-2.5 px-3 font-semibold text-emerald-600">Phase L3</td>
              <td className="py-2.5 px-3">{latestData.voltage_l3?.toFixed(1) ?? "-"} V</td>
              <td className="py-2.5 px-3">{latestData.current_l3?.toFixed(2) ?? "-"} A</td>
              <td className="py-2.5 px-3">{latestData.pf_l3?.toFixed(2) ?? "-"}</td>
            </tr>
            <tr className="bg-gray-50 font-semibold text-gray-900 border-t">
              <td className="py-2.5 px-3">รวม / เฉลี่ย</td>
              <td className="py-2.5 px-3 text-gray-600">{avgVoltage} V (เฉลี่ย)</td>
              <td className="py-2.5 px-3 text-gray-600">{totalCurrent} A (รวม)</td>
              <td className="py-2.5 px-3 text-gray-600">
                {latestData.total_pf?.toFixed(2) ?? "-"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}