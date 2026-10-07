
// //ยังไม่เพิ่มTOU (Time of Use) Energy Analysis ครับ โดยสร้างเป็นคอมโพเนนต์ใหม่ชื่อ TOUChart.tsx ที่มีการคำนวณแยกช่วง On-Peak (09:00 - 22:00 น. วันจันทร์-ศุกร์) และ Off-Peak (ช่วงกลางคืน วันเสาร์-อาทิตย์ และวันหยุด) พร้อมแสดงสัดส่วน kWh, ประมาณการค่าไฟตามอัตรา TOU จริง และมีคำแนะนำ Load Shifting ให้อัตโนมัติ
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
//           {/* <EnergyTrendChart buildingId={buildingId} timeRange={timeRange} /> */}
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
//         {/* <div className="grid grid-cols-1 gap-6">
//           <AlertWidget
//             buildingId={buildingId} // หรือ params.id ตามตัวแปรที่คุณใช้ใน page.tsx
//             telemetry={telemetry}
//             currentUnbalance={telemetry?.current_unbalance_pct}
//             voltageUnbalance={telemetry?.voltage_unbalance_pct}
//             thdCurrent={telemetry?.thd_current_l1_pct}
//           />
//         </div> */}

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
'use client';

import React, { useState, useEffect, use, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Download } from 'lucide-react';

// Shared Components
import BuildingSidebar from '@/components/admin/building/shared/BuildingSidebar';

// Energy Components
import DailyEnergyChart from '@/components/admin/building/energy/DailyEnergyChart';
import EnergySummary from '@/components/admin/building/energy/EnergySummary';

// Peak Demand & Power Factor Charts
import { PeakDemandChart } from '@/components/admin/building/energy/PeakDemandChart';
import { PowerFactorChart } from '@/components/admin/building/energy/PowerFactorChart';

// Modal สำหรับพิมพ์รายงาน A4
import EnergyPrintReportModal from '@/components/admin/building/energy/EnergyPrintReportModal';

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

// ค่าที่ได้จากกราฟ Peak Demand และ Power Factor สำหรับการ์ดสรุป
export interface EnergyPeakData {
  peakKw: number | null;
  peakKwTime: string | null;
  peakPf: number | null;
  /** 'avg' = PF เฉลี่ย (โหมดรายวัน), 'max' = PF สูงสุดรายวัน (โหมด 7/30 วัน) */
  pfKind: 'avg' | 'max';
}

export type TimeRangeOption = 'day' | '7d' | '30d';

const EMPTY_PEAK: EnergyPeakData = {
  peakKw: null,
  peakKwTime: null,
  peakPf: null,
  pfKind: 'avg',
};

export default function EnergyPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const buildingId = resolvedParams.id;
  const numericBuildingId = Number(buildingId);

  // State
  const [timeRange, setTimeRange] = useState<TimeRangeOption>('day');
  const [selectedDate, setSelectedDate] = useState<string>(
    () => new Date().toISOString().split('T')[0]
  );
  const [buildingName, setBuildingName] = useState<string>('');
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [telemetry, setTelemetry] = useState<EnergyTelemetryData | null>(null);
  const [peak, setPeak] = useState<EnergyPeakData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Helper Label
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

  // รับค่า Peak kW จากกราฟ Peak Demand
  const handlePeakChange = useCallback((kw: number, time: string) => {
    setPeak((prev) => ({
      ...(prev ?? EMPTY_PEAK),
      peakKw: kw > 0 ? kw : null,
      peakKwTime: time === '-' ? null : time,
    }));
  }, []);

  // รับค่า PF จากกราฟ Power Factor
  const handlePfChange = useCallback((pf: number, kind: 'avg' | 'max') => {
    setPeak((prev) => ({
      ...(prev ?? EMPTY_PEAK),
      peakPf: pf > 0 ? pf : null,
      pfKind: kind,
    }));
  }, []);

  // เมื่อเปลี่ยนอาคาร / วัน / ช่วงเวลา ให้ล้างค่าเดิมก่อน กราฟจะส่งค่าใหม่กลับมาหลังโหลดเสร็จ
  useEffect(() => {
    setPeak(null);
  }, [buildingId, selectedDate, timeRange]);

  // 1. ดึงข้อมูลอาคาร (ทำครั้งเดียวเมื่อ buildingId เปลี่ยน)
  useEffect(() => {
    if (!buildingId) return;

    let isSubscribed = true;
    const fetchBuildingInfo = async () => {
      const { data, error } = await supabase
        .from('buildings')
        .select('name')
        .eq('id', buildingId)
        .single();

      if (!error && data?.name && isSubscribed) {
        setBuildingName(data.name);
      }
    };

    fetchBuildingInfo();
    return () => {
      isSubscribed = false;
    };
  }, [buildingId]);

  // 2. คำนวณ Start Date String
  const calculateStartDate = useCallback((dateStr: string, range: TimeRangeOption) => {
    const targetDate = new Date(`${dateStr}T00:00:00`);
    if (range === '7d') {
      targetDate.setDate(targetDate.getDate() - 6);
    } else if (range === '30d') {
      targetDate.setDate(targetDate.getDate() - 29);
    }
    return targetDate.toISOString().split('T')[0];
  }, []);

  // 3. ดึงข้อมูล Telemetry คำนวณตามช่วงเวลา
  useEffect(() => {
    if (!buildingId) return;

    let isSubscribed = true;

    const fetchEnergyData = async () => {
      try {
        // ดึงอุปกรณ์ของอาคารนี้ก่อน
        const { data: devices, error: devError } = await supabase
          .from('devices')
          .select('id')
          .eq('building_id', buildingId);

        if (devError || !devices || devices.length === 0) {
          if (isSubscribed) setTelemetry(null);
          return;
        }

        const deviceIds = devices.map((d) => d.id);
        const startDateStr = calculateStartDate(selectedDate, timeRange);
        const startOfPeriod = `${startDateStr}T00:00:00`;
        const endOfPeriod = `${selectedDate}T23:59:59`;

        // ดึงข้อมูลล่าสุด + ข้อมูลต้นช่วงเวลาแบบ Parallel
        const [latestRes, startRes] = await Promise.all([
          supabase
            .from('energy_readings')
            .select('*')
            .in('device_id', deviceIds)
            .order('reading_time', { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabase
            .from('energy_readings')
            .select('energy_kwh')
            .in('device_id', deviceIds)
            .gte('reading_time', startOfPeriod)
            .lte('reading_time', endOfPeriod)
            .order('reading_time', { ascending: true })
            .limit(1)
            .maybeSingle(),
        ]);

        if (latestRes.data && isSubscribed) {
          const currentEnergy = latestRes.data.energy_kwh ?? 0;
          const startEnergy = startRes.data?.energy_kwh ?? currentEnergy;
          const periodEnergyKwh = Math.max(0, currentEnergy - startEnergy);

          setTelemetry({
            ...latestRes.data,
            energy_start_of_day_kwh: startEnergy,
            daily_energy_kwh: periodEnergyKwh,
          });
        }
      } catch (error) {
        console.error('Failed to fetch energy telemetry:', error);
      } finally {
        if (isSubscribed) setLoading(false);
      }
    };

    fetchEnergyData();
    const interval = setInterval(fetchEnergyData, 5000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [buildingId, selectedDate, timeRange, calculateStartDate]);

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      {/* Sidebar */}
      <BuildingSidebar buildingId={buildingId} />

      {/* Main Content Area */}
      <main className="flex-1 p-8 space-y-6 overflow-y-auto">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              พลังงาน / รายงาน — วิเคราะห์การใช้ไฟฟ้า
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              วิเคราะห์ปริมาณการใช้พลังงานไฟฟ้า ประเมินค่าบริการ และดูสถิตีย้อนหลัง ({getTimeRangeLabel()})
            </p>
          </div>

          {/* Control Bar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Date Picker */}
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs text-slate-700 shadow-sm">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent border-none outline-none focus:ring-0 text-xs font-semibold text-slate-700 cursor-pointer"
              />
            </div>

            {/* Time Range Dropdown */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRangeOption)}
              className="bg-white border border-slate-200 text-xs font-semibold text-slate-700 px-3 py-2 rounded-xl shadow-sm outline-none cursor-pointer focus:ring-2 focus:ring-emerald-500/20 transition-all"
            >
              <option value="day">รายวัน (เลือกวัน)</option>
              <option value="7d">7 วันล่าสุด</option>
              <option value="30d">30 วันล่าสุด</option>
            </select>

            {/* Export Button */}
            <button
              type="button"
              onClick={() => setIsExportOpen(true)}
              className="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>สร้างรายงาน</span>
            </button>
          </div>
        </div>

        {/* Energy Summary Cards */}
        <EnergySummary
          data={telemetry}
          peak={peak}
          timeRange={timeRange}
          loading={loading}
        />

        {/* Charts Grid 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DailyEnergyChart buildingId={buildingId} timeRange={timeRange} selectedDate={selectedDate} />
        </div>

        {/* Charts Grid 2: Peak Demand และ Power Factor เต็มความกว้างคนละกล่อง */}
        <div className="grid grid-cols-1 gap-6">
          <PeakDemandChart
            buildingId={numericBuildingId}
            timeRange={timeRange}
            selectedDate={selectedDate}
            onPeakChange={handlePeakChange}
          />
          <PowerFactorChart
            buildingId={numericBuildingId}
            timeRange={timeRange}
            selectedDate={selectedDate}
            onPfChange={handlePfChange}
          />
        </div>

        {/* Print Report Modal */}
        <EnergyPrintReportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          buildingId={buildingId}
          buildingName={buildingName}
          selectedDate={selectedDate}
          telemetry={telemetry}
        />
      </main>
    </div>
  );
}