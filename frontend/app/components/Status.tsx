"use client";

import { Building2, AlertTriangle, CheckCircle2, Sparkles } from "lucide-react";
import type { AnalysisResult } from "@/lib/analyzeStatus";

/* ---------- 1. การ์ดตึก + สถานะ ---------- */
interface BuildingStatusCardProps {
  name: string;
  isNormal: boolean;
  severity: "normal" | "warning" | "critical";
  /** เรียกเมื่อกดเครื่องหมายสถานะ มุมขวาบน (ใช้ toggle กล่องข้อความด้านข้าง) */
  onMarkerClick?: () => void;
  /** true = กล่องข้อความกำลังเปิดอยู่ ใช้ปรับ style ปุ่ม เช่น ring ตอน active */
  isActive?: boolean;
}

export function BuildingStatusCard({
  name,
  isNormal,
  severity,
  onMarkerClick,
  isActive,
}: BuildingStatusCardProps) {
  const markerColor =
    severity === "critical"
      ? "#DC2626"
      : severity === "warning"
      ? "#F59E0B"
      : "#16A34A";

  return (
    <div className="rounded-[16px] bg-white shadow-sm border-2 border-[#A5A6D9] p-[24px] flex flex-col items-center justify-center relative">
      {/* ไอคอนตึก + จุดสถานะ */}
      <div className="relative">
        <div className="w-[140px] h-[140px] rounded-[20px] bg-[#EDEDF7] flex items-center justify-center">
          <Building2 size={80} strokeWidth={1.5} className="text-[#8C8DC7]" />
        </div>

        {/* เครื่องหมายสถานะ มุมขวาบน — กดได้ เพื่อเปิด/ปิดกล่องวิเคราะห์ */}
        <button
          type="button"
          onClick={onMarkerClick}
          aria-label={isActive ? "ซ่อนผลวิเคราะห์" : "แสดงผลวิเคราะห์"}
          aria-pressed={isActive}
          className={`absolute -top-[6px] -right-[6px] w-[32px] h-[32px] rounded-full flex items-center justify-center shadow-md cursor-pointer transition-transform duration-150 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isActive ? "ring-2 ring-offset-2" : ""
          } ${!isNormal && !isActive ? "animate-pulse" : ""}`}
          style={{
            backgroundColor: markerColor,
            ["--tw-ring-color" as string]: markerColor,
          }}
        >
          {!isNormal ? (
            <AlertTriangle size={20} className="text-white" />
          ) : (
            <CheckCircle2 size={20} className="text-white" />
          )}
        </button>
      </div>

      {/* ชื่ออาคาร */}
      <h3 className="mt-[16px] text-[18px] font-semibold text-gray-800 text-center">
        {name}
      </h3>

      {/* ป้ายสถานะ */}
      <span
        className="mt-[8px] px-[12px] py-[4px] rounded-full text-[13px] font-medium"
        style={{
          backgroundColor: `${markerColor}1A`,
          color: markerColor,
        }}
      >
        {severity === "critical"
          ? "ผิดปกติ (Critical)"
          : severity === "warning"
          ? "ผิดปกติ (Warning)"
          : "ปกติ"}
      </span>
    </div>
  );
}

/* ---------- 2. กล่องวิเคราะห์ (ขอบทอง/เหลือง + ไอคอนเตือนมุมซ้ายบน) ---------- */
interface StatusAnalysisPanelProps {
  result: AnalysisResult;
  /** true = แสดงกล่อง, false/undefined = ซ่อนกล่อง (ยุบ + จาง) */
  isOpen?: boolean;
}

export function StatusAnalysisPanel({ result, isOpen = true }: StatusAnalysisPanelProps) {
  // กันกรณี result ยังไม่มีค่า (เช่น ข้อมูลกำลังโหลด หรือ analyzeStatus คืนค่า undefined)
  if (!result) {
    return null;
  }

  return (
    <div
      className={`flex-1 overflow-hidden transition-all duration-300 ease-out ${
        isOpen
          ? "max-w-[600px] opacity-100 translate-x-0"
          : "max-w-0 opacity-0 -translate-x-4 pointer-events-none"
      }`}
    >
      <div className="relative rounded-[16px] bg-[#F3F7EF] border-2 border-[#E3B23C] p-[20px] min-w-[400px]">
        {/* ไอคอนเตือนมุมซ้ายบน แบบ badge ทับขอบ */}
        <span className="absolute -top-[14px] -left-[14px] w-[34px] h-[34px] rounded-full bg-[#DC2626] flex items-center justify-center shadow-md">
          <AlertTriangle size={18} className="text-white" />
        </span>

        <div className="flex items-center gap-[8px] mb-[12px] pl-[8px]">
          <Sparkles size={18} className="text-[#E3B23C]" />
          <h3 className="text-gray-700 font-semibold text-[14px]">
            ผลวิเคราะห์จากระบบ AI (Machine Learning)
          </h3>
        </div>

        {result.isNormal ? (
          <p className="text-gray-600 text-[14px] pl-[8px]">
            ระบบไฟฟ้าทำงานอยู่ในเกณฑ์ปกติทุกตัวชี้วัด ไม่พบความผิดปกติในขณะนี้
          </p>
        ) : (
          <div className="flex flex-col gap-[14px] pl-[8px]">
            {result.issues.map((issue, i) => (
              <div key={i} className="border-l-[3px] border-[#DC2626] pl-[12px]">
                <div className="flex items-center justify-between">
                  <h4 className="text-[14px] font-semibold text-gray-800">
                    {issue.title}
                  </h4>
                  <span className="text-[12px] text-gray-400">
                    ความเชื่อมั่น {(issue.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-[13px] text-gray-600 mt-[4px] leading-relaxed">
                  {issue.detail}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}