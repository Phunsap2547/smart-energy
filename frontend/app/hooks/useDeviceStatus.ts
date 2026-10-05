// hooks/useDeviceStatus.ts
import { useMemo } from 'react';
import { EnergyIngest } from '@/types/energy';

export function useDeviceStatus(latestData: EnergyIngest | null) {
  return useMemo(() => {
    const rawTime = latestData?.reading_time || latestData?.created_at;
    const lastDate = rawTime ? new Date(rawTime) : null;
    const now = new Date();

    const diffMinutes =
      lastDate && !isNaN(lastDate.getTime())
        ? Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60))
        : 999;

    // สัญญาณขาดหายเกิน 15 นาทีถือเป็น Offline
    const isOffline = !latestData || diffMinutes >= 15;

    const voltage = isOffline ? 0 : (latestData?.voltage_system ?? 0);
    const current = isOffline ? 0 : (latestData?.current_system ?? 0);
    const pf = isOffline ? 0 : (latestData?.power_factor ?? 0);
    const freq = isOffline ? 0 : (latestData?.frequency_hz ?? 0);

    // const isVoltageAnomaly = !isOffline && (voltage < 380 || voltage > 440);
    const isVoltageAnomaly = !isOffline && (voltage < 220 || voltage > 240);
    const isCurrentAnomaly = !isOffline && current >= 100;
    const isPfAnomaly = !isOffline && pf < 0.8;
    const isFreqAnomaly = !isOffline && (freq < 49 || freq > 51);

    const hasAnyAnomaly =
      isVoltageAnomaly || isCurrentAnomaly || isPfAnomaly || isFreqAnomaly;

    return {
      isOffline,
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
  }, [latestData]);
}