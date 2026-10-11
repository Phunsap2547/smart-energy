import { useEffect, useMemo, useState } from 'react';
import { EnergyIngest } from '@/types/energy';

const STALE_SEC = 60;          // เงียบเกินนี้ = "กำลังวิเคราะห์ / ข้อมูลค้าง" (ESP32 ส่งทุก ~60 วิ)
const OFFLINE_SEC = 3 * 60;    // เงียบเกินนี้ = ไฟดับ/สัญญาณขาด 
const OUTAGE_VOLT = 50;        // แรงดันต่ำกว่านี้ทุกเฟส = ไฟดับ

export function useDeviceStatus(latestData: EnergyIngest | null) {
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
    const isStale = !isOffline && silentSec >= STALE_SEC;

    // รวมแรงดันทุกเฟสที่มีค่าจริง (ไม่นับ null)
    const d = latestData as any;
    const volts = [d?.voltage_system, d?.voltage_a, d?.voltage_b, d?.voltage_c]
      .filter((v) => v !== null && v !== undefined)
      .map(Number)
      .filter((v) => !isNaN(v));

    const rawVoltage = Number(d?.voltage_system ?? d?.voltage_a ?? 0);
    const isPowerOutage =
      !isOffline && !isStale && volts.length > 0 && volts.every((v) => v < OUTAGE_VOLT);

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