"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiFetch, clearToken, getToken, LOGIN_PATH } from "@/lib/api";

// หน้าที่ไม่ต้อง login
const PUBLIC_PATHS = [LOGIN_PATH];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.includes(pathname);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isPublic) return;

    if (!getToken()) {
      router.replace(LOGIN_PATH);
      return;
    }
    apiFetch("/api/admin/me")
      .then(() => setReady(true))
      .catch(() => {
        clearToken();
        router.replace(LOGIN_PATH);
      });
  }, [router, isPublic]);

  // หน้า login แสดงได้เลย ไม่ต้องตรวจสิทธิ์
  if (isPublic) return <>{children}</>;

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        กำลังตรวจสอบสิทธิ์...
      </div>
    );
  }

  return <>{children}</>;
}