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
}

interface DailyDataItem {
  day: string;
  energy: number;
}

const DAYS_TH = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

export default function DailyEnergyChart({ buildingId }: DailyEnergyChartProps) {
  const [data, setData] = useState<DailyDataItem[]>([]);
  const [avgEnergy, setAvgEnergy] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDailyEnergy = useCallback(async () => {
    if (!buildingId) return;

    try {
      setLoading(true);

      // 1. ดึง device_id ทั้งหมดของอาคารนี้
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

      // 2. คำนวณช่วงเวลา 7 วันย้อนหลัง
      const now = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      // 3. ดึงข้อมูล energy_readings ในรอบ 7 วัน
      const { data: readings, error: readingsError } = await supabase
        .from('energy_readings')
        .select('reading_time, energy_kwh')
        .in('device_id', deviceIds)
        .gte('reading_time', sevenDaysAgo.toISOString())
        .order('reading_time', { ascending: true });

      if (readingsError) {
        console.error('Error fetching daily energy readings:', readingsError);
        return;
      }

      if (!readings || readings.length === 0) {
        setData([]);
        setAvgEnergy(0);
        return;
      }

      // 4. จัดกลุ่มตามวัน และคำนวณพลังงานที่ใช้ในแต่ละวัน (Max kWh - Min kWh)
      const dailyMap: { [key: string]: { min: number; max: number; dayName: string } } = {};

      readings.forEach((item) => {
        if (item.energy_kwh === null || item.energy_kwh === undefined) return;

        const dateObj = new Date(item.reading_time);
        const dateKey = dateObj.toISOString().split('T')[0];
        const dayName = DAYS_TH[dateObj.getDay()];

        if (!dailyMap[dateKey]) {
          dailyMap[dateKey] = {
            min: item.energy_kwh,
            max: item.energy_kwh,
            dayName,
          };
        } else {
          dailyMap[dateKey].min = Math.min(dailyMap[dateKey].min, item.energy_kwh);
          dailyMap[dateKey].max = Math.max(dailyMap[dateKey].max, item.energy_kwh);
        }
      });

      // แปลงข้อมูลเพื่อส่งให้ Recharts
      const chartData: DailyDataItem[] = Object.keys(dailyMap)
        .sort()
        .map((dateKey) => {
          const item = dailyMap[dateKey];
          const diff = Math.max(0, item.max - item.min);
          return {
            day: item.dayName,
            energy: Number(diff.toFixed(1)),
          };
        });

      setData(chartData);

      // คำนวณค่าเฉลี่ยต่อวัน
      if (chartData.length > 0) {
        const total = chartData.reduce((sum, d) => sum + d.energy, 0);
        setAvgEnergy(Number((total / chartData.length).toFixed(1)));
      } else {
        setAvgEnergy(0);
      }
    } catch (err) {
      console.error('Daily energy fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [buildingId]);

  useEffect(() => {
    fetchDailyEnergy();
  }, [buildingId, fetchDailyEnergy]);

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">การใช้พลังงานรายวัน (kWh)</h3>
          <p className="text-xs text-slate-400 mt-0.5">ปริมาณการใช้งานในสัปดาห์นี้</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
            {loading ? 'กำลังคำนวณ...' : `เฉลี่ย ${avgEnergy} kWh/วัน`}
          </span>
        </div>
      </div>

      <div className="h-64 w-full flex items-center justify-center">
        {loading ? (
          <div className="text-xs text-slate-400">กำลังโหลดข้อมูล...</div>
        ) : data.length === 0 ? (
          <div className="text-xs text-slate-400">ไม่มีข้อมูลการใช้พลังงานในสัปดาห์นี้</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip
                formatter={(value: number) => [`${value} kWh`, 'ปริมาณการใช้ไฟ']}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
              />
              <Bar dataKey="energy" fill="#10b981" radius={[6, 6, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}