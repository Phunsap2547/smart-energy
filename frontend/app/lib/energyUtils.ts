
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


// import { EnergyIngest } from '@/types/energy';

// export function processEnergyReadings(readings: EnergyIngest[], timeRange: string) {
//   if (!readings || readings.length === 0) return [];

//   // ==========================================
//   // PASS 1: รวมค่าจากหลายมิเตอร์ในอาคารเดียวกัน ณ เวลาเดียวกัน (Sum per Timestamp)
//   // ==========================================
//   const timestampMap = new Map<
//     string, // ใช้ ISO string หรือ timestamp
//     {
//       time: Date;
//       totalPowerKw: number;
//       pfSum: number;
//       pfCount: number;
//       pfASum: number;
//       pfACount: number;
//       pfBSum: number;
//       pfBCount: number;
//       pfCSum: number;
//       pfCCount: number;
//     }
//   >();

//   readings.forEach((r) => {
//     const timeStr = r.reading_time || r.created_at;
//     if (!timeStr) return;

//     const date = new Date(timeStr);
//     // Key ของเวลาเดียวกัน (ตัด MS เพื่อให้อยู่ในนาที/วินาทีเดียวกัน)
//     const timeKey = date.toISOString();

//     const kw = Number(r.power_kw ?? 0);

//     const toPos = (v: unknown): number | null => {
//       if (v === null || v === undefined) return null;
//       const n = Number(v);
//       return Number.isFinite(n) && n > 0 ? n : null;
//     };

//     const pfA = toPos(r.pf_a);
//     const pfB = toPos(r.pf_b);
//     const pfC = toPos(r.pf_c);
//     const pfLegs = [pfA, pfB, pfC].filter((v): v is number => v !== null);
//     const pf =
//       toPos(r.power_factor) ??
//       (pfLegs.length ? pfLegs.reduce((a, b) => a + b, 0) / pfLegs.length : null);

//     let snapshot = timestampMap.get(timeKey);
//     if (!snapshot) {
//       snapshot = {
//         time: date,
//         totalPowerKw: 0,
//         pfSum: 0,
//         pfCount: 0,
//         pfASum: 0,
//         pfACount: 0,
//         pfBSum: 0,
//         pfBCount: 0,
//         pfCSum: 0,
//         pfCCount: 0,
//       };
//       timestampMap.set(timeKey, snapshot);
//     }

//     // รวม Power (kW) ของทุกมิเตอร์ ณ เวลานั้นเข้าด้วยกัน
//     snapshot.totalPowerKw += kw;

//     if (pf !== null) { snapshot.pfSum += pf; snapshot.pfCount += 1; }
//     if (pfA !== null) { snapshot.pfASum += pfA; snapshot.pfACount += 1; }
//     if (pfB !== null) { snapshot.pfBSum += pfB; snapshot.pfBCount += 1; }
//     if (pfC !== null) { snapshot.pfCSum += pfC; snapshot.pfCCount += 1; }
//   });

//   // ==========================================
//   // PASS 2: จัดกลุ่มข้อมูลลง Bucket (Downsampling) ตาม timeRange
//   // ==========================================
//   const bucketMap = new Map<
//     string,
//     {
//       timestamp: number;
//       displayTime: string;
//       fullTime: string;
//       powerKwSum: number;
//       powerKwCount: number;
//       pfSum: number;
//       pfCount: number;
//       pfASum: number;
//       pfACount: number;
//       pfBSum: number;
//       pfBCount: number;
//       pfCSum: number;
//       pfCCount: number;
//     }
//   >();

//   // เรียงลำดับเวลาล่วงหน้า
//   const aggregatedSnapshots = Array.from(timestampMap.values()).sort(
//     (a, b) => a.time.getTime() - b.time.getTime()
//   );

//   aggregatedSnapshots.forEach((snap) => {
//     const date = snap.time;
//     const pad = (n: number) => String(n).padStart(2, '0');
//     const year = date.getFullYear();
//     const month = pad(date.getMonth() + 1);
//     const day = pad(date.getDate());
//     const hours = pad(date.getHours());

//     let bucketKey: string;
//     if (timeRange === '30d') {
//       // รายชั่วโมง (YYYY-MM-DD HH:00)
//       bucketKey = `${year}-${month}-${day} ${hours}:00`;
//     } else if (timeRange === '7d') {
//       // ทุก 15 นาที
//       const roundedMinutes = pad(Math.floor(date.getMinutes() / 15) * 15);
//       bucketKey = `${year}-${month}-${day} ${hours}:${roundedMinutes}`;
//     } else {
//       // รายนาที (1d)
//       const minutes = pad(date.getMinutes());
//       bucketKey = `${year}-${month}-${day} ${hours}:${minutes}`;
//     }

//     const displayTime =
//       timeRange === 'day' || timeRange === '1d'
//         ? date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
//         : date.toLocaleDateString('th-TH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

//     const fullTime = date.toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });

//     let bucket = bucketMap.get(bucketKey);
//     if (!bucket) {
//       bucket = {
//         timestamp: date.getTime(),
//         displayTime,
//         fullTime,
//         powerKwSum: 0,
//         powerKwCount: 0,
//         pfSum: 0,
//         pfCount: 0,
//         pfASum: 0,
//         pfACount: 0,
//         pfBSum: 0,
//         pfBCount: 0,
//         pfCSum: 0,
//         pfCCount: 0,
//       };
//       bucketMap.set(bucketKey, bucket);
//     }

//     // นำค่าพลังงานรวมของอาคาร ณ เวลานั้นไปเฉลี่ยต่อใน Bucket
//     bucket.powerKwSum += snap.totalPowerKw;
//     bucket.powerKwCount += 1;

//     if (snap.pfCount > 0) { bucket.pfSum += snap.pfSum / snap.pfCount; bucket.pfCount += 1; }
//     if (snap.pfACount > 0) { bucket.pfASum += snap.pfASum / snap.pfACount; bucket.pfACount += 1; }
//     if (snap.pfBCount > 0) { bucket.pfBSum += snap.pfBSum / snap.pfBCount; bucket.pfBCount += 1; }
//     if (snap.pfCCount > 0) { bucket.pfCSum += snap.pfCSum / snap.pfCCount; bucket.pfCCount += 1; }
//   });

//   const avg = (sum: number, count: number) =>
//     count > 0 ? Number((sum / count).toFixed(2)) : null;

//   return Array.from(bucketMap.values()).map((item) => ({
//     time: item.displayTime,
//     fullTime: item.fullTime,
//     power_kw: avg(item.powerKwSum, item.powerKwCount) ?? 0,
//     power_factor: avg(item.pfSum, item.pfCount),
//     pf_a: avg(item.pfASum, item.pfACount),
//     pf_b: avg(item.pfBSum, item.pfBCount),
//     pf_c: avg(item.pfCSum, item.pfCCount),
//   }));
// }