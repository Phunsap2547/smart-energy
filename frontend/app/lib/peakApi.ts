// lib/peakApi.ts
// Peak Demand (kW สูงสุด) ของช่วงที่เลือก: Month / Year / Total
// (โหมด Day ใช้ค่าสูงสุดจากกราฟ Power Real-time ใน BuildingDetailClient โดยตรง)
import { supabase } from "@/lib/supabase";
import type { RangeMode } from "@/lib/readingsApi.ts";

const TZ = "Asia/Bangkok";
const pad = (n: number) => String(n).padStart(2, "0");
const MONTHS_TH_SHORT = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

const dateFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function thaiYMD(d: Date) {
  const p: Record<string, string> = {};
  dateFmt.formatToParts(d).forEach((x) => (p[x.type] = x.value));
  return { y: +p.year, m: +p.month, d: +p.day };
}

function rangeBounds(range: RangeMode) {
  const { y, m, d } = thaiYMD(new Date());
  const today = `${y}-${pad(m)}-${pad(d)}`;

  if (range === "Day") {
    return { start: `${today}T00:00:00+07:00`, end: `${today}T23:59:59+07:00` };
  }
  if (range === "Month") {
    const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
    return {
      start: `${y}-${pad(m)}-01T00:00:00+07:00`,
      end: `${y}-${pad(m)}-${pad(last)}T23:59:59+07:00`,
    };
  }
  if (range === "Year") {
    return { start: `${y}-01-01T00:00:00+07:00`, end: `${y}-12-31T23:59:59+07:00` };
  }
  return { start: "2000-01-01T00:00:00+07:00", end: `${today}T23:59:59+07:00` };
}

// อ่านวัน-เวลาจาก string ตรงๆ (แบบเดียวกับ parseStamp ใน readingsApi) -> "6 ต.ค. 2569 14:20 น."
function formatStamp(raw: string) {
  const m = raw.match(/(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
  if (!m) return raw;
  return `${+m[3]} ${MONTHS_TH_SHORT[+m[2] - 1]} ${+m[1] + 543} ${m[4]}:${m[5]} น.`;
}

export async function getPeakPower(deviceId: string, range: RangeMode) {
  const { start, end } = rangeBounds(range);

  const { data, error } = await supabase
    .from("energy_readings")
    .select("reading_time, power_kw")
    .eq("device_id", deviceId)
    .gte("reading_time", start)
    .lte("reading_time", end)
    .not("power_kw", "is", null)
    .order("power_kw", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return { value: Number(data.power_kw), time: formatStamp(data.reading_time) };
}