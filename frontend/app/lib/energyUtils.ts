
import { EnergyIngest } from '@/types/energy';

/**
 * คำนวณ ISO String ในเขตเวลาประเทศไทย (+07:00) ตามช่วงเวลาที่เลือก
 */
export function getTimeRangeIso(timeRange: string, selectedDate?: string) {
  const base = selectedDate ? new Date(selectedDate) : new Date();
  const year = base.getFullYear();
  const month = String(base.getMonth() + 1).padStart(2, '0');
  const day = String(base.getDate()).padStart(2, '0');

  // เวลาสิ้นสุดของวัน (23:59:59.999 +07:00)
  const endIso = `${year}-${month}-${day}T23:59:59.999+07:00`;

  const startBase = new Date(base);
  if (timeRange === '7d') {
    startBase.setDate(startBase.getDate() - 6);
  } else if (timeRange === '30d') {
    startBase.setDate(startBase.getDate() - 29);
  }

  const sYear = startBase.getFullYear();
  const sMonth = String(startBase.getMonth() + 1).padStart(2, '0');
  const sDay = String(startBase.getDate()).padStart(2, '0');

  // เวลาเริ่มต้นของวัน (00:00:00.000 +07:00)
  const startIso = `${sYear}-${sMonth}-${sDay}T00:00:00.000+07:00`;

  return { startIso, endIso };
}

/**
 * จัดกลุ่มข้อมูล (Bucket/Downsampling) เพื่อแก้ปัญหา
 * 1. ข้อมูลส่งทุก 1 นาทีทำให้จุดกราฟแน่นเกินไปใน 7d/30d
 * 2. อาคารที่มีหลายมิเตอร์ ให้รวมกำลังไฟฟ้า (Sum power_kw) ในเวลาเดียวกัน
 *
 * ค่า PF: เฉลี่ยเฉพาะแถวที่มีค่าจริง (> 0) ไม่นับ null เป็น 0
 */
export function processEnergyReadings(readings: EnergyIngest[], timeRange: string) {
  const map = new Map<
    string,
    {
      displayTime: string;
      fullTime: string;
      totalPowerKw: number;
      pfSum: number;
      pfCount: number;
      pfASum: number;
      pfACount: number;
      pfBSum: number;
      pfBCount: number;
      pfCSum: number;
      pfCCount: number;
    }
  >();

  readings.forEach((r) => {
    if (!r.reading_time) return;
    const date = new Date(r.reading_time);

    // กำหนดการตัดช่วงเวลาตาม timeRange
    let bucketKey: string;
    if (timeRange === '30d') {
      // รวมเป็นรายชั่วโมง (YYYY-MM-DD-HH)
      bucketKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${date.getHours()}`;
    } else if (timeRange === '7d') {
      // รวมทุก 15 นาที
      const roundedMinutes = Math.floor(date.getMinutes() / 15) * 15;
      bucketKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${date.getHours()}:${roundedMinutes}`;
    } else {
      // รายนาที (1 วัน)
      bucketKey = date.toISOString().substring(0, 16);
    }

    const kw = Number(r.power_kw ?? 0);

    // PF แต่ละเฟส: ใช้เฉพาะค่าที่ > 0
    const toPos = (v: unknown): number | null => {
      if (v === null || v === undefined) return null;
      const n = Number(v);
      return Number.isFinite(n) && n > 0 ? n : null;
    };
    const pfA = toPos(r.pf_a);
    const pfB = toPos(r.pf_b);
    const pfC = toPos(r.pf_c);

    // PF รวม: ใช้ power_factor ถ้ามี ไม่เช่นนั้นเฉลี่ยจากเฟสที่มีค่า
    const pfLegs = [pfA, pfB, pfC].filter((v): v is number => v !== null);
    const pf =
      toPos(r.power_factor) ??
      (pfLegs.length ? pfLegs.reduce((a, b) => a + b, 0) / pfLegs.length : null);

    const displayTime =
      timeRange === 'day'
        ? date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
        : date.toLocaleDateString('th-TH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    const fullTime = date.toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });

    let item = map.get(bucketKey);
    if (!item) {
      item = {
        displayTime,
        fullTime,
        totalPowerKw: 0,
        pfSum: 0,
        pfCount: 0,
        pfASum: 0,
        pfACount: 0,
        pfBSum: 0,
        pfBCount: 0,
        pfCSum: 0,
        pfCCount: 0,
      };
      map.set(bucketKey, item);
    }

    item.totalPowerKw += kw; // รวมค่า Power kW ของทุกมิเตอร์
    if (pf !== null) { item.pfSum += pf; item.pfCount += 1; }
    if (pfA !== null) { item.pfASum += pfA; item.pfACount += 1; }
    if (pfB !== null) { item.pfBSum += pfB; item.pfBCount += 1; }
    if (pfC !== null) { item.pfCSum += pfC; item.pfCCount += 1; }
  });

  const avg = (sum: number, count: number) =>
    count > 0 ? Number((sum / count).toFixed(2)) : null;

  return Array.from(map.values()).map((item) => ({
    time: item.displayTime,
    fullTime: item.fullTime,
    power_kw: Number(item.totalPowerKw.toFixed(2)),
    power_factor: avg(item.pfSum, item.pfCount),
    pf_a: avg(item.pfASum, item.pfACount),
    pf_b: avg(item.pfBSum, item.pfBCount),
    pf_c: avg(item.pfCSum, item.pfCCount),
  }));
}

