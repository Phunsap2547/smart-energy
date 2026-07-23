"use client";

import { ReactNode } from "react";
import theme from "@/config/theme.js";
import Link from "next/link";

interface StatCardProps {
  icon: ReactNode;
  title: string;
  value: string | number;
  unit?: string;
  badgeText: string;
  variant: "energyToday" | "realPower" | "powerFactor";
}

// การ์ดแบบปกติ (เขียว / น้ำเงิน / เหลือง) — สไตล์คุมด้วย theme.stats
export function StatCard({ icon, title, value, unit, badgeText, variant }: StatCardProps) {
  const colors = theme.stats[variant];

  return (
    <div
      className="flex-[5px] rounded-[20px] bg-white p-[20px] shadow-card border-[10px] h-[180px] w-[5px]"
      style={{
        borderColor: colors.border,
        boxShadow: `
          inset 0 4px 4px rgba(255, 255, 255, 0.4),
          inset 0 -4px 6px rgba(0, 0, 0, 0.3),
          0 10px 20px rgba(0, 0, 0, 0.3),
          0 4px 6px rgba(109, 102, 102, 0.2)
        `
      }}
    >
      {/* ส่วนบน: ไอคอน และ ชื่อของการ์ด */}
      <div className="flex items-center gap-[10px] text-[30px] ">
        <div
          className="w-[40px] rounded-xl flex items-center justify-center ml-[px]"
          style={{ backgroundColor: colors.iconBg, color: colors.iconColor }}
        >
          {icon}
        </div>
        <span className="text-sm text-gray-500">{title}</span>
      </div>

      {/* ส่วนกลาง: ตัวเลข และ หน่วย (จัดให้ตัวเลขใหญ่เด่นขึ้น) */}
      <div className=" mb-[10px] px-[100px] text-[30px]">
        {value}
        {unit && <span className="text-base font-medium text-gray-500 ml-[70px]">{unit}</span>}
      </div>

      {/* ส่วนล่าง: Badge สถานะ */}
      <span
        className="inline-block text-s font-semibold px-[2px] py-[0.5px] rounded  ml-[10px] rounded-[5px] text-[20px]"
        style={{ backgroundColor: colors.badgeBg, color: colors.badgeText, }}
      >
        {badgeText}
      </span>
    </div>
  );
}

// การ์ดสถานะแจ้งเตือน (สีแดง) — แยกออกมาเพราะดีไซน์ทึบสีทั้งใบ ต่างจากการ์ดอื่น
interface StatusCardProps {
  icon: ReactNode;
  count: number;
  label: string;
}

export function StatusCard({ icon, count, label }: StatusCardProps) {
  const colors = theme.stats.status;

  return (
    <div
      className="flex-[5px]  p-[4px] shadow-card border-[10px] rounded-[20px] "
      style={{
        backgroundColor: colors.background,
        borderColor: "#d4d4d4",
        boxShadow: `
          inset 0 4px 4px rgba(255, 255, 255, 0.4),
          inset 0 -4px 6px rgba(0, 0, 0, 0.3),
          0 10px 20px rgba(0, 0, 0, 0.3),
          0 4px 6px rgba(109, 102, 102, 0.2)
        `
        /* border: theme.stats.status.border*/
      }}
    >
      <div className="flex items-center mb-[3px] py-[5px] px-[20px]">
        <div className=" rounded-lg flex items-center justify-center bg-white/20  ">
          {icon}
        </div>
        <span className="text-[25px] px-[20px]"
          style={{ color: colors.textheading }}>
          Status
        </span>
      </div>

      <div className="flex items-baseline gap-[60px] mb-[18px] text-[25px] px-[100px]">
        <span className="text-[30px]  font-bold"
          style={{ color: colors.textheading }}>
          {count}
        </span>
        <span className="text-sm"
          style={{ color: colors.textheading }}>
          {label}
        </span>
      </div>

      <Link
        href="/admin/status" // เปลี่ยนเป็น path ของหน้าคู่ขนานที่คุณต้องการให้ไป
        className="text-[16px] font-semibold underline-offset-2 ml-[12px]"
        style={{ backgroundColor: theme.stats.status.adminPillBg 
        }}
      >
        View Details ›
      </Link>
    </div>
  );
}
