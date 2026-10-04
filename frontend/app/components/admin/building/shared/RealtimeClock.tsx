"use client";

import React, { useState, useEffect, useRef } from "react";
import { Calendar, RefreshCw, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RealtimeClock() {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [timeStr, setTimeStr] = useState<string>("");
  const [compact, setCompact] = useState(false); // true = อยู่ใน sidebar (แคบ)

  // วัดความกว้างของที่ที่ถูกวาง
  useEffect(() => {
    const parent = rootRef.current?.parentElement;
    if (!parent) return;

    const check = () => setCompact(parent.clientWidth < 360);
    check();

    const ro = new ResizeObserver(check);
    ro.observe(parent);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const date = now.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      const time = now.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setTimeStr(`${date} ${time}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      ref={rootRef}
      className={
        compact
          ? "flex flex-col items-stretch gap-2.5 w-full pb-1"
          : "flex flex-col items-end gap-2"
      }
    >
      <div
        className={
          compact ? "flex flex-col gap-2.5 w-full" : "flex items-center gap-3"
        }
      >
        {/* กล่องวันที่ */}
        <div
          className={`flex items-center gap-3 px-3.5 py-2.5 bg-gray-50/80 rounded-xl border border-gray-100 ${compact ? "order-2" : ""
            }`}
        >
          <Calendar size={20} className="text-gray-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-gray-400 font-medium leading-none">
              วันที่และเวลา
            </p>
            <p className="text-sm font-semibold text-gray-700 mt-1 whitespace-nowrap">
              {timeStr || "27/08/2026 14:25:30"}
            </p>
          </div>
        </div>

        {/* ปุ่มกลับ */}
        <button
          onClick={() => router.push("/admin")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 rounded-xl border border-emerald-200 transition-colors shadow-sm cursor-pointer whitespace-nowrap ${compact ? "w-full justify-center order-1" : "shrink-0"
            }`}
        >
          <ArrowLeft size={18} className="text-emerald-600 shrink-0" />
          <span>กลับหน้าแผนที่อาคาร</span>
        </button>
      </div>

      {/* ข้อความอัปเดตอัตโนมัติ */}
      <div
        className={`flex items-center gap-2 text-xs text-gray-500 px-1 ${compact ? "justify-center" : ""
          }`}
      >
        <RefreshCw size={14} className="text-gray-400 animate-spin shrink-0" />
        <span>อัปเดตอัตโนมัติทุก 1 นาที</span>
      </div>
    </div>
  );
}