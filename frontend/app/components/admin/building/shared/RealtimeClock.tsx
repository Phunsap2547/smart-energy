"use client";

import React, { useState, useEffect } from "react";
import { Calendar, RefreshCw } from "lucide-react";

export default function RealtimeClock() {
  const [timeStr, setTimeStr] = useState<string>("");

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
    <div className="space-y-3">
      <div className="flex items-center gap-2.5 p-2.5 bg-gray-50/80 rounded-xl border border-gray-100">
        <Calendar size={18} className="text-gray-400 shrink-0" />
        <div>
          <p className="text-[10px] text-gray-400 font-medium">วันที่และเวลา</p>
          <p className="text-xs font-semibold text-gray-700">
            {timeStr || "27/08/2026 14:25:30"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-500 px-1">
        <RefreshCw size={14} className="text-gray-400 animate-spin shrink-0" />
        <span>อัปเดตอัตโนมัติทุก 1 นาที</span>
      </div>
    </div>
  );
}