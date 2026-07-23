(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/config/theme.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {

/**
 * ============================================================
 *  THEME CONFIG — แก้สีและดีไซน์ของทั้งระบบได้ที่ไฟล์นี้ไฟล์เดียว
 * ============================================================
 *  ไฟล์นี้ถูก import เข้าไปใน:
 *   1) tailwind.config.js  -> เพื่อสร้าง utility class เช่น bg-brand-green
 *   2) components ต่าง ๆ    -> เพื่อใช้สีแบบ inline (เช่นสีของแต่ละการ์ด/สถานะ)
 *
 *  ถ้าต้องการเปลี่ยนโทนสีทั้งเว็บ (เช่นเปลี่ยนจากเขียวเป็นน้ำเงิน)
 *  ให้แก้ค่าที่นี่ที่เดียว ไม่ต้องไปไล่แก้ในแต่ละ component
 */ const theme = {
    // ---------- Sidebar ----------
    sidebar: {
        gradientFrom: "#173620",
        gradientTo: "#5a9a6d",
        textActive: "#ffffff",
        smartPillBg: "rgba(255,255,255,0.18)",
        textInactive: "#d9ead9",
        activeItemBg: "rgba(255,255,255,0.15)"
    },
    // ---------- Top header bar ----------
    topbar: {
        //gradientFrom: "#3d7a4d",
        gradientFrom: "#173620",
        //gradientTo: "#6fae7f",
        gradientTo: "#5a9a6d",
        adminPillBg: "rgba(255,255,255,0.18)",
        adminText: "#ffffff"
    },
    // ---------- Page background ----------
    page: {
        //background: "#f4f6f5",
        background: "#e4ece8",
        cardBackground: "#ffffff",
        heading: "#1f4d2c"
    },
    // ---------- 4 สรุปการ์ดด้านบน (Stat cards) ----------
    stats: {
        energyToday: {
            border: "#2f7d43",
            iconBg: "#eaf7ee",
            iconColor: "#2f7d43",
            badgeBg: "#2f7d43",
            badgeText: "#ffffff"
        },
        realPower: {
            border: "#2f6fed",
            iconBg: "#eaf1ff",
            iconColor: "#2f6fed",
            badgeBg: "#2f6fed",
            badgeText: "#ffffff"
        },
        powerFactor: {
            border: "#f1b400",
            iconBg: "#fff8e6",
            iconColor: "#c98f00",
            badgeBg: "#f1b400",
            badgeText: "#5a4200"
        },
        status: {
            //border: "#772727",
            background: "#e23c3c",
            iconColor: "#ffffff",
            textheading: "#ffffff",
            text: "#0f0f0f"
        }
    },
    // ---------- Panel headers (การ์ดกราฟ) ----------
    panels: {
        energyConsumption: {
            headerFrom: "#7fc4c4",
            headerTo: "#5fb3c9",
            liveBadgeBg: "#e23c3c",
            liveBadgeText: "#ffffff"
        },
        totalEnergy: {
            headerFrom: "#a190d8",
            headerTo: "#8b73c9",
            barColor: "#6f4fa0"
        },
        map: {
            headerColor: "#2f4d3a"
        }
    },
    // ---------- Line chart series colors (Energy Consumption) ----------
    chartLines: {
        voltage: "#f1b400",
        current: "#5fb3c9",
        power: "#2f6fed",
        marker: "#e23c3c",
        gridLine: "#e5e7eb"
    },
    // ---------- Typography ----------
    font: {
        heading: "'Kanit', 'Segoe UI', sans-serif",
        body: "'Kanit', 'Segoe UI', sans-serif"
    },
    // ---------- Border radius / shadow ----------
    radius: {
        card: "16px",
        pill: "999px"
    },
    shadow: {
        card: "0 4px 14px rgba(0,0,0,0.06)"
    }
};
module.exports = theme;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/shared/Sidebar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Sidebar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layout-dashboard.mjs [app-client] (ecmascript) <export default as LayoutDashboard>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$line$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LineChart$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chart-line.mjs [app-client] (ecmascript) <export default as LineChart>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chart-column.mjs [app-client] (ecmascript) <export default as BarChart3>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.mjs [app-client] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zap.mjs [app-client] (ecmascript) <export default as Zap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$config$2f$theme$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/config/theme.js [app-client] (ecmascript)");
"use client";
;
;
;
const navItems = [
    {
        label: "Dashboard",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__["LayoutDashboard"],
        active: true
    },
    {
        label: "Energy Consumption",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$line$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LineChart$3e$__["LineChart"],
        active: false
    },
    {
        label: "Total Energy",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__["BarChart3"],
        active: false
    },
    {
        label: "Status",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"],
        active: false
    }
];
function Sidebar() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
        className: " min-h-screen flex flex-col py-[3px]  items-center",
        style: {
            background: `linear-gradient(180deg, ${__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$config$2f$theme$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].sidebar.gradientFrom} 0%, ${__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$config$2f$theme$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].sidebar.gradientTo} 100%)`
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-center mb-[10px] w-[130px] h-[46px] font-semibold rounded-[15px] gap-[5px]",
                style: {
                    background: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$config$2f$theme$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].sidebar.smartPillBg
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-white/15 flex items-center justify-center p-[1px] shrink-0 py-[10px] ",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                            size: 20,
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$config$2f$theme$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].sidebar.textActive
                        }, void 0, false, {
                            fileName: "[project]/app/components/shared/Sidebar.tsx",
                            lineNumber: 29,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/components/shared/Sidebar.tsx",
                        lineNumber: 28,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "font-semibold leading-tight text-sm tracking-wide",
                        style: {
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$config$2f$theme$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].sidebar.textActive
                        },
                        children: "Smart energy"
                    }, void 0, false, {
                        fileName: "[project]/app/components/shared/Sidebar.tsx",
                        lineNumber: 31,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/shared/Sidebar.tsx",
                lineNumber: 22,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                className: "flex flex-col gap-1",
                children: navItems.map(({ label, icon: Icon, active })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "flex items-center gap-[8px] w-full h-[40px] rounded-[8px] text-left px-[15px] mb-[10px] border-none outline-none transition-all",
                        style: {
                            background: active ? __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$config$2f$theme$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].sidebar.activeItemBg : "transparent",
                            color: active ? __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$config$2f$theme$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].sidebar.textActive : __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$config$2f$theme$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].sidebar.textInactive
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                size: 20
                            }, void 0, false, {
                                fileName: "[project]/app/components/shared/Sidebar.tsx",
                                lineNumber: 55,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-sm font-medium",
                                children: label
                            }, void 0, false, {
                                fileName: "[project]/app/components/shared/Sidebar.tsx",
                                lineNumber: 56,
                                columnNumber: 13
                            }, this)
                        ]
                    }, label, true, {
                        fileName: "[project]/app/components/shared/Sidebar.tsx",
                        lineNumber: 46,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/app/components/shared/Sidebar.tsx",
                lineNumber: 44,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/shared/Sidebar.tsx",
        lineNumber: 15,
        columnNumber: 5
    }, this);
}
_c = Sidebar;
var _c;
__turbopack_context__.k.register(_c, "Sidebar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/shared/TopBar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TopBar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$user$2d$round$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserCircle2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-user-round.mjs [app-client] (ecmascript) <export default as UserCircle2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$config$2f$theme$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/config/theme.js [app-client] (ecmascript)");
"use client";
;
;
;
function TopBar() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-full rounded-b-3xl px-8px pt-6 h-[49px] -mb-12px",
        style: {
            background: `linear-gradient(90deg, ${__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$config$2f$theme$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].topbar.gradientFrom} 0%, ${__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$config$2f$theme$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].topbar.gradientTo} 100%)`
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex justify-end",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-center gap-[3px] w-[100px] h-[36px] text-sm font-semibold relative right-[30px] top-[7px] ",
                style: {
                    background: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$config$2f$theme$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].topbar.adminPillBg,
                    color: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$config$2f$theme$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].topbar.adminText,
                    borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$config$2f$theme$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].radius.pill
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$user$2d$round$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserCircle2$3e$__["UserCircle2"], {
                        size: 18
                    }, void 0, false, {
                        fileName: "[project]/app/components/shared/TopBar.tsx",
                        lineNumber: 23,
                        columnNumber: 11
                    }, this),
                    "Admin"
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/shared/TopBar.tsx",
                lineNumber: 15,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/components/shared/TopBar.tsx",
            lineNumber: 14,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/components/shared/TopBar.tsx",
        lineNumber: 8,
        columnNumber: 5
    }, this);
}
_c = TopBar;
var _c;
__turbopack_context__.k.register(_c, "TopBar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/shared/StatCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StatCard",
    ()=>StatCard,
    "StatusCard",
    ()=>StatusCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$config$2f$theme$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/config/theme.js [app-client] (ecmascript)");
"use client";
;
;
function StatCard({ icon, title, value, unit, badgeText, variant }) {
    const colors = __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$config$2f$theme$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].stats[variant];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex-[5px] rounded-[20px] bg-white p-[20px] shadow-card border-[10px] h-[180px] w-[5px]",
        style: {
            borderColor: colors.border,
            boxShadow: `
          inset 0 4px 4px rgba(255, 255, 255, 0.4),
          inset 0 -4px 6px rgba(0, 0, 0, 0.3),
          0 10px 20px rgba(0, 0, 0, 0.3),
          0 4px 6px rgba(109, 102, 102, 0.2)
        `
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-[10px] text-[30px] ",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-[40px] rounded-xl flex items-center justify-center ml-[px]",
                        style: {
                            backgroundColor: colors.iconBg,
                            color: colors.iconColor
                        },
                        children: icon
                    }, void 0, false, {
                        fileName: "[project]/app/components/shared/StatCard.tsx",
                        lineNumber: 33,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-sm text-gray-500",
                        children: title
                    }, void 0, false, {
                        fileName: "[project]/app/components/shared/StatCard.tsx",
                        lineNumber: 39,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/shared/StatCard.tsx",
                lineNumber: 32,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: " mb-[10px] px-[100px] text-[30px]",
                children: [
                    value,
                    unit && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-base font-medium text-gray-500 ml-[70px]",
                        children: unit
                    }, void 0, false, {
                        fileName: "[project]/app/components/shared/StatCard.tsx",
                        lineNumber: 45,
                        columnNumber: 18
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/shared/StatCard.tsx",
                lineNumber: 43,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "inline-block text-s font-semibold px-[2px] py-[0.5px] rounded  ml-[10px] rounded-[5px] text-[20px]",
                style: {
                    backgroundColor: colors.badgeBg,
                    color: colors.badgeText
                },
                children: badgeText
            }, void 0, false, {
                fileName: "[project]/app/components/shared/StatCard.tsx",
                lineNumber: 49,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/shared/StatCard.tsx",
        lineNumber: 20,
        columnNumber: 5
    }, this);
}
_c = StatCard;
function StatusCard({ icon, count, label }) {
    const colors = __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$config$2f$theme$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].stats.status;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex-[5px]  p-[4px] shadow-card border-[10px] rounded-[20px] ",
        style: {
            backgroundColor: colors.background,
            borderColor: "#d4d4d4",
            boxShadow: `
          inset 0 4px 4px rgba(255, 255, 255, 0.4),
          inset 0 -4px 6px rgba(0, 0, 0, 0.3),
          0 10px 20px rgba(0, 0, 0, 0.3),
          0 4px 6px rgba(109, 102, 102, 0.2)
        `
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center mb-[3px] py-[5px] px-[20px]",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: " rounded-lg flex items-center justify-center bg-white/20  ",
                        children: icon
                    }, void 0, false, {
                        fileName: "[project]/app/components/shared/StatCard.tsx",
                        lineNumber: 84,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[25px] px-[20px]",
                        style: {
                            color: colors.textheading
                        },
                        children: "Status"
                    }, void 0, false, {
                        fileName: "[project]/app/components/shared/StatCard.tsx",
                        lineNumber: 87,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/shared/StatCard.tsx",
                lineNumber: 83,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-baseline gap-[60px] mb-[18px] text-[25px] px-[100px]",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[30px]  font-bold",
                        style: {
                            color: colors.textheading
                        },
                        children: count
                    }, void 0, false, {
                        fileName: "[project]/app/components/shared/StatCard.tsx",
                        lineNumber: 94,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-sm",
                        style: {
                            color: colors.textheading
                        },
                        children: label
                    }, void 0, false, {
                        fileName: "[project]/app/components/shared/StatCard.tsx",
                        lineNumber: 98,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/shared/StatCard.tsx",
                lineNumber: 93,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: "text-[16px] font-semibold underline underline-offset-2 ml-[12px]",
                style: {
                    color: colors.text
                },
                children: "View Details ›"
            }, void 0, false, {
                fileName: "[project]/app/components/shared/StatCard.tsx",
                lineNumber: 104,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/shared/StatCard.tsx",
        lineNumber: 70,
        columnNumber: 5
    }, this);
}
_c1 = StatusCard;
var _c, _c1;
__turbopack_context__.k.register(_c, "StatCard");
__turbopack_context__.k.register(_c1, "StatusCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/data/mockData.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// ข้อมูลตัวอย่าง — ในระบบจริงสามารถแทนที่ด้วยการ fetch จาก API/DB ได้เลย
// โดยไม่ต้องแก้ไข component ใด ๆ (แค่เปลี่ยนแหล่งข้อมูลตรงนี้)
__turbopack_context__.s([
    "buildingLocation",
    ()=>buildingLocation,
    "energyConsumptionSeries",
    ()=>energyConsumptionSeries,
    "statCards",
    ()=>statCards,
    "totalEnergyWeekly",
    ()=>totalEnergyWeekly
]);
const statCards = {
    energyToday: {
        value: 655,
        unit: "kWH",
        status: "Normal"
    },
    realPower: {
        value: 10,
        unit: "kW",
        status: "Normal"
    },
    powerFactor: {
        value: 0.48,
        status: "Low"
    },
    statusAlert: {
        count: 1,
        label: "devices"
    }
};
const energyConsumptionSeries = [
    {
        time: "9.00 AM",
        voltage: 40,
        current: 55,
        power: 30
    },
    {
        time: "9.30 AM",
        voltage: 60,
        current: 35,
        power: 50
    },
    {
        time: "10.00 AM",
        voltage: 30,
        current: 60,
        power: 10
    },
    {
        time: "10.30 AM",
        voltage: 55,
        current: 40,
        power: 45
    },
    {
        time: "11.00 AM",
        voltage: 65,
        current: 50,
        power: 60
    },
    {
        time: "11.30 AM",
        voltage: 45,
        current: 70,
        power: 35
    },
    {
        time: "12.00 AM",
        voltage: 70,
        current: 45,
        power: 65
    }
];
const totalEnergyWeekly = [
    {
        day: "Mon",
        kwh: 30
    },
    {
        day: "Tue",
        kwh: 32
    },
    {
        day: "Wed",
        kwh: 55
    },
    {
        day: "Thu",
        kwh: 62
    },
    {
        day: "Fri",
        kwh: 78
    }
];
const buildingLocation = {
    name: "Academic Building",
    lat: 17.1664,
    lng: 104.1486
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/charts/EnergyConsumptionChart.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>EnergyConsumptionChart
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$LineChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/chart/LineChart.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Line$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/Line.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$XAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/XAxis.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/YAxis.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianGrid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/CartesianGrid.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/ResponsiveContainer.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$shape$2f$Dot$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/shape/Dot.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$line$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LineChart$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chart-line.mjs [app-client] (ecmascript) <export default as LineChart>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$config$2f$theme$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/config/theme.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$data$2f$mockData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/data/mockData.ts [app-client] (ecmascript)");
"use client";
;
;
;
;
;
function EnergyConsumptionChart() {
    const panel = __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$config$2f$theme$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].panels.energyConsumption;
    const lines = __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$config$2f$theme$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].chartLines;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-card overflow-hidden shadow-card bg-white flex-1",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between px-[4px] py-[3px] text-[22px]",
                style: {
                    background: `linear-gradient(90deg, ${panel.headerFrom} 0%, ${panel.headerTo} 100%)`
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-[10px] text-white font-medium text-sm px-[20px]",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$line$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LineChart$3e$__["LineChart"], {
                                size: 26
                            }, void 0, false, {
                                fileName: "[project]/app/components/charts/EnergyConsumptionChart.tsx",
                                lineNumber: 29,
                                columnNumber: 11
                            }, this),
                            "Energy Consumption"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/charts/EnergyConsumptionChart.tsx",
                        lineNumber: 28,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xs font-bold px-2 py-0.5 rounded",
                        style: {
                            backgroundColor: panel.liveBadgeBg,
                            color: panel.liveBadgeText
                        },
                        children: "LIVE"
                    }, void 0, false, {
                        fileName: "[project]/app/components/charts/EnergyConsumptionChart.tsx",
                        lineNumber: 32,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/charts/EnergyConsumptionChart.tsx",
                lineNumber: 22,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 ",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ResponsiveContainer"], {
                    width: "100%",
                    height: 250,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$LineChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LineChart"], {
                        data: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$data$2f$mockData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["energyConsumptionSeries"],
                        margin: {
                            top: 10,
                            right: 10,
                            left: -20,
                            bottom: 0
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianGrid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CartesianGrid"], {
                                stroke: lines.gridLine,
                                vertical: false
                            }, void 0, false, {
                                fileName: "[project]/app/components/charts/EnergyConsumptionChart.tsx",
                                lineNumber: 43,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$XAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["XAxis"], {
                                dataKey: "time",
                                tick: {
                                    fontSize: 11,
                                    fill: "#9ca3af"
                                },
                                axisLine: false,
                                tickLine: false
                            }, void 0, false, {
                                fileName: "[project]/app/components/charts/EnergyConsumptionChart.tsx",
                                lineNumber: 44,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["YAxis"], {
                                tick: {
                                    fontSize: 11,
                                    fill: "#9ca3af"
                                },
                                axisLine: false,
                                tickLine: false
                            }, void 0, false, {
                                fileName: "[project]/app/components/charts/EnergyConsumptionChart.tsx",
                                lineNumber: 45,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Line$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Line"], {
                                type: "monotone",
                                dataKey: "voltage",
                                stroke: lines.voltage,
                                strokeWidth: 2,
                                dot: {
                                    r: 3,
                                    fill: "#111827"
                                }
                            }, void 0, false, {
                                fileName: "[project]/app/components/charts/EnergyConsumptionChart.tsx",
                                lineNumber: 46,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Line$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Line"], {
                                type: "monotone",
                                dataKey: "current",
                                stroke: lines.current,
                                strokeWidth: 2,
                                dot: {
                                    r: 3,
                                    fill: "#111827"
                                }
                            }, void 0, false, {
                                fileName: "[project]/app/components/charts/EnergyConsumptionChart.tsx",
                                lineNumber: 53,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Line$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Line"], {
                                type: "monotone",
                                dataKey: "power",
                                stroke: lines.power,
                                strokeWidth: 2,
                                dot: (props)=>{
                                    // ไฮไลต์จุดสีแดงที่ค่าต่ำสุด (เช่นค่าที่ต้องเฝ้าระวัง) เหมือนดีไซน์ต้นฉบับ
                                    const isLowest = props.payload.time === "10.00 AM";
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$shape$2f$Dot$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Dot"], {
                                        cx: props.cx,
                                        cy: props.cy,
                                        r: isLowest ? 6 : 3,
                                        fill: isLowest ? lines.marker : "#111827"
                                    }, props.index, false, {
                                        fileName: "[project]/app/components/charts/EnergyConsumptionChart.tsx",
                                        lineNumber: 69,
                                        columnNumber: 19
                                    }, this);
                                }
                            }, void 0, false, {
                                fileName: "[project]/app/components/charts/EnergyConsumptionChart.tsx",
                                lineNumber: 60,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/charts/EnergyConsumptionChart.tsx",
                        lineNumber: 42,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/components/charts/EnergyConsumptionChart.tsx",
                    lineNumber: 41,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/charts/EnergyConsumptionChart.tsx",
                lineNumber: 40,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/charts/EnergyConsumptionChart.tsx",
        lineNumber: 21,
        columnNumber: 5
    }, this);
}
_c = EnergyConsumptionChart;
var _c;
__turbopack_context__.k.register(_c, "EnergyConsumptionChart");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/charts/TotalEnergyChart.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TotalEnergyChart
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$BarChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/chart/BarChart.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Bar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/Bar.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$XAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/XAxis.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/YAxis.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianGrid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/CartesianGrid.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/ResponsiveContainer.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chart-column.mjs [app-client] (ecmascript) <export default as BarChart3>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$config$2f$theme$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/config/theme.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$data$2f$mockData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/data/mockData.ts [app-client] (ecmascript)");
"use client";
;
;
;
;
;
function TotalEnergyChart() {
    const panel = __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$config$2f$theme$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].panels.totalEnergy;
    const gridColor = __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$config$2f$theme$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].chartLines.gridLine;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-card overflow-hidden shadow-card bg-white flex-1",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-[10px] text-white font-medium text-[22px] px-[20px]",
                style: {
                    background: `linear-gradient(90deg, ${panel.headerFrom} 0%, ${panel.headerTo} 100%)`
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__["BarChart3"], {
                        size: 26
                    }, void 0, false, {
                        fileName: "[project]/app/components/charts/TotalEnergyChart.tsx",
                        lineNumber: 20,
                        columnNumber: 9
                    }, this),
                    "Total Energy Used (kwh)"
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/charts/TotalEnergyChart.tsx",
                lineNumber: 14,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-[4px] ",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ResponsiveContainer"], {
                    width: "100%",
                    height: 250,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$BarChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BarChart"], {
                        data: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$data$2f$mockData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["totalEnergyWeekly"],
                        margin: {
                            top: 10,
                            right: 10,
                            left: -20,
                            bottom: 0
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianGrid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CartesianGrid"], {
                                stroke: gridColor,
                                vertical: false
                            }, void 0, false, {
                                fileName: "[project]/app/components/charts/TotalEnergyChart.tsx",
                                lineNumber: 27,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$XAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["XAxis"], {
                                dataKey: "day",
                                tick: {
                                    fontSize: 11,
                                    fill: "#9ca3af"
                                },
                                axisLine: false,
                                tickLine: false
                            }, void 0, false, {
                                fileName: "[project]/app/components/charts/TotalEnergyChart.tsx",
                                lineNumber: 28,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["YAxis"], {
                                tick: {
                                    fontSize: 11,
                                    fill: "#9ca3af"
                                },
                                axisLine: false,
                                tickLine: false
                            }, void 0, false, {
                                fileName: "[project]/app/components/charts/TotalEnergyChart.tsx",
                                lineNumber: 29,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Bar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Bar"], {
                                dataKey: "kwh",
                                fill: panel.barColor,
                                radius: [
                                    4,
                                    4,
                                    0,
                                    0
                                ],
                                barSize: 28
                            }, void 0, false, {
                                fileName: "[project]/app/components/charts/TotalEnergyChart.tsx",
                                lineNumber: 30,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/charts/TotalEnergyChart.tsx",
                        lineNumber: 26,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/components/charts/TotalEnergyChart.tsx",
                    lineNumber: 25,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/charts/TotalEnergyChart.tsx",
                lineNumber: 24,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/charts/TotalEnergyChart.tsx",
        lineNumber: 13,
        columnNumber: 5
    }, this);
}
_c = TotalEnergyChart;
var _c;
__turbopack_context__.k.register(_c, "TotalEnergyChart");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/MapCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MapCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/map-pin.mjs [app-client] (ecmascript) <export default as MapPin>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$config$2f$theme$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/config/theme.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$data$2f$mockData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/data/mockData.ts [app-client] (ecmascript)");
"use client";
;
;
;
;
function MapCard() {
    const mapSrc = `https://maps.google.com/maps?q=${__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$data$2f$mockData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildingLocation"].lat},${__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$data$2f$mockData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildingLocation"].lng}&z=16&output=embed`;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-card overflow-hidden shadow-card bg-white",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-[2px] px-[350px] py-[10px] font-medium text-[22px] ml-[90px]",
                style: {
                    color: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$config$2f$theme$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].panels.map.headerColor
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"], {
                        size: 26
                    }, void 0, false, {
                        fileName: "[project]/app/components/MapCard.tsx",
                        lineNumber: 16,
                        columnNumber: 9
                    }, this),
                    "Map"
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/MapCard.tsx",
                lineNumber: 12,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-[800px] w-[1300px] px-[150px] ml-[230px]",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("iframe", {
                    title: "building-location",
                    src: mapSrc,
                    width: "100%",
                    height: "100%",
                    style: {
                        border: 0
                    },
                    loading: "lazy"
                }, void 0, false, {
                    fileName: "[project]/app/components/MapCard.tsx",
                    lineNumber: 20,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/MapCard.tsx",
                lineNumber: 19,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/MapCard.tsx",
        lineNumber: 11,
        columnNumber: 5
    }, this);
}
_c = MapCard;
var _c;
__turbopack_context__.k.register(_c, "MapCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=app_01257-a._.js.map