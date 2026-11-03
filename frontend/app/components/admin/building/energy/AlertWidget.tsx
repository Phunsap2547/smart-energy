
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { AlertTriangle, AlertCircle, Info, ChevronRight, Loader2, WifiOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface AlertItem {
  id: string;
  type: 'danger' | 'warning' | 'info';
  title: string;
  time: string;
  detail: string;
}

interface AlertWidgetProps {
  buildingId?: string;
  telemetry?: any;
  currentUnbalance?: number;
  voltageUnbalance?: number;
  thdCurrent?: number;
}

// เกณฑ์วัดค่าแรงดันไฟฟ้า (ML Standard Thresholds)
const VOLTAGE_OUTAGE_TH = 57.0;  // < 57V = ไฟดับ
const VOLTAGE_OVER_TH = 253.0;   // > 253V = ไฟเกิน (220V +10%)
const VOLTAGE_UNDER_TH = 198.0;  // < 198V = ไฟต่ำ (220V -10%)

export default function AlertWidget({
  buildingId,
  telemetry,
  currentUnbalance,
  voltageUnbalance,
  thdCurrent,
}: AlertWidgetProps) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // ฟังก์ชันสำหรับบันทึกความผิดปกติลงตาราง anomalies ใน Supabase เพื่อเก็บประวัติ
  const saveToAnomalies = async (alertList: AlertItem[], bId?: string) => {
    for (const alert of alertList) {
      if (alert.id === 'system-ok' || alert.id === 'no-data') continue;

      try {
        // เช็กก่อนว่ามีรายการแจ้งเตือนประเภทนี้ที่ยังค้างอยู่ (pending) ไหม เพื่อไม่ให้บันทึกซ้ำซ้อน
        const { data: existing } = await supabase
          .from('anomalies')
          .select('id')
          .eq('type', alert.id)
          .eq('status', 'pending')
          .limit(1);

        if (!existing || existing.length === 0) {
          await supabase.from('anomalies').insert([
            {
              device_id: bId ? parseInt(bId) : null,
              type: alert.id,
              severity: alert.type,
              description: `${alert.title} - ${alert.detail}`,
              status: 'pending',
              created_at: new Date().toISOString(),
            },
          ]);
        }
      } catch (err) {
        console.error('Error saving anomaly record:', err);
      }
    }
  };

  const fetchAndProcessAlerts = useCallback(async () => {
    try {
      setLoading(true);

      // ดึงข้อมูลอ่านค่าไฟล่าสุด 1 Record
      let query = supabase
        .from('energy_readings')
        .select('*')
        .order('reading_time', { ascending: false })
        .limit(1);

      if (buildingId) {
        query = query.eq('building_id', buildingId);
      }

      const { data } = await query;
      const lastRecord = data && data.length > 0 ? data[0] : telemetry;

      if (!lastRecord) {
        setAlerts([
          {
            id: 'no-data',
            type: 'warning',
            title: 'ไม่พบข้อมูลในระบบ',
            time: 'ปัจจุบัน',
            detail: 'ยังไม่มีข้อมูลการบันทึกพลังงานส่งเข้ามาในระบบ',
          },
        ]);
        setLoading(false);
        return;
      }

      const rawTime = lastRecord.reading_time || lastRecord.created_at;

      let formattedStr = String(rawTime || '').trim();
      if (formattedStr.includes(' ') && !formattedStr.includes('T')) {
        formattedStr = formattedStr.replace(' ', 'T');
      }
      if (
        formattedStr &&
        !formattedStr.endsWith('Z') &&
        !formattedStr.includes('+') &&
        !formattedStr.includes('-', 10)
      ) {
        formattedStr += 'Z';
      }

      const lastDate = formattedStr ? new Date(formattedStr) : new Date();
      const now = new Date();

      const diffMs = now.getTime() - lastDate.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));

      const timeString = isNaN(lastDate.getTime())
        ? 'ปัจจุบัน'
        : lastDate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';

      const detectedAlerts: AlertItem[] = [];

      // --- 1. เช็กสถานะแรงดันไฟฟ้า (ML Voltage Detection) ---
            // --- 1. เช็กสถานะแรงดันไฟฟ้า ---
      const voltage = Number(lastRecord.voltage_v ?? lastRecord.voltage_l1 ?? lastRecord.voltage ?? 0);
      if (voltage > 0) {
        if (voltage < VOLTAGE_OUTAGE_TH) {
          detectedAlerts.push({
            id: 'ml-power-outage',
            type: 'danger',
            title: '⚫ ไฟดับ (Power Outage)',
            time: timeString,
            detail: `แรงดันไฟฟ้าดิ่งต่ำเหลือ ${voltage.toFixed(1)} V (ต่ำกว่า ${VOLTAGE_OUTAGE_TH}V)`,
          });
        } else if (voltage > VOLTAGE_OVER_TH) {
          detectedAlerts.push({
            id: 'ml-over-voltage',
            type: 'danger',
            title: '🔺 ไฟเกิน (Over Voltage)',
            time: timeString,
            detail: `แรงดันไฟฟ้าพุ่งสูงถึง ${voltage.toFixed(1)} V (เกินเกณฑ์ ${VOLTAGE_OVER_TH}V)`,
          });
        } else if (voltage < VOLTAGE_UNDER_TH) {
          detectedAlerts.push({
            id: 'ml-under-voltage',
            type: 'warning',
            title: '🔻 ไฟต่ำ (Under Voltage)',
            time: timeString,
            detail: `แรงดันไฟฟ้าอยู่ที่ ${voltage.toFixed(1)} V (ต่ำกว่าเกณฑ์ ${VOLTAGE_UNDER_TH}V)`,
          });
        }
      }

      // --- 2. เช็กไฟดับ / Wi-Fi หลุด (ขาดหาย > 15 นาที) ---
      if (diffMinutes >= 15) {
        const displayTimeDiff =
          diffMinutes >= 60
            ? `${Math.floor(diffMinutes / 60)} ชม. ${diffMinutes % 60} นาที`
            : `${diffMinutes} นาที`;

        const lastCurrent = Number(lastRecord.system_current ?? lastRecord.current_l1 ?? 0);
        const lastPower = Number(lastRecord.power_kw ?? lastRecord.active_power ?? 0);

        const isPowerZero = lastCurrent < 0.1 && lastPower < 0.05;

        if (isPowerZero) {
          detectedAlerts.push({
            id: 'power-outage',
            type: 'danger',
            title: '⚡ คาดว่าระบบไฟดับ (Power Outage)',
            time: timeString,
            detail: `กระแสไฟดรอปเหลือ 0 และไม่ได้รับข้อมูลส่งเข้ามานาน ${displayTimeDiff} (อัปเดตล่าสุด ${timeString})`,
          });
        } else {
          detectedAlerts.push({
            id: 'network-disconnected',
            type: 'warning',
            title: '📶 ขาดการเชื่อมต่อเครือข่าย / Wi-Fi หลุด',
            time: timeString,
            detail: `พบกระแสไฟค้างอยู่ (${lastCurrent.toFixed(1)} A) แต่ระบบหยุดส่งข้อมูลนาน ${displayTimeDiff}`,
          });
        }
      }

      // --- 3. เช็ก Power Factor (PF) ต่ำ (< 0.85) ---
      const pfVal = Number(lastRecord.power_factor ?? lastRecord.total_pf ?? 0);
      if (pfVal > 0 && pfVal < 0.85) {
        detectedAlerts.push({
          id: 'low-pf',
          type: 'warning',
          title: 'Power Factor (PF) ต่ำกว่ามาตรฐาน',
          time: timeString,
          detail: `ค่า PF ปัจจุบันอยู่ที่ ${pfVal.toFixed(2)} (เกณฑ์แนะนำ ≥ 0.85)`,
        });
      }

      // --- 4. เช็ก Unbalance ของกระแสไฟฟ้า (> 15%) ---
      const cUnbalance = currentUnbalance ?? Number(lastRecord.current_unbalance_pct ?? 0);
      if (cUnbalance > 15) {
        detectedAlerts.push({
          id: 'current-unbalance',
          type: 'warning',
          title: 'Current Unbalance สูงเกินเกณฑ์',
          time: timeString,
          detail: `ความไม่สมดุลของกระแสไฟฟ้าสูงถึง ${cUnbalance.toFixed(1)}% (เกณฑ์แนะนำ ≤ 15%)`,
        });
      }

      // --- 5. เช็ก THD Current (> 20%) ---
      const thd = thdCurrent ?? Number(lastRecord.thd_current_l1_pct ?? 0);
      if (thd > 20) {
        detectedAlerts.push({
          id: 'thd-high',
          type: 'warning',
          title: 'กระแสฮาร์มอนิกส์ (THD-I) สูง',
          time: timeString,
          detail: `ค่า THD Current อยู่ที่ ${thd.toFixed(1)}% อาจส่งผลต่อความร้อนในระบบ`,
        });
      }

      // --- 6. ถ้าทุกอย่างปกติ ---
      if (detectedAlerts.length === 0) {
        detectedAlerts.push({
          id: 'system-ok',
          type: 'info',
          title: 'ระบบและอุปกรณ์ทำงานปกติ',
          time: timeString,
          detail: `การเชื่อมต่อสมบูรณ์ อัปเดตข้อมูลล่าสุดเมื่อ ${timeString}`,
        });
      }

      // บันทึกความผิดปกติลงตาราง anomalies เพื่อส่งไปหน้าประวัติ
      //saveToAnomalies(detectedAlerts, buildingId);

      setAlerts(detectedAlerts);
    } catch (err) {
      console.error('Error in AlertWidget:', err);
    } finally {
      setLoading(false);
    }
  }, [buildingId, telemetry, currentUnbalance, voltageUnbalance, thdCurrent]);

  useEffect(() => {
    fetchAndProcessAlerts();
    const interval = setInterval(fetchAndProcessAlerts, 30000);
    return () => clearInterval(interval);
  }, [fetchAndProcessAlerts]);

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-800 text-sm">แจ้งเตือน & เหตุการณ์พลังงาน</h3>
            {loading && <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />}
          </div>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              alerts.some((a) => a.type === 'danger')
                ? 'bg-red-100 text-red-600 animate-pulse'
                : alerts.some((a) => a.type === 'warning')
                ? 'bg-amber-100 text-amber-600'
                : 'bg-emerald-100 text-emerald-600'
            }`}
          >
            {alerts.length} รายการ
          </span>
        </div>

        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
                alert.type === 'danger'
                  ? 'bg-red-50/50 border-red-100'
                  : alert.type === 'warning'
                  ? 'bg-amber-50/50 border-amber-100'
                  : 'bg-blue-50/50 border-blue-100'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {alert.id === 'network-disconnected' ? (
                  <WifiOff className="w-4 h-4 text-amber-500" />
                ) : alert.type === 'danger' ? (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                ) : alert.type === 'warning' ? (
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                ) : (
                  <Info className="w-4 h-4 text-blue-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-800 truncate">{alert.title}</h4>
                  <span className="text-[10px] text-slate-400 shrink-0">{alert.time}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">{alert.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Link
        href={`/admin/buildings/${buildingId}/alerts`}
        className="w-full mt-4 py-2 text-xs font-semibold text-emerald-600 bg-emerald-50/60 hover:bg-emerald-50 rounded-xl transition-colors flex items-center justify-center gap-1"
      >
        ดูประวัติการแจ้งเตือนทั้งหมด
        <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}