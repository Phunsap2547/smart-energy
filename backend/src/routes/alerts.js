
// routes/alerts.js
const express = require('express');
const supabase = require('../supabase');

const router = express.Router();

/**
 * GET /api/alerts
 * ดึงรายการ Alert/Anomaly สำหรับหน้า Public หรือ Dashboard ทั่วไป
 *
 * Query:
 *  - building_id : กรองเฉพาะอาคารนั้น (ใช้กับหน้ารายละเอียดอาคาร)
 *  - device_id   : device เดียว
 *  - device_ids  : หลาย device คั่นด้วย comma เช่น 1,2,3
 *  - type
 *  - status      : ค่าเดียว หรือหลายค่าคั่นด้วย comma เช่น open,investigating
 *  - limit       : default 50 (สูงสุด 200)
 */

router.get('/', async (req, res) => {
  try {
    const { building_id, device_id, type, status, severity, limit = 50 } = req.query;
    const safeLimit = Math.min(parseInt(limit, 10) || 50, 500);
    const deviceRelation = building_id ? 'devices!inner' : 'devices';

    let query = supabase
      .from('anomalies')
      .select(`
        id, device_id, type, severity, description, status, created_at,
        resolved_at, resolution_reason,
        ${deviceRelation} ( id, name, building_id )
      `)
      .order('created_at', { ascending: false })
      .limit(safeLimit);

    const splitList = (v) => String(v).split(',').map((s) => s.trim()).filter(Boolean);

    if (building_id) query = query.eq('devices.building_id', building_id);
    if (device_id) query = query.eq('device_id', device_id);
    if (severity) query = query.eq('severity', severity);
    if (type) {
      const t = splitList(type);
      query = t.length > 1 ? query.in('type', t) : query.eq('type', t[0]);
    }
    if (status) {
      const s = splitList(status);
      query = s.length > 1 ? query.in('status', s) : query.eq('status', s[0]);
    }

    const { data, error } = await query;
    if (error) throw error;

    return res.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

module.exports = router;