// const express = require('express');
// const pool = require('../scripts/db');

// const router = express.Router();

// // GET /api/alerts?device_id=1&type=overload&status=open&from=&to=&limit=50&page=1
// router.get('/', async (req, res) => {
//   const { device_id, type, status, from, to, limit = 50, page = 1 } = req.query;

//   try {
//     const conditions = [];
//     const values = [];
//     let idx = 1;

//     if (device_id) {
//       conditions.push(`device_id = $${idx++}`);
//       values.push(device_id);
//     }
//     if (type) {
//       conditions.push(`type = $${idx++}`);
//       values.push(type);
//     }
//     if (status) {
//       conditions.push(`status = $${idx++}`);
//       values.push(status);
//     }
//     if (from) {
//       conditions.push(`detected_at >= $${idx++}`);
//       values.push(from);
//     }
//     if (to) {
//       conditions.push(`detected_at <= $${idx++}`);
//       values.push(to);
//     }

//     const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
//     const safeLimit = Math.min(parseInt(limit, 10) || 50, 500);
//     const offset = (Math.max(parseInt(page, 10) || 1, 1) - 1) * safeLimit;

//     values.push(safeLimit, offset);

//     const result = await pool.query(
//       `SELECT * FROM anomalies ${where}
//        ORDER BY detected_at DESC
//        LIMIT $${idx++} OFFSET $${idx++}`,
//       values
//     );

//     res.json(result.rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
//   }
// });

// module.exports = router;
// import express from 'express';
// import { supabase } from '../supabase.js'; // ปรับ path ตามไฟล์ supabase.js ของคุณ

// const router = express.Router();

// /**
//  * 1. GET /api/admin/alerts
//  * ดึงรายการแจ้งเตือนทั้งหมดในระบบสำหรับ Admin (รองรับการกรองตามสถานะ/ความรุนแรง)
//  */
// router.get('/', async (req, res) => {
//   try {
//     const { status = 'PENDING', severity, buildingId } = req.query;

//     let query = supabase
//       .from('alerts')
//       .select(`
//         id,
//         type,
//         severity,
//         title,
//         message,
//         anomaly_score,
//         status,
//         created_at,
//         building_id,
//         buildings ( name ),
//         device_id,
//         devices ( name )
//       `)
//       .order('created_at', { ascending: false });

//     // Filter ตาม Parameter ที่ส่งมาจาก Frontend
//     if (status !== 'ALL') {
//       query = query.eq('status', status);
//     }
//     if (severity) {
//       query = query.eq('severity', severity);
//     }
//     if (buildingId) {
//       query = query.eq('building_id', buildingId);
//     }

//     const { data, error } = await query;

//     if (error) throw error;

//     return res.json({
//       success: true,
//       count: data.length,
//       data,
//     });
//   } catch (error) {
//     console.error('Error in GET /admin/alerts:', error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// });

// /**
//  * 2. GET /api/admin/alerts/summary
//  * สรุปจำนวน Alert สำหรับแสดงผลบน Card บน Admin Dashboard
//  */
// router.get('/summary', async (req, res) => {
//   try {
//     const { data: alerts, error } = await supabase
//       .from('alerts')
//       .select('severity, status, type')
//       .eq('status', 'PENDING');

//     if (error) throw error;

//     const summary = {
//       totalPending: alerts.length,
//       dangerCount: alerts.filter((a) => a.severity === 'danger').length,
//       warningCount: alerts.filter((a) => a.severity === 'warning').length,
//       mlAnomalyCount: alerts.filter((a) => a.type === 'ML_ANOMALY').length, // เคสที่มาจาก ML
//     };

//     return res.json({ success: true, summary });
//   } catch (error) {
//     console.error('Error in GET /admin/alerts/summary:', error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// });

// /**
//  * 3. PATCH /api/admin/alerts/:id/status
//  * อัปเดตสถานะการแจ้งเตือน (เช่น Admin กด Resolve ปิดเคส)
//  */
// router.patch('/:id/status', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body; // รับค่า 'ACKNOWLEDGED' หรือ 'RESOLVED'

//     if (!['PENDING', 'ACKNOWLEDGED', 'RESOLVED'].includes(status)) {
//       return res.status(400).json({ success: false, message: 'Invalid status value' });
//     }

//     const { data, error } = await supabase
//       .from('alerts')
//       .update({ status, updated_at: new Date().toISOString() })
//       .eq('id', id)
//       .select();

//     if (error) throw error;

//     return res.json({
//       success: true,
//       message: 'อัปเดตสถานะสำเร็จ',
//       data: data[0],
//     });
//   } catch (error) {
//     console.error('Error updating alert status:', error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// });

// export default router;
// alerts.js
import { supabase } from '@/lib/supabase'; // ปรับ path ตามโครงสร้างโปรเจกต์

/**
 * ตรวจสอบสถานะการส่งข้อมูลของอุปกรณ์ในอาคาร
 * @param {string} buildingId - ID ของอาคาร
 * @returns {Promise<Array>} รายการแจ้งเตือนทั้งหมด
 */
export async function checkBuildingAlerts(buildingId) {
  try {
    if (!buildingId) return [];

    // 1. ดึงอุปกรณ์ทั้งหมดในอาคาร
    const { data: devices, error: deviceError } = await supabase
      .from('devices')
      .select('id, name')
      .eq('building_id', buildingId);

    if (deviceError || !devices || devices.length === 0) {
      return [];
    }

    const alerts = [];
    const now = new Date().getTime();

    for (const device of devices) {
      // 2. ดึงข้อมูลล่าสุด 1 Record ของอุปกรณ์ชิ้นนี้
      const { data: latestReadings, error: readingError } = await supabase
        .from('energy_readings')
        .select('reading_time, energy_kwh')
        .eq('device_id', device.id)
        .order('reading_time', { ascending: false })
        .limit(1);

      if (readingError || !latestReadings || latestReadings.length === 0) {
        alerts.push({
          id: `no-data-${device.id}`,
          deviceId: device.id,
          type: 'NO_DATA',
          severity: 'warning',
          title: 'ไม่พบข้อมูลการใช้งาน',
          message: `อุปกรณ์ ${device.name} ยังไม่มีการบันทึกข้อมูลในระบบ`,
        });
        continue;
      }

      const lastReading = latestReadings[0];
      
      // แปลง Timestamp (รองรับทั้ง UTC/Z)
      let rawTime = String(lastReading.reading_time).trim();
      if (rawTime.includes(' ') && !rawTime.includes('T')) {
        rawTime = rawTime.replace(' ', 'T');
      }
      if (!rawTime.endsWith('Z') && !rawTime.includes('+') && !rawTime.includes('-', 10)) {
        rawTime += 'Z';
      }

      const lastTime = new Date(rawTime).getTime();
      const diffMinutes = Math.floor((now - lastTime) / (1000 * 60));

      // 3. เงื่อนไข: ถ้าขาดข้อมูลเกิน 15 นาที
      if (diffMinutes >= 15) {
        const lastTimeFormatted = new Date(lastTime).toLocaleTimeString('th-TH', {
          hour: '2-digit',
          minute: '2-digit',
        });

        alerts.push({
          id: `power-outage-${device.id}`,
          deviceId: device.id,
          type: 'POWER_OUTAGE',
          severity: 'danger', // สีแดง
          title: 'คาดว่าไฟดับ / อุปกรณ์ Offline',
          message: `ขาดการติดต่อเกิน ${diffMinutes} นาที (อัปเดตล่าสุดเวลา ${lastTimeFormatted} น.)`,
          lastSeen: lastReading.reading_time,
          diffMinutes,
        });
      }
    }

    return alerts;
  } catch (error) {
    console.error('Error checking building alerts:', error);
    return [];
  }
}