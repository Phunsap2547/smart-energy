"use client";

import { useState } from "react"; // 1. เพิ่ม useState ตรงนี้
import Sidebar from "@/components/shared/Sidebar";
import TopBar from "@/components/shared/TopBar";
import { BuildingStatusCard, StatusAnalysisPanel } from "@/components/Status";
import { analyzeStatus } from "@/lib/analyzeStatus";
import { buildingStatus } from "@/data/mockData";
import theme from "@/config/theme.js";

export default function StatusPage() {
  const result = analyzeStatus(buildingStatus);
  
  // 2. สร้าง State สำหรับควบคุมการเปิด/ปิดกล่อง (ค่าเริ่มต้นเป็น true โชว์ไว้ก่อนแบบในรูป)
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: theme.page.background }}>
      <Sidebar />
      <main className="flex-1">
        <TopBar />

        {/* พื้นที่ใส่คอนเทนต์และเนื้อหาภายใน */}
        <div className="px-8 pb-10 pt-6">
          
          {/* หัวข้อโปรเจกต์เด่นตรงกลางสีขาว */}
          <div className="grid place-items-center w-full mb-[30px]">
            <h1
              className="text-xl font-bold bg-white px-6 py-3 rounded-card shadow-card text-center"
              style={{ color: theme.page.heading }}
            >
              Smart energy management system in academic building
            </h1>
          </div>

          {/* หัวข้อย่อยของหน้า Building Status */}
          <h1 className="mb-[20px] text-[20px] font-bold text-gray-800">
            Building Status
          </h1>

          {/* ส่วนแสดงสถานะการ์ดและผลวิเคราะห์ */}
          {/* ปรับเป็น items-start และไม่ wrap เพื่อไม่ให้กล่องเด้งตกไปข้างล่างเวลาหดขยาย */}
          <div className="flex gap-[24px] items-start flex-nowrap">
            <div className="w-[220px] flex-shrink-0">
              <BuildingStatusCard
                name={buildingStatus.name}
                isNormal={result.isNormal}
                severity={result.severity}
                onMarkerClick={() => setIsAnalysisOpen(!isAnalysisOpen)} // 3. ส่งฟังก์ชันสลับสถานะ
                isActive={isAnalysisOpen}                               // 4. ส่งสถานะไปคุมไฟปุ่ม
              />
            </div>

            {/* 5. ส่งสถานะเปิด/ปิด ไปควบคุมอนิเมชันของกล่อง */}
            <StatusAnalysisPanel result={result} isOpen={isAnalysisOpen} />
          </div>

        </div>
      </main>
    </div>
  );
}