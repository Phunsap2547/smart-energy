// components/admin/building/alerts/StatusAlertBanners.tsx
'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { formatNumber } from '@/lib/formatter';
import { useDeviceStatus } from '@/hooks/useDeviceStatus';

interface StatusAlertBannersProps {
  status: ReturnType<typeof useDeviceStatus>;
}

export default function StatusAlertBanners({ status }: StatusAlertBannersProps) {
  const {
    isOffline,
    diffMinutes,
    lastDate,
    hasAnyAnomaly,
    isPfAnomaly,
    pf,
    isVoltageAnomaly,
    voltage,
    isCurrentAnomaly,
    current,
    isFreqAnomaly,
    freq,
  } = status;

  const lastTimeString =
    lastDate && !isNaN(lastDate.getTime())
      ? lastDate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.'
      : '-';

  const displayTimeDiff =
    diffMinutes >= 60
      ? `${Math.floor(diffMinutes / 60)} ชม. ${diffMinutes % 60} นาที`
      : `${diffMinutes} นาที`;

  if (!isOffline && !hasAnyAnomaly) return null;

  return (
    <div className="space-y-3">
      {/* BANNER 1: OFFLINE / ไฟดับ */}
      {isOffline && (
        <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl text-red-900 shadow-sm">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-600 shrink-0" size={22} />
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
            ระบบถูกปรับค่ากระแสเป็น 0 A
          </span>
        </div>
      )}

      {/* BANNER 2: ค่าไฟฟ้าผิดปกติ (กรณี Online) */}
      {!isOffline && hasAnyAnomaly && (
        <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 shadow-sm">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-amber-600 shrink-0" size={20} />
            <span className="font-medium text-sm">
              พบค่าความผิดปกติในระบบไฟฟ้า —{' '}
              {isPfAnomaly && `Power factor รวมต่ำ (${formatNumber(pf, 2)}) `}
              {isVoltageAnomaly && `แรงดันไม่อยู่ในช่วง 380-440V (${formatNumber(voltage, 1)}V) `}
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