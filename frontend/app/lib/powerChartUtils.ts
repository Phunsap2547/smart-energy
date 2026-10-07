// lib/powerChartUtils.ts
// ฟังก์ชันช่วยแปลงข้อมูลสำหรับกราฟ Power Real-time (ไม่มี React / ไม่ยิง API)
import type { RangeMode } from "@/lib/readingsApi.ts";

export type PowerPoint = { label: string; cost: number };
export type PowerPointOrNull = { label: string; cost: number | null };
export type EnergyComparePoint = { label: string; today: number | null; yesterday: number };

// เติมเวลาให้ครบทั้งวัน (00:00 - 23:59) นาทีที่ไม่มีข้อมูลเป็น null
export function formatFullDayPowerData(rawData: PowerPoint[]): PowerPointOrNull[] {
  const dataMap = new Map<string, number>();
  rawData?.forEach((d) => dataMap.set(d.label, d.cost));

  const result: PowerPointOrNull[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m++) {
      const label = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      result.push({ label, cost: dataMap.has(label) ? dataMap.get(label)! : null });
    }
  }
  return result;
}

// จำนวนชั่วโมงของแต่ละ bucket เพื่อแปลง kWh -> kW เฉลี่ย
// Day = รายชั่วโมง (1) / Month = รายวัน (24) / Year = รายเดือน (วันในเดือน x 24) / Total = ประมาณ 30 วัน
export function bucketHours(range: RangeMode, index: number): number {
  const now = new Date();
  if (range === "Day") return 1;
  if (range === "Month") return 24;
  if (range === "Year") return new Date(now.getFullYear(), index + 1, 0).getDate() * 24;
  return 30 * 24;
}

// Month / Year / Total: แปลง kWh ต่อ bucket เป็น kW เฉลี่ย
export function toAveragePowerData(
  energyCompare: EnergyComparePoint[],
  range: RangeMode
): PowerPointOrNull[] {
  return energyCompare.map((d, i) => ({
    label: d.label,
    cost: d.today === null ? null : Number((d.today / bucketHours(range, i)).toFixed(2)),
  }));
}
