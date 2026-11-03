
// components/admin/building/overview/PhaseTable.tsx
"use client";

import React from "react";
import { EnergyIngest } from "@/types/energy";
import { formatNumber } from "@/lib/formatter";
import Link from "next/link";
import { useParams } from "next/navigation";
import { VoltageCfg, DEFAULT_VOLTAGE_CFG } from "@/lib/voltage";

interface PhaseTableProps {
  latestData: EnergyIngest | null;
  isOffline?: boolean;
  voltageCfg?: VoltageCfg; // ช่วงแรงดันปกติของอุปกรณ์ (จากตาราง devices)
}

// เกณฑ์ตรวจ (ปรับได้)
const V_NO_SIGNAL = 22;   // ต่ำกว่านี้ถือว่าไม่มีแรงดัน/ไม่ได้ต่อเฟส
const PF_MIN = 0.85;
const CURRENT_MIN_FOR_PF = 0.1; // กระแสต่ำกว่านี้ PF ไม่มีความหมาย ไม่ตรวจ
const THD_V_MAX = 8;      // %
const THD_I_MAX = 20;     // %

type Raw = {
  phase: string;
  voltage: number | null | undefined;
  current: number | null | undefined;
  pf: number | null | undefined;
  thdV: number | null | undefined;
  thdI: number | null | undefined;
};

function analyze(p: Raw, vMin: number, vMax: number) {
  const v = p.voltage ?? null;
  const i = p.current ?? null;
  const pf = p.pf ?? null;
  const thdV = p.thdV ?? null;
  const thdI = p.thdI ?? null;

  // เฟสที่ไม่มีข้อมูล / ไม่ได้ต่อ
  if (v === null || v < V_NO_SIGNAL) {
    return {
      state: "nodata" as const,
      reasons: [v === null ? "ไม่มีข้อมูลเฟสนี้" : `แรงดัน ${formatNumber(v, 0)} V (อาจไม่ได้ต่อเฟสนี้)`],
      bad: { v: false, i: false, pf: false, thdV: false, thdI: false },
      v: v ?? 0, i: i ?? 0, pf: pf ?? 0, thdV: thdV ?? 0, thdI: thdI ?? 0,
    };
  }

  const bad = {
    v: v > vMax || v < vMin,
    i: false,
    pf: pf !== null && (i ?? 0) >= CURRENT_MIN_FOR_PF && pf < PF_MIN,
    thdV: thdV !== null && thdV > THD_V_MAX,
    thdI: thdI !== null && thdI > THD_I_MAX,
  };

  const reasons: string[] = [];
  if (v > vMax) reasons.push(`แรงดันสูง ${formatNumber(v, 1)} V (เกิน ${vMax})`);
  else if (v < vMin) reasons.push(`แรงดันต่ำ ${formatNumber(v, 1)} V (ต่ำกว่า ${vMin})`);
  if (bad.pf) reasons.push(`PF ต่ำ ${formatNumber(pf as number, 2)} (ต่ำกว่า ${PF_MIN})`);
  if (bad.thdV) reasons.push(`THD-V สูง ${formatNumber(thdV as number, 1)}%`);
  if (bad.thdI) reasons.push(`THD-I สูง ${formatNumber(thdI as number, 1)}%`);

  return {
    state: reasons.length > 0 ? ("error" as const) : ("ok" as const),
    reasons,
    bad,
    v, i: i ?? 0, pf: pf ?? 0, thdV: thdV ?? 0, thdI: thdI ?? 0,
  };
}

export default function PhaseTable({
  latestData,
  isOffline = false,
  voltageCfg = DEFAULT_VOLTAGE_CFG,
}: PhaseTableProps) {
  const params = useParams();
  const buildingId = params?.id;

  const raws: Raw[] = [
    { phase: "L1", voltage: latestData?.voltage_a, current: latestData?.current_a, pf: latestData?.pf_a, thdV: latestData?.thd_voltage_l1_pct, thdI: latestData?.thd_current_l1_pct },
    { phase: "L2", voltage: latestData?.voltage_b, current: latestData?.current_b, pf: latestData?.pf_b, thdV: latestData?.thd_voltage_l2_pct, thdI: latestData?.thd_current_l2_pct },
    { phase: "L3", voltage: latestData?.voltage_c, current: latestData?.current_c, pf: latestData?.pf_c, thdV: latestData?.thd_voltage_l3_pct, thdI: latestData?.thd_current_l3_pct },
  ];

  const phases = raws.map((r) => {
    if (isOffline) {
      return {
        phase: r.phase, state: "offline" as const,
        reasons: ["ไม่ได้รับข้อมูล (Offline)"],
        bad: { v: false, i: false, pf: false, thdV: false, thdI: false },
        v: 0, i: 0, pf: 0, thdV: 0, thdI: 0,
      };
    }
    return { phase: r.phase, ...analyze(r, voltageCfg.min, voltageCfg.max) };
  });

  const badge = {
    ok: { text: "ปกติ", cls: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
    error: { text: "ผิดปกติ", cls: "bg-red-100 text-red-700", dot: "bg-red-500" },
    offline: { text: "Offline", cls: "bg-red-100 text-red-700", dot: "bg-red-500" },
    nodata: { text: "ไม่มีข้อมูล", cls: "bg-gray-100 text-gray-500", dot: "bg-gray-400" },
  } as const;

  const cell = (isBad: boolean) => (isBad ? "text-red-600 font-bold" : "");

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
              const b = badge[p.state];
              const rowCls =
                p.state === "error" || p.state === "offline"
                  ? "bg-red-50/30"
                  : p.state === "nodata"
                  ? "text-gray-400"
                  : "text-gray-700";
              return (
                <tr key={p.phase} className={rowCls}>
                  <td className="py-3 px-3 font-semibold">{p.phase}</td>
                  <td className={`py-3 px-3 ${cell(p.bad.v)}`}>{formatNumber(p.v, 1)} V</td>
                  <td className={`py-3 px-3 ${cell(p.bad.i)}`}>{formatNumber(p.i, 1)} A</td>
                  <td className={`py-3 px-3 ${cell(p.bad.pf)}`}>{formatNumber(p.pf, 2)}</td>
                  <td className={`py-3 px-3 ${cell(p.bad.thdV)}`}>{formatNumber(p.thdV, 1)} %</td>
                  <td className={`py-3 px-3 ${cell(p.bad.thdI)}`}>{formatNumber(p.thdI, 1)} %</td>
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${b.cls}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${b.dot}`} />
                      {b.text}
                    </span>
                    {p.state !== "ok" && (
                      <div className="mt-1 text-[11px] font-normal text-gray-500 leading-tight">
                        {p.reasons.join(" · ")}
                      </div>
                    )}
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