// 'use client';

// import { use } from 'react';
// import AlertHistoryTable from '@/components/admin/building/alerts/AlertHistoryTable';
// import BuildingSidebar from '@/components/admin/building/shared/BuildingSidebar';

// export default function AlertsPage({ params }: { params: Promise<{ id: string }> }) {
//   const { id } = use(params);

//   return (
//     <div className="flex min-h-screen bg-slate-50/50">
//       <BuildingSidebar buildingId={id} />
//       <main className="flex-1 p-8 space-y-6">
//         <h1 className="text-xl font-bold text-slate-800">ประวัติการแจ้งเตือน</h1>
//         <AlertHistoryTable buildingId={id} />
//       </main>
//     </div>
//   );
// }

'use client';

import { use, useEffect, useState, useCallback } from 'react';
import AlertHistoryTable from '@/components/admin/building/alerts/AlertHistoryTable';
import BuildingSidebar from '@/components/admin/building/shared/BuildingSidebar';
import StatusAlertBanners from '@/components/admin/building/alerts/StatusAlertBanners';

import { supabase } from '@/lib/supabase';
import { EnergyIngest } from '@/types/energy';
import { useDeviceStatus } from '@/hooks/useDeviceStatus';

export default function AlertsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const buildingId = Number(id);

  const [latestData, setLatestData] = useState<EnergyIngest | null>(null);

  // ⚡ ใช้ Hook เดียวกันกับหน้า Overview
  const status = useDeviceStatus(latestData);

  const fetchLatestData = useCallback(async () => {
    if (!buildingId) return;

    try {
      const { data: devices } = await supabase
        .from('devices')
        .select('id')
        .eq('building_id', buildingId);

      if (!devices || devices.length === 0) return;
      const deviceIds = devices.map((d) => d.id);

      const { data: latestRow } = await supabase
        .from('energy_readings')
        .select('*')
        .in('device_id', deviceIds)
        .order('reading_time', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestRow) {
        setLatestData(latestRow);
      }
    } catch (err) {
      console.error('Fetch latest error in alerts page:', err);
    }
  }, [buildingId]);

  useEffect(() => {
    fetchLatestData();
    const interval = setInterval(fetchLatestData, 5000);
    return () => clearInterval(interval);
  }, [fetchLatestData]);

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <BuildingSidebar buildingId={buildingId} />
      <main className="flex-1 p-8 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">ประวัติการแจ้งเตือน</h1>
            <p className="text-sm text-slate-500 mt-1">
              ติดตามเหตุการณ์ความผิดปกติ และการตรวจจับไฟดับ / สัญญาณขาดหาย (0 - 15 นาที)
            </p>
          </div>
        </div>

        {/* ⚡ Banner แจ้งเตือนไฟดับ / ค่าผิดปกติแบบ Realtime */}
        <StatusAlertBanners status={status} />

        {/* ตารางแสดงผลประวัติการแจ้งเตือน */}
        <AlertHistoryTable buildingId={buildingId} />
      </main>
    </div>
  );
}