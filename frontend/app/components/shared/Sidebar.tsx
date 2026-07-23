"use client";

import { LayoutDashboard, LineChart, BarChart3, AlertTriangle, Zap } from "lucide-react";
import theme from "@/config/theme.js";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Energy Consumption", icon: LineChart, active: false },
  { label: "Total Energy", icon: BarChart3, active: false },
  { label: "Status", icon: AlertTriangle, active: false },
];

export default function Sidebar() {
  return (
    <aside
      className=" min-h-screen flex flex-col py-[3px]  items-center"
      style={{
        background: `linear-gradient(180deg, ${theme.sidebar.gradientFrom} 0%, ${theme.sidebar.gradientTo} 100%)`,
      }}
    >
      {/* Logo */}
      <div 
        className="flex items-center justify-center mb-[10px] w-[130px] h-[46px] font-semibold rounded-[15px] gap-[5px]"
        style={{
          background: theme.sidebar.smartPillBg
        }}
      >
        <div className="bg-white/15 flex items-center justify-center p-[1px] shrink-0 py-[10px] ">
          <Zap size={20} color={theme.sidebar.textActive} />
        </div>
        <span
          className="font-semibold leading-tight text-sm tracking-wide"
          style={{
            color: theme.sidebar.textActive,
          }}
        >
          Smart
        
          energy
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1">
        {navItems.map(({ label, icon: Icon, active }) => (
          <button
            key={label}
className="flex items-center gap-[8px] w-full h-[40px] rounded-[8px] text-left px-[15px] mb-[10px] border-none outline-none transition-all"           
           style={{
              background: active ? theme.sidebar.activeItemBg : "transparent",
              color: active ? theme.sidebar.textActive : theme.sidebar.textInactive,
              //boxShadow: active ? "0 4px 6px -1px rgba(0,0,0,0.1)" : "none"
            }}
          >
            <Icon size={20} />
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
