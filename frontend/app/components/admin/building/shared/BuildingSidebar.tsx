'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  Building2,
  LayoutGrid,
  Layers,
  Activity,
  BarChart3,
  Bell,
  SlidersHorizontal,
} from 'lucide-react';
import RealtimeClock from './RealtimeClock';

interface BuildingSidebarProps {
  buildingId: string;
}

export default function BuildingSidebar({ buildingId }: BuildingSidebarProps) {
  const pathname = usePathname();

  const [buildingName, setBuildingName] = useState<string>('กำลังโหลด...');
  const [isOnline, setIsOnline] = useState<boolean>(false);

  useEffect(() => {
    async function fetchBuildingAndStatus() {
      if (!buildingId) return;

      try {
        // 1. ดึงชื่ออาคาร
        const { data: building } = await supabase
          .from('buildings')
          .select('name')
          .eq('id', buildingId)
          .single();

        if (building) setBuildingName(building.name || 'ไม่ระบุชื่ออาคาร');

        // 2. ดึง device_id ของอาคารนี้
        const { data: devices } = await supabase
          .from('devices')
          .select('id')
          .eq('building_id', buildingId);

        const deviceIds = devices?.map((d) => d.id) || [];

        if (deviceIds.length > 0) {
          // 3. ดึงเวลาอ่านค่าล่าสุดของอุปกรณ์ในอาคารนี้
          const { data: latestReading } = await supabase
            .from('energy_readings')
            .select('reading_time')
            .in('device_id', deviceIds)
            .order('reading_time', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (latestReading?.reading_time) {
            const lastTime = new Date(latestReading.reading_time).getTime();
            const now = new Date().getTime();
            const diffMinutes = (now - lastTime) / (1000 * 60);

            // ถ้ามีข้อมูลเข้ามาภายใน 10 นาที ถือว่า Online
            setIsOnline(diffMinutes <= 10);
          } else {
            setIsOnline(false);
          }
        } else {
          setIsOnline(false);
        }
      } catch (err) {
        console.error('Fetch status error:', err);
        setIsOnline(false);
      }
    }

    fetchBuildingAndStatus();
  }, [buildingId]);

  
  const navItems = [
    { id: 'overview', label: 'ภาพรวม', icon: LayoutGrid, href: `/admin/buildings/${buildingId}` },
    { id: 'phases', label: 'รายเฟส', icon: Layers, href: `/admin/buildings/${buildingId}/phase` },
    // { id: 'quality', label: 'คุณภาพไฟฟ้า', icon: Activity, href: `/admin/buildings/${buildingId}/quality` },
    { id: 'reports', label: 'พลังงาน / รายงาน', icon: BarChart3, href: `/admin/buildings/${buildingId}/energy` },
    { id: 'alerts', label: 'แจ้งเตือน', icon: Bell, href: `/admin/buildings/${buildingId}/alerts` },
    { id: 'thresholds', label: 'ตั้งค่า threshold', icon: SlidersHorizontal, href: `/admin/buildings/${buildingId}/threshold` },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-100 min-h-screen p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        {/* Building Title Header */}
        <div className="flex items-center gap-3 p-2 rounded-xl bg-emerald-50/40 border border-emerald-100/60">
          <div className="p-2.5 bg-emerald-700 text-white rounded-lg shadow-xs shrink-0">
            <Building2 size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-sm text-gray-900 leading-tight truncate">
              {buildingName}
            </h2>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
              <span className={isOnline ? 'text-emerald-600' : 'text-slate-500'}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </span>
          </div>
        </div>

        {/* Menu Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <Icon
                  size={18}
                  className={isActive ? 'text-emerald-700' : 'text-gray-400'}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Clock Widget */}
      <div className="pt-4 border-t border-gray-100">
        <RealtimeClock />
      </div>
    </aside>
  );
}