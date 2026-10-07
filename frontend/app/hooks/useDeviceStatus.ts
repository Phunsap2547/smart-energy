

import { useEffect, useMemo, useState } from 'react';
import { EnergyIngest } from '@/types/energy';

const STALE_SEC = 60;          // เงียบเกินนี้ = "กำลังวิเคราะห์ / ข้อมูลค้าง"
const OFFLINE_SEC = 15 * 60;   // เงียบเกินนี้ = Offline

export function useDeviceStatus(latestData: EnergyIngest | null) {
  // นาฬิกาเดินเอง ทำให้ hook คำนวณใหม่แม้ไม่มีข้อมูลใหม่
  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  return useMemo(() => {
    const rawTime = latestData?.reading_time || latestData?.created_at;
    const lastDate = rawTime ? new Date(rawTime) : null;
    const validDate = lastDate && !isNaN(lastDate.getTime());

    const silentSec = validDate
      ? Math.max(0, Math.floor((nowMs - lastDate!.getTime()) / 1000))
      : 999999;
    const diffMinutes = Math.floor(silentSec / 60);

    const isOffline = !latestData || silentSec >= OFFLINE_SEC;
    // ข้อมูลค้าง: เงียบเกิน 1 นาที แต่ยังไม่ถึงเกณฑ์ Offline
    const isStale = !isOffline && silentSec >= STALE_SEC;

    const rawVoltage = latestData?.voltage_system ?? 0;
    const isPowerOutage = !isOffline && !isStale && rawVoltage < 50.0;

    // ข้อมูลค้าง/offline = ไม่ใช้ค่าเก่าตัดสินความผิดปกติ
    const live = !isOffline && !isStale && !isPowerOutage;

    const voltage = live ? rawVoltage : 0;
    const current = live ? (latestData?.current_system ?? 0) : 0;
    const pf = live ? (latestData?.power_factor ?? 0) : 0;
    const freq = live ? (latestData?.frequency_hz ?? 0) : 0;

    const isVoltageAnomaly = live && (voltage < 220 || voltage > 240);
    const isCurrentAnomaly = live && current >= 100;
    const isPfAnomaly = live && pf < 0.8;
    const isFreqAnomaly = live && (freq < 49 || freq > 51);

    const hasAnyAnomaly =
      isPowerOutage || isVoltageAnomaly || isCurrentAnomaly || isPfAnomaly || isFreqAnomaly;

    return {
      isOffline,
      isStale,
      silentSec,
      isPowerOutage,
      diffMinutes,
      lastDate,
      voltage,
      current,
      pf,
      freq,
      isVoltageAnomaly,
      isCurrentAnomaly,
      isPfAnomaly,
      isFreqAnomaly,
      hasAnyAnomaly,
    };
  }, [latestData, nowMs]);
}