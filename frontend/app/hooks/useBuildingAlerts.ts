// hooks/useBuildingAlerts.ts
// ดึงรายการแจ้งเตือน (anomalies) "ของอาคารนี้เท่านั้น" จาก GET /api/alerts?building_id=...
"use client";

import { useEffect, useState } from "react";
import type { AlertRow } from "@/lib/alertUtils";

// Base URL ของ Express (ตั้งใน .env.local เช่น NEXT_PUBLIC_API_URL=http://localhost:5000)
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export function useBuildingAlerts(buildingId: string | number, limit = 200) {
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (buildingId === undefined || buildingId === null || buildingId === "") {
      setAlerts([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/alerts?building_id=${encodeURIComponent(String(buildingId))}&limit=${limit}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const rows: AlertRow[] = json.data ?? [];

        // กันพลาดอีกชั้น: ถ้า API ส่ง building_id กลับมา ให้เหลือเฉพาะของอาคารนี้
        const own = rows.filter(
          (a) => a.devices?.building_id == null || String(a.devices.building_id) === String(buildingId)
        );

        if (!cancelled) {
          setAlerts(own);
          setError(false);
        }
      } catch (err) {
        console.error("❌ [DEBUG] Fetch alerts error:", err);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    setLoading(true);
    load();
    const interval = setInterval(load, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [buildingId, limit]);

  return { alerts, loading, error };
}