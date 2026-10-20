// import { useEffect, useMemo, useState } from 'react';
// import { EnergyIngest } from '@/types/energy';

// const STALE_SEC = 60;          // เงียบเกินนี้ = "กำลังวิเคราะห์ / ข้อมูลค้าง" (ESP32 ส่งทุก ~60 วิ)
// const OFFLINE_SEC = 3 * 60;    // เงียบเกินนี้ = ไฟดับ/สัญญาณขาด 
// const OUTAGE_VOLT = 50;        // แรงดันต่ำกว่านี้ทุกเฟส = ไฟดับ
// const DEFAULT_VOLT_MIN = 220;
// const DEFAULT_VOLT_MAX = 240;

// export function useDeviceStatus(latestData: EnergyIngest | null) {
//   const [nowMs, setNowMs] = useState(() => Date.now());
//   useEffect(() => {
//     const t = setInterval(() => setNowMs(Date.now()), 1000);
//     return () => clearInterval(t);
//   }, []);

//   return useMemo(() => {
//     const rawTime = latestData?.reading_time || latestData?.created_at;
//     const lastDate = rawTime ? new Date(rawTime) : null;
//     const validDate = lastDate && !isNaN(lastDate.getTime());

//     const silentSec = validDate
//       ? Math.max(0, Math.floor((nowMs - lastDate!.getTime()) / 1000))
//       : 999999;
//     const diffMinutes = Math.floor(silentSec / 60);

//     const isOffline = !latestData || silentSec >= OFFLINE_SEC;
//     const isStale = !isOffline && silentSec >= STALE_SEC;

//     // รวมแรงดันทุกเฟสที่มีค่าจริง (ไม่นับ null)
//     const d = latestData as any;
//     const volts = [d?.voltage_system, d?.voltage_a, d?.voltage_b, d?.voltage_c]
//       .filter((v) => v !== null && v !== undefined)
//       .map(Number)
//       .filter((v) => !isNaN(v));

//     const rawVoltage = Number(d?.voltage_system ?? d?.voltage_a ?? 0);
//     const isPowerOutage =
//       !isOffline && !isStale && volts.length > 0 && volts.every((v) => v < OUTAGE_VOLT);

//     const live = !isOffline && !isStale && !isPowerOutage;

//     const voltage = live ? rawVoltage : 0;
//     const current = live ? (latestData?.current_system ?? 0) : 0;
//     const pf = live ? (latestData?.power_factor ?? 0) : 0;
//     const freq = live ? (latestData?.frequency_hz ?? 0) : 0;

//     const isVoltageAnomaly = live && (voltage < 220 || voltage > 240);
//     const isCurrentAnomaly = live && current >= 100;
//     const isPfAnomaly = live && pf < 0.8;
//     const isFreqAnomaly = live && (freq < 49 || freq > 51);

//     const hasAnyAnomaly =
//       isPowerOutage || isVoltageAnomaly || isCurrentAnomaly || isPfAnomaly || isFreqAnomaly;

//     return {
//       isOffline,
//       isStale,
//       silentSec,
//       isPowerOutage,
//       diffMinutes,
//       lastDate,
//       voltage,
//       current,
//       pf,
//       freq,
//       isVoltageAnomaly,
//       isCurrentAnomaly,
//       isPfAnomaly,
//       isFreqAnomaly,
//       hasAnyAnomaly,
//     };
//   }, [latestData, nowMs]);
// }



// // hooks/useDeviceStatus.ts
// import { useEffect, useMemo, useState } from 'react';
// import { EnergyIngest } from '@/types/energy';

// const STALE_SEC = 60;          // เงียบเกินนี้ = "กำลังวิเคราะห์ / ข้อมูลค้าง"
// const OFFLINE_SEC = 3 * 60;    // เงียบเกินนี้ = ไฟดับ/สัญญาณขาด
// const OUTAGE_VOLT = 50;        // แรงดันต่ำกว่านี้ทุกเฟส = ไฟดับ

// // ค่า fallback กรณี API ไม่ส่งเกณฑ์ของอุปกรณ์มา
// const DEFAULT_VOLT_MIN = 220;
// const DEFAULT_VOLT_MAX = 240;
// const DEFAULT_CURRENT_MAX = 100;
// const DEFAULT_PF_MIN = 0.85;

// export function useDeviceStatus(latestData: EnergyIngest | null) {
//   const [nowMs, setNowMs] = useState(() => Date.now());
//   useEffect(() => {
//     const t = setInterval(() => setNowMs(Date.now()), 1000);
//     return () => clearInterval(t);
//   }, []);

//   return useMemo(() => {
//     const rawTime = latestData?.reading_time || latestData?.created_at;
//     const lastDate = rawTime ? new Date(rawTime) : null;
//     const validDate = lastDate && !isNaN(lastDate.getTime());

//     const silentSec = validDate
//       ? Math.max(0, Math.floor((nowMs - lastDate!.getTime()) / 1000))
//       : 999999;
//     const diffMinutes = Math.floor(silentSec / 60);

//     const isOffline = !latestData || silentSec >= OFFLINE_SEC;
//     const isStale = !isOffline && silentSec >= STALE_SEC;

//     const d = latestData as any;
//     const volts = [d?.voltage_system, d?.voltage_a, d?.voltage_b, d?.voltage_c]
//       .filter((v) => v !== null && v !== undefined)
//       .map(Number)
//       .filter((v) => !isNaN(v));

//     const rawVoltage = Number(d?.voltage_system ?? d?.voltage_a ?? 0);
//     const isPowerOutage =
//       !isOffline && !isStale && volts.length > 0 && volts.every((v) => v < OUTAGE_VOLT);

//     const live = !isOffline && !isStale && !isPowerOutage;

//     const voltage = live ? rawVoltage : 0;
//     const current = live ? (latestData?.current_system ?? 0) : 0;
//     const pf = live ? (latestData?.power_factor ?? 0) : 0;
//     const freq = live ? (latestData?.frequency_hz ?? 0) : 0;

//     // เกณฑ์ของอุปกรณ์นี้ (มาจากตาราง devices ผ่าน /api/readings/latest)
//     const voltMin = Number(d?.voltage_min ?? DEFAULT_VOLT_MIN);
//     const voltMax = Number(d?.voltage_max ?? DEFAULT_VOLT_MAX);
//     const currentMax = Number(d?.current_max ?? DEFAULT_CURRENT_MAX);
//     const pfMin = Number(d?.pf_min ?? DEFAULT_PF_MIN);

//     const isVoltageAnomaly = live && (voltage < voltMin || voltage > voltMax);
//     const isCurrentAnomaly = live && current >= currentMax;
//     const isPfAnomaly = live && pf < pfMin;
//     const isFreqAnomaly = live && (freq < 49 || freq > 51);

//     const hasAnyAnomaly =
//       isPowerOutage || isVoltageAnomaly || isCurrentAnomaly || isPfAnomaly || isFreqAnomaly;

//     return {
//       isOffline,
//       isStale,
//       silentSec,
//       isPowerOutage,
//       diffMinutes,
//       lastDate,
//       voltage,
//       current,
//       pf,
//       freq,
//       voltMin,
//       voltMax,
//       currentMax,
//       pfMin,
//       isVoltageAnomaly,
//       isCurrentAnomaly,
//       isPfAnomaly,
//       isFreqAnomaly,
//       hasAnyAnomaly,
//     };
//   }, [latestData, nowMs]);
// }


// // hooks/useDeviceStatus.ts
// import { useEffect, useMemo, useState } from 'react';
// import { EnergyIngest } from '@/types/energy';

// const STALE_SEC = 60;          // เงียบเกินนี้ = "กำลังวิเคราะห์ / ข้อมูลค้าง"
// const OFFLINE_SEC = 3 * 60;    // เงียบเกินนี้ = ไฟดับ/สัญญาณขาด
// const OUTAGE_VOLT = 50;        // แรงดันต่ำกว่านี้ทุกเฟส = ไฟดับ

// // ค่า fallback กรณีไม่ได้ส่งเกณฑ์ของอุปกรณ์มา
// const DEFAULT_VOLT_MIN = 220;
// const DEFAULT_VOLT_MAX = 240;
// const DEFAULT_CURRENT_MAX = 100;
// const DEFAULT_PF_MIN = 0.85;

// export type VoltageCfg = { min: number; max: number };

// export function useDeviceStatus(
//   latestData: EnergyIngest | null,
//   voltageCfg?: VoltageCfg   // ช่วงแรงดันจากตาราง devices (ถ้าส่งมาจะใช้ก่อนเสมอ)
// ) {
//   const [nowMs, setNowMs] = useState(() => Date.now());
//   useEffect(() => {
//     const t = setInterval(() => setNowMs(Date.now()), 1000);
//     return () => clearInterval(t);
//   }, []);

//   const cfgMin = voltageCfg?.min;
//   const cfgMax = voltageCfg?.max;

//   return useMemo(() => {
//     const rawTime = latestData?.reading_time || latestData?.created_at;
//     const lastDate = rawTime ? new Date(rawTime) : null;
//     const validDate = lastDate && !isNaN(lastDate.getTime());

//     const silentSec = validDate
//       ? Math.max(0, Math.floor((nowMs - lastDate!.getTime()) / 1000))
//       : 999999;
//     const diffMinutes = Math.floor(silentSec / 60);

//     const isOffline = !latestData || silentSec >= OFFLINE_SEC;
//     const isStale = !isOffline && silentSec >= STALE_SEC;

//     const d = latestData as any;
//     const volts = [d?.voltage_system, d?.voltage_a, d?.voltage_b, d?.voltage_c]
//       .filter((v) => v !== null && v !== undefined)
//       .map(Number)
//       .filter((v) => !isNaN(v));

//     const rawVoltage = Number(d?.voltage_system ?? d?.voltage_a ?? 0);
//     const isPowerOutage =
//       !isOffline && !isStale && volts.length > 0 && volts.every((v) => v < OUTAGE_VOLT);

//     const live = !isOffline && !isStale && !isPowerOutage;

//     const voltage = live ? rawVoltage : 0;
//     const current = live ? (latestData?.current_system ?? 0) : 0;
//     const pf = live ? (latestData?.power_factor ?? 0) : 0;
//     const freq = live ? (latestData?.frequency_hz ?? 0) : 0;

//     // ลำดับความสำคัญ: voltageCfg (devices) > field ใน reading (/latest) > default
//     const voltMin = Number(cfgMin ?? d?.voltage_min ?? DEFAULT_VOLT_MIN);
//     const voltMax = Number(cfgMax ?? d?.voltage_max ?? DEFAULT_VOLT_MAX);
//     const currentMax = Number(d?.current_max ?? DEFAULT_CURRENT_MAX);
//     const pfMin = Number(d?.pf_min ?? DEFAULT_PF_MIN);

//     const isVoltageAnomaly = live && (voltage < voltMin || voltage > voltMax);
//     const isCurrentAnomaly = live && current >= currentMax;
//     const isPfAnomaly = live && pf < pfMin;
//     const isFreqAnomaly = live && (freq < 49 || freq > 51);

//     const hasAnyAnomaly =
//       isPowerOutage || isVoltageAnomaly || isCurrentAnomaly || isPfAnomaly || isFreqAnomaly;

//     return {
//       isOffline,
//       isStale,
//       silentSec,
//       isPowerOutage,
//       diffMinutes,
//       lastDate,
//       voltage,
//       current,
//       pf,
//       freq,
//       voltMin,
//       voltMax,
//       currentMax,
//       pfMin,
//       isVoltageAnomaly,
//       isCurrentAnomaly,
//       isPfAnomaly,
//       isFreqAnomaly,
//       hasAnyAnomaly,
//     };
//   }, [latestData, nowMs, cfgMin, cfgMax]);
// }


//// hooks/useDeviceStatus.ts
import { useEffect, useMemo, useState } from 'react';
import { EnergyIngest } from '@/types/energy';
import { supabase } from '@/lib/supabase';
import { VoltageCfg, resolveVoltageCfg } from '@/lib/voltage';

export type { VoltageCfg };

// ชนิดข้อมูลสถานะอุปกรณ์จาก API /api/readings/status
export interface DeviceStatusResponse {
  state?: 'online' | 'offline' | 'meter_error';
  message?: string;
  meter_ok?: boolean;
  last_seen_at?: string;
  [key: string]: any;
}

const STALE_SEC = 60;          // ค่าวัดมิเตอร์เงียบเกินนี้ = "ข้อมูลค้าง"
const OFFLINE_SEC = 3 * 60;    // บอร์ดขาดการติดต่อเกิน 3 นาที = "ออฟไลน์"
const OUTAGE_VOLT = 50;        // แรงดันต่ำกว่านี้ทุกเฟส = "ไฟดับ"

// ค่า fallback กรณีหาเกณฑ์ของอุปกรณ์ไม่ได้
const DEFAULT_VOLT_MIN = 220;
const DEFAULT_VOLT_MAX = 240;
const DEFAULT_CURRENT_MAX = 100;
const DEFAULT_PF_MIN = 0.85;

export function useDeviceStatus(
  latestData: EnergyIngest | null,
  voltageCfg?: VoltageCfg,                  // ถ้าส่งมาจะใช้ก่อนเสมอ
  statusData?: DeviceStatusResponse | null  // รับ statusData จาก API /api/readings/status
) {
  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const deviceId = (latestData as any)?.device_id ?? null;
  const [fetchedCfg, setFetchedCfg] = useState<{ id: number; cfg: VoltageCfg } | null>(null);

  useEffect(() => {
    if (voltageCfg || deviceId == null) return;
    if (fetchedCfg && fetchedCfg.id === Number(deviceId)) return;

    let cancelled = false;
    supabase
      .from('devices')
      .select('voltage_min, voltage_max, nominal_voltage')
      .eq('id', deviceId)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled || !data) return;
        setFetchedCfg({ id: Number(deviceId), cfg: resolveVoltageCfg(data) });
      });

    return () => {
      cancelled = true;
    };
  }, [deviceId, voltageCfg, fetchedCfg]);

  const activeFetched =
    fetchedCfg && deviceId != null && fetchedCfg.id === Number(deviceId) ? fetchedCfg.cfg : null;

  const cfgMin = voltageCfg?.min ?? activeFetched?.min;
  const cfgMax = voltageCfg?.max ?? activeFetched?.max;
  const cfgPending = !voltageCfg && deviceId != null && !activeFetched;

  return useMemo(() => {
    // -------------------------------------------------------------
    // 1. ตรวจสอบสถานะการออนไลน์ของ "ตัวบอร์ด" (อ้างอิงจาก devices.last_seen_at)
    // -------------------------------------------------------------
    const boardLastSeenRaw = statusData?.last_seen_at;
    const boardLastSeenDate = boardLastSeenRaw ? new Date(boardLastSeenRaw) : null;
    const isBoardTimeValid = boardLastSeenDate && !isNaN(boardLastSeenDate.getTime());

    const boardSilentSec = isBoardTimeValid
      ? Math.max(0, Math.floor((nowMs - boardLastSeenDate!.getTime()) / 1000))
      : 999999;

    const meterOk = statusData?.meter_ok;

    // [แก้] บอร์ด Offline ตัดสินจาก last_seen_at เงียบเกิน 3 นาที เท่านั้น
    // (ไม่เชื่อ state จาก API ซ้ำ เพราะ threshold ของ API อาจไม่ตรงกับฝั่งนี้)
    const isOffline = boardSilentSec >= OFFLINE_SEC;

    // [แก้] Meter Error ต่อเมื่อบอร์ดยังออนไลน์ แต่อ่านมิเตอร์ไม่ได้ (meter_ok === false)
    const isMeterError = !isOffline && meterOk === false;

    // -------------------------------------------------------------
    // 2. ตรวจสอบเวลาข้อมูลล่าสุดจากตาราง energy_readings
    // -------------------------------------------------------------
    const rawTime = latestData?.reading_time || latestData?.created_at;
    const lastDate = rawTime ? new Date(rawTime) : null;
    const validDate = lastDate && !isNaN(lastDate.getTime());

    const silentSec = validDate
      ? Math.max(0, Math.floor((nowMs - lastDate!.getTime()) / 1000))
      : 999999;
    const diffMinutes = Math.floor(silentSec / 60);

    // ข้อมูลค้าง (Stale) คือ บอร์ดออนไลน์ + อ่านมิเตอร์ได้ปกติ แต่ไม่มีค่าวัดใหม่เกิน 60 วินาที
    const isStale = !isOffline && !isMeterError && silentSec >= STALE_SEC;

    // -------------------------------------------------------------
    // 3. ตรวจสอบค่าวัดไฟฟ้า (Voltage / Current / Power)
    // -------------------------------------------------------------
    const d = latestData as any;
    const volts = [d?.voltage_system, d?.voltage_a, d?.voltage_b, d?.voltage_c]
      .filter((v) => v !== null && v !== undefined)
      .map(Number)
      .filter((v) => !isNaN(v));

    const rawVoltage = Number(d?.voltage_system ?? d?.voltage_a ?? 0);

    // ไฟดับจริง: ต้องออนไลน์อยู่, มิเตอร์วัดได้ปกติ, และแรงดันต่ำกว่า 50V ทุกเฟส
    const isPowerOutage =
      !isOffline && !isStale && !isMeterError && volts.length > 0 && volts.every((v) => v < OUTAGE_VOLT);

    const live = !isOffline && !isStale && !isMeterError && !isPowerOutage;

    const voltage = live ? rawVoltage : 0;
    const current = live ? (latestData?.current_system ?? 0) : 0;
    const pf = live ? (latestData?.power_factor ?? 0) : 0;
    const freq = live ? (latestData?.frequency_hz ?? 0) : 0;

    const voltMin = Number(cfgMin ?? d?.voltage_min ?? DEFAULT_VOLT_MIN);
    const voltMax = Number(cfgMax ?? d?.voltage_max ?? DEFAULT_VOLT_MAX);
    const currentMax = Number(d?.current_max ?? DEFAULT_CURRENT_MAX);
    const pfMin = Number(d?.pf_min ?? DEFAULT_PF_MIN);

    const isVoltageAnomaly = live && !cfgPending && (voltage < voltMin || voltage > voltMax);
    const isCurrentAnomaly = live && current >= currentMax;
    const isPfAnomaly = live && pf < pfMin;
    const isFreqAnomaly = live && (freq < 49 || freq > 51);

    const hasAnyAnomaly =
      isPowerOutage || isVoltageAnomaly || isCurrentAnomaly || isPfAnomaly || isFreqAnomaly;

    return {
      isOffline,
      isMeterError, // ปล่อยสถานะอ่านมิเตอร์ไม่ได้ ให้ Banner สีส้มแสดงผล
      isStale,
      silentSec,
      isPowerOutage,
      diffMinutes,
      lastDate,
      voltage,
      current,
      pf,
      freq,
      voltMin,
      voltMax,
      currentMax,
      pfMin,
      isVoltageAnomaly,
      isCurrentAnomaly,
      isPfAnomaly,
      isFreqAnomaly,
      hasAnyAnomaly,
    };
  }, [latestData, statusData, nowMs, cfgMin, cfgMax, cfgPending]);
}