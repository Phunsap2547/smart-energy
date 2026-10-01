// const express = require('express');
// const pool = require('../scripts/db');
// const authenticateAdmin = require('../middleware/auth');

// const router = express.Router();
// router.use(authenticateAdmin);

// // PATCH /api/admin/alerts/:id  body: { status: "acknowledged" | "resolved" }
// router.patch('/:id', async (req, res) => {
//   const { status } = req.body;
//   const allowedStatus = ['open', 'acknowledged', 'resolved'];

//   if (!status || !allowedStatus.includes(status)) {
//     return res.status(400).json({ message: `status ต้องเป็นหนึ่งใน: ${allowedStatus.join(', ')}` });
//   }

//   try {
//     const result = await pool.query(
//       'UPDATE anomalies SET status = $1 WHERE id = $2 RETURNING *',
//       [status, req.params.id]
//     );
//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: 'ไม่พบ alert นี้' });
//     }
//     res.json(result.rows[0]);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
//   }
// });

// module.exports = router;

//adminAlert.js
const supabase = require('../supabase');
const express = require('express');

const router = express.Router();

/**
 * 1. GET /api/admin/alerts
 * ดึงรายการ Anomaly/Alert ทั้งหมดจากตาราง anomalies สำหรับ Admin Dashboard
 */
router.get('/', async (req, res) => {
  try {
    const { status = 'open', severity, buildingId } = req.query;

    let query = supabase
      .from('anomalies')
      .select(`
        id,
        type,
        severity,
        description,
        status,
        created_at,
        device_id,
        devices (
          id,
          name,
          building_id,
          buildings ( id, name )
        )
      `)
      .order('created_at', { ascending: false });

    if (status !== 'ALL') {
      query = query.eq('status', status);
    }

    if (severity) {
      query = query.eq('severity', severity);
    }

    const { data, error } = await query;
    if (error) throw error;

    let formattedData = data.map((item) => ({
      id: item.id,
      deviceId: item.device_id,
      deviceName: item.devices?.name || 'ไม่ทราบชื่ออุปกรณ์',
      buildingId: item.devices?.buildings?.id || null,
      buildingName: item.devices?.buildings?.name || 'ไม่ทราบชื่ออาคาร',
      type: item.type,
      severity: item.severity,
      description: item.description,
      status: item.status,
      createdAt: item.created_at,
    }));

    if (buildingId) {
      formattedData = formattedData.filter(
        (item) => String(item.buildingId) === String(buildingId)
      );
    }

    return res.json({
      success: true,
      count: formattedData.length,
      data: formattedData,
    });
  } catch (error) {
    console.error('Error in GET /api/admin/alerts:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 2. GET /api/admin/alerts/summary
 * สรุปสถิติ Alert ที่ยังไม่ถูกแก้ไข (status = 'open') เพื่อนำไปแสดงใน Overview Cards
 */
router.get('/summary', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('anomalies')
      .select('severity, status, type')
      .eq('status', 'open');

    if (error) throw error;

    const summary = {
      totalOpen: data.length,
      dangerCount: data.filter((item) => item.severity === 'danger').length,
      warningCount: data.filter((item) => item.severity === 'warning').length,
      mlAnomalyCount: data.filter((item) => item.type.includes('ML')).length,
    };

    return res.json({ success: true, summary });
  } catch (error) {
    console.error('Error in GET /api/admin/alerts/summary:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 3. PATCH /api/admin/alerts/:id/status
 * อัปเดตสถานะ Alert (เช่น ปรับจาก 'open' เป็น 'resolved' หรือ 'acknowledged')
 */
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'กรุณาระบุสถานะที่ต้องการเปลี่ยน' });
    }

    const { data, error } = await supabase
      .from('anomalies')
      .update({ status })
      .eq('id', id)
      .select();

    if (error) throw error;

    return res.json({
      success: true,
      message: 'อัปเดตสถานะสำเร็จ',
      data: data[0],
    });
  } catch (error) {
    console.error('Error updating status in /api/admin/alerts:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;