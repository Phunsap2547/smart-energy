
//PowerFactorChart.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { EnergyIngest } from '@/types/energy';
import { getTimeRangeIso, processEnergyReadings } from '@/lib/energyUtils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Activity, AlertTriangle } from 'lucide-react';

// ดึง energy_readings ครบทั้งช่วงเวลา โดยวนดึงทีละ 1000 แถว (Supabase จำกัด 1000 แถวต่อครั้ง)
async function fetchAllReadings(
  deviceIds: (string | number)[],
  startIso: string,
  endIso: string
) {
  const PAGE_SIZE = 1000;
  let page = 0;
  const all: any[] = [];

  while (true) {
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from('energy_readings')
      .select('*')
      .in('device_id', deviceIds)
      .gte('reading_time', startIso)
      .lte('reading_time', endIso)
      .order('reading_time', { ascending: true })
      .order('id', { ascending: true }) // ถ้าตารางไม่มีคอลัมน์ id ให้ลบบรรทัดนี้
      .range(from, to);

    if (error) throw error;
    if (!data || data.length === 0) break;

    all.push(...data);
    if (data.length < PAGE_SIZE) break;
    page++;
  }

  return all;
}

interface PowerFactorChartProps {
  buildingId: string | number;
  timeRange?: 'day' | '7d' | '30d' | string;
  selectedDate?: string;
  /**
   * ส่งค่า PF ที่ badge ของกราฟแสดง กลับไปให้หน้าหลัก
   * kind = 'avg' (โหมดรายวัน: ค่าเฉลี่ย) หรือ 'max' (โหมด 7/30 วัน: ค่าสูงสุดรายวัน)
   */
  onPfChange?: (pf: number, kind: 'avg' | 'max') => void;
}

export const PowerFactorChart: React.FC<PowerFactorChartProps> = ({
  buildingId,
  timeRange = 'day',
  selectedDate,
  onPfChange,
}) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [avgPf, setAvgPf] = useState<number>(0);
  const [maxPf, setMaxPf] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // เก็บ callback ไว้ใน ref เพื่อไม่ให้การเปลี่ยน callback ทำให้ดึงข้อมูลใหม่
  const onPfChangeRef = useRef(onPfChange);
  useEffect(() => {
    onPfChangeRef.current = onPfChange;
  }, [onPfChange]);

  const isMultiDay = timeRange === '7d' || timeRange === '30d';

  useEffect(() => {
    let isSubscribed = true;

    const applyPf = (avg: number, max: number) => {
      if (!isSubscribed) return;
      setAvgPf(avg);
      setMaxPf(max);
      if (isMultiDay) onPfChangeRef.current?.(max, 'max');
      else onPfChangeRef.current?.(avg, 'avg');
    };

    async function fetchPfData(silent = false) {
      if (!buildingId) return;

      try {
        if (!silent) setLoading(true);

        // 1. ดึง device_id ทั้งหมดของอาคารนี้
        const { data: devices, error: deviceError } = await supabase
          .from('devices')
          .select('id')
          .eq('building_id', buildingId);

        if (deviceError) throw deviceError;

        const deviceIds = devices?.map((d) => d.id) || [];
        if (deviceIds.length === 0) {
          if (!isSubscribed) return;
          setChartData([]);
          applyPf(0, 0);
          return;
        }

        if (isMultiDay) {
          // โหมด 7 วัน หรือ 30 วัน: ดึงค่า PF สูงสุดของแต่ละวัน
          const daysCount = timeRange === '30d' ? 30 : 7;
          const baseDate = selectedDate ? new Date(selectedDate) : new Date();

          const dayPromises = [];
          for (let i = daysCount - 1; i >= 0; i--) {
            const d = new Date(baseDate);
            d.setDate(d.getDate() - i);

            const startOfDay = new Date(d);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(d);
            endOfDay.setHours(23, 59, 59, 999);

            dayPromises.push(
              supabase
                .from('energy_readings')
                .select('power_factor, reading_time')
                .in('device_id', deviceIds)
                .gte('reading_time', startOfDay.toISOString())
                .lte('reading_time', endOfDay.toISOString())
                // .gt ตัดแถว NULL ออก (Postgres เรียง NULL ขึ้นก่อนเมื่อ desc ทำให้ limit(1) ได้แถวว่าง)
                .gt('power_factor', 0)
                .order('power_factor', { ascending: false, nullsFirst: false })
                .limit(1)
                .then(({ data }) => {
                  const dayLabel = d.toLocaleDateString('th-TH', {
                    day: 'numeric',
                    month: 'short',
                  });
                  const fullDateLabel = d.toLocaleDateString('th-TH', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  });

                  const maxRead = data && data.length > 0 ? data[0] : null;
                  const val = maxRead ? Number(maxRead.power_factor) || null : null;

                  return {
                    time: dayLabel,
                    fullTime: fullDateLabel,
                    power_factor: val && val > 0 ? val : null,
                  };
                })
            );
          }

          const results = await Promise.all(dayPromises);
          if (!isSubscribed) return;

          // กรองเอาเฉพาะวันที่มีข้อมูลจริง (PF > 0) เพื่อไม่ให้กราฟดิ่งลง 0 หรือมีพื้นที่ว่างฝั่งซ้าย
          const validResults = results.filter(
            (item) => item.power_factor !== null && item.power_factor > 0
          );
          const finalData = validResults.length > 0 ? validResults : results;

          setChartData(finalData);

          const validItems = finalData.filter(
            (item) => item.power_factor !== null && item.power_factor > 0
          );

          if (validItems.length > 0) {
            const highestPf = Math.max(...validItems.map((item) => item.power_factor as number));
            const totalPf = validItems.reduce((sum, item) => sum + (item.power_factor as number), 0);
            applyPf(
              Number((totalPf / validItems.length).toFixed(2)),
              Number(highestPf.toFixed(2))
            );
          } else {
            applyPf(0, 0);
          }
        } else {
          // โหมด 1 วัน (รายวัน): ดึงข้อมูลครบทั้งวันแบบวนหน้า
          const { startIso, endIso } = getTimeRangeIso('day', selectedDate);
          const data = await fetchAllReadings(deviceIds, startIso, endIso);
          if (!isSubscribed) return;

          if (data.length > 0) {
            const processed = processEnergyReadings(data as EnergyIngest[], 'day');
            setChartData(processed);

            const validItems = processed.filter(
              (item) => item.power_factor !== null && item.power_factor > 0
            );
            if (validItems.length > 0) {
              const highestPf = Math.max(...validItems.map((item) => item.power_factor as number));
              const totalPf = validItems.reduce((sum, item) => sum + (item.power_factor as number), 0);
              applyPf(
                Number((totalPf / validItems.length).toFixed(2)),
                Number(highestPf.toFixed(2))
              );
            } else {
              applyPf(0, 0);
            }
          } else {
            setChartData([]);
            applyPf(0, 0);
          }
        }
      } catch (err) {
        console.error('Error loading Power Factor chart:', err);
      } finally {
        if (isSubscribed && !silent) setLoading(false);
      }
    }

    fetchPfData();

    // รีเฟรชอัตโนมัติเฉพาะเมื่อดู "วันนี้" (ข้อมูลย้อนหลังไม่เปลี่ยน)
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const isToday = !selectedDate || selectedDate === todayStr;

    const interval = isToday
      ? setInterval(() => fetchPfData(true), 30000)
      : null;

    return () => {
      isSubscribed = false;
      if (interval) clearInterval(interval);
    };
  }, [buildingId, timeRange, selectedDate, isMultiDay]);

  if (loading) {
    return <div className="h-72 flex items-center justify-center text-slate-400">กำลังโหลดข้อมูล...</div>;
  }

  const hasData = chartData.some((item) => item.power_factor !== null && item.power_factor > 0);
  const isPenaltyRisk = avgPf < 0.85 && avgPf > 0;

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-500" /> Power Factor (PF)
          </h3>
          <p className="text-sm text-slate-500">
            {isMultiDay
              ? 'ค่าตัวประกอบกำลังไฟฟ้าสูงสุดประจำวัน (เป้าหมาย ≥ 0.85)'
              : 'ค่าตัวประกอบกำลังไฟฟ้า (เป้าหมาย ≥ 0.85)'}
          </p>
        </div>

        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${isPenaltyRisk
            ? 'bg-rose-50 border-rose-200 text-rose-700'
            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}
        >
          <span className="text-sm font-medium">{isMultiDay ? 'PF สูงสุด:' : 'PF เฉลี่ย:'}</span>
          <span className="text-base font-bold">{isMultiDay ? maxPf : avgPf}</span>
          {isPenaltyRisk && <span className="text-xs font-semibold text-rose-600">(เสี่ยงค่าปรับ)</span>}
        </div>
      </div>

      {!hasData ? (
        <div className="h-60 flex flex-col items-center justify-center text-slate-400 gap-2">
          <AlertTriangle className="w-8 h-8 text-slate-300" />
          <span>ไม่พบข้อมูล Power Factor ในช่วงเวลานี้</span>
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: isMultiDay ? 25 : 0 }}>
              <defs>
                <linearGradient id="colorPf" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

              {/* ปรับแต่งแกน X ให้เอียง -45 องศาแบบเดียวกับ Peak Demand */}
              <XAxis
                dataKey="time"
                interval={isMultiDay ? 0 : 'preserveStartEnd'}
                angle={isMultiDay ? -45 : 0}
                textAnchor={isMultiDay ? 'end' : 'middle'}
                height={isMultiDay ? 45 : 30}
                tick={{ fontSize: 11, fill: '#64748b' }}
                stroke="#cbd5e1"
              />
              <YAxis domain={[0, 1]} tick={{ fontSize: 13, fill: '#64748b' }} stroke="#cbd5e1" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white text-sm p-2.5 rounded-lg shadow-lg border border-slate-700">
                        <p className="font-medium text-slate-300 mb-1">{data.fullTime}</p>
                        <p className="text-blue-400 font-bold">
                          {isMultiDay ? 'PF สูงสุด: ' : 'PF รวม: '}
                          {data.power_factor !== null ? data.power_factor : 'ไม่มีข้อมูล'}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="power_factor"
                stroke="#2563eb"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorPf)"
                connectNulls={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};