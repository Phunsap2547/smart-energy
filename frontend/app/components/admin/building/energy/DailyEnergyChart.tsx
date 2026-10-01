'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { supabase } from '@/lib/supabase';

interface DailyEnergyChartProps {
  buildingId: string;
  timeRange?: 'day' | '7d' | '30d';
  selectedDate?: string;
}

interface ChartDataItem {
  label: string;
  fullDateText: string; 
  energy: number;
}

const DAYS_TH_FULL = [
  'วันอาทิตย์',
  'วันจันทร์',
  'วันอังคาร',
  'วันพุธ',
  'วันพฤหัสบดี',
  'วันศุกร์',
  'วันเสาร์',
];

const DAYS_TH_SHORT = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

const MONTHS_TH_FULL = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

// แปลง Date Object เป็น YYYY-MM-DD
const formatDateStr = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// แปลง Date Object เป็นข้อความวันที่เต็มภาษาไทย (เช่น วันจันทร์ที่ 29 กันยายน 2569)
const formatFullThaiDate = (d: Date, isHourView: boolean = false, hourStr: string = ''): string => {
  const dayName = DAYS_TH_FULL[d.getDay()];
  const dateNum = d.getDate();
  const monthName = MONTHS_TH_FULL[d.getMonth()];
  const thaiYear = d.getFullYear() + 543;

  if (isHourView) {
    return `${dayName}ที่ ${dateNum} ${monthName} ${thaiYear} เวลา ${hourStr} น.`;
  }
  return `${dayName}ที่ ${dateNum} ${monthName} ${thaiYear}`;
};

// แกะชั่วโมงจาก Timestamp
const extractHourFromTimestamp = (readingTimeStr: string): string => {
  if (!readingTimeStr) return '00:00';
  let timePart = '';
  if (readingTimeStr.includes('T')) {
    timePart = readingTimeStr.split('T')[1];
  } else if (readingTimeStr.includes(' ')) {
    timePart = readingTimeStr.split(' ')[1];
  }
  if (timePart) {
    const hour = timePart.split(':')[0];
    if (hour && !isNaN(Number(hour))) {
      return `${String(Number(hour)).padStart(2, '0')}:00`;
    }
  }
  return '00:00';
};

export default function DailyEnergyChart({
  buildingId,
  timeRange = 'day',
  selectedDate,
}: DailyEnergyChartProps) {
  const [data, setData] = useState<ChartDataItem[]>([]);
  const [avgEnergy, setAvgEnergy] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchEnergyChartData = useCallback(async () => {
    if (!buildingId) return;

    try {
      setLoading(true);

      const { data: devices, error: deviceError } = await supabase
        .from('devices')
        .select('id')
        .eq('building_id', buildingId);

      if (deviceError || !devices || devices.length === 0) {
        setData([]);
        setAvgEnergy(0);
        return;
      }

      const deviceIds = devices.map((d) => d.id);

      // 1. คำนวณช่วงวันที่เริ่มต้น - สิ้นสุด ตาม timeRange
      const targetDateObj = selectedDate ? new Date(selectedDate) : new Date();
      const endDateObj = new Date(targetDateObj);
      const startDateObj = new Date(targetDateObj);

      if (timeRange === '7d') {
        startDateObj.setDate(targetDateObj.getDate() - 6);
      } else if (timeRange === '30d') {
        startDateObj.setDate(targetDateObj.getDate() - 29);
      }

      const startDateStr = `${formatDateStr(startDateObj)} 00:00:00`;
      const endDateStr = `${formatDateStr(endDateObj)} 23:59:59`;

      // 2. ดึงข้อมูลแบบ Pagination Loop
      let allReadings: any[] = [];
      let page = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const from = page * pageSize;
        const to = from + pageSize - 1;

        const { data: batch, error: batchError } = await supabase
          .from('energy_readings')
          .select('reading_time, energy_kwh')
          .in('device_id', deviceIds)
          .gte('reading_time', startDateStr)
          .lte('reading_time', endDateStr)
          .order('reading_time', { ascending: true })
          .range(from, to);

        if (batchError || !batch || batch.length === 0) {
          hasMore = false;
        } else {
          allReadings = [...allReadings, ...batch];
          if (batch.length < pageSize) {
            hasMore = false;
          } else {
            page++;
          }
        }
      }

      // 3. สร้าง Skeleton มารอไว้ก่อน
      const groupedMap: { 
        [key: string]: { 
          min: number | null; 
          max: number | null; 
          label: string;
          fullDateText: string;
        } 
      } = {};

      if (timeRange === 'day') {
        for (let h = 0; h < 24; h++) {
          const hourStr = `${String(h).padStart(2, '0')}:00`;
          groupedMap[hourStr] = { 
            min: null, 
            max: null, 
            label: hourStr,
            fullDateText: formatFullThaiDate(targetDateObj, true, hourStr),
          };
        }
      } else {
        const totalDays = timeRange === '7d' ? 7 : 30;
        for (let i = totalDays - 1; i >= 0; i--) {
          const d = new Date(targetDateObj);
          d.setDate(d.getDate() - i);
          const dateKey = formatDateStr(d);
          const label = timeRange === '7d' ? DAYS_TH_SHORT[d.getDay()] : `${d.getDate()}/${d.getMonth() + 1}`;
          
          groupedMap[dateKey] = { 
            min: null, 
            max: null, 
            label,
            fullDateText: formatFullThaiDate(d),
          };
        }
      }

      // 4. จัดกลุ่มข้อมูลลง groupedMap
      allReadings.forEach((item) => {
        if (item.energy_kwh === null || item.energy_kwh === undefined) return;

        let groupKey = '';

        if (timeRange === 'day') {
          groupKey = extractHourFromTimestamp(item.reading_time);
        } else {
          const datePart = item.reading_time.replace('T', ' ').split(' ')[0];
          groupKey = datePart;
        }

        if (groupedMap[groupKey]) {
          const currentMin = groupedMap[groupKey].min;
          const currentMax = groupedMap[groupKey].max;

          groupedMap[groupKey].min = currentMin === null ? item.energy_kwh : Math.min(currentMin, item.energy_kwh);
          groupedMap[groupKey].max = currentMax === null ? item.energy_kwh : Math.max(currentMax, item.energy_kwh);
        }
      });

      // 5. คำนวณพลังงาน (Max - Min)
      const chartData: ChartDataItem[] = Object.keys(groupedMap)
        .sort()
        .map((key) => {
          const item = groupedMap[key];
          const diff = (item.max !== null && item.min !== null) ? Math.max(0, item.max - item.min) : 0;
          return {
            label: item.label,
            fullDateText: item.fullDateText,
            energy: Number(diff.toFixed(1)),
          };
        });

      setData(chartData);

      if (chartData.length > 0) {
        const total = chartData.reduce((sum, d) => sum + d.energy, 0);
        setAvgEnergy(Number((total / chartData.length).toFixed(1)));
      } else {
        setAvgEnergy(0);
      }
    } catch (err) {
      console.error('Daily energy chart fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [buildingId, timeRange, selectedDate]);

  useEffect(() => {
    fetchEnergyChartData();
  }, [fetchEnergyChartData]);

  const chartTitle = timeRange === 'day' 
    ? 'การใช้พลังงานรายชั่วโมง (kWh)' 
    : timeRange === '7d' 
    ? 'การใช้พลังงานรายวัน (7 วันล่าสุด)' 
    : 'การใช้พลังงานรายวัน (30 วันล่าสุด)';

  const avgLabel = timeRange === 'day' ? 'kWh/ชั่วโมง' : 'kWh/วัน';

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">{chartTitle}</h3>
          <p className="text-xs text-slate-400 mt-0.5">ปริมาณการใช้ไฟแยกตามช่วงเวลา</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
            {loading ? 'กำลังคำนวณ...' : `เฉลี่ย ${avgEnergy} ${avgLabel}`}
          </span>
        </div>
      </div>

      <div className="h-64 w-full flex items-center justify-center">
        {loading ? (
          <div className="text-xs text-slate-400">กำลังโหลดข้อมูล...</div>
        ) : data.length === 0 ? (
          <div className="text-xs text-slate-400">ไม่มีข้อมูลการใช้พลังงานในช่วงเวลานี้</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="label" 
                tickLine={false} 
                axisLine={false} 
                tick={{ fontSize: 10, fill: '#64748b' }} 
                interval={0}
              />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              
              {/* 💡 แสดงข้อมูลวันที่เต็ม พ.ศ. เมื่อนำเมาส์ไปชี้แท่งกราฟ */}
              <Tooltip
                labelFormatter={(_, payload) => {
                  if (payload && payload.length > 0) {
                    return payload[0].payload.fullDateText;
                  }
                  return '';
                }}
                formatter={(value: number) => [`${value} kWh`, 'ปริมาณการใช้ไฟ']}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="energy" fill="#10b981" radius={[6, 6, 0, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}