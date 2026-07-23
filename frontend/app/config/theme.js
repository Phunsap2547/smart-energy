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
 */

const theme = {
  // ---------- Sidebar ----------
  sidebar: {
    gradientFrom: "#173620", // เขียวเข้มด้านบน
    gradientTo: "#5a9a6d",   // เขียวอ่อนด้านล่าง
    textActive: "#ffffff",
    smartPillBg: "rgba(255,255,255,0.18)",
    textInactive: "#d9ead9",
    activeItemBg: "rgba(255,255,255,0.15)",
  },

  // ---------- Top header bar ----------
  topbar: {
    //gradientFrom: "#3d7a4d",
    gradientFrom: "#173620",
    //gradientTo: "#6fae7f",
    gradientTo: "#5a9a6d",
    adminPillBg: "rgba(255,255,255,0.18)",
    adminText: "#ffffff",
  },

  // ---------- Page background ----------
  page: {
    //background: "#f4f6f5",
    background: "#e4ece8",
    cardBackground: "#ffffff",
    heading: "#1f4d2c",
  },

  // ---------- 4 สรุปการ์ดด้านบน (Stat cards) ----------
  stats: {
    energyToday: {
      border: "#2f7d43",
      iconBg: "#eaf7ee",
      iconColor: "#2f7d43",
      badgeBg: "#2f7d43",
      badgeText: "#ffffff",
     // energytodayPillBg: "rgba(255,255,255,0.18)",
    },
    realPower: {
      border: "#2f6fed",
      iconBg: "#eaf1ff",
      iconColor: "#2f6fed",
      badgeBg: "#2f6fed",
      badgeText: "#ffffff",
    },
    powerFactor: {
      border: "#f1b400",
      iconBg: "#fff8e6",
      iconColor: "#c98f00",
      badgeBg: "#f1b400",
      badgeText: "#5a4200",
    },
    status: {
      //border: "#772727",
      background: "#e23c3c",
      iconColor: "#ffffff",
      textheading: "#ffffff",
      text: "#0f0f0f",
    },
  },

  // ---------- Panel headers (การ์ดกราฟ) ----------
  panels: {
    energyConsumption: {
      headerFrom: "#7fc4c4",
      headerTo: "#5fb3c9",
      liveBadgeBg: "#e23c3c",
      liveBadgeText: "#ffffff",
    },
    totalEnergy: {
      headerFrom: "#a190d8",
      headerTo: "#8b73c9",
      barColor: "#6f4fa0",
    },
    map: {
      headerColor: "#2f4d3a",
    },
  },

  // ---------- Line chart series colors (Energy Consumption) ----------
  chartLines: {
    voltage: "#f1b400",   // เหลือง
    current: "#5fb3c9",   // ฟ้า
    power: "#2f6fed",     // น้ำเงิน
    marker: "#e23c3c",    // จุดแดง (ค่าล่าสุด/แจ้งเตือน)
    gridLine: "#e5e7eb",
  },

  // ---------- Typography ----------
  font: {
    heading: "'Kanit', 'Segoe UI', sans-serif",
    body: "'Kanit', 'Segoe UI', sans-serif",
  },

  // ---------- Border radius / shadow ----------
  radius: {
    card: "16px",
    pill: "999px",
  },
  shadow: {
    card: "0 4px 14px rgba(0,0,0,0.06)",
  },
};

module.exports = theme;
