"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import OverviewCard from "@/components/admin/building/overview/OverviewCard";
import ActiveEnergyChart from "@/components/admin/building/overview/ActiveEnergyChart";
import PhaseTable from "@/components/admin/building/overview/PhaseTable";
import { Zap, Activity, Gauge, BatteryCharging } from "lucide-react";

import { supabase } from "@/lib/supabase";

export default function BuildingOverviewPage() {
  const params = useParams();
  const buildingId = params?.id ? Number(params.id) : null;

  const [ingestData, setIngestData] = useState<EnergyIngest[]>([]);
  const [loading, setLoading] = useState(true);

  // ดึงข้อมูลกรองตาม building_id
  const fetchIngestData = useCallback(async () => {
    if (!buildingId) return;

    try {
      const { data, error } = await supabase
        .from("energy_ingest")
        .select("*")
        .eq("building_id", buildingId)
        .order("created_at", { ascending: false })
        .limit(30);

      if (error) {
        console.error("Supabase error:", error);
        return;
      }

      if (data) {
        setIngestData([...data].reverse());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [buildingId]);

  useEffect(() => {
    fetchIngestData();

    // ฟัง Realtime Data เฉพาะ building_id นี้
    const channel = supabase
      .channel(`energy_ingest_b${buildingId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "energy_ingest",
          filter: `building_id=eq.${buildingId}`,
        },
        () => fetchIngestData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [buildingId, fetchIngestData]);

  const latest = ingestData[ingestData.length - 1] || null;

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 font-medium">
        กำลังโหลดข้อมูลอาคาร ID: {buildingId}...
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      {/* Dynamic Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            ภาพรวมพลังงาน (Building ID: {buildingId})
          </h1>
          <p className="text-xs text-gray-500">
            อัปเดตล่าสุด:{" "}
            {latest
              ? new Date(latest.created_at).toLocaleString("th-TH")
              : "ไม่มีข้อมูล Realtime"}
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <OverviewCard
          title="Active Power"
          value={latest?.active_power?.toFixed(2) ?? "0.00"}
          unit="kW"
          borderColor="#3b82f6"
          icon={<Zap size={20} className="text-blue-500" />}
          subtitle="กำลังไฟฟ้าปัจจุบัน"
        />
        <OverviewCard
          title="Active Energy"
          value={latest?.active_energy?.toFixed(1) ?? "0.0"}
          unit="kWh"
          borderColor="#10b981"
          icon={<BatteryCharging size={20} className="text-emerald-500" />}
          subtitle="พลังงานไฟฟ้ารวม"
        />
        <OverviewCard
          title="Power Factor"
          value={latest?.total_pf?.toFixed(2) ?? "0.00"}
          borderColor="#f59e0b"
          icon={<Gauge size={20} className="text-amber-500" />}
          subtitle={
            (latest?.total_pf ?? 0) >= 0.85 ? "สถานะปกติ (≥ 0.85)" : "ควรปรับปรุง"
          }
        />
        <OverviewCard
          title="Total Current"
          value={(
            (latest?.current_l1 ?? 0) +
            (latest?.current_l2 ?? 0) +
            (latest?.current_l3 ?? 0)
          ).toFixed(1)}
          unit="A"
          borderColor="#8b5cf6"
          icon={<Activity size={20} className="text-purple-500" />}
          subtitle="กระแสไฟฟ้ารวม 3 เฟส"
        />
      </div>

      {/* Chart & Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActiveEnergyChart data={ingestData} />
        </div>
        <div className="lg:col-span-1">
          <PhaseTable latestData={latest} />
        </div>
      </div>
    </div>
  );
}