'use client';

import React, { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { EnergyIngest } from '@/types/energy';
import { formatChartTime } from '@/lib/formatter';

import BuildingSidebar from '@/components/admin/building/shared/BuildingSidebar';
import PhaseLineChart from '@/components/admin/building/phase/PhaseLineChart';
import UnbalanceAlert from '@/components/admin/building/phase/UnbalanceAlert';
import { Download, ChevronDown, AlertCircle } from 'lucide-react';

export interface PhaseDataPoint {
  time: string;
  v_a: number;
  v_b: number;
  v_c: number;
  i_a: number;
  i_b: number;
  i_c: number;
  pf_a: number;
  pf_b: number;
  pf_c: number;
  p_a: number;
  p_b: number;
  p_c: number;
}

export default function PhasePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const buildingId = resolvedParams.id;

  const [timeRange, setTimeRange] = useState<string>('24h');
  const [chartData, setChartData] = useState<PhaseDataPoint[]>([]);
  const [currentUnbalance, setCurrentUnbalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchPhaseTelemetry(isInitial = false) {
      if (isInitial) setLoading(true);
      const buildingIdNum = Number(buildingId);

      // 1. คำนวณช่วงเวลาเริ่มต้น
      const startDate = new Date();
      if (timeRange === '24h') startDate.setHours(startDate.getHours() - 24);
      if (timeRange === '7d') startDate.setDate(startDate.getDate() - 7);
      if (timeRange === '30d') startDate.setDate(startDate.getDate() - 30);

      const queryLimit = timeRange === '24h' ? 100 : timeRange === '7d' ? 500 : 1500;

      try {
        // Step 1: ค้นหา device_id ทั้งหมดที่ผูกกับ building_id นี้
        const { data: devices, error: deviceError } = await supabase
          .from('devices')
          .select('id')
          .eq('building_id', buildingIdNum);

        if (deviceError) {
          console.error('Error fetching devices:', deviceError);
        }

        const deviceIds = devices?.map((d) => d.id) || [];

        // หากแม้อาคารนี้ไม่มี device เชื่อมอยู่ ให้หยุดการดึงข้อมูล
        if (deviceIds.length === 0) {
          if (isMounted) {
            setChartData([]);
            setCurrentUnbalance(0);
          }
          return;
        }

        // Step 2: Query ตาราง energy_readings ด้วย device_id และ reading_time
        const { data, error } = await supabase
          .from('energy_readings')
          .select('*')
          .in('device_id', deviceIds)
          .gte('reading_time', startDate.toISOString())
          .order('reading_time', { ascending: false })
          .limit(queryLimit);

        if (error) {
          console.error('Error fetching energy_readings:', error);
        }

        if (data && data.length > 0 && !error) {
          const sortedData: EnergyIngest[] = [...data].reverse();

          const formatted: PhaseDataPoint[] = sortedData.map((row) => ({
            time: formatChartTime(row.reading_time || row.created_at),
            v_a: row.voltage_a ?? 0,
            v_b: row.voltage_b ?? 0,
            v_c: row.voltage_c ?? 0,
            i_a: row.current_a ?? 0,
            i_b: row.current_b ?? 0,
            i_c: row.current_c ?? 0,
            pf_a: row.power_factor ?? 0,
            pf_b: row.power_factor ?? 0,
            pf_c: row.power_factor ?? 0,
            p_a: row.power_a ?? 0,
            p_b: row.power_b ?? 0,
            p_c: row.power_c ?? 0,
          }));

          if (isMounted) {
            setChartData(formatted);

            if (data[0]?.current_unbalance_pct !== undefined) {
              setCurrentUnbalance(data[0].current_unbalance_pct);
            }
          }
        } else {
          if (isMounted) {
            setChartData([]);
            setCurrentUnbalance(0);
          }
        }
      } catch (err) {
        console.error('Failed to fetch phase telemetry:', err);
        if (isMounted) setChartData([]);
      } finally {
        if (isMounted && isInitial) setLoading(false);
      }
    }

    // เรียกครั้งแรก (เปิด Spinner โหลด)
    fetchPhaseTelemetry(true);

    // ดึงข้อมูลใหม่ทุกๆ 5 วินาที
    const interval = setInterval(() => {
      fetchPhaseTelemetry(false);
    }, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [buildingId, timeRange]);

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case '24h':
        return '24 ชั่วโมงล่าสุด';
      case '7d':
        return '7 วันที่ผ่านมา';
      case '30d':
        return '30 วันที่ผ่านมา';
      default:
        return 'ช่วงเวลาที่เลือก';
    }
  };

  const handleExportCSV = () => {
    if (chartData.length === 0) return;
    const headers =
      'Time,Voltage A (V),Voltage B (V),Voltage C (V),Current A (A),Current B (A),Current C (A),Power A (kW),Power B (kW),Power C (kW)\n';
    const rows = chartData
      .map(
        (d) =>
          `${d.time},${d.v_a},${d.v_b},${d.v_c},${d.i_a},${d.i_b},${d.i_c},${d.p_a},${d.p_b},${d.p_c}`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `phase_analysis_building_${buildingId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <BuildingSidebar buildingId={buildingId} />

      <main className="flex-1 p-8 space-y-6 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">รายเฟส — วิเคราะห์ความสมดุล</h1>
            <p className="text-xs text-gray-500 mt-1">วิเคราะห์ความสมดุลการใช้ไฟฟ้าในแต่ละเฟสแบบเรียลไทม์</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-1.5 pr-8 text-xs font-medium text-gray-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="24h">24 ชั่วโมง</option>
                <option value="7d">7 วัน</option>
                <option value="30d">30 วันที่ผ่านมา</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              onClick={handleExportCSV}
              disabled={chartData.length === 0}
              className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-lg shadow-xs hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Download size={14} className="text-gray-500" />
              ดาวน์โหลด CSV
            </button>
          </div>
        </div>

        {!loading && chartData.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-4 rounded-xl flex items-start gap-3 shadow-2xs">
            <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900">ไม่พบข้อมูลพลังงานไฟฟ้าในช่วงเวลา {getTimeRangeLabel()}</p>
              <p className="text-amber-700 mt-0.5">
                ตาราง <code className="font-mono bg-amber-100/80 px-1 rounded">energy_readings</code> ไม่มีบันทึกข้อมูลย้อนหลังสำหรับตัวเลือกนี้ โปรดลองเปลี่ยนตัวเลือกช่วงเวลาอื่น
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-6 bg-white px-4 py-2.5 rounded-xl border border-gray-100 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span className="text-xs font-semibold text-gray-700">L1</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-semibold text-gray-700">L2</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-xs font-semibold text-gray-700">L3</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PhaseLineChart
            title="แรงดันไฟฟ้า (V) รายเฟส"
            data={chartData}
            keys={{ l1: 'v_a', l2: 'v_b', l3: 'v_c' }}
            unit="V"
            loading={loading}
          />

          <PhaseLineChart
            title="กระแสไฟฟ้า (A) รายเฟส"
            data={chartData}
            keys={{ l1: 'i_a', l2: 'i_b', l3: 'i_c' }}
            unit="A"
            loading={loading}
          />

          <PhaseLineChart
            title="Power Factor รายเฟส"
            data={chartData}
            keys={{ l1: 'pf_a', l2: 'pf_b', l3: 'pf_c' }}
            unit=""
            domain={[0, 1]}
            loading={loading}
          />

          <PhaseLineChart
            title="Real power (kW) รายเฟส"
            data={chartData}
            keys={{ l1: 'p_a', l2: 'p_b', l3: 'p_c' }}
            unit="kW"
            loading={loading}
          />
        </div>

        {chartData.length > 0 && (
          <UnbalanceAlert unbalanceValue={currentUnbalance} buildingId={buildingId} />
        )}
      </main>
    </div>
  );
}