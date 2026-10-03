// // const express = require('express');
// // const pool = require('../scripts/db');
// // const authenticateAdmin = require('../middleware/auth');

// // const router = express.Router();
// // router.use(authenticateAdmin);

// // // PATCH /api/admin/alerts/:id  body: { status: "acknowledged" | "resolved" }
// // router.patch('/:id', async (req, res) => {
// //   const { status } = req.body;
// //   const allowedStatus = ['open', 'acknowledged', 'resolved'];

// //   if (!status || !allowedStatus.includes(status)) {
// //     return res.status(400).json({ message: `status ต้องเป็นหนึ่งใน: ${allowedStatus.join(', ')}` });
// //   }

// //   try {
// //     const result = await pool.query(
// //       'UPDATE anomalies SET status = $1 WHERE id = $2 RETURNING *',
// //       [status, req.params.id]
// //     );
// //     if (result.rows.length === 0) {
// //       return res.status(404).json({ message: 'ไม่พบ alert นี้' });
// //     }
// //     res.json(result.rows[0]);
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
// //   }
// // });

// // module.exports = router;

// //adminAlert.js
// const supabase = require('../supabase');
// const express = require('express');

// const router = express.Router();

// /**
//  * 1. GET /api/admin/alerts
//  * ดึงรายการ Anomaly/Alert ทั้งหมดจากตาราง anomalies สำหรับ Admin Dashboard
//  */
// router.get('/', async (req, res) => {
//   try {
//     const { status = 'open', severity, buildingId } = req.query;

//     let query = supabase
//       .from('anomalies')
//       .select(`
//         id,
//         type,
//         severity,
//         description,
//         status,
//         created_at,
//         device_id,
//         devices (
//           id,
//           name,
//           building_id,
//           buildings ( id, name )
//         )
//       `)
//       .order('created_at', { ascending: false });

//     if (status !== 'ALL') {
//       query = query.eq('status', status);
//     }

//     if (severity) {
//       query = query.eq('severity', severity);
//     }

//     const { data, error } = await query;
//     if (error) throw error;

//     let formattedData = data.map((item) => ({
//       id: item.id,
//       deviceId: item.device_id,
//       deviceName: item.devices?.name || 'ไม่ทราบชื่ออุปกรณ์',
//       buildingId: item.devices?.buildings?.id || null,
//       buildingName: item.devices?.buildings?.name || 'ไม่ทราบชื่ออาคาร',
//       type: item.type,
//       severity: item.severity,
//       description: item.description,
//       status: item.status,
//       createdAt: item.created_at,
//     }));

//     if (buildingId) {
//       formattedData = formattedData.filter(
//         (item) => String(item.buildingId) === String(buildingId)
//       );
//     }

//     return res.json({
//       success: true,
//       count: formattedData.length,
//       data: formattedData,
//     });
//   } catch (error) {
//     console.error('Error in GET /api/admin/alerts:', error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// });

// /**
//  * 2. GET /api/admin/alerts/summary
//  * สรุปสถิติ Alert ที่ยังไม่ถูกแก้ไข (status = 'open') เพื่อนำไปแสดงใน Overview Cards
//  */
// router.get('/summary', async (req, res) => {
//   try {
//     const { data, error } = await supabase
//       .from('anomalies')
//       .select('severity, status, type')
//       .eq('status', 'open');

//     if (error) throw error;

//     const summary = {
//       totalOpen: data.length,
//       dangerCount: data.filter((item) => item.severity === 'danger').length,
//       warningCount: data.filter((item) => item.severity === 'warning').length,
//       mlAnomalyCount: data.filter((item) => item.type.includes('ML')).length,
//     };

//     return res.json({ success: true, summary });
//   } catch (error) {
//     console.error('Error in GET /api/admin/alerts/summary:', error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// });

// /**
//  * 3. PATCH /api/admin/alerts/:id/status
//  * อัปเดตสถานะ Alert (เช่น ปรับจาก 'open' เป็น 'resolved' หรือ 'acknowledged')
//  */
// router.patch('/:id/status', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;

//     if (!status) {
//       return res.status(400).json({ success: false, message: 'กรุณาระบุสถานะที่ต้องการเปลี่ยน' });
//     }

//     const { data, error } = await supabase
//       .from('anomalies')
//       .update({ status })
//       .eq('id', id)
//       .select();

//     if (error) throw error;

//     return res.json({
//       success: true,
//       message: 'อัปเดตสถานะสำเร็จ',
//       data: data[0],
//     });
//   } catch (error) {
//     console.error('Error updating status in /api/admin/alerts:', error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// });

// module.exports = router;

// routes/adminAlerts.js
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
// const authenticateAdmin = require('../middleware/adminAuth'); // มิดเดิลแวร์ตรวจ Auth (ถ้ามี)

const router = express.Router();

// สร้าง Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// -----------------------------------------------------------------------------
// GET /api/admin/alerts — ดึงรายการความผิดปกติ (พร้อม Filter, Pagination และ Join Table)
// -----------------------------------------------------------------------------
router.get('/', async (req, res) => {
  const { status, severity, device_id, building_id, limit = 50, page = 1 } = req.query;

  try {
    const safeLimit = Math.min(parseInt(limit, 10) || 50, 200);
    const currentPage = Math.max(parseInt(page, 10) || 1, 1);
    const offset = (currentPage - 1) * safeLimit;

    // Join ตาราง devices และ buildings ผ่าน Supabase Relation
    // ใช้ !inner เมื่อมีการกรองตาม building_id
    const deviceRelation = building_id ? 'devices!inner' : 'devices';
    
    let query = supabase
      .from('anomalies')
      .select(`
        id,
        device_id,
        type,
        severity,
        description,
        status,
        created_at,
        ${deviceRelation} (
          id,
          name,
          building_id,
          buildings (
            id,
            name
          )
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + safeLimit - 1);

    if (status) query = query.eq('status', status);
    if (severity) query = query.eq('severity', severity);
    if (device_id) query = query.eq('device_id', device_id);
    if (building_id) query = query.eq('devices.building_id', building_id);

    const { data, error } = await query;
    if (error) throw error;

    // Map ผลลัพธ์ให้เป็น Object เรียบ (Flatten) ตรงกับโครงสร้าง SQL เดิม
    const formattedData = (data || []).map(item => ({
      id: item.id,
      device_id: item.device_id,
      device_name: item.devices?.name || null,
      building_id: item.devices?.buildings?.id || item.devices?.building_id || null,
      building_name: item.devices?.buildings?.name || null,
      type: item.type,
      severity: item.severity,
      description: item.description,
      status: item.status,
      created_at: item.created_at,
    }));

    res.json(formattedData);
  } catch (err) {
    console.error('❌ Error in GET /api/admin/alerts:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการแจ้งเตือน', error: err.message });
  }
});

// -----------------------------------------------------------------------------
// GET /api/admin/alerts/stats — สรุปสถิติการแจ้งเตือนสำหรับ Dashboard Cards
// -----------------------------------------------------------------------------
router.get('/stats', async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    // รัน Query สถิติพร้อมกันแบบ Parallel ด้วย Promise.all
    const [
      { count: openTotal, error: err1 },
      { count: openCritical, error: err2 },
      { count: openHigh, error: err3 },
      { count: openWarning, error: err4 },
      { count: resolvedToday, error: err5 }
    ] = await Promise.all([
      supabase.from('anomalies').select('*', { count: 'exact', head: true }).eq('status', 'open'),
      supabase.from('anomalies').select('*', { count: 'exact', head: true }).eq('status', 'open').eq('severity', 'critical'),
      supabase.from('anomalies').select('*', { count: 'exact', head: true }).eq('status', 'open').eq('severity', 'high'),
      supabase.from('anomalies').select('*', { count: 'exact', head: true }).eq('status', 'open').eq('severity', 'warning'),
      supabase.from('anomalies').select('*', { count: 'exact', head: true }).eq('status', 'resolved').gte('created_at', `${todayStr}T00:00:00`)
    ]);

    if (err1 || err2 || err3 || err4 || err5) {
      throw err1 || err2 || err3 || err4 || err5;
    }

    res.json({
      open_total: openTotal || 0,
      open_critical: openCritical || 0,
      open_high: openHigh || 0,
      open_warning: openWarning || 0,
      resolved_today: resolvedToday || 0,
    });
  } catch (err) {
    console.error('❌ Error in GET /api/admin/alerts/stats:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการคำนวณสถิติ', error: err.message });
  }
});

// -----------------------------------------------------------------------------
// PATCH /api/admin/alerts/:id — อัปเดตสถานะ Anomaly และอัปเดตสถานะอาคาร
// -----------------------------------------------------------------------------
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'open', 'investigating', 'resolved', 'dismissed'

  const validStatuses = ['open', 'investigating', 'resolved', 'dismissed'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ 
      message: `สถานะไม่ถูกต้อง รองรับเฉพาะ: ${validStatuses.join(', ')}` 
    });
  }

  try {
    // 1. อัปเดตสถานะของ Anomaly
    const { data: updatedAnomaly, error: updateErr } = await supabase
      .from('anomalies')
      .update({ status })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (updateErr) throw updateErr;
    if (!updatedAnomaly) {
      return res.status(404).json({ message: 'ไม่พบรายการแจ้งเตือนที่ระบุ' });
    }

    // 2. คำนวณเพื่ออัปเดตสถานะของอาคาร (Building Status) ใหม่
    if (updatedAnomaly.device_id) {
      const { data: deviceData } = await supabase
        .from('devices')
        .select('building_id')
        .eq('id', updatedAnomaly.device_id)
        .maybeSingle();

      const buildingId = deviceData?.building_id;

      if (buildingId) {
        // ดึง Anomaly ทั้งหมดของอาคารที่ยังคงสถานะ 'open' อยู่
        const { data: activeAnomalies } = await supabase
          .from('anomalies')
          .select('severity, devices!inner(building_id)')
          .eq('devices.building_id', buildingId)
          .eq('status', 'open');

        // หา Severity ที่แย่ที่สุด
        let maxRank = 0;
        const severityRank = { 'warning': 1, 'high': 2, 'critical': 3 };

        (activeAnomalies || []).forEach(a => {
          const rank = severityRank[a.severity] || 0;
          if (rank > maxRank) maxRank = rank;
        });

        const rankToBuildingStatus = { 0: 'normal', 1: 'warning', 2: 'warning', 3: 'critical' };
        const newBuildingStatus = rankToBuildingStatus[maxRank] || 'normal';

        // อัปเดตตาราง buildings
        await supabase
          .from('buildings')
          .update({ status: newBuildingStatus })
          .eq('id', buildingId);
      }
    }

    return res.json({
      message: 'อัปเดตสถานะการแจ้งเตือนสำเร็จ',
      anomaly: updatedAnomaly
    });

  } catch (err) {
    console.error('❌ Error in PATCH /api/admin/alerts/:id:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตสถานะ', error: err.message });
  }
});

module.exports = router;