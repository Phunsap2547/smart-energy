'use client';

import { use } from 'react';
import AlertHistoryTable from '@/components/admin/building/alerts/AlertHistoryTable';
import BuildingSidebar from '@/components/admin/building/shared/BuildingSidebar';

export default function AlertsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <BuildingSidebar buildingId={id} />
      <main className="flex-1 p-8 space-y-6">
        <h1 className="text-xl font-bold text-slate-800">ประวัติการแจ้งเตือน</h1>
        <AlertHistoryTable buildingId={id} />
      </main>
    </div>
  );
}