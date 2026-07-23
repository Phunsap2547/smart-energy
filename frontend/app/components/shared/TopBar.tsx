"use client";

import { UserCircle2 } from "lucide-react";
import theme from "@/config/theme.js";

export default function TopBar() {
  return (
    <div
      className="w-full rounded-b-3xl px-8px pt-6 h-[49px] -mb-12px"
      style={{
        background: `linear-gradient(90deg, ${theme.topbar.gradientFrom} 0%, ${theme.topbar.gradientTo} 100%)`,
      }}
    >
      <div className="flex justify-end">
        <div
className="flex items-center justify-center gap-[3px] w-[100px] h-[36px] text-sm font-semibold relative right-[30px] top-[7px] "          
          style={{
            background: theme.topbar.adminPillBg,
            color: theme.topbar.adminText,
            borderRadius: theme.radius.pill,
          }}
        >
          <UserCircle2 size={18} />
          Admin
        </div>
      </div>
    </div>
  );
}