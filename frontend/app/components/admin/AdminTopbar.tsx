"use client";

import Link from "next/link";
import { UserCircle2, Settings2 } from "lucide-react";
import theme from "@/config/theme.js";

interface AdminTopbarProps {
  panelOpen: boolean;
  onTogglePanel: () => void;
}

export default function AdminTopbar({ panelOpen, onTogglePanel }: AdminTopbarProps) {
  return (
    <div
      className="absolute top-0 left-0 right-0 z-[1000] px-6 py-3 shadow-md flex items-center justify-between"
      style={{
        background: `linear-gradient(90deg, ${theme.topbar.gradientFrom} 0%, ${theme.topbar.gradientTo} 100%)`,
      }}
    >
      <div>
        <h1 className="text-white font-bold text-lg ml-10">
          Smart Energy Management System
        </h1>
        <p className="text-white/80 text-xs sm:text-sm ml-12">
          แผงควบคุมผู้ดูแลระบบ — จัดการอาคารบนแผนที่
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onTogglePanel}
          className="flex items-center justify-center gap-1.5 px-4 h-[36px] text-sm font-semibold transition-opacity hover:opacity-90"
          style={{
            background: theme.topbar.adminPillBg,
            color: theme.topbar.adminText,
            borderRadius: theme.radius.pill,
          }}
        >
          <Settings2 size={16} />
          <span>จัดการอาคาร</span>
        </button>
        <Link
          href="/"
          className="flex items-center justify-center gap-1.5 px-4 h-[36px] text-sm font-semibold"
          style={{
            background: theme.topbar.adminPillBg,
            color: theme.topbar.adminText,
            borderRadius: theme.radius.pill,
          }}
        >
          <UserCircle2 size={18} />
          <span>User</span>
        </Link>
      </div>
    </div>
  );
}