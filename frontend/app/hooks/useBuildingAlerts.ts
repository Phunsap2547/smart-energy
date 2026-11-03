
"use client";

import { useEffect, useState } from "react";
import type { AlertRow } from "@/lib/alertUtils";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export function useBuildingAlerts(buildingId: string | number, limit = 500) {
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
        const rows: any[] = Array.isArray(json) ? json : json.data ?? [];

        const own = rows.filter((a) => {
          const bid = a.building_id ?? a.devices?.building_id;
          return bid != null && String(bid) === String(buildingId);
        }) as AlertRow[];

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