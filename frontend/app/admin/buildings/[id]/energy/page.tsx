
// 'use client';

// import React, { useState, useEffect, use } from 'react';
// import { supabase } from '@/lib/supabase';
// import { Download } from 'lucide-react';

// // Shared Components
// import BuildingSidebar from '@/components/admin/building/shared/BuildingSidebar';

// // Energy Components
// import AlertWidget from '@/components/admin/building/energy/AlertWidget';
// import DailyEnergyChart from '@/components/admin/building/energy/DailyEnergyChart';
// import EnergySummary from '@/components/admin/building/energy/EnergySummary';

// import Current_S from '@/components/admin/building/energy/CurrentChart';

// // Peak Demand & Power Factor Charts
// import { PeakDemandChart } from '@/components/admin/building/energy/PeakDemandChart';
// import { PowerFactorChart } from '@/components/admin/building/energy/PowerFactorChart';

// // Modal สำหรับพิมพ์รายงาน A4
// import EnergyPrintReportModal from '@/components/admin/building/energy/EnergyPrintReportModal';

// export interface EnergyTelemetryData {
//   voltage_system: number | null;
//   voltage_a: number | null;
//   voltage_b: number | null;
//   voltage_c: number | null;

//   current_system: number | null;
//   current_a: number | null;
//   current_b: number | null;
//   current_c: number | null;

//   power_kw: number | null;
//   power_a: number | null;
//   power_b: number | null;
//   power_c: number | null;

//   energy_kwh: number | null;
//   energy_start_of_day_kwh?: number | null;
//   daily_energy_kwh?: number | null;

//   power_factor: number | null;
//   pf_a: number | null;
//   pf_b: number | null;
//   pf_c: number | null;

//   frequency_hz: number | null;
//   voltage_unbalance_pct: number | null;
//   current_unbalance_pct: number | null;
//   thd_voltage_l1_pct: number | null;
//   thd_current_l1_pct: number | null;
// }

// export type TimeRangeOption = 'day' | '7d' | '30d';

// export default function EnergyPage({ params }: { params: Promise<{ id: string }> }) {
//   const resolvedParams = use(params);
//   const buildingId = resolvedParams.id;
//   const numericBuildingId = Number(buildingId);

//   // State สำหรับตัวกรองช่วงเวลา
//   const [timeRange, setTimeRange] = useState<TimeRangeOption>('day');
//   const [selectedDate, setSelectedDate] = useState<string>(
//     new Date().toISOString().split('T')[0]
//   );

//   // State สำหรับชื่ออาคาร
//   const [buildingName, setBuildingName] = useState<string>('');

//   // State สำหรับควบคุม Modal ออกรายงาน
//   const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

//   const [telemetry, setTelemetry] = useState<EnergyTelemetryData | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);

//   // Helper function แปลงป้ายชื่อช่วงเวลา
//   const getTimeRangeLabel = () => {
//     switch (timeRange) {
//       case 'day':
//         return `วันที่ ${selectedDate}`;
//       case '7d':
//         return '7 วันที่ผ่านมา';
//       case '30d':
//         return '30 วันที่ผ่านมา';
//       default:
//         return 'ช่วงเวลาที่เลือก';
//     }
//   };

//   // ดึงข้อมูลชื่ออาคาร
//   useEffect(() => {
//     const fetchBuildingInfo = async () => {
//       if (!buildingId) return;
//       const { data } = await supabase
//         .from('buildings')
//         .select('name')
//         .eq('id', buildingId)
//         .single();

//       if (data?.name) {
//         setBuildingName(data.name);
//       }
//     };

//     fetchBuildingInfo();
//   }, [buildingId]);

//   // ดึงข้อมูล Telemetry คำนวณตามช่วงเวลา (day / 7d / 30d)
//   useEffect(() => {
//     const fetchEnergyData = async () => {
//       if (!buildingId) return;

//       try {
//         const { data: devices } = await supabase
//           .from('devices')
//           .select('id')
//           .eq('building_id', buildingId);

//         const deviceIds = devices?.map((d) => d.id) || [];
//         if (deviceIds.length === 0) {
//           setTelemetry(null);
//           return;
//         }

//         // 1. ดึงข้อมูลล่าสุด 1 รายการ (ค่าปัจจุบัน)
//         const { data: latestData, error: latestError } = await supabase
//           .from('energy_readings')
//           .select('*')
//           .in('device_id', deviceIds)
//           .order('reading_time', { ascending: false })
//           .limit(1)
//           .maybeSingle();

//         if (latestData && !latestError) {
//           // 2. คำนวณวันเริ่มต้นตามช่วงเวลา timeRange
//           const targetDate = new Date(selectedDate);
//           if (timeRange === '7d') {
//             targetDate.setDate(targetDate.getDate() - 6);
//           } else if (timeRange === '30d') {
//             targetDate.setDate(targetDate.getDate() - 29);
//           }

//           const startDateStr = targetDate.toISOString().split('T')[0];
//           const startOfPeriod = `${startDateStr}T00:00:00`;
//           const endOfPeriod = `${selectedDate}T23:59:59`;

//           // ดึงค่าพลังงาน ณ จุดเริ่มต้นของช่วงเวลานั้น
//           const { data: startOfPeriodData } = await supabase
//             .from('energy_readings')
//             .select('energy_kwh')
//             .in('device_id', deviceIds)
//             .gte('reading_time', startOfPeriod)
//             .lte('reading_time', endOfPeriod)
//             .order('reading_time', { ascending: true })
//             .limit(1)
//             .maybeSingle();

//           const currentEnergy = latestData.energy_kwh ?? 0;
//           const startEnergy = startOfPeriodData?.energy_kwh ?? currentEnergy;
//           const periodEnergyKwh = Math.max(0, currentEnergy - startEnergy);

//           setTelemetry({
//             ...latestData,
//             energy_start_of_day_kwh: startEnergy,
//             daily_energy_kwh: periodEnergyKwh,
//           });
//         }
//       } catch (error) {
//         console.error('Failed to fetch energy telemetry:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchEnergyData();
//     const interval = setInterval(fetchEnergyData, 5000);
//     return () => clearInterval(interval);
//   }, [buildingId, selectedDate, timeRange]);

//   return (
//     <div className="flex min-h-screen bg-slate-50/50">
//       {/* Sidebar */}
//       <BuildingSidebar buildingId={buildingId} />

//       {/* Main Content Area */}
//       <main className="flex-1 p-8 space-y-6 overflow-y-auto">

//         {/* --- Header Section --- */}
//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//           <div>
//             <h1 className="text-xl font-bold text-slate-800">
//               พลังงาน / รายงาน — วิเคราะห์การใช้ไฟฟ้า
//             </h1>
//             <p className="text-xs text-slate-500 mt-1">
//               วิเคราะห์ปริมาณการใช้พลังงานไฟฟ้า ประเมินค่าบริการ และดูสถิตีย้อนหลัง ({getTimeRangeLabel()})
//             </p>
//           </div>

//           {/* Control Bar ด้านขวาบน */}
//           <div className="flex flex-wrap items-center gap-3">
//             {/* เลือกวันที่ (Date Picker) */}
//             <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs text-slate-700 shadow-sm">
//               <input
//                 type="date"
//                 value={selectedDate}
//                 onChange={(e) => setSelectedDate(e.target.value)}
//                 className="bg-transparent border-none outline-none focus:ring-0 text-xs font-semibold text-slate-700 cursor-pointer"
//               />
//             </div>

//             {/* Dropdown เลือกช่วงเวลา */}
//             <select
//               value={timeRange}
//               onChange={(e) => setTimeRange(e.target.value as TimeRangeOption)}
//               className="bg-white border border-slate-200 text-xs font-semibold text-slate-700 px-3 py-2 rounded-xl shadow-sm outline-none cursor-pointer focus:ring-2 focus:ring-emerald-500/20"
//             >
//               <option value="day">รายวัน (เลือกวัน)</option>
//               <option value="7d">7 วันล่าสุด</option>
//               <option value="30d">30 วันล่าสุด</option>
//             </select>

//             {/* ปุ่มสร้างรายงาน */}
//             <button
//               type="button"
//               onClick={() => setIsExportOpen(true)}
//               className="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
//             >
//               <Download className="w-3.5 h-3.5" />
//               <span>สร้างรายงาน</span>
//             </button>
//           </div>
//         </div>

//         {/* Energy Summary Cards */}
//         <EnergySummary
//           data={telemetry}
//           timeRange={timeRange}
//           loading={loading}
//         />

//         {/* Charts Grid 1: การใช้พลังงานและแนวโน้ม */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           <DailyEnergyChart buildingId={buildingId} timeRange={timeRange} selectedDate={selectedDate} />
//           <Current_S buildingId={buildingId} timeRange={timeRange} />
//         </div>

//         {/* Charts Grid 2: Peak Demand และ Power Factor */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           <PeakDemandChart
//             buildingId={numericBuildingId}
//             timeRange={timeRange}
//             selectedDate={selectedDate}
//           />
//           <PowerFactorChart
//             buildingId={numericBuildingId}
//             timeRange={timeRange}
//             selectedDate={selectedDate}
//           />
//         </div>
//         {/* Alert Widget */}
//         <div className="grid grid-cols-1 gap-6">
//           {/* <AlertWidget
//             buildingId={buildingId} // หรือ params.id ตามตัวแปรที่คุณใช้ใน page.tsx
//             telemetry={telemetry}
//             currentUnbalance={telemetry?.current_unbalance_pct}
//             voltageUnbalance={telemetry?.voltage_unbalance_pct}
//             thdCurrent={telemetry?.thd_current_l1_pct}
//           /> */}
//         </div>

//         {/* Modal พิมพ์รายงาน A4 */}
//         <EnergyPrintReportModal
//           isOpen={isExportOpen}
//           onClose={() => setIsExportOpen(false)}
//           buildingId={buildingId}
//           buildingName={buildingName}
//           selectedDate={selectedDate}
//           telemetry={telemetry}
//         />
//       </main>
//     </div>
//   );
// }


//app/admin/buildings/[id]/energy/page.tsx
'use client';

import React, { useState, useEffect, useMemo, use } from 'react';
import { supabase } from '@/lib/supabase';
import { Download } from 'lucide-react';

// Shared Components
import BuildingSidebar from '@/components/admin/building/shared/BuildingSidebar';

// Energy Components
import DailyEnergyChart from '@/components/admin/building/energy/DailyEnergyChart';
import EnergySummary from '@/components/admin/building/energy/EnergySummary';
import CurrentChart from '@/components/admin/building/energy/CurrentChart';

// Peak Demand & Power Factor Charts
import { PeakDemandChart } from '@/components/admin/building/energy/PeakDemandChart';
import { PowerFactorChart } from '@/components/admin/building/energy/PowerFactorChart';

// Modal สำหรับพิมพ์รายงาน A4
import EnergyPrintReportModal from '@/components/admin/building/energy/EnergyPrintReportModal';
import { EnergyIngest } from '@/types/energy';

import HourlyAverageChart from '@/components/admin/building/energy/HourlyAverageChart';

export interface EnergyTelemetryData {
  voltage_system: number | null;
  voltage_a: number | null;
  voltage_b: number | null;
  voltage_c: number | null;

  current_system: number | null;
  current_a: number | null;
  current_b: number | null;
  current_c: number | null;

  power_kw: number | null;
  power_a: number | null;
  power_b: number | null;
  power_c: number | null;

  energy_kwh: number | null;
  energy_start_of_day_kwh?: number | null;
  daily_energy_kwh?: number | null;

  power_factor: number | null;
  pf_a: number | null;
  pf_b: number | null;
  pf_c: number | null;

  frequency_hz: number | null;
  voltage_unbalance_pct: number | null;
  current_unbalance_pct: number | null;
  thd_voltage_l1_pct: number | null;
  thd_current_l1_pct: number | null;
}

export type TimeRangeOption = 'day' | '7d' | '30d';

// แปลงวันที่เป็น YYYY-MM-DD ตามเวลาท้องถิ่น (กันวันที่เพี้ยนช่วงหลังเที่ยงคืน)
const toLocalDateStr = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// ดึง energy_readings ครบทั้งช่วงเวลา โดยวนดึงทีละ 1000 แถว (Supabase จำกัด 1000 แถวต่อครั้ง)
async function fetchAllHistory(
  deviceIds: (string | number)[],
  startIso: string,
  endIso: string
): Promise<EnergyIngest[]> {
  const PAGE_SIZE = 1000;
  const all: EnergyIngest[] = [];

  for (let page = 0; ; page++) {
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from('energy_readings')
      .select('*')
      .in('device_id', deviceIds)
      .gte('reading_time', startIso)
      .lte('reading_time', endIso)
      .order('reading_time', { ascending: true })
      .range(from, to);

    if (error) throw error;
    if (!data || data.length === 0) break;

    all.push(...(data as EnergyIngest[]));
    if (data.length < PAGE_SIZE) break;
  }

  return all;
}

export default function EnergyPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const buildingId = resolvedParams.id;
  const numericBuildingId = Number(buildingId);

  // State สำหรับตัวกรองช่วงเวลา
  const [timeRange, setTimeRange] = useState<TimeRangeOption>('day');
  const [selectedDate, setSelectedDate] = useState<string>(toLocalDateStr(new Date()));

  // State สำหรับชื่ออาคาร
  const [buildingName, setBuildingName] = useState<string>('');

  // State สำหรับควบคุม Modal ออกรายงาน
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  const [deviceIds, setDeviceIds] = useState<(string | number)[]>([]);
  const [latestReading, setLatestReading] = useState<any | null>(null);
  const [startEnergy, setStartEnergy] = useState<number | null>(null);
  const [ingestData, setIngestData] = useState<EnergyIngest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Helper function แปลงป้ายชื่อช่วงเวลา
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

  // 1. ดึงชื่ออาคาร
  useEffect(() => {
    const fetchBuildingInfo = async () => {
      if (!buildingId) return;
      const { data } = await supabase
        .from('buildings')
        .select('name')
        .eq('id', buildingId)
        .single();

      if (data?.name) {
        setBuildingName(data.name);
      }
    };

    fetchBuildingInfo();
  }, [buildingId]);

  // 2. ดึงรายการอุปกรณ์ของอาคาร (ครั้งเดียวต่ออาคาร)
  useEffect(() => {
    let cancelled = false;

    const fetchDevices = async () => {
      if (!buildingId) return;
      const { data } = await supabase
        .from('devices')
        .select('id')
        .eq('building_id', buildingId);

      if (cancelled) return;
      const ids = data?.map((d) => d.id) || [];
      setDeviceIds(ids);
      if (ids.length === 0) {
        setLatestReading(null);
        setIngestData([]);
        setStartEnergy(null);
        setLoading(false);
      }
    };

    fetchDevices();
    return () => {
      cancelled = true;
    };
  }, [buildingId]);

  // 3. ดึงข้อมูลประวัติ (ทำเฉพาะตอนเปลี่ยนวันที่ / ช่วงเวลา)
  useEffect(() => {
    if (deviceIds.length === 0) return;
    let cancelled = false;

    const fetchHistory = async () => {
      try {
        // ใช้ UTC ทั้งหมดเพื่อให้การบวกลบวันที่ไม่เพี้ยน
        const start = new Date(`${selectedDate}T00:00:00Z`);
        if (timeRange === '7d') start.setUTCDate(start.getUTCDate() - 6);
        else if (timeRange === '30d') start.setUTCDate(start.getUTCDate() - 29);

        const startDateStr = start.toISOString().split('T')[0];
        const startOfPeriod = `${startDateStr}T00:00:00`;
        const endOfPeriod = `${selectedDate}T23:59:59`;

        const history = await fetchAllHistory(deviceIds, startOfPeriod, endOfPeriod);
        if (cancelled) return;

        setIngestData(history);
        setStartEnergy(history.length > 0 ? history[0].energy_kwh ?? null : null);
      } catch (error) {
        console.error('Failed to fetch energy history:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchHistory();
    return () => {
      cancelled = true;
    };
  }, [deviceIds, selectedDate, timeRange]);

  // 4. ดึงค่าล่าสุด (รีเฟรชทุก 5 วินาที ดึงแค่ 1 แถว)
  useEffect(() => {
    if (deviceIds.length === 0) return;
    let cancelled = false;

    const fetchLatest = async () => {
      try {
        const { data, error } = await supabase
          .from('energy_readings')
          .select('*')
          .in('device_id', deviceIds)
          .order('reading_time', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!cancelled && data && !error) {
          setLatestReading(data);
        }
      } catch (error) {
        console.error('Failed to fetch latest energy reading:', error);
      }
    };

    fetchLatest();
    const interval = setInterval(fetchLatest, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [deviceIds]);

  // รวมค่าล่าสุด + พลังงานเริ่มต้นของช่วงเวลา เป็น telemetry
  const telemetry: EnergyTelemetryData | null = useMemo(() => {
    if (!latestReading) return null;
    const currentEnergy = latestReading.energy_kwh ?? 0;
    const start = startEnergy ?? currentEnergy;
    return {
      ...latestReading,
      energy_start_of_day_kwh: start,
      daily_energy_kwh: Math.max(0, currentEnergy - start),
    };
  }, [latestReading, startEnergy]);

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      {/* Sidebar */}
      <BuildingSidebar buildingId={buildingId} />

      {/* Main Content Area */}
      <main className="flex-1 p-8 space-y-6 overflow-y-auto">
        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              พลังงาน — วิเคราะห์การใช้ไฟฟ้า
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              วิเคราะห์ปริมาณการใช้พลังงานไฟฟ้า ประเมินค่าบริการ และดูสถิตีย้อนหลัง ({getTimeRangeLabel()})
            </p>
          </div>

          {/* Control Bar ด้านขวาบน */}
          <div className="flex flex-wrap items-center gap-3">
            {/* เลือกวันที่ (Date Picker) */}
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs text-slate-700 shadow-sm">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent border-none outline-none focus:ring-0 text-xs font-semibold text-slate-700 cursor-pointer"
              />
            </div>

            {/* Dropdown เลือกช่วงเวลา */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRangeOption)}
              className="bg-white border border-slate-200 text-xs font-semibold text-slate-700 px-3 py-2 rounded-xl shadow-sm outline-none cursor-pointer focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="day">รายวัน (เลือกวัน)</option>
              <option value="7d">7 วันล่าสุด</option>
              <option value="30d">30 วันล่าสุด</option>
            </select>

            {/* ปุ่มสร้างรายงาน */}
            {/* <button
              type="button"
              onClick={() => setIsExportOpen(true)}
              className="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>สร้างรายงาน</span>
            </button> */}
          </div>
        </div>

        {/* Energy Summary Cards */}
        <EnergySummary data={telemetry} timeRange={timeRange} loading={loading} />

        {/* Charts Grid 1: วางคู่ขนานกันสองฝั่ง */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ฝั่งซ้าย: การใช้พลังงานรายชั่วโมง */}
          <DailyEnergyChart
            buildingId={buildingId}
            timeRange={timeRange}
            selectedDate={selectedDate}
          />

          
          <HourlyAverageChart buildingId={buildingId} selectedDate={selectedDate} />
        </div>

        {/* Charts Grid 2: Peak Demand และ Power Factor */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PeakDemandChart
            buildingId={numericBuildingId}
            timeRange={timeRange}
            selectedDate={selectedDate}
          />
          <PowerFactorChart
            buildingId={numericBuildingId}
            timeRange={timeRange}
            selectedDate={selectedDate}
          />

          {/* ฝั่งขวา: กระแสไฟฟ้ารวม System Current */}
          <CurrentChart data={ingestData} timeRange={timeRange} />
        </div>

        {/* Modal พิมพ์รายงาน A4
        <EnergyPrintReportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          buildingId={buildingId}
          buildingName={buildingName}
          selectedDate={selectedDate}
          telemetry={telemetry}
        /> */}
      </main>
    </div>
  );
}