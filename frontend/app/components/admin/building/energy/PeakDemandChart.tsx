//PeakDemandChart.tsx
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
import { Zap, AlertTriangle } from 'lucide-react';

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

interface PeakDemandChartProps {
  buildingId: string | number;
  timeRange?: 'day' | '7d' | '30d' | string;
  selectedDate?: string;
  /** ส่งค่า Peak kW และเวลา กลับไปให้หน้าหลัก (ใช้แสดงในการ์ดสรุป) */
  onPeakChange?: (kw: number, time: string) => void;
}

export const PeakDemandChart: React.FC<PeakDemandChartProps> = ({
  buildingId,
  timeRange = 'day',
  selectedDate,
  onPeakChange,
}) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [peakKw, setPeakKw] = useState<number>(0);
  const [peakTime, setPeakTime] = useState<string>('-');
  const [loading, setLoading] = useState<boolean>(true);

  // เก็บ callback ไว้ใน ref เพื่อไม่ให้การเปลี่ยน callback ทำให้ดึงข้อมูลใหม่
  const onPeakChangeRef = useRef(onPeakChange);
  useEffect(() => {
    onPeakChangeRef.current = onPeakChange;
  }, [onPeakChange]);

  const isMultiDay = timeRange === '7d' || timeRange === '30d';

  useEffect(() => {
    let isSubscribed = true;

    // อัปเดต state ภายใน + แจ้งหน้าหลักในที่เดียว
    const applyPeak = (kw: number, time: string) => {
      if (!isSubscribed) return;
      setPeakKw(kw);
      setPeakTime(time);
      onPeakChangeRef.current?.(kw, time);
    };

    async function fetchPeakData() {
      if (!buildingId) return;

      try {
        setLoading(true);

        const { data: devices, error: deviceError } = await supabase
          .from('devices')
          .select('id')
          .eq('building_id', buildingId);

        if (deviceError) throw deviceError;

        const deviceIds = devices?.map((d) => d.id) || [];
        if (deviceIds.length === 0) {
          if (!isSubscribed) return;
          setChartData([]);
          applyPeak(0, '-');
          return;
        }

        if (isMultiDay) {
          const daysCount = timeRange === '30d' ? 30 : 7;
          const baseDate = selectedDate ? new Date(selectedDate) : new Date();

          const dayPromises = [];
          for (let i = daysCount - 1; i >= 0; i--) {
            const d = new Date(baseDate);
            d.setDate(d.getDate() - i);

            const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
            const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

            dayPromises.push(
              supabase
                .from('energy_readings')
                .select('power_kw, reading_time')
                .in('device_id', deviceIds)
                .gte('reading_time', startOfDay.toISOString())
                .lte('reading_time', endOfDay.toISOString())
                // .gt ตัดแถว NULL ออก (Postgres เรียง NULL ขึ้นก่อนเมื่อ desc ทำให้ limit(1) ได้แถวว่าง)
                .gt('power_kw', 0)
                .order('power_kw', { ascending: false, nullsFirst: false })
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
                  const val = maxRead ? Number(maxRead.power_kw) || null : null;

                  return {
                    time: dayLabel,
                    fullTime: fullDateLabel,
                    power_kw: val && val > 0 ? val : null,
                  };
                })
            );
          }

          const results = await Promise.all(dayPromises);
          if (!isSubscribed) return;

          // กรองเอาเฉพาะวันที่มีข้อมูลจริงเพื่อไม่ให้เกิดพื้นที่ว่างสีขาวฝั่งซ้าย
          const validResults = results.filter(
            (item) => item.power_kw !== null && item.power_kw > 0
          );
          const finalData = validResults.length > 0 ? validResults : results;

          setChartData(finalData);

          let maxKw = 0;
          let maxTime = '-';
          finalData.forEach((item) => {
            if (item.power_kw && item.power_kw > maxKw) {
              maxKw = item.power_kw;
              maxTime = item.fullTime;
            }
          });

          applyPeak(Number(maxKw.toFixed(2)), maxTime);
        } else {
          // โหมดรายวัน: ดึงข้อมูลครบทั้งวันแบบวนหน้า
          const { startIso, endIso } = getTimeRangeIso('day', selectedDate);
          const data = await fetchAllReadings(deviceIds, startIso, endIso);
          if (!isSubscribed) return;

          if (data.length > 0) {
            const processed = processEnergyReadings(data as EnergyIngest[], 'day');
            setChartData(processed);

            let maxKw = 0;
            let maxTime = '-';
            processed.forEach((item) => {
              if (item.power_kw > maxKw) {
                maxKw = item.power_kw;
                maxTime = item.fullTime;
              }
            });

            applyPeak(Number(maxKw.toFixed(2)), maxTime);
          } else {
            setChartData([]);
            applyPeak(0, '-');
          }
        }
      } catch (err) {
        console.error('Error loading Peak Demand chart:', err);
      } finally {
        if (isSubscribed) setLoading(false);
      }
    }

    fetchPeakData();

    return () => {
      isSubscribed = false;
    };
  }, [buildingId, timeRange, selectedDate, isMultiDay]);

  if (loading) {
    return <div className="h-72 flex items-center justify-center text-slate-400">กำลังโหลดข้อมูล...</div>;
  }

  const hasData = chartData.some((item) => item.power_kw !== null && item.power_kw > 0);

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-500" /> Peak Demand (kW)
          </h3>
          <p className="text-sm text-slate-500">
            {isMultiDay ? 'ความต้องการพลังงานไฟฟ้าสูงสุดประจำวัน' : 'ความต้องการพลังงานไฟฟ้าสูงสุด'}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
          <span className="text-sm text-amber-700 font-medium">Peak สูงสุด:</span>
          <span className="text-base font-bold text-amber-600">{peakKw.toLocaleString()} kW</span>
          <span className="text-xs text-amber-500 font-normal">({peakTime})</span>
        </div>
      </div>

      {!hasData ? (
        <div className="h-60 flex flex-col items-center justify-center text-slate-400 gap-2">
          <AlertTriangle className="w-8 h-8 text-slate-300" />
          <span>ไม่พบข้อมูลการใช้ไฟฟ้าในช่วงเวลานี้</span>
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: isMultiDay ? 25 : 0 }}>
              <defs>
                <linearGradient id="colorKw" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

              {/* ปรับแต่งแกน X ให้เอียง 45 องศาเฉพาะตอนแสดงหลายวัน เพื่อป้องกันข้อความซ้อนกัน */}
              <XAxis
                dataKey="time"
                interval={isMultiDay ? 0 : 'preserveStartEnd'}
                angle={isMultiDay ? -45 : 0}
                textAnchor={isMultiDay ? 'end' : 'middle'}
                height={isMultiDay ? 45 : 30}
                tick={{ fontSize: 11, fill: '#64748b' }}
                stroke="#cbd5e1"
              />
              <YAxis tick={{ fontSize: 13, fill: '#64748b' }} stroke="#cbd5e1" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white text-sm p-2.5 rounded-lg shadow-lg border border-slate-700">
                        <p className="font-medium text-slate-300 mb-1">{data.fullTime}</p>
                        <p className="text-amber-400 font-bold">
                          {isMultiDay ? 'Peak สูงสุด: ' : 'กำลังไฟฟ้า: '}
                          {data.power_kw !== null ? `${data.power_kw?.toLocaleString()} kW` : 'ไม่มีข้อมูล'}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="power_kw"
                stroke="#f59e0b"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorKw)"
                connectNulls={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};