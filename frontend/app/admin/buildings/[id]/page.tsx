

'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Zap, Activity, Gauge, Radio, TrendingUp } from 'lucide-react';

import OverviewCard from '@/components/admin/building/overview/OverviewCard';
import ActiveEnergyChart from '@/components/admin/building/overview/ActiveEnergyChart';
import PhaseTable from '@/components/admin/building/overview/PhaseTable';
import CurrentChart from '@/components/admin/building/overview/THDChart';

import BuildingSidebar from '@/components/admin/building/shared/BuildingSidebar';
import RealtimeClock from '@/components/admin/building/shared/RealtimeClock';
import StatusAlertBanners from '@/components/admin/building/alerts/StatusAlertBanners';

import { supabase } from '@/lib/supabase';
import { EnergyIngest } from '@/types/energy';
import { formatNumber } from '@/lib/formatter';
import { useDeviceStatus } from '@/hooks/useDeviceStatus';
import { VoltageCfg, DEFAULT_VOLTAGE_CFG, resolveVoltageCfg } from '@/lib/voltage';

export type TimeFilter = '1D' | '7D' | '30D' | '12M';

export default function BuildingOverviewPage() {
  const params = useParams();
  const buildingId = params?.id ? Number(params.id) : null;

  const [ingestData, setIngestData] = useState<EnergyIngest[]>([]);
  const [latestData, setLatestData] = useState<EnergyIngest | null>(null);
  const [startOfDayEnergy, setStartOfDayEnergy] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('1D');
  const [deviceCfgs, setDeviceCfgs] = useState<Record<number, VoltageCfg>>({});

  // ช่วงแรงดันของอุปกรณ์ที่ส่งค่าล่าสุด (ถ้าไม่เจอใช้ตัวแรกของอาคาร แล้วค่อย default)
  const voltageCfg = useMemo<VoltageCfg>(() => {
    const id = latestData?.device_id != null ? Number(latestData.device_id) : null;
    if (id != null && deviceCfgs[id]) return deviceCfgs[id];
    return Object.values(deviceCfgs)[0] ?? DEFAULT_VOLTAGE_CFG;
  }, [latestData, deviceCfgs]);

  // ⚡ Hook สถานะ Realtime / Offline (ต้องแก้ hook ให้รับ voltageCfg ด้วย ดูข้อ 4)
  const status = useDeviceStatus(latestData, voltageCfg);
  const { isOffline, voltage, current, pf, freq, isVoltageAnomaly, isCurrentAnomaly, isPfAnomaly, isFreqAnomaly } = status;

  const fetchIngestData = useCallback(async () => {
    if (!buildingId) return;

    try {
      const { data: devices, error: deviceError } = await supabase
        .from('devices')
        .select('id, voltage_min, voltage_max, nominal_voltage')
        .eq('building_id', buildingId);

      if (deviceError || !devices || devices.length === 0) {
        setIngestData([]);
        setLatestData(null);
        setStartOfDayEnergy(null);
        return;
      }

      const cfgMap: Record<number, VoltageCfg> = {};
      devices.forEach((d) => {
        cfgMap[Number(d.id)] = resolveVoltageCfg(d);
      });
      setDeviceCfgs(cfgMap);

      const deviceIds = devices.map((d) => d.id);

      const { data: latestRow } = await supabase
        .from('energy_readings')
        .select('*')
        .in('device_id', deviceIds)
        .order('reading_time', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestRow) {
        setLatestData(latestRow);
      }

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const { data: firstRowToday } = await supabase
        .from('energy_readings')
        .select('energy_kwh')
        .in('device_id', deviceIds)
        .gte('reading_time', startOfDay.toISOString())
        .order('reading_time', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (firstRowToday && firstRowToday.energy_kwh != null) {
        setStartOfDayEnergy(Number(firstRowToday.energy_kwh));
      }

      const now = new Date();
      let startDate = new Date();

      if (timeFilter === '1D') startDate.setHours(0, 0, 0, 0);
      else if (timeFilter === '7D') startDate.setDate(now.getDate() - 7);
      else if (timeFilter === '30D') startDate.setDate(now.getDate() - 30);
      else if (timeFilter === '12M') startDate.setFullYear(now.getFullYear() - 1);

      const { data, error } = await supabase
        .from('energy_readings')
        .select('*')
        .in('device_id', deviceIds)
        .gte('reading_time', startDate.toISOString())
        .order('reading_time', { ascending: false })
        .limit(1000);

      if (!error && data) {
        setIngestData([...data].reverse());
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [buildingId, timeFilter]);

  useEffect(() => {
    fetchIngestData();

    const channel = supabase
      .channel(`energy_readings_b${buildingId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'energy_readings' },
        () => fetchIngestData()
      )
      .subscribe();

    const interval = setInterval(fetchIngestData, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [buildingId, fetchIngestData]);

  const displayLatest = useMemo(() => {
    if (!latestData || isOffline) {
      return {
        ...latestData,
        voltage_system: 0, current_system: 0, power_factor: 0, frequency_hz: 0,
        voltage_l1: 0, voltage_l2: 0, voltage_l3: 0,
        current_l1: 0, current_l2: 0, current_l3: 0,
        pf_l1: 0, pf_l2: 0, pf_l3: 0,
        thd_voltage_l1_pct: 0, thd_current_l1_pct: 0,
      } as EnergyIngest;
    }
    return latestData;
  }, [latestData, isOffline]);

  const periodEnergyKwh = useMemo(() => {
    if (timeFilter === '1D' && latestData?.energy_kwh != null && startOfDayEnergy != null) {
      const diff = Number(latestData.energy_kwh) - startOfDayEnergy;
      return Math.max(0, diff);
    }
    if (!ingestData || ingestData.length === 0) return 0;
    const values = ingestData.map((item) => Number(item.energy_kwh ?? 0)).filter((v) => v > 0);
    if (values.length === 0) return 0;
    return Math.max(...values) - Math.min(...values);
  }, [ingestData, timeFilter, latestData, startOfDayEnergy]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500 font-medium">
        กำลังโหลดข้อมูลระบบ...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <BuildingSidebar buildingId={buildingId} />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">ภาพรวมระบบ</h1>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${isOffline
                      ? 'bg-red-100 text-red-700 animate-pulse'
                      : 'bg-emerald-100 text-emerald-700'
                    }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${isOffline ? 'bg-red-500' : 'bg-emerald-500'
                      }`}
                  />
                  {isOffline ? 'Offline' : 'Realtime Online'}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">สรุปสถานะระบบไฟฟ้าแบบ Real-time</p>
            </div>
            <RealtimeClock />
          </div>

          {/* ⚡ Banners การแจ้งเตือนไฟดับ / ค่าไฟฟ้าผิดปกติ */}
          {/* <StatusAlertBanners status={status} voltageCfg={voltageCfg} /> */}
          <StatusAlertBanners status={status} />

          {/* OVERVIEW CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <OverviewCard
              title="System voltage"
              value={formatNumber(voltage, 1)}
              unit="V"
              subtitle="แรงดันระบบ"
              statusLabel={isOffline ? 'Offline' : isVoltageAnomaly ? 'ผิดปกติ' : 'ปกติ'}
              statusRange={`ช่วงปกติ ${voltageCfg.min} - ${voltageCfg.max} V`}
              isError={isOffline || isVoltageAnomaly}
              borderColor={isOffline ? '#ef4444' : '#3b82f6'}
              icon={<Zap size={20} className={isOffline || isVoltageAnomaly ? 'text-red-600' : 'text-emerald-600'} />}
            />
            <OverviewCard
              title="System current"
              value={formatNumber(current, 2)}
              unit="A"
              subtitle="กระแสรวม"
              statusLabel={isOffline ? 'Offline' : isCurrentAnomaly ? 'ผิดปกติ' : 'ปกติ'}
              statusRange="ช่วงปกติ < 100 A"
              isError={isOffline || isCurrentAnomaly}
              borderColor={isOffline ? '#ef4444' : '#3b82f6'}
              icon={<Activity size={20} className={isOffline || isCurrentAnomaly ? 'text-red-600' : 'text-emerald-600'} />}
            />
            <OverviewCard
              title="Total power factor"
              value={formatNumber(pf, 2)}
              subtitle="เพาเวอร์แฟคเตอร์รวม"
              statusLabel={isOffline ? 'Offline' : isPfAnomaly ? 'ผิดปกติ' : 'ปกติ'}
              statusRange="เกณฑ์ปกติ ≥ 0.80"
              isError={isOffline || isPfAnomaly}
              borderColor={isOffline ? '#ef4444' : '#3b82f6'}
              icon={<Gauge size={20} className={isOffline || isPfAnomaly ? 'text-red-600' : 'text-emerald-600'} />}
            />
            <OverviewCard
              title="Frequency"
              value={formatNumber(freq, 1)}
              unit="Hz"
              subtitle="ความถี่"
              statusLabel={isOffline ? 'Offline' : isFreqAnomaly ? 'ผิดปกติ' : 'ปกติ'}
              statusRange="ช่วงปกติ 49 - 51 Hz"
              isError={isOffline || isFreqAnomaly}
              borderColor={isOffline ? '#ef4444' : '#3b82f6'}
              icon={<Radio size={20} className={isOffline || isFreqAnomaly ? 'text-red-600' : 'text-emerald-600'} />}
            />
          </div>

          {/* PHASE TABLE */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <PhaseTable latestData={latestData} isOffline={isOffline} voltageCfg={voltageCfg} />
          </div>

          {/* CHARTS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {timeFilter === '1D' ? 'การใช้ไฟฟ้าวันนี้' : `การใช้ไฟฟ้าช่วง ${timeFilter}`}
                  </p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-bold text-gray-900">{formatNumber(periodEnergyKwh, 1)}</span>
                    <span className="text-sm text-gray-500 font-medium">kWh</span>
                  </div>
                  <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1">
                    <TrendingUp size={14} /> มิเตอร์สะสมรวม: {formatNumber(latestData?.energy_kwh ?? 0, 0)} kWh
                  </p>
                </div>
              </div>
              <ActiveEnergyChart buildingId={buildingId} filter={timeFilter} />
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">System Current</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold text-gray-900">
                      {formatNumber(displayLatest?.current_system ?? 0, 2)}
                    </span>
                    <span className="text-sm text-gray-500 font-medium">A</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">กระแสรวมของระบบ</p>
                </div>
              </div>
              <CurrentChart data={ingestData} filter={timeFilter} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}