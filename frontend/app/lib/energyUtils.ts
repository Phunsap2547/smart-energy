// // src/utils/energyUtils.ts

// export interface ReadingItem {
//   reading_time: string;
//   energy_kwh: number | null;
//   power_kw?: number | null;
// }

// export interface TOUBreakdown {
//   onPeakKwh: number;
//   offPeakKwh: number;
//   onPeakPct: number;
//   offPeakPct: number;
//   estimatedCost: number;
// }

// // อัตราค่าไฟ TOU ปกติ (ปรับตามสัญญาจริงได้)
// const ON_PEAK_RATE = 4.3299;
// const OFF_PEAK_RATE = 2.6369;

// /**
//  * 1. ตรวจสอบว่าเป็นเวลา On-Peak หรือไม่
//  * On-Peak: จันทร์ - ศุกร์ เวลา 09:00 - 22:00 น.
//  * Off-Peak: เสาร์ - อาทิตย์, วันหยุดราชการ และ เวลา 22:00 - 09:00 น. ของวันธรรมดา
//  */
// export function isOnPeak(dateStr: string): boolean {
//   const date = new Date(dateStr);
//   const day = date.getDay(); // 0 = Sunday, 6 = Saturday
//   const hour = date.getHours();

//   // เสาร์ - อาทิตย์
//   if (day === 0 || day === 6) return false;

//   // จันทร์ - ศุกร์ ช่วง 09:00 - 21:59 น.
//   return hour >= 9 && hour < 22;
// }

// /**
//  * 2. คำนวณสัดส่วน On-Peak / Off-Peak และประมาณการค่าไฟ TOU
//  */
// export function calculateTOU(dailyKwh: number, readings: ReadingItem[]): TOUBreakdown {
//   if (!readings || readings.length === 0 || dailyKwh <= 0) {
//     return { onPeakKwh: 0, offPeakKwh: 0, onPeakPct: 0, offPeakPct: 0, estimatedCost: 0 };
//   }

//   let onPeakCount = 0;
//   let totalCount = 0;

//   readings.forEach((r) => {
//     if (r.reading_time) {
//       totalCount++;
//       if (isOnPeak(r.reading_time)) {
//         onPeakCount++;
//       }
//     }
//   });

//   const onPeakRatio = totalCount > 0 ? onPeakCount / totalCount : 0.6; // Default ~60% หากข้อมูลไม่พอ
//   const offPeakRatio = 1 - onPeakRatio;

//   const onPeakKwh = dailyKwh * onPeakRatio;
//   const offPeakKwh = dailyKwh * offPeakRatio;

//   const estimatedCost = (onPeakKwh * ON_PEAK_RATE) + (offPeakKwh * OFF_PEAK_RATE);

//   return {
//     onPeakKwh,
//     offPeakKwh,
//     onPeakPct: Math.round(onPeakRatio * 100),
//     offPeakPct: Math.round(offPeakRatio * 100),
//     estimatedCost,
//   };
// }

// /**
//  * 3. จัดกลุ่มข้อมูลสำหรับแสดงผลบนแกน X ของกราฟแท่ง (Dynamic Resolution)
//  */
// export function formatChartDataByRange(readings: ReadingItem[], range: 'day' | '7d' | '30d' | 'month' | 'year') {
//   if (!readings || readings.length === 0) return [];

//   // เรียงลำดับเวลาจากเก่าไปใหม่
//   const sorted = [...readings].sort(
//     (a, b) => new Date(a.reading_time).getTime() - new Date(b.reading_time).getTime()
//   );

//   const grouped: { [key: string]: number } = {};

//   sorted.forEach((item) => {
//     const d = new Date(item.reading_time);
//     let label = '';

//     switch (range) {
//       case 'day':
//         // แสดงเป็นรายชั่วโมง: "00:00", "01:00", ... "23:00"
//         label = `${String(d.getHours()).padStart(2, '0')}:00`;
//         break;
//       case '7d':
//       case '30d':
//       case 'month':
//         // แสดงเป็นรายวัน: "25/09", "26/09"
//         label = `${d.getDate()}/${d.getMonth() + 1}`;
//         break;
//       case 'year':
//         // แสดงเป็นรายเดือน: "ม.ค.", "ก.พ."
//         label = d.toLocaleDateString('th-TH', { month: 'short' });
//         break;
//     }

//     const val = item.power_kw ?? item.energy_kwh ?? 0;
//     grouped[label] = (grouped[label] || 0) + val;
//   });

//   return Object.keys(grouped).map((key) => ({
//     timeLabel: key,
//     value: parseFloat(grouped[key].toFixed(2)),
//   }));
// }

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
 */
export function processEnergyReadings(readings: EnergyIngest[], timeRange: string) {
  const map = new Map<
    string,
    {
      displayTime: string;
      fullTime: string;
      totalPowerKw: number;
      pfSum: number;
      pfASum: number;
      pfBSum: number;
      pfCSum: number;
      count: number;
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
    const pf = Number(r.power_factor ?? 0);
    const pfA = Number(r.pf_a ?? 0);
    const pfB = Number(r.pf_b ?? 0);
    const pfC = Number(r.pf_c ?? 0);

    const displayTime =
      timeRange === 'day'
        ? date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
        : date.toLocaleDateString('th-TH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    const fullTime = date.toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });

    if (map.has(bucketKey)) {
      const item = map.get(bucketKey)!;
      item.totalPowerKw += kw; // รวมค่า Power kW
      item.pfSum += pf;
      item.pfASum += pfA;
      item.pfBSum += pfB;
      item.pfCSum += pfC;
      item.count += 1;
    } else {
      map.set(bucketKey, {
        displayTime,
        fullTime,
        totalPowerKw: kw,
        pfSum: pf,
        pfASum: pfA,
        pfBSum: pfB,
        pfCSum: pfC,
        count: 1,
      });
    }
  });

  return Array.from(map.values()).map((item) => ({
    time: item.displayTime,
    fullTime: item.fullTime,
    power_kw: Number(item.totalPowerKw.toFixed(2)),
    power_factor: Number((item.pfSum / item.count).toFixed(2)),
    pf_a: Number((item.pfASum / item.count).toFixed(2)),
    pf_b: Number((item.pfBSum / item.count).toFixed(2)),
    pf_c: Number((item.pfCSum / item.count).toFixed(2)),
  }));
}