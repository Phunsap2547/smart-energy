// app/admin/buildings/[id]/phases/page.tsx
'use client';

import React, { useState, useEffect, use, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { EnergyIngest } from '@/types/energy';
import { formatChartTime } from '@/lib/formatter';

import BuildingSidebar from '@/components/admin/building/shared/BuildingSidebar';
import PhaseLineChart from '@/components/admin/building/phase/PhaseLineChart';
import UnbalanceAlert from '@/components/admin/building/phase/UnbalanceAlert';
import { Download, ChevronDown, AlertCircle, Maximize2, X } from 'lucide-react';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Brush,
} from 'recharts';

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
  thd_v_a: number;
  thd_v_b: number;
  thd_v_c: number;
  thd_i_a: number;
  thd_i_b: number;
  thd_i_c: number;
}

export default function PhasePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const buildingId = resolvedParams.id;

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [timeRange, setTimeRange] = useState<string>('day');
  const [chartData, setChartData] = useState<PhaseDataPoint[]>([]); // เก็บข้อมูลทั้งหมด 24 ชม.
  const [currentUnbalance, setCurrentUnbalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // State สำหรับควบคุม Modal กราฟขยายใหญ่
  const [expandedChart, setExpandedChart] = useState<
    'voltage' | 'current' | 'pf' | 'power' | 'thd_v' | 'thd_i' | null
  >(null);

  // 🎯 ตัดข้อมูลเหลือเฉพาะ 300 จุดล่าสุด (~5 ชม.) สำหรับแสดงที่การ์ดหน้าแรก
  const recentChartData = useMemo(() => {
    if (timeRange === 'day' && chartData.length > 300) {
      return chartData.slice(-300); // เอา 300 จุดท้ายสุด (ล่าสุด ~5 ชม.)
    }
    return chartData;
  }, [chartData, timeRange]);

  const toLocalISOString = (date: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  useEffect(() => {
    let isMounted = true;

    // app/admin/buildings/[id]/phases/page.tsx

async function fetchPhaseTelemetry(isInitial = false) {
  if (isInitial) setLoading(true);
  const buildingIdNum = Number(buildingId);

  let startStr = '';
  let endStr: string | null = null;

  if (timeRange === 'day') {
    startStr = `${selectedDate}T00:00:00+07:00`;
    endStr = `${selectedDate}T23:59:59+07:00`;
  } else if (timeRange === '7d') {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    startStr = d.toISOString();
  } else if (timeRange === '30d') {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    startStr = d.toISOString();
  }

  // 🎯 ขยาย Limit สำหรับรายวันให้เพียงพอครอบคลุมทั้ง 24 ชม.
  const queryLimit = timeRange === 'day' ? 10000 : timeRange === '7d' ? 20000 : 50000;

  try {
    const { data: devices, error: deviceError } = await supabase
      .from('devices')
      .select('id')
      .eq('building_id', buildingIdNum);

    if (deviceError) console.error('Error fetching devices:', deviceError);

    const deviceIds = devices?.map((d) => d.id) || [];

    if (deviceIds.length === 0) {
      if (isMounted) {
        setChartData([]);
        setCurrentUnbalance(0);
      }
      return;
    }

    // 🎯 ใช้ ascending: false เพื่อให้ได้ข้อมูลเวลาปัจจุบันแน่นอนเสมอ
    let query = supabase
      .from('energy_readings')
      .select('*')
      .in('device_id', deviceIds)
      .gte('reading_time', startStr)
      .order('reading_time', { ascending: false })
      .limit(queryLimit);

    if (endStr) {
      query = query.lte('reading_time', endStr);
    }

    const { data, error } = await query;

    if (error) console.error('Error fetching energy_readings:', error);

    if (data && data.length > 0 && !error) {
      // กลับลำดับข้อมูลจาก ปัจจุบัน->อดีต ให้เป็น อดีต->ปัจจุบัน (00:00 -> ล่าสุด) เพื่อใช้วาดกราฟ
      const sortedData: EnergyIngest[] = [...data].reverse();

      const formatted: PhaseDataPoint[] = sortedData.map((row) => ({
        time: formatChartTime(row.reading_time || row.created_at),
        v_a: row.voltage_a ?? 0,
        v_b: row.voltage_b ?? 0,
        v_c: row.voltage_c ?? 0,
        i_a: row.current_a ?? 0,
        i_b: row.current_b ?? 0,
        i_c: row.current_c ?? 0,
        pf_a: row.pf_a ?? 0,
        pf_b: row.pf_b ?? 0,
        pf_c: row.pf_c ?? 0,
        p_a: row.power_a ?? 0,
        p_b: row.power_b ?? 0,
        p_c: row.power_c ?? 0,
        thd_v_a: row.thd_voltage_l1_pct ?? 0,
        thd_v_b: row.thd_voltage_l2_pct ?? 0,
        thd_v_c: row.thd_voltage_l3_pct ?? 0,
        thd_i_a: row.thd_current_l1_pct ?? 0,
        thd_i_b: row.thd_current_l2_pct ?? 0,
        thd_i_c: row.thd_current_l3_pct ?? 0,
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
    fetchPhaseTelemetry(true);

    const interval = setInterval(() => {
      fetchPhaseTelemetry(false);
    }, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [buildingId, timeRange, selectedDate]);

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case 'day':
        return `วันที่ ${selectedDate}`;
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
    link.setAttribute('download', `phase_analysis_building_${buildingId}_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getModalConfig = () => {
    switch (expandedChart) {
      case 'voltage':
        return {
          title: '⚡ แรงดันไฟฟ้า (V) รายเฟส',
          unit: 'V',
          keys: { l1: 'v_a', l2: 'v_b', l3: 'v_c' },
          domain: undefined,
        };
      case 'current':
        return {
          title: '🔌 กระแสไฟฟ้า (A) รายเฟส',
          unit: 'A',
          keys: { l1: 'i_a', l2: 'i_b', l3: 'i_c' },
          domain: undefined,
        };
      case 'pf':
        return {
          title: '📊 Power Factor รายเฟส',
          unit: '',
          keys: { l1: 'pf_a', l2: 'pf_b', l3: 'pf_c' },
          domain: [0, 1] as [number, number],
        };
      case 'power':
        return {
          title: '💡 Real Power (kW) รายเฟส',
          unit: 'kW',
          keys: { l1: 'p_a', l2: 'p_b', l3: 'p_c' },
          domain: undefined,
        };
      case 'thd_v':
        return {
          title: '📈 THD-Voltage (%) รายเฟส',
          unit: '%',
          keys: { l1: 'thd_v_a', l2: 'thd_v_b', l3: 'thd_v_c' },
          domain: undefined,
        };
      case 'thd_i':
        return {
          title: '📉 THD-Current (%) รายเฟส',
          unit: '%',
          keys: { l1: 'thd_i_a', l2: 'thd_i_b', l3: 'thd_i_c' },
          domain: undefined,
        };
      default:
        return null;
    }
  };

  const modalConfig = getModalConfig();

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
            {timeRange === 'day' && (
              <div className="relative flex items-center">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                />
              </div>
            )}

            <div className="relative">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-1.5 pr-8 text-xs font-medium text-gray-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="day">รายวัน (เลือกวัน)</option>
                <option value="7d">7 วันล่าสุด</option>
                <option value="30d">30 วันล่าสุด</option>
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
                ตาราง <code className="font-mono bg-amber-100/80 px-1 rounded">energy_readings</code> ไม่มีบันทึกข้อมูลย้อนหลังสำหรับตัวเลือกนี้ โปรดลองเปลี่ยนตัวเลือกช่วงเวลาหรือเลือกวันที่อื่น
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

        {/* 🟢 การ์ดกราฟ 6 ใบหลัก -> ส่ง `recentChartData` (แสดงเฉพาะ ~5 ชม. ล่าสุด) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="relative group">
            <button
              onClick={() => setExpandedChart('voltage')}
              className="absolute top-3 right-3 z-10 p-1.5 bg-white/80 hover:bg-white text-gray-600 hover:text-blue-600 rounded-lg border border-gray-200 shadow-xs transition-all flex items-center gap-1 text-xs font-medium cursor-pointer"
              title="ขยายดู 24 ชั่วโมง"
            >
              <Maximize2 size={13} />
              <span>ขยาย</span>
            </button>
            <PhaseLineChart
              title="แรงดันไฟฟ้า (V) รายเฟส"
              data={recentChartData}
              keys={{ l1: 'v_a', l2: 'v_b', l3: 'v_c' }}
              unit="V"
              loading={loading}
            />
          </div>

          <div className="relative group">
            <button
              onClick={() => setExpandedChart('current')}
              className="absolute top-3 right-3 z-10 p-1.5 bg-white/80 hover:bg-white text-gray-600 hover:text-blue-600 rounded-lg border border-gray-200 shadow-xs transition-all flex items-center gap-1 text-xs font-medium cursor-pointer"
              title="ขยายดู 24 ชั่วโมง"
            >
              <Maximize2 size={13} />
              <span>ขยาย</span>
            </button>
            <PhaseLineChart
              title="กระแสไฟฟ้า (A) รายเฟส"
              data={recentChartData}
              keys={{ l1: 'i_a', l2: 'i_b', l3: 'i_c' }}
              unit="A"
              loading={loading}
            />
          </div>

          <div className="relative group">
            <button
              onClick={() => setExpandedChart('pf')}
              className="absolute top-3 right-3 z-10 p-1.5 bg-white/80 hover:bg-white text-gray-600 hover:text-blue-600 rounded-lg border border-gray-200 shadow-xs transition-all flex items-center gap-1 text-xs font-medium cursor-pointer"
              title="ขยายดู 24 ชั่วโมง"
            >
              <Maximize2 size={13} />
              <span>ขยาย</span>
            </button>
            <PhaseLineChart
              title="Power Factor รายเฟส"
              data={recentChartData}
              keys={{ l1: 'pf_a', l2: 'pf_b', l3: 'pf_c' }}
              unit=""
              domain={[0, 1]}
              loading={loading}
            />
          </div>

          <div className="relative group">
            <button
              onClick={() => setExpandedChart('power')}
              className="absolute top-3 right-3 z-10 p-1.5 bg-white/80 hover:bg-white text-gray-600 hover:text-blue-600 rounded-lg border border-gray-200 shadow-xs transition-all flex items-center gap-1 text-xs font-medium cursor-pointer"
              title="ขยายดู 24 ชั่วโมง"
            >
              <Maximize2 size={13} />
              <span>ขยาย</span>
            </button>
            <PhaseLineChart
              title="Real power (kW) รายเฟส"
              data={recentChartData}
              keys={{ l1: 'p_a', l2: 'p_b', l3: 'p_c' }}
              unit="kW"
              loading={loading}
            />
          </div>

          <div className="relative group">
            <button
              onClick={() => setExpandedChart('thd_v')}
              className="absolute top-3 right-3 z-10 p-1.5 bg-white/80 hover:bg-white text-gray-600 hover:text-blue-600 rounded-lg border border-gray-200 shadow-xs transition-all flex items-center gap-1 text-xs font-medium cursor-pointer"
              title="ขยายดู 24 ชั่วโมง"
            >
              <Maximize2 size={13} />
              <span>ขยาย</span>
            </button>
            <PhaseLineChart
              title="THD-Voltage (%) รายเฟส"
              data={recentChartData}
              keys={{ l1: 'thd_v_a', l2: 'thd_v_b', l3: 'thd_v_c' }}
              unit="%"
              loading={loading}
            />
          </div>

          <div className="relative group">
            <button
              onClick={() => setExpandedChart('thd_i')}
              className="absolute top-3 right-3 z-10 p-1.5 bg-white/80 hover:bg-white text-gray-600 hover:text-blue-600 rounded-lg border border-gray-200 shadow-xs transition-all flex items-center gap-1 text-xs font-medium cursor-pointer"
              title="ขยายดู 24 ชั่วโมง"
            >
              <Maximize2 size={13} />
              <span>ขยาย</span>
            </button>
            <PhaseLineChart
              title="THD-Current (%) รายเฟส"
              data={recentChartData}
              keys={{ l1: 'thd_i_a', l2: 'thd_i_b', l3: 'thd_i_c' }}
              unit="%"
              loading={loading}
            />
          </div>
        </div>

        {chartData.length > 0 && (
          <UnbalanceAlert unbalanceValue={currentUnbalance} buildingId={buildingId} />
        )}
      </main>

      {/* 🟢 Popup Modal ขนาดใหญ่ -> ส่ง `chartData` (ดึงครบถ้วนทั้ง 24 ชั่วโมง) + แถบ Brush ลากเลื่อนดูย้อนหลังได้เลย */}
      {expandedChart && modalConfig && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 w-full max-w-6xl shadow-2xl relative flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  {modalConfig.title}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  แสดงข้อมูลทั้ง 24 ชั่วโมงของ {getTimeRangeLabel()} (ใช้แถบ Brush สีฟ้าด้านล่างเพื่อสไลด์เลื่อนดูย้อนหลังตลอดทั้งวัน)
                </p>
              </div>
              <button
                onClick={() => setExpandedChart(null)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content: กราฟขนาดใหญ่ทั้ง 24 ชม. */}
            <div className="w-full h-[520px] pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="time"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    domain={modalConfig.domain || ['auto', 'auto']}
                    unit={` ${modalConfig.unit}`}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Legend verticalAlign="top" height={36} />

                  <Line
                    type="monotone"
                    dataKey={modalConfig.keys.l1}
                    name="L1"
                    stroke="#3b82f6"
                    dot={false}
                    strokeWidth={2}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey={modalConfig.keys.l2}
                    name="L2"
                    stroke="#10b981"
                    dot={false}
                    strokeWidth={2}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey={modalConfig.keys.l3}
                    name="L3"
                    stroke="#f59e0b"
                    dot={false}
                    strokeWidth={2}
                    activeDot={{ r: 5 }}
                  />

                  {/* แถบ Brush สำหรับลากเลื่อนเวลาดูข้อมูลได้ตลอดทั้ง 24 ชม. */}
                  <Brush
                    dataKey="time"
                    height={32}
                    stroke="#3b82f6"
                    fill="#f8fafc"
                    startIndex={0}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}