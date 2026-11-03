///building/[id]/page.tsx(user)
"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import BuildingDetailClient from "@/components/user/buildings/BuildingDetailClient";

interface PageProps {
  params: Promise<{ buildingId: string }>;
}

export default function BuildingDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const buildingId = resolvedParams.buildingId;

  const [building, setBuilding] = useState<any>(null);
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);

  useEffect(() => {
    if (!buildingId) {
      setLoading(false);
      setIsNotFound(true);
      return;
    }

    const fetchBuildingAndDevices = async () => {
      try {
        setLoading(true);
        setIsNotFound(false);

        // 1. ดึงข้อมูลอาคาร
        const { data: bData, error: bError } = await supabase
          .from("buildings")
          .select("*")
          .eq("id", buildingId)
          .maybeSingle();

        console.log("=== Debug Supabase Query ===");
        console.log("Building ID:", buildingId);
        console.log("Building Data:", bData);
        console.log("Building Error:", bError);

        if (bError || !bData) {
          setBuilding(null);
          setIsNotFound(true);
          return;
        }

        setBuilding(bData);

        // 2. ดึงข้อมูลอุปกรณ์ (devices) ที่ผูกกับอาคารนี้
        // ✅ ใช้ select("*") เพราะคอลัมน์ name / device_type / status อาจไม่มีในตาราง (ทำให้ได้ 400)
        const { data: dData, error: dError } = await supabase
          .from("devices")
          .select("*")
          .eq("building_id", buildingId);

        console.log("Devices:", dData);
        if (dError) console.error("Devices Error:", dError);

        setDevices(!dError && dData ? dData : []);
      } catch (err) {
        console.error("Unexpected error:", err);
        setIsNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchBuildingAndDevices();
  }, [buildingId]);

  // 1. สถานะกำลังโหลดข้อมูล
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f4f6f8",
          color: "#4b5563",
          fontSize: 16,
          fontWeight: 500,
        }}
      >
        กำลังโหลดข้อมูลอาคาร...
      </div>
    );
  }

  // 2. กรณีไม่พบข้อมูลอาคารใน Supabase
  if (isNotFound || !building) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#f4f6f8",
          color: "#111827",
          gap: 12,
        }}
      >
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>404 | ไม่พบข้อมูลอาคารนี้</h2>
        <p style={{ color: "#6b7280", margin: 0 }}>
          ไม่พบอาคารหมายเลข ID: {buildingId} ในระบบ หรืออาจถูกลบไปแล้ว
        </p>
        <Link
          href="/"
          style={{
            marginTop: 12,
            padding: "8px 16px",
            background: "#1E9E5A",
            color: "#fff",
            borderRadius: 8,
            textDecoration: "none",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          กลับไปหน้าหลัก
        </Link>
      </div>
    );
  }

  // 3. แสดงผลหน้า Dashboard เมื่อพบข้อมูล
  return <BuildingDetailClient building={building} devices={devices} />;
}