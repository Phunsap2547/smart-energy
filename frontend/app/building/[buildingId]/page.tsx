// import { notFound } from "next/navigation";
// import BuildingDetailClient from "@/components/user/buildings/BuildingDetailClient";
// import { supabase } from "@/lib/supabase";

// // กำหนดให้หน้าทำการ Fetch ข้อมูลสดใหม่เสมอ ไม่ดึงจาก Cache
// export const revalidate = 0;

// interface PageProps {
//   params: Promise<{ buildingId: string }>;
// }

// export default async function BuildingDetailPage({ params }: PageProps) {
//   const { buildingId } = await params;

//   // แปลง buildingId จาก string เป็น number ให้ตรงกับประเภทข้อมูลใน Supabase
//   const numericId = Number(buildingId);

//   // ถ้า URL ที่ส่งมาไม่ใช่ตัวเลข ให้แสดงหน้า 404 ทันที
//   if (isNaN(numericId)) {
//     notFound();
//   }

//   // 1. ดึงข้อมูลอาคารจาก Supabase
//   const { data: building, error } = await supabase
//     .from("buildings")
//     .select("*")
//     .eq("id", numericId)
//     .single();

//   // 2. ถ้าหาไม่เจอ หรือเกิด error ให้แสดงหน้า 404
//   if (error || !building) {
//     notFound();
//   }

//   // 3. ส่งข้อมูล building ไปให้ Client Component
//   return <BuildingDetailClient building={building} />;
// }

// import { notFound } from "next/navigation";
// import BuildingDetailClient from "@/components/user/buildings/BuildingDetailClient";
// import { supabase } from "@/lib/supabase";

// export const revalidate = 0;

// interface PageProps {
//   params: Promise<{ buildingId: string }>;
// }

// export default async function BuildingDetailPage({ params }: PageProps) {
//   const { buildingId } = await params;
//   const numericId = Number(buildingId);

//   if (isNaN(numericId)) {
//     notFound();
//   }

//   // 1. ดึงข้อมูลอาคาร พร้อมดึงอุปกรณ์ (devices) ที่อยู่ในอาคารนี้มาด้วยใน Query เดียว
//   const { data: building, error } = await supabase
//     .from("buildings")
//     .select(`
//       *,
//       devices (
//         id,
//         name,
//         device_type,
//         status
//       )
//     `)
//     .eq("id", numericId)
//     .single();

//   if (error || !building) {
//     notFound();
//   }

//   // 2. ส่งทั้งข้อมูล building และรายชื่อ devices ไปให้ BuildingDetailClient
//   return <BuildingDetailClient building={building} devices={building.devices || []} />;
// }


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