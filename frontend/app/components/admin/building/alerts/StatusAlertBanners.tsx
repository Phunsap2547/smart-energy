// // components/admin/building/alerts/StatusAlertBanners.tsx
// 'use client';

// import React from 'react';
// import { AlertTriangle } from 'lucide-react';
// import { formatNumber } from '@/lib/formatter';
// import { useDeviceStatus } from '@/hooks/useDeviceStatus';

// interface StatusAlertBannersProps {
//   status: ReturnType<typeof useDeviceStatus>;
// }

// export default function StatusAlertBanners({ status }: StatusAlertBannersProps) {
//   const {
//     isOffline,
//     diffMinutes,
//     lastDate,
//     hasAnyAnomaly,
//     isPfAnomaly,
//     pf,
//     isVoltageAnomaly,
//     voltage,
//     isCurrentAnomaly,
//     current,
//     isFreqAnomaly,
//     freq,
//   } = status;

//   const lastTimeString =
//     lastDate && !isNaN(lastDate.getTime())
//       ? lastDate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.'
//       : '-';

//   const displayTimeDiff =
//     diffMinutes >= 60
//       ? `${Math.floor(diffMinutes / 60)} ชม. ${diffMinutes % 60} นาที`
//       : `${diffMinutes} นาที`;

//   if (!isOffline && !hasAnyAnomaly) return null;

//   return (
//     <div className="space-y-3">
//       {/* BANNER 1: OFFLINE / ไฟดับ */}
//       {isOffline && (
//         <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl text-red-900 shadow-sm">
//           <div className="flex items-center gap-3">
//             <AlertTriangle className="text-red-600 shrink-0" size={22} />
//             <div>
//               <h4 className="font-bold text-sm text-red-800">
//                 ⚡ คาดว่าระบบไฟดับ / สัญญาณขาดหาย (Offline)
//               </h4>
//               <p className="text-xs text-red-700 mt-0.5">
//                 ไม่ได้รับข้อมูลส่งเข้ามานานเกิน {displayTimeDiff} (อัปเดตล่าสุดเมื่อ {lastTimeString})
//               </p>
//             </div>
//           </div>
//           <span className="text-xs font-semibold px-3 py-1 bg-red-100 text-red-700 rounded-lg shrink-0">
//             ระบบถูกปรับค่ากระแสเป็น 0 A
//           </span>
//         </div>
//       )}

//       {/* BANNER 2: ค่าไฟฟ้าผิดปกติ (กรณี Online) */}
//       {!isOffline && hasAnyAnomaly && (
//         <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 shadow-sm">
//           <div className="flex items-center gap-3">
//             <AlertTriangle className="text-amber-600 shrink-0" size={20} />
//             {/* <span className="font-medium text-sm">
//               พบค่าความผิดปกติในระบบไฟฟ้า —{' '}
//               {isPfAnomaly && `Power factor รวมต่ำ (${formatNumber(pf, 2)}) `}
//               {isVoltageAnomaly && `แรงดันไม่อยู่ในช่วง 220-240V (${formatNumber(voltage, 1)}V) `}
//               {isCurrentAnomaly && `กระแสเกินเกณฑ์ (${formatNumber(current, 1)}A) `}
//               {isFreqAnomaly && `ความถี่ไม่อยู่ในช่วง 49-51Hz (${formatNumber(freq, 1)}Hz) `}
//               — ควรตรวจสอบโหลด
//             </span> */}
//             {/* <span className="font-medium text-sm">
//               พบค่าความผิดปกติในระบบไฟฟ้า:
//               {isPfAnomaly && ` • Power Factor ต่ำกว่าเกณฑ์ (${formatNumber(pf, 2)} / เกณฑ์ปกติ ≥ 0.85)`}
//               {isVoltageAnomaly && ` • แรงดันไม่อยู่ในช่วงปกติ (${formatNumber(voltage, 1)}V / เกณฑ์ปกติ 220–240V)`}
//               {isCurrentAnomaly && ` • กระแสสูงเกินเกณฑ์ (${formatNumber(current, 1)}A)`}
//               {isFreqAnomaly && ` • ความถี่ไม่อยู่ในช่วงปกติ (${formatNumber(freq, 1)}Hz / เกณฑ์ปกติ 49–51Hz)`}
//             </span> */}
//             <span className="font-medium text-sm">
//               พบค่าความผิดปกติในระบบไฟฟ้า —{' '}
//               {isPfAnomaly && `Power factor รวมต่ำ (${formatNumber(pf, 2)}) `}
//               {isVoltageAnomaly && (
//                 voltage < 22
//                   ? `ไฟดับ (${formatNumber(voltage, 1)}V) `
//                   : `แรงดันไม่อยู่ในช่วงปกติ 220-240V (${formatNumber(voltage, 1)}V) `
//               )}
//               {isCurrentAnomaly && `กระแสเกินเกณฑ์ (${formatNumber(current, 1)}A) `}
//               {isFreqAnomaly && `ความถี่ไม่อยู่ในช่วง 49-51Hz (${formatNumber(freq, 1)}Hz) `}
//               — ควรตรวจสอบโหลด
//             </span>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


// // components/admin/building/alerts/StatusAlertBanners.tsx
// 'use client';

// import React from 'react';
// import { AlertTriangle, Loader2, ZapOff } from 'lucide-react';
// import { formatNumber } from '@/lib/formatter';
// import { useDeviceStatus } from '@/hooks/useDeviceStatus';

// interface StatusAlertBannersProps {
//   status: ReturnType<typeof useDeviceStatus>;
// }

// export default function StatusAlertBanners({ status }: StatusAlertBannersProps) {
//   const {
//     isOffline,
//     isStale,
//     silentSec,
//     isPowerOutage,
//     diffMinutes,
//     lastDate,
//     hasAnyAnomaly,
//     isPfAnomaly,
//     pf,
//     isVoltageAnomaly,
//     voltage,
//     isCurrentAnomaly,
//     current,
//     isFreqAnomaly,
//     freq,
//   } = status;

//   // ไฟดับ/ค่าเป็น 0 ทุกเฟส (เฉพาะตอนข้อมูลสด ไม่ใช่ตอนข้อมูลค้าง)
//   const isZeroData =
//     !isOffline && !isStale && (isPowerOutage || (voltage === 0 && current === 0));

//   const lastTimeString =
//     lastDate && !isNaN(lastDate.getTime())
//       ? lastDate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.'
//       : '-';

//   const displayTimeDiff =
//     diffMinutes >= 60
//       ? `${Math.floor(diffMinutes / 60)} ชม. ${diffMinutes % 60} นาที`
//       : `${diffMinutes} นาที`;

//   const silentText =
//     silentSec >= 3600
//       ? `${Math.floor(silentSec / 3600)} ชม. ${Math.floor((silentSec % 3600) / 60)} นาที`
//       : silentSec >= 60
//       ? `${Math.floor(silentSec / 60)} นาที ${silentSec % 60} วินาที`
//       : `${silentSec} วินาที`;

//   if (!isOffline && !isStale && !hasAnyAnomaly && !isZeroData) return null;

//   return (
//     <div className="space-y-3">
//       {/* BANNER 1: OFFLINE (ขาดการส่งสัญญาณเป็นเวลานาน) */}
//       {isOffline && (
//         <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl text-red-900 shadow-sm">
//           <div className="flex items-center gap-3">
//             <ZapOff className="text-red-600 shrink-0 animate-bounce" size={22} />
//             <div>
//               <h4 className="font-bold text-sm text-red-800">
//                 ⚡ คาดว่าระบบไฟดับ / สัญญาณขาดหาย (Offline)
//               </h4>
//               <p className="text-xs text-red-700 mt-0.5">
//                 ไม่ได้รับข้อมูลส่งเข้ามานานเกิน {displayTimeDiff} (อัปเดตล่าสุดเมื่อ {lastTimeString})
//               </p>
//             </div>
//           </div>
//           <span className="text-xs font-semibold px-3 py-1 bg-red-100 text-red-700 rounded-lg shrink-0">
//             ปรับค่ากระแสเป็น 0 A
//           </span>
//         </div>
//       )}

//       {/* BANNER 2: ข้อมูลค้าง (กำลังรอข้อมูลใหม่) */}
//       {isStale && (
//         <div className="flex items-center justify-between p-4 bg-sky-50 border border-sky-200 rounded-xl text-sky-950 shadow-sm">
//           <div className="flex items-center gap-3">
//             <Loader2 className="text-sky-600 shrink-0 animate-spin" size={22} />
//             <div>
//               <div className="flex items-center gap-2 flex-wrap">
//                 <h4 className="font-bold text-sm text-sky-900">
//                   🔍 กำลังวิเคราะห์ข้อมูล — ไม่ได้รับข้อมูลใหม่มาแล้ว {silentText}
//                 </h4>
//                 <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full border border-sky-200">
//                   <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping" />
//                   รอข้อมูลใหม่...
//                 </span>
//               </div>
//               <p className="text-xs text-sky-700 mt-1">
//                 ค่าที่แสดงบนหน้าเป็นข้อมูลล่าสุดเมื่อ {lastTimeString} ไม่ใช่ค่า ณ ปัจจุบัน
//               </p>
//             </div>
//           </div>
//           <div className="text-right shrink-0 hidden sm:block">
//             <span className="text-xs font-medium text-sky-600 block">ข้อมูลล่าสุดเมื่อ</span>
//             <span className="text-xs font-bold text-sky-900">{lastTimeString}</span>
//           </div>
//         </div>
//       )}

//       {/* BANNER 3: ZERO DATA / ไฟดับทันทีเมื่อตรวจพบค่าไฟฟ้าเป็น 0 (ข้อมูลสด) */}
//       {!isOffline && !isStale && isZeroData && (
//         <div className="flex items-center justify-between p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-950 shadow-sm">
//           <div className="flex items-center gap-3">
//             <ZapOff className="text-rose-600 shrink-0 animate-pulse" size={22} />
//             <div>
//               <div className="flex items-center gap-2 flex-wrap">
//                 <h4 className="font-bold text-sm text-rose-900">
//                   ⚡ ตรวจพบเหตุการณ์ไฟดับ / ค่าไฟฟ้าเป็น 0 (Power Outage)
//                 </h4>
//                 <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full border border-rose-200">
//                   <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
//                   ตรวจพบทันที
//                 </span>
//               </div>
//               <p className="text-xs text-rose-700 mt-1">
//                 ตรวจพบแรงดันหรือกระแสไฟฟ้าเป็น 0 ในระบบจริง (อัปเดตล่าสุด {lastTimeString})
//               </p>
//             </div>
//           </div>
//           <div className="text-right shrink-0 hidden sm:block">
//             <span className="text-xs font-medium text-rose-600 block">อัปเดตล่าสุด</span>
//             <span className="text-xs font-bold text-rose-900">{lastTimeString}</span>
//           </div>
//         </div>
//       )}

//       {/* BANNER 4: ค่าผิดปกติ (ข้อมูลสด ไม่ใช่ Zero Data) */}
//       {!isOffline && !isStale && !isZeroData && hasAnyAnomaly && (
//         <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 shadow-sm">
//           <div className="flex items-center gap-3">
//             <AlertTriangle className="text-amber-600 shrink-0" size={20} />
//             <span className="font-medium text-sm">
//               พบค่าความผิดปกติในระบบไฟฟ้า —{' '}
//               {isPfAnomaly && `Power factor รวมต่ำ (${formatNumber(pf, 2)}) `}
//               {isVoltageAnomaly && `แรงดันไม่อยู่ในช่วงปกติ 220-240V (${formatNumber(voltage, 1)}V) `}
//               {isCurrentAnomaly && `กระแสเกินเกณฑ์ (${formatNumber(current, 1)}A) `}
//               {isFreqAnomaly && `ความถี่ไม่อยู่ในช่วง 49-51Hz (${formatNumber(freq, 1)}Hz) `}
//               — ควรตรวจสอบโหลด
//             </span>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


// components/admin/building/alerts/StatusAlertBanners.tsx
'use client';

import React from 'react';
import { AlertTriangle, Loader2, ZapOff, Activity } from 'lucide-react';
import { formatNumber } from '@/lib/formatter';
import { useDeviceStatus } from '@/hooks/useDeviceStatus';

interface StatusAlertBannersProps {
  status: ReturnType<typeof useDeviceStatus>;
}

export default function StatusAlertBanners({ status }: StatusAlertBannersProps) {
  const {
    isOffline,
    isStale,
    isMeterError, // <-- รับสถานะอ่านมิเตอร์ไม่ได้เพิ่มเข้ามา
    silentSec,
    isPowerOutage,
    diffMinutes,
    lastDate,
    hasAnyAnomaly,
    isPfAnomaly,
    pf,
    isVoltageAnomaly,
    voltage,
    voltMin,
    voltMax,
    isCurrentAnomaly,
    current,
    isFreqAnomaly,
    freq,
  } = status;

  // ไฟดับจริง: บอร์ดต้องอ่านมิเตอร์ได้ปกติ (isMeterError เป็น false) แต่แรงดันเป็น 0 V
  const isZeroData =
    !isOffline && !isStale && !isMeterError && (isPowerOutage || (voltage === 0 && voltage !== null));

  const lastTimeString =
    lastDate && !isNaN(lastDate.getTime())
      ? lastDate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.'
      : '-';

  const displayTimeDiff =
    diffMinutes >= 60
      ? `${Math.floor(diffMinutes / 60)} ชม. ${diffMinutes % 60} นาที`
      : `${diffMinutes} นาที`;

  const silentText =
    silentSec >= 3600
      ? `${Math.floor(silentSec / 3600)} ชม. ${Math.floor((silentSec % 3600) / 60)} นาที`
      : silentSec >= 60
      ? `${Math.floor(silentSec / 60)} นาที ${silentSec % 60} วินาที`
      : `${silentSec} วินาที`;

  if (!isOffline && !isStale && !isMeterError && !hasAnyAnomaly && !isZeroData) return null;

  return (
    <div className="space-y-3">
      {/* BANNER 1: OFFLINE (ขาดการส่งสัญญาณจากบอร์ด) */}
      {isOffline && (
        <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl text-red-900 shadow-sm">
          <div className="flex items-center gap-3">
            <ZapOff className="text-red-600 shrink-0 animate-bounce" size={22} />
            <div>
              <h4 className="font-bold text-sm text-red-800">
                ⚡ คาดว่าระบบไฟดับ / สัญญาณขาดหาย (Offline)
              </h4>
              <p className="text-xs text-red-700 mt-0.5">
                ไม่ได้รับข้อมูลส่งเข้ามานานเกิน {displayTimeDiff} (อัปเดตล่าสุดเมื่อ {lastTimeString})
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-red-100 text-red-700 rounded-lg shrink-0">
            บอร์ดออฟไลน์
          </span>
        </div>
      )}

      {/* BANNER 2: METER ERROR (บอร์ดออนไลน์ แต่อ่านค่าจากมิเตอร์ไม่ได้) */}
      {!isOffline && isMeterError && (
        <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-xl text-orange-950 shadow-sm">
          <div className="flex items-center gap-3">
            <Activity className="text-orange-600 shrink-0 animate-pulse" size={22} />
            <div>
              <h4 className="font-bold text-sm text-orange-900">
                ⚠️ บอร์ดออนไลน์ แต่อ่านค่าจากมิเตอร์ไม่ได้ (Meter Error)
              </h4>
              <p className="text-xs text-orange-700 mt-0.5">
                สัญญาณเน็ตปกติ แต่ระบบสื่อสาร Modbus/RS-485 มีปัญหา กรุณาเช็กสายสัญญาณ A/B หรือไฟเลี้ยงมิเตอร์
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-orange-100 text-orange-800 rounded-lg shrink-0">
            ตรวจสาย RS-485
          </span>
        </div>
      )}

      {/* BANNER 3: ข้อมูลค้าง (กำลังรอข้อมูลใหม่) */}
      {isStale && !isMeterError && (
        <div className="flex items-center justify-between p-4 bg-sky-50 border border-sky-200 rounded-xl text-sky-950 shadow-sm">
          <div className="flex items-center gap-3">
            <Loader2 className="text-sky-600 shrink-0 animate-spin" size={22} />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-bold text-sm text-sky-900">
                  🔍 กำลังวิเคราะห์ข้อมูล — ไม่ได้รับข้อมูลใหม่มาแล้ว {silentText}
                </h4>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full border border-sky-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping" />
                  รอข้อมูลใหม่...
                </span>
              </div>
              <p className="text-xs text-sky-700 mt-1">
                ค่าที่แสดงบนหน้าเป็นข้อมูลล่าสุดเมื่อ {lastTimeString} ไม่ใช่ค่า ณ ปัจจุบัน
              </p>
            </div>
          </div>
          <div className="text-right shrink-0 hidden sm:block">
            <span className="text-xs font-medium text-sky-600 block">ข้อมูลล่าสุดเมื่อ</span>
            <span className="text-xs font-bold text-sky-900">{lastTimeString}</span>
          </div>
        </div>
      )}

      {/* BANNER 4: ZERO DATA / ไฟดับจริง (วัดค่าแรงดันได้ 0V ทั้งที่มิเตอร์สื่อสารได้) */}
      {!isOffline && !isStale && !isMeterError && isZeroData && (
        <div className="flex items-center justify-between p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-950 shadow-sm">
          <div className="flex items-center gap-3">
            <ZapOff className="text-rose-600 shrink-0 animate-pulse" size={22} />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-bold text-sm text-rose-900">
                  ⚡ ตรวจพบเหตุการณ์ไฟดับ / ค่าไฟฟ้าเป็น 0 (Power Outage)
                </h4>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full border border-rose-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  ตรวจพบทันที
                </span>
              </div>
              <p className="text-xs text-rose-700 mt-1">
                ตรวจพบแรงดันไฟฟ้าเป็น 0 V ในระบบจริง (อัปเดตล่าสุด {lastTimeString})
              </p>
            </div>
          </div>
          <div className="text-right shrink-0 hidden sm:block">
            <span className="text-xs font-medium text-rose-600 block">อัปเดตล่าสุด</span>
            <span className="text-xs font-bold text-rose-900">{lastTimeString}</span>
          </div>
        </div>
      )}

      {/* BANNER 5: ค่าผิดปกติ (ข้อมูลสด แรงดัน/กระแสไม่อยู่ในช่วงปกติ) */}
      {!isOffline && !isStale && !isMeterError && !isZeroData && hasAnyAnomaly && (
        <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 shadow-sm">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-amber-600 shrink-0" size={20} />
            <span className="font-medium text-sm">
              พบค่าความผิดปกติในระบบไฟฟ้า —{' '}
              {isPfAnomaly && `Power factor รวมต่ำ (${formatNumber(pf, 2)}) `}
              {isVoltageAnomaly && `แรงดันไม่อยู่ในช่วงปกติ ${voltMin}-${voltMax}V (${formatNumber(voltage, 1)}V) `}
              {isCurrentAnomaly && `กระแสเกินเกณฑ์ (${formatNumber(current, 1)}A) `}
              {isFreqAnomaly && `ความถี่ไม่อยู่ในช่วง 49-51Hz (${formatNumber(freq, 1)}Hz) `}
              — ควรตรวจสอบโหลด
            </span>
          </div>
        </div>
      )}
    </div>
  );
}