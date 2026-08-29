"use client";

import dynamic from "next/dynamic";

// สำคัญ: ต้อง import แบบ dynamic + ssr: false
// เพราะ leaflet เรียกใช้ window/document ซึ่งฝั่ง server ของ Next.js ไม่มี
// ถ้า import ตรงๆ แบบปกติจะเจอ error ตอน build
const LandingMap = dynamic(() => import("@/components/LandingMap/LandingMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center text-gray-400">
      กำลังโหลดแผนที่...
    </div>
  ),
});

export default function HomePage() {
  return <LandingMap />;
}