'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, ChevronRight } from 'lucide-react';

interface UnbalanceAlertProps {
  unbalanceValue?: number;
  buildingId: string;
}

export default function UnbalanceAlert({
  unbalanceValue = 0.2,
  buildingId,
}: UnbalanceAlertProps) {
  const isWarning = unbalanceValue > 5.0;

  return (
    <div
      className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
        isWarning
          ? 'bg-amber-50/60 border-amber-200 text-amber-900'
          : 'bg-white border-gray-100 text-gray-700 shadow-2xs'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-lg ${
            isWarning ? 'bg-amber-100 text-amber-700' : 'bg-red-50 text-red-500'
          }`}
        >
          <AlertTriangle size={18} />
        </div>
        {/* <p className="text-xs font-medium">
          ค่าเบี่ยงเบนความกระแส (Unbalance) <span className="font-bold">{unbalanceValue}%</span> — เกณฑ์ไม่เกิน 5%
        </p> */}
      </div>

      <Link
        href={`/admin/buildings/${buildingId}/alerts`}
        className="inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold hover:underline"
      >
        ดูเพิ่มเติม
        <ChevronRight size={14} />
      </Link>
    </div>
  );
}