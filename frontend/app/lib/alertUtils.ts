// lib/alertUtils.ts
// type + ฟังก์ชันช่วยของ Alert/Anomaly (ใช้ร่วมกับ GET /api/alerts)

export interface AlertRow {
  id: string | number;
  device_id: string | number;
  type?: string | null;
  severity?: string | null; // critical | high | warning
  description?: string | null;
  status?: string | null; // open | investigating | resolved | dismissed
  created_at: string;
  devices?: { id?: string | number; name?: string | null; building_id?: string | number | null } | null;
}

// ยังไม่ปิดเรื่อง = open หรือ investigating
export const isOpenAlert = (a: AlertRow) => a.status === "open" || a.status === "investigating";

// "6 ต.ค. 2569 21:18" (เวลาไทย, พ.ศ.)
export function formatThaiDateTime(iso: string) {
  try {
    return new Intl.DateTimeFormat("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      timeZone: "Asia/Bangkok",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

// "2026-10-07" (วันที่ตามเวลาไทย) ใช้เทียบกับ <input type="date">
export function bangkokDateKey(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Bangkok",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}