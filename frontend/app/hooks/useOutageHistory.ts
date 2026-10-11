// hooks/useOutageHistory.ts
// ดึงช่วงเวลาไฟดับ/สัญญาณขาดหายย้อนหลังของ "อาคารนี้" จาก RPC get_device_outages
// (logic เดียวกับ AlertHistoryTable ฝั่ง admin)
"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface OutageRecord {
  device_id: number;
  start_time: string; // ข้อมูลล่าสุดก่อนขาดหาย
  end_time: string; // ข้อมูลกลับมาอีกครั้ง
  gap_minutes: number;
}

export function useOutageHistory(
  buildingId: string | number,
  minMinutes = 2,
  intervalMs = 30000
) {
  const [outages, setOutages] = useState<OutageRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!buildingId) {
      setLoading(false);
      return;
    }

    try {
      const { data: devices } = await supabase
        .from("devices")
        .select("id")
        .eq("building_id", buildingId);

      if (!devices || devices.length === 0) {
        setOutages([]);
        return;
      }

      const { data, error } = await supabase.rpc("get_device_outages", {
        p_device_ids: devices.map((d) => d.id),
        p_min_minutes: minMinutes,
      });

      if (error) {
        console.error("get_device_outages error:", error);
        return;
      }

      setOutages(
        (data ?? []).map((r: any) => ({
          device_id: r.device_id,
          start_time: r.start_time,
          end_time: r.end_time,
          gap_minutes: Number(r.gap_minutes),
        }))
      );
    } catch (err) {
      console.error("Fetch outage history error:", err);
    } finally {
      setLoading(false);
    }
  }, [buildingId, minMinutes]);

  useEffect(() => {
    setLoading(true);
    load();
    const t = setInterval(load, intervalMs);
    return () => clearInterval(t);
  }, [load, intervalMs]);

  return { outages, loading };
}