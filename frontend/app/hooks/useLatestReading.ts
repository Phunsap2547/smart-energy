// hooks/useLatestReading.ts
// ดึงแถว energy_readings ล่าสุดของ "อาคารนี้" (logic เดียวกับหน้า admin /admin/buildings/[id]/alerts)
"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { EnergyIngest } from "@/types/energy";

export function useLatestReading(buildingId: string | number, intervalMs = 5000) {
  const [latestData, setLatestData] = useState<EnergyIngest | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLatest = useCallback(async () => {
    if (!buildingId) {
      setLoading(false);
      return;
    }

    try {
      const { data: devices } = await supabase
        .from("devices")
        .select("id")
        .eq("building_id", buildingId);

      if (!devices || devices.length === 0) return;
      const deviceIds = devices.map((d) => d.id);

      const { data: latestRow } = await supabase
        .from("energy_readings")
        .select("*")
        .in("device_id", deviceIds)
        .order("reading_time", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestRow) setLatestData(latestRow as EnergyIngest);
    } catch (err) {
      console.error("Fetch latest reading error:", err);
    } finally {
      setLoading(false);
    }
  }, [buildingId]);

  useEffect(() => {
    setLoading(true);
    fetchLatest();
    const t = setInterval(fetchLatest, intervalMs);
    return () => clearInterval(t);
  }, [fetchLatest, intervalMs]);

  return { latestData, loading };
}