
"use client";

import React, { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, User, Lock, Eye, EyeOff } from "lucide-react";

/**
 * LoginPage
 * หน้า Login สำหรับระบบตรวจวัดพลังงานไฟฟ้าในอาคาร (มหาวิทยาลัย)
 */

// ปรับ URL Endpoint ให้ตรงกับ Express Backend (กรณีใช้ Next.js Rewrite หรือ Proxy สามารถใช้ "/api/auth/login" ได้)
const LOGIN_ENDPOINT = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL}/api/admin/login`
  : "http://localhost:5000/api/admin/login";

export interface LoginUser {
  id: string | number;
  username: string;
  email?: string;
  role?: string;
  [key: string]: unknown;
}

interface LoginResponse {
  token?: string;
  user?: LoginUser;
  message?: string;
}

export interface LoginPageProps {
  onLoginSuccess?: (user: LoginUser) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const router = useRouter();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const finishLogin = (data: LoginResponse) => {
    if (data.token) {
      localStorage.setItem("adminToken", data.token);
    }
    
    // เรียก callback หากมีการส่ง props เข้ามา
    if (data.user) {
      onLoginSuccess?.(data.user);
    }

    // เปลี่ยนหน้าไปยัง Dashboard หลัง Login สำเร็จ
    router.push("/components/admin");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("กรุณากรอก Username และ Password ให้ครบถ้วน");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(LOGIN_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // ส่ง username และ password ให้ตรงกับ req.body ของ Express Backend
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data: LoginResponse = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบข้อมูลอีกครั้ง");
      }

      finishLogin(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

   return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#081812] p-6 font-[family-name:var(--font-body,inherit)]">
      {/* ambient glow แบบมิเตอร์ไฟ ไม่ใช่ blob ตกแต่งลอยๆ */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[420px] h-[420px] rounded-full bg-[#F5A623]/[0.06] blur-3xl" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[480px] h-[480px] rounded-full bg-[#5EEAD4]/[0.05] blur-3xl" />
      </div>

      <div className="relative w-full max-w-5xl h-[660px] max-h-[92vh] rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-[#1E4638]">
        <div className="relative z-10 w-full h-full flex bg-[#0E2A22]">
          {/* ===== ซ้าย: ภาพอาคาร + HUD ข้อมูล ===== */}
          <div className="hidden md:block relative w-[46%] h-full bg-[#0B211B]">
            <img
              src="/csc.jpg"
              alt="อาคารมหาวิทยาลัย"
              className="w-full h-full object-cover object-[70%_25%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B211B] via-[#0B211B]/10 to-[#0B211B]/40" />

            {/* eyebrow บนสุด */}
            <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 size={16} className="text-[#F5A623]" />
                <span className="text-[13px] tracking-[0.18em] uppercase text-[#EAF3EE]/90 font-[family-name:var(--font-mono,monospace)]">
                  Smart Energy Management System
                </span>
              </div>
              <span className="flex items-center gap-1.5 text-[10px] tracking-wider uppercase text-[#5EEAD4] font-[family-name:var(--font-mono,monospace)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5EEAD4] animate-pulse" />
                Live
              </span>
            </div>

            {/* HUD stat chips ล่าง — ข้อมูลตัวอย่าง ต่อยอดด้วย real-time data ได้ */}
            {/* <div className="absolute bottom-6 left-6 right-6 grid grid-cols-3 gap-2">
              {[
                { icon: Gauge, label: "24.6 kWh", sub: "การใช้ไฟขณะนี้" },
                { icon: Wifi, label: "128", sub: "เซนเซอร์ออนไลน์" },
                { icon: Building2, label: "98.4%", sub: "Uptime ระบบ" },
              ].map(({ icon: Icon, label, sub }) => (
                <div
                  key={sub}
                  className="rounded-lg bg-[#0B211B]/70 backdrop-blur-sm border border-[#F5A623]/15 px-3 py-2"
                >
                  <div className="flex items-center gap-1.5">
                    <Icon size={12} className="text-[#F5A623]" />
                    <span className="text-sm font-semibold text-[#EAF3EE] font-[family-name:var(--font-mono,monospace)]">
                      {label}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#9DBBAE] mt-0.5">{sub}</p>
                </div>
              ))}
            </div> */}
          </div>

          {/* ===== กลาง: waveform ชีพจรพลังงาน — signature element ===== */}
          <div className="hidden md:flex relative w-8 h-full items-center justify-center bg-[#0E2A22]">
            <svg
              width="16"
              height="100%"
              viewBox="0 0 16 640"
              className="absolute inset-0 h-full w-full"
              preserveAspectRatio="none"
            >
              <path
                d="M8,0 L8,240 L3,255 L13,280 L3,305 L13,330 L8,345 L8,640"
                fill="none"
                stroke="#F5A623"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="pulse-line"
                opacity="0.85"
              />
            </svg>
          </div>

          {/* ===== ขวา: ฟอร์ม ===== */}
          <div className="w-full md:w-[54%] h-full flex flex-col justify-center overflow-y-auto px-10 py-10 sm:px-14 bg-[#F4F7F4]">
            <span className="text-[11px] tracking-[0.2em] uppercase text-[#F5A623] font-[family-name:var(--font-mono,monospace)] mb-3">
              Building Access Panel
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0E2A22] mb-8 font-[family-name:var(--font-display,inherit)]">
              เข้าสู่ระบบ
            </h1>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-[11px] tracking-wider uppercase text-[#46685B] mb-2 font-[family-name:var(--font-mono,monospace)]"
                >
                  Username
                </label>
                <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-[#D7E4DC] focus-within:border-[#5EEAD4] focus-within:ring-2 focus-within:ring-[#5EEAD4]/30 transition-all">
                  <User size={16} className="text-[#7FA396] shrink-0" />
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="กรอกชื่อผู้ใช้"
                    autoComplete="username"
                    className="bg-transparent outline-none w-full text-[#0E2A22] placeholder-[#A9BCB3] text-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-[11px] tracking-wider uppercase text-[#46685B] mb-2 font-[family-name:var(--font-mono,monospace)]"
                >
                  Password
                </label>
                <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-[#D7E4DC] focus-within:border-[#5EEAD4] focus-within:ring-2 focus-within:ring-[#5EEAD4]/30 transition-all">
                  <Lock size={16} className="text-[#7FA396] shrink-0" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="กรอกรหัสผ่าน"
                    autoComplete="current-password"
                    className="bg-transparent outline-none w-full text-[#0E2A22] placeholder-[#A9BCB3] text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="shrink-0 text-[#7FA396] hover:text-[#0E2A22] transition-colors focus-visible:outline-2 focus-visible:outline-[#5EEAD4] rounded"
                    aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <div className="text-right -mt-2">
                <button
                  type="button"
                  className="text-sm text-[#46685B] hover:text-[#0E2A22] hover:underline"
                  onClick={() => alert("ต่อยอด: ลิงก์ไปหน้ารีเซ็ตรหัสผ่าน")}
                >
                  ลืมรหัสผ่าน?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#F5A623] hover:bg-[#E0951A] disabled:opacity-60 transition-colors text-[#0E2A22] font-semibold text-base rounded-xl py-3.5 shadow-md shadow-[#F5A623]/20 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E2A22]"
              >
                {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulseDash {
          from { stroke-dashoffset: 24; }
          to { stroke-dashoffset: 0; }
        }
        .pulse-line {
          stroke-dasharray: 4 3;
          animation: pulseDash 1.2s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .pulse-line { animation: none; }
        }
      `}</style>
    </div>
  );
}