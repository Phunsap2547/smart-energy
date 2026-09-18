'use client';

import React, { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';

// Shared Components
import BuildingSidebar from '@/components/admin/building/shared/BuildingSidebar';

// Energy Components
import AlertWidget from '@/components/admin/building/energy/AlertWidget';
import DailyEnergyChart from '@/components/admin/building/energy/DailyEnergyChart';
import EnergySummary from '@/components/admin/building/energy/EnergySummary';
import EnergyTrendChart from '@/components/admin/building/energy/EnergyTrendChart';
import ExportReportModal from '@/components/admin/building/energy/ExportReportModal';

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

export default function EnergyPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const buildingId = resolvedParams.id;

  const [telemetry, setTelemetry] = useState<EnergyTelemetryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchEnergyData = async () => {
      if (!buildingId) return;

      try {
        // 1. ค้นหา device_id ของอาคารนี้
        const { data: devices } = await supabase
          .from('devices')
          .select('id')
          .eq('building_id', buildingId);

        const deviceIds = devices?.map((d) => d.id) || [];
        if (deviceIds.length === 0) {
          setTelemetry(null);
          return;
        }

        // 2. ดึงข้อมูลการอ่านค่าล่าสุด 1 รายการจาก energy_readings
        const { data, error } = await supabase
          .from('energy_readings')
          .select('*')
          .in('device_id', deviceIds)
          .order('reading_time', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data && !error) {
          setTelemetry(data);
        }
      } catch (error) {
        console.error('Failed to fetch energy telemetry:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnergyData();
    // ดึงข้อมูลใหม่ทุกๆ 5 วินาที
    const interval = setInterval(fetchEnergyData, 5000);
    return () => clearInterval(interval);
  }, [buildingId]);

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      {/* Sidebar */}
      <BuildingSidebar buildingId={buildingId} />

      {/* Main Content Area */}
      <main className="flex-1 p-8 space-y-6 overflow-y-auto">
        {/* Energy Summary Cards */}
        <EnergySummary data={telemetry} loading={loading} />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DailyEnergyChart buildingId={buildingId} />
          <EnergyTrendChart buildingId={buildingId} />
        </div>

        {/* Alert Widget & Export Modal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AlertWidget 
              currentUnbalance={telemetry?.current_unbalance_pct}
              voltageUnbalance={telemetry?.voltage_unbalance_pct}
              thdCurrent={telemetry?.thd_current_l1_pct}
            />
          </div>
          <div>
            <ExportReportModal buildingId={buildingId} />
          </div>
        </div>
      </main>
    </div>
  );
}