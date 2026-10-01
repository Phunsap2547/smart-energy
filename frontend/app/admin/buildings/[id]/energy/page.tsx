// 'use client';

// import React, { useState, useEffect, use } from 'react';
// import { supabase } from '@/lib/supabase';

// // Shared Components
// import BuildingSidebar from '@/components/admin/building/shared/BuildingSidebar';

// // Energy Components
// import AlertWidget from '@/components/admin/building/energy/AlertWidget';
// import DailyEnergyChart from '@/components/admin/building/energy/DailyEnergyChart';
// import EnergySummary from '@/components/admin/building/energy/EnergySummary';
// import EnergyTrendChart from '@/components/admin/building/energy/EnergyTrendChart';
// import ExportReportModal from '@/components/admin/building/energy/ExportReportModal';

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

// export default function EnergyPage({ params }: { params: Promise<{ id: string }> }) {
//   const resolvedParams = use(params);
//   const buildingId = resolvedParams.id;

//   const [telemetry, setTelemetry] = useState<EnergyTelemetryData | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);

//   useEffect(() => {
//     const fetchEnergyData = async () => {
//       if (!buildingId) return;

//       try {
//         // 1. ค้นหา device_id ของอาคารนี้
//         const { data: devices } = await supabase
//           .from('devices')
//           .select('id')
//           .eq('building_id', buildingId);

//         const deviceIds = devices?.map((d) => d.id) || [];
//         if (deviceIds.length === 0) {
//           setTelemetry(null);
//           return;
//         }

//         // 2. ดึงข้อมูลการอ่านค่าล่าสุด 1 รายการจาก energy_readings
//         const { data, error } = await supabase
//           .from('energy_readings')
//           .select('*')
//           .in('device_id', deviceIds)
//           .order('reading_time', { ascending: false })
//           .limit(1)
//           .maybeSingle();

//         if (data && !error) {
//           setTelemetry(data);
//         }
//       } catch (error) {
//         console.error('Failed to fetch energy telemetry:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchEnergyData();
//     // ดึงข้อมูลใหม่ทุกๆ 5 วินาที
//     const interval = setInterval(fetchEnergyData, 5000);
//     return () => clearInterval(interval);
//   }, [buildingId]);

//   return (
//     <div className="flex min-h-screen bg-slate-50/50">
//       {/* Sidebar */}
//       <BuildingSidebar buildingId={buildingId} />

//       {/* Main Content Area */}
//       <main className="flex-1 p-8 space-y-6 overflow-y-auto">
//         {/* Energy Summary Cards */}
//         <EnergySummary data={telemetry} loading={loading} />

//         {/* Charts Grid */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           <DailyEnergyChart buildingId={buildingId} />
//           <EnergyTrendChart buildingId={buildingId} />
//         </div>

//         {/* Alert Widget & Export Modal */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           <div className="lg:col-span-2">
//             <AlertWidget 
//               currentUnbalance={telemetry?.current_unbalance_pct}
//               voltageUnbalance={telemetry?.voltage_unbalance_pct}
//               thdCurrent={telemetry?.thd_current_l1_pct}
//             />
//           </div>
//           <div>
//             <ExportReportModal buildingId={buildingId} />
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }

// 'use client';

// import React, { useState, useEffect, use } from 'react';
// import { supabase } from '@/lib/supabase';

// // Shared Components
// import BuildingSidebar from '@/components/admin/building/shared/BuildingSidebar';

// // Energy Components
// import AlertWidget from '@/components/admin/building/energy/AlertWidget';
// import DailyEnergyChart from '@/components/admin/building/energy/DailyEnergyChart';
// import EnergySummary from '@/components/admin/building/energy/EnergySummary';
// import EnergyTrendChart from '@/components/admin/building/energy/EnergyTrendChart';
// import ExportReportModal from '@/components/admin/building/energy/ExportReportModal';

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

//   energy_kwh: number | null;               // ค่าสะสมรวมทั้งหมด
//   energy_start_of_day_kwh?: number | null;  // ค่าสะสม ณ เวลา 00:00 น.
//   daily_energy_kwh?: number | null;         // หน่วยไฟเฉพาะวันนี้

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

// export default function EnergyPage({ params }: { params: Promise<{ id: string }> }) {
//   const resolvedParams = use(params);
//   const buildingId = resolvedParams.id;

//   const [telemetry, setTelemetry] = useState<EnergyTelemetryData | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);

//   useEffect(() => {
//     const fetchEnergyData = async () => {
//       if (!buildingId) return;

//       try {
//         // 1. ค้นหา device_id ทั้งหมดของอาคารนี้
//         const { data: devices } = await supabase
//           .from('devices')
//           .select('id')
//           .eq('building_id', buildingId);

//         const deviceIds = devices?.map((d) => d.id) || [];
//         if (deviceIds.length === 0) {
//           setTelemetry(null);
//           return;
//         }

//         // 2. ดึงข้อมูลการอ่านค่าล่าสุด 1 รายการ
//         const { data: latestData, error: latestError } = await supabase
//           .from('energy_readings')
//           .select('*')
//           .in('device_id', deviceIds)
//           .order('reading_time', { ascending: false })
//           .limit(1)
//           .maybeSingle();

//         if (latestData && !latestError) {
//           // 3. หาวันเวลาเริ่มต้นของวันนี้ (00:00:00 น. เวลาไทย UTC+7)
//           const now = new Date();
//           const thaiDateStr = new Date(now.getTime() + 7 * 60 * 60 * 1000)
//             .toISOString()
//             .split('T')[0];
//           const startOfToday = `${thaiDateStr}T00:00:00`;

//           // 4. ดึงค่า energy_kwh แถวแรกสุดที่เกิดขึ้นตั้งแต่เที่ยงคืนของวันนี้
//           const { data: startOfDayData } = await supabase
//             .from('energy_readings')
//             .select('energy_kwh')
//             .in('device_id', deviceIds)
//             .gte('reading_time', startOfToday)
//             .order('reading_time', { ascending: true })
//             .limit(1)
//             .maybeSingle();

//           // 5. คำนวณหน่วยไฟเฉพาะของวันนี้
//           const currentEnergy = latestData.energy_kwh ?? 0;
//           const startOfDayEnergy = startOfDayData?.energy_kwh ?? currentEnergy;
//           const dailyEnergyKwh = Math.max(0, currentEnergy - startOfDayEnergy);

//           // 6. บันทึกข้อมูลเข้า State พร้อมค่าที่คำนวณแล้ว
//           setTelemetry({
//             ...latestData,
//             energy_start_of_day_kwh: startOfDayEnergy,
//             daily_energy_kwh: dailyEnergyKwh,
//           });
//         }
//       } catch (error) {
//         console.error('Failed to fetch energy telemetry:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchEnergyData();
//     // ดึงข้อมูลใหม่ทุกๆ 5 วินาที
//     const interval = setInterval(fetchEnergyData, 5000);
//     return () => clearInterval(interval);
//   }, [buildingId]);

//   return (
//     <div className="flex min-h-screen bg-slate-50/50">
//       {/* Sidebar */}
//       <BuildingSidebar buildingId={buildingId} />

//       {/* Main Content Area */}
//       <main className="flex-1 p-8 space-y-6 overflow-y-auto">
//         {/* Energy Summary Cards */}
//         <EnergySummary data={telemetry} loading={loading} />

//         {/* Charts Grid */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           <DailyEnergyChart buildingId={buildingId} />
//           <EnergyTrendChart buildingId={buildingId} />
//         </div>

//         {/* Alert Widget & Export Modal */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           <div className="lg:col-span-2">
//             <AlertWidget 
//               currentUnbalance={telemetry?.current_unbalance_pct}
//               voltageUnbalance={telemetry?.voltage_unbalance_pct}
//               thdCurrent={telemetry?.thd_current_l1_pct}
//             />
//           </div>
//           <div>
//             <ExportReportModal buildingId={buildingId} />
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }



//ยังไม่เพิ่มTOU (Time of Use) Energy Analysis ครับ โดยสร้างเป็นคอมโพเนนต์ใหม่ชื่อ TOUChart.tsx ที่มีการคำนวณแยกช่วง On-Peak (09:00 - 22:00 น. วันจันทร์-ศุกร์) และ Off-Peak (ช่วงกลางคืน วันเสาร์-อาทิตย์ และวันหยุด) พร้อมแสดงสัดส่วน kWh, ประมาณการค่าไฟตามอัตรา TOU จริง และมีคำแนะนำ Load Shifting ให้อัตโนมัติ
'use client';

import React, { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { Download } from 'lucide-react';

// Shared Components
import BuildingSidebar from '@/components/admin/building/shared/BuildingSidebar';

// Energy Components
import AlertWidget from '@/components/admin/building/energy/AlertWidget';
import DailyEnergyChart from '@/components/admin/building/energy/DailyEnergyChart';
import EnergySummary from '@/components/admin/building/energy/EnergySummary';
import EnergyTrendChart from '@/components/admin/building/energy/EnergyTrendChart';

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

export type TimeRangeOption = 'day' | '7d' | '30d';

export default function EnergyPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const buildingId = resolvedParams.id;
  const numericBuildingId = Number(buildingId);

  // State สำหรับตัวกรองช่วงเวลา
  const [timeRange, setTimeRange] = useState<TimeRangeOption>('day');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // State สำหรับชื่ออาคาร
  const [buildingName, setBuildingName] = useState<string>('');

  // State สำหรับควบคุม Modal ออกรายงาน
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  const [telemetry, setTelemetry] = useState<EnergyTelemetryData | null>(null);
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

  // ดึงข้อมูลชื่ออาคาร
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

  // ดึงข้อมูล Telemetry คำนวณตามช่วงเวลา (day / 7d / 30d)
  useEffect(() => {
    const fetchEnergyData = async () => {
      if (!buildingId) return;

      try {
        const { data: devices } = await supabase
          .from('devices')
          .select('id')
          .eq('building_id', buildingId);

        const deviceIds = devices?.map((d) => d.id) || [];
        if (deviceIds.length === 0) {
          setTelemetry(null);
          return;
        }

        // 1. ดึงข้อมูลล่าสุด 1 รายการ (ค่าปัจจุบัน)
        const { data: latestData, error: latestError } = await supabase
          .from('energy_readings')
          .select('*')
          .in('device_id', deviceIds)
          .order('reading_time', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (latestData && !latestError) {
          // 2. คำนวณวันเริ่มต้นตามช่วงเวลา timeRange
          const targetDate = new Date(selectedDate);
          if (timeRange === '7d') {
            targetDate.setDate(targetDate.getDate() - 6);
          } else if (timeRange === '30d') {
            targetDate.setDate(targetDate.getDate() - 29);
          }

          const startDateStr = targetDate.toISOString().split('T')[0];
          const startOfPeriod = `${startDateStr}T00:00:00`;
          const endOfPeriod = `${selectedDate}T23:59:59`;

          // ดึงค่าพลังงาน ณ จุดเริ่มต้นของช่วงเวลานั้น
          const { data: startOfPeriodData } = await supabase
            .from('energy_readings')
            .select('energy_kwh')
            .in('device_id', deviceIds)
            .gte('reading_time', startOfPeriod)
            .lte('reading_time', endOfPeriod)
            .order('reading_time', { ascending: true })
            .limit(1)
            .maybeSingle();

          const currentEnergy = latestData.energy_kwh ?? 0;
          const startEnergy = startOfPeriodData?.energy_kwh ?? currentEnergy;
          const periodEnergyKwh = Math.max(0, currentEnergy - startEnergy);

          setTelemetry({
            ...latestData,
            energy_start_of_day_kwh: startEnergy,
            daily_energy_kwh: periodEnergyKwh,
          });
        }
      } catch (error) {
        console.error('Failed to fetch energy telemetry:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnergyData();
    const interval = setInterval(fetchEnergyData, 5000);
    return () => clearInterval(interval);
  }, [buildingId, selectedDate, timeRange]);

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
              พลังงาน / รายงาน — วิเคราะห์การใช้ไฟฟ้า
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
            <button
              type="button"
              onClick={() => setIsExportOpen(true)}
              className="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>สร้างรายงาน</span>
            </button>
          </div>
        </div>

        {/* Energy Summary Cards */}
        <EnergySummary
          data={telemetry}
          timeRange={timeRange}
          loading={loading}
        />

        {/* Charts Grid 1: การใช้พลังงานและแนวโน้ม */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DailyEnergyChart buildingId={buildingId} timeRange={timeRange} selectedDate={selectedDate} />
          <EnergyTrendChart buildingId={buildingId} timeRange={timeRange} />
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
        </div>
        {/* Alert Widget */}
        <div className="grid grid-cols-1 gap-6">
          <AlertWidget
            buildingId={buildingId} // หรือ params.id ตามตัวแปรที่คุณใช้ใน page.tsx
            telemetry={telemetry}
            currentUnbalance={telemetry?.current_unbalance_pct}
            voltageUnbalance={telemetry?.voltage_unbalance_pct}
            thdCurrent={telemetry?.thd_current_l1_pct}
          />
        </div>

        {/* Modal พิมพ์รายงาน A4 */}
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
// import EnergyTrendChart from '@/components/admin/building/energy/EnergyTrendChart';
// import TOUChart from '@/components/admin/building/energy/TOUChart';
// import PeakDemandChart from '@/components/admin/building/energy/PeakDemandChart';
// import PowerFactorChart from '@/components/admin/building/energy/PowerFactorChart';
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

//   const [timeRange, setTimeRange] = useState<TimeRangeOption>('day');
//   const [selectedDate, setSelectedDate] = useState<string>(
//     new Date().toISOString().split('T')[0]
//   );

//   const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
//   const [telemetry, setTelemetry] = useState<EnergyTelemetryData | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);

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

//         const { data: latestData, error: latestError } = await supabase
//           .from('energy_readings')
//           .select('*')
//           .in('device_id', deviceIds)
//           .order('reading_time', { ascending: false })
//           .limit(1)
//           .maybeSingle();

//         if (latestData && !latestError) {
//           const startOfToday = `${selectedDate}T00:00:00`;

//           const { data: startOfDayData } = await supabase
//             .from('energy_readings')
//             .select('energy_kwh')
//             .in('device_id', deviceIds)
//             .gte('reading_time', startOfToday)
//             .order('reading_time', { ascending: true })
//             .limit(1)
//             .maybeSingle();

//           const currentEnergy = latestData.energy_kwh ?? 0;
//           const startOfDayEnergy = startOfDayData?.energy_kwh ?? currentEnergy;
//           const dailyEnergyKwh = Math.max(0, currentEnergy - startOfDayEnergy);

//           setTelemetry({
//             ...latestData,
//             energy_start_of_day_kwh: startOfDayEnergy,
//             daily_energy_kwh: dailyEnergyKwh,
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
//   }, [buildingId, selectedDate]);

//   return (
//     <div className="flex min-h-screen bg-slate-50/50">
//       <BuildingSidebar buildingId={buildingId} />

//       <main className="flex-1 p-8 space-y-6 overflow-y-auto">
//         {/* Header Section */}
//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//           <div>
//             <h1 className="text-xl font-bold text-slate-800">
//               พลังงาน / รายงาน — วิเคราะห์การใช้ไฟฟ้า
//             </h1>
//             <p className="text-xs text-slate-500 mt-1">
//               วิเคราะห์ปริมาณการใช้พลังงานไฟฟ้า ประเมินค่าบริการ และดูสถิตีย้อนหลัง ({getTimeRangeLabel()})
//             </p>
//           </div>

//           <div className="flex flex-wrap items-center gap-3">
//             <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs text-slate-700 shadow-sm">
//               <input
//                 type="date"
//                 value={selectedDate}
//                 onChange={(e) => setSelectedDate(e.target.value)}
//                 className="bg-transparent border-none outline-none focus:ring-0 text-xs font-semibold text-slate-700 cursor-pointer"
//               />
//             </div>

//             <select
//               value={timeRange}
//               onChange={(e) => setTimeRange(e.target.value as TimeRangeOption)}
//               className="bg-white border border-slate-200 text-xs font-semibold text-slate-700 px-3 py-2 rounded-xl shadow-sm outline-none cursor-pointer focus:ring-2 focus:ring-emerald-500/20"
//             >
//               <option value="day">รายวัน (เลือกวัน)</option>
//               <option value="7d">7 วันล่าสุด</option>
//               <option value="30d">30 วันล่าสุด</option>
//             </select>

//             <button
//               type="button"
//               onClick={() => setIsExportOpen(true)}
//               className="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-2"
//             >
//               <Download className="w-3.5 h-3.5" />
//               <span>พิมพ์รายงาน A4 / PDF</span>
//             </button>
//           </div>
//         </div>

//         {/* 1. Energy Summary */}
//         <EnergySummary data={telemetry} loading={loading} />

//         {/* 2. TOU Chart */}
//         {/* <TOUChart
//           buildingId={buildingId}
//           selectedDate={selectedDate}
//           timeRange={timeRange}
//         /> */}

//         {/* 5. Charts Grid */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           <DailyEnergyChart buildingId={buildingId} timeRange={timeRange} selectedDate={selectedDate} />
//           <EnergyTrendChart buildingId={buildingId} timeRange={timeRange} />
//         </div>

//         {/* 4. Power Factor Chart */}
//         {/* <PowerFactorChart
//           buildingId={buildingId}
//           selectedDate={selectedDate}
//           timeRange={timeRange}
//           pfThreshold={0.85}
//         /> */}

//         {/* 3. Peak Demand Chart */}
//         {/* <PeakDemandChart
//           buildingId={buildingId}
//           selectedDate={selectedDate}
//           timeRange={timeRange}
//           maxDemandThresholdKw={40}
//         /> */}


//         {/* 6. Alert Widget */}
//         <div className="grid grid-cols-1 gap-6">
//           <AlertWidget
//             currentUnbalance={telemetry?.current_unbalance_pct}
//             voltageUnbalance={telemetry?.voltage_unbalance_pct}
//             thdCurrent={telemetry?.thd_current_l1_pct}
//           />
//         </div>

//         {/* Modal พิมพ์รายงาน A4 */}
//         <EnergyPrintReportModal
//           isOpen={isExportOpen}
//           onClose={() => setIsExportOpen(false)}
//           buildingId={buildingId}
//           selectedDate={selectedDate}
//           telemetry={telemetry}
//         />
//       </main>
//     </div>
//   );
// }