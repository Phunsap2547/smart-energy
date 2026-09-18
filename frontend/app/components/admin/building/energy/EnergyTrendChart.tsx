'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { supabase } from '@/lib/supabase';

interface EnergyTrendChartProps {
  buildingId: string;
}

interface RealtimeDataPoint {
  time: string;
  power_kw: number;
}

export default function EnergyTrendChart({ buildingId }: EnergyTrendChartProps) {
  const [data, setData] = useState<RealtimeDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 1. ดึงข้อมูล 15 ค่าล่าสุดมาแสดงเริ่มต้น
  const fetchInitialData = useCallback(async () => {
    if (!buildingId) return;

    try {
      setLoading(true);

      const { data: devices } = await supabase
        .from('devices')
        .select('id')
        .eq('building_id', buildingId);

      if (!devices || devices.length === 0) {
        setData([]);
        return;
      }

      const deviceIds = devices.map((d) => d.id);

      const { data: readings, error } = await supabase
        .from('energy_readings')
        .select('reading_time, power_kw')
        .in('device_id', deviceIds)
        .order('reading_time', { ascending: false })
        .limit(15);

      if (error || !readings) {
        console.error('Error fetching initial trend:', error);
        return;
      }

      // เรียงเวลาจากอดีตไปปัจจุบันเพื่อวาดกราฟ
      const formatted = readings.reverse().map((item) => {
        const timeStr = new Date(item.reading_time).toLocaleTimeString('th-TH', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        return {
          time: timeStr,
          power_kw: item.power_kw ?? 0,
        };
      });

      setData(formatted);
    } catch (err) {
      console.error('Realtime chart fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [buildingId]);

  useEffect(() => {
    fetchInitialData();

    if (!buildingId) return;

    // 2. ดักฟังข้อมูลใหม่แบบ Realtime WebSocket จาก Supabase
    const channel = supabase
      .channel(`realtime-power-${buildingId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'energy_readings',
        },
        (payload) => {
          const newReading = payload.new;
          if (newReading && newReading.power_kw !== undefined) {
            const timeStr = new Date(newReading.reading_time || Date.now()).toLocaleTimeString('th-TH', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            });

            const newPoint: RealtimeDataPoint = {
              time: timeStr,
              power_kw: Number(newReading.power_kw ?? 0),
            };

            // ดันข้อมูลใหม่เข้ากราฟ และเก็บเฉพาะ 15 จุดล่าสุด
            setData((prev) => [...prev.slice(-14), newPoint]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [buildingId, fetchInitialData]);

  const latestPower = data.length > 0 ? data[data.length - 1].power_kw : 0;

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-800 text-sm">กำลังไฟฟ้า Real-time (kW)</h3>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">อัปเดตข้อมูลสดเมื่อ ESP32 ส่งค่าเข้ามา</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
            ปัจจุบัน: {latestPower.toFixed(2)} kW
          </span>
        </div>
      </div>

      <div className="h-64 w-full flex items-center justify-center">
        {loading ? (
          <div className="text-xs text-slate-400">กำลังเชื่อมต่อข้อมูล Real-time...</div>
        ) : data.length === 0 ? (
          <div className="text-xs text-slate-400">รอรับข้อมูล Real-time จากมิเตอร์...</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="realtimePower" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                formatter={(value: number) => [`${value} kW`, 'กำลังไฟฟ้า']}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
              />
              <Area
                type="monotone"
                dataKey="power_kw"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#realtimePower)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}