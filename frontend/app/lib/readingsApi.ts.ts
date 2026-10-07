// lib/readingsApi.ts
// ดึงข้อมูลจาก Supabase ตรงๆ (แบบเดียวกับ DailyEnergyChart) ไม่ต้องผ่าน Express
import { supabase } from "@/lib/supabase";
import { formatChartTime } from "@/lib/formatter";

export type RangeMode = "Day" | "Month" | "Year" | "Total";

const TZ = "Asia/Bangkok";
const pad = (n: number) => String(n).padStart(2, "0");
const MONTHS_TH_SHORT = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

const fmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  hourCycle: "h23",
});

// แปลงเวลาเป็นเวลาไทย (ไม่ขึ้นกับ timezone ของเครื่อง)
function thaiParts(d: Date) {
  const p: Record<string, string> = {};
  fmt.formatToParts(d).forEach((x) => (p[x.type] = x.value));
  return { y: +p.year, m: +p.month, d: +p.day, h: +p.hour };
}


// อ่าน y/m/d/h จาก string ตรงๆ (reading_time เก็บเป็นเวลาไทยอยู่แล้ว) ไม่ให้ JS แปลง timezone ซ้ำ
function parseStamp(raw: string) {
  const m = raw.match(/(\d{4})-(\d{2})-(\d{2})[T ](\d{2})/);
  if (m) return { y: +m[1], m: +m[2], d: +m[3], h: +m[4] };
  return thaiParts(new Date(raw));
}

// 1) Active Power (kW) ทั้งวันนี้ -> ActivePowerChart
export async function getPowerChart(deviceId: string) {
  const t = thaiParts(new Date());
  const startOfToday = `${t.y}-${pad(t.m)}-${pad(t.d)}T00:00:00+07:00`;

  // Pagination (Supabase จำกัด 1000 แถว/ครั้ง)
  const pageSize = 1000;
  let page = 0;
  const all: { reading_time: string; power_kw: number | null }[] = [];

  while (true) {
    const { data, error } = await supabase
      .from("energy_readings")
      .select("reading_time, power_kw")
      .eq("device_id", deviceId)
      .gte("reading_time", startOfToday)
      .order("reading_time", { ascending: true })
      .range(page * pageSize, page * pageSize + pageSize - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < pageSize) break;
    page++;
  }

  // รวมเป็น 1 ค่า/นาที (ใช้ค่าล่าสุดของนาทีนั้น)
  const perMinute = new Map<string, number>();
  for (const r of all) {
    perMinute.set(formatChartTime(r.reading_time), Number(r.power_kw ?? 0));
  }

  return [...perMinute].map(([label, cost]) => ({ label, cost }));
}

// 2) ค่าล่าสุด + พลังงานวันนี้ (kWh)
export async function getLatestReading(deviceId: string) {
  const { data: latest, error } = await supabase
    .from("energy_readings")
    .select("*")
    .eq("device_id", deviceId)
    .order("reading_time", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!latest) return null;

  const t = thaiParts(new Date());
  const startOfToday = `${t.y}-${pad(t.m)}-${pad(t.d)}T00:00:00+07:00`;

  const { data: first, error: e2 } = await supabase
    .from("energy_readings")
    .select("energy_kwh")
    .eq("device_id", deviceId)
    .gte("reading_time", startOfToday)
    .not("energy_kwh", "is", null)
    .order("reading_time", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (e2) throw e2;

  const current = Number(latest.energy_kwh) || 0;
  const startEnergy = first?.energy_kwh != null ? Number(first.energy_kwh) : current;

  return {
    ...latest,
    daily_energy_kwh: Number(Math.max(0, current - startEnergy).toFixed(2)),
  };
}

// 3) พลังงานที่ใช้ (kWh) = Max - Min ต่อช่วง -> TotalEnergyChart
export async function getEnergyByRange(deviceId: string, range: RangeMode, offset = 0) {
  // offset: 0 = ช่วงปัจจุบัน, 1 = ช่วงก่อนหน้า (เมื่อวาน / เดือนก่อน / ปีก่อน)
  const real = thaiParts(new Date());
  let now = real;
  if (offset > 0) {
    if (range === "Total") return [];
    if (range === "Day") {
      const t = new Date(Date.UTC(real.y, real.m - 1, real.d - offset));
      now = { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate(), h: 0 };
    } else if (range === "Month") {
      const t = new Date(Date.UTC(real.y, real.m - 1 - offset, 1));
      now = { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: 1, h: 0 };
    } else {
      now = { ...real, y: real.y - offset };
    }
  }
  let start: string;
  let end: string;
  const groups: Record<string, { label: string; min: number | null; max: number | null }> = {};

  if (range === "Day") {
    const ds = `${now.y}-${pad(now.m)}-${pad(now.d)}`;
    start = `${ds}T00:00:00+07:00`;
    end = `${ds}T23:59:59+07:00`;
    for (let h = 0; h < 24; h++) groups[pad(h)] = { label: `${pad(h)}:00`, min: null, max: null };
  } else if (range === "Month") {
    const last = new Date(now.y, now.m, 0).getDate();
    start = `${now.y}-${pad(now.m)}-01T00:00:00+07:00`;
    end = `${now.y}-${pad(now.m)}-${pad(last)}T23:59:59+07:00`;
    for (let d = 1; d <= last; d++) groups[pad(d)] = { label: `${d}/${now.m}`, min: null, max: null };
  } else if (range === "Year") {
    start = `${now.y}-01-01T00:00:00+07:00`;
    end = `${now.y}-12-31T23:59:59+07:00`;
    for (let m = 1; m <= 12; m++) groups[pad(m)] = { label: MONTHS_TH_SHORT[m - 1], min: null, max: null };
  } else {
    start = "2000-01-01T00:00:00+07:00";
    end = `${now.y}-${pad(now.m)}-${pad(now.d)}T23:59:59+07:00`;
  }

  // Pagination (Supabase จำกัด 1000 แถว/ครั้ง)
  const pageSize = 1000;
  let page = 0;
  const all: { reading_time: string; energy_kwh: number }[] = [];
  while (true) {
    const { data, error } = await supabase
      .from("energy_readings")
      .select("reading_time, energy_kwh")
      .eq("device_id", deviceId)
      .gte("reading_time", start)
      .lte("reading_time", end)
      .not("energy_kwh", "is", null)
      .order("reading_time", { ascending: true })
      .range(page * pageSize, page * pageSize + pageSize - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < pageSize) break;
    page++;
  }

  for (const r of all) {
    const p = parseStamp(r.reading_time);
    const key =
      range === "Day" ? pad(p.h)
      : range === "Month" ? pad(p.d)
      : range === "Year" ? pad(p.m)
      : `${p.y}-${pad(p.m)}`;

    if (!groups[key]) {
      groups[key] = { label: range === "Total" ? `${MONTHS_TH_SHORT[p.m - 1]} ${p.y + 543}` : key, min: null, max: null };
    }
    const v = Number(r.energy_kwh);
    const g = groups[key];
    g.min = g.min === null ? v : Math.min(g.min, v);
    g.max = g.max === null ? v : Math.max(g.max, v);
  }

  return Object.keys(groups)
    .sort()
    .map((k) => {
      const g = groups[k];
      const diff = g.min !== null && g.max !== null ? Math.max(0, g.max - g.min) : 0;
      return { label: g.label, energy: Number(diff.toFixed(2)) };
    });
}

// 4) เทียบช่วงนี้กับช่วงก่อนหน้า -> EnergyConsumptionChart ({ label, today, yesterday })
export async function getEnergyCompare(deviceId: string, range: RangeMode) {
  const [cur, prev] = await Promise.all([
    getEnergyByRange(deviceId, range, 0),
    getEnergyByRange(deviceId, range, 1),
  ]);

  const real = thaiParts(new Date());
  // index สุดท้ายที่ "ถึงเวลาแล้ว" ของช่วงปัจจุบัน (ช่วงอนาคตจะไม่วาดเส้น)
  const cutoff =
    range === "Day" ? real.h
    : range === "Month" ? real.d - 1
    : range === "Year" ? real.m - 1
    : Infinity;

  return cur.map((c, i) => ({
    label: c.label,
    today: i > cutoff ? null : c.energy,
    yesterday: prev[i]?.energy ?? 0,
  }));
}