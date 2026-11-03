
// routes/adminAlerts.js
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
// const authenticateAdmin = require('../middleware/adminAuth'); // มิดเดิลแวร์ตรวจ Auth (ถ้ามี)

const router = express.Router();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// -----------------------------------------------------------------------------
// GET /api/admin/alerts — ดึงรายการความผิดปกติ (Filter, Pagination, Join)
// -----------------------------------------------------------------------------
router.get('/', async (req, res) => {
  const { status, severity, device_id, building_id, limit = 50, page = 1 } = req.query;

  try {
    const safeLimit = Math.min(parseInt(limit, 10) || 50, 500);
    const currentPage = Math.max(parseInt(page, 10) || 1, 1);
    const offset = (currentPage - 1) * safeLimit;

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
        resolved_at,
        resolution_reason,
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

    const formattedData = (data || []).map((item) => ({
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
      resolved_at: item.resolved_at,
      resolution_reason: item.resolution_reason,
    }));

    res.json(formattedData);
  } catch (err) {
    console.error('❌ Error in GET /api/admin/alerts:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการแจ้งเตือน', error: err.message });
  }
});
// -----------------------------------------------------------------------------
// GET /api/admin/alerts/stats — สรุปสถิติสำหรับ Dashboard Cards
// -----------------------------------------------------------------------------
router.get('/stats', async (req, res) => {
  const { building_id } = req.query;
  try {
    const todayStr = new Date(Date.now() + 7 * 3600 * 1000).toISOString().split('T')[0];

    const count = (status, severity) => {
      let q = supabase
        .from('anomalies')
        .select(building_id ? 'id, devices!inner(building_id)' : 'id', { count: 'exact', head: true })
        .eq('status', status);
      if (severity) q = q.eq('severity', severity);
      if (building_id) q = q.eq('devices.building_id', building_id);
      return q;
    };

    const [a, b, c, d, e] = await Promise.all([
      count('open'),
      count('open', 'critical'),
      count('open', 'high'),
      count('open', 'warning'),
      count('resolved').gte('created_at', `${todayStr}T00:00:00+07:00`),
    ]);

    const err = [a, b, c, d, e].find((r) => r.error)?.error;
    if (err) throw err;

    res.json({
      open_total: a.count || 0,
      open_critical: b.count || 0,
      open_high: c.count || 0,
      open_warning: d.count || 0,
      resolved_today: e.count || 0,
    });
  } catch (err) {
    console.error('❌ Error in GET /api/admin/alerts/stats:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการคำนวณสถิติ', error: err.message });
  }
});

// -----------------------------------------------------------------------------
// PATCH /api/admin/alerts/:id — อัปเดตสถานะ Anomaly และสถานะอาคาร
// -----------------------------------------------------------------------------
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'open', 'investigating', 'resolved', 'dismissed'

  const validStatuses = ['open', 'investigating', 'resolved', 'dismissed'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      message: `สถานะไม่ถูกต้อง รองรับเฉพาะ: ${validStatuses.join(', ')}`,
    });
  }

  try {
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

    if (updatedAnomaly.device_id) {
      const { data: deviceData } = await supabase
        .from('devices')
        .select('building_id')
        .eq('id', updatedAnomaly.device_id)
        .maybeSingle();

      const buildingId = deviceData?.building_id;

      if (buildingId) {
        const { data: activeAnomalies } = await supabase
          .from('anomalies')
          .select('severity, devices!inner(building_id)')
          .eq('devices.building_id', buildingId)
          .eq('status', 'open');

        let maxRank = 0;
        const severityRank = { warning: 1, high: 2, critical: 3 };

        (activeAnomalies || []).forEach((a) => {
          const rank = severityRank[a.severity] || 0;
          if (rank > maxRank) maxRank = rank;
        });

        const rankToBuildingStatus = { 0: 'normal', 1: 'warning', 2: 'warning', 3: 'critical' };
        const newBuildingStatus = rankToBuildingStatus[maxRank] || 'normal';

        await supabase
          .from('buildings')
          .update({ status: newBuildingStatus })
          .eq('id', buildingId);
      }
    }

    return res.json({
      message: 'อัปเดตสถานะการแจ้งเตือนสำเร็จ',
      anomaly: updatedAnomaly,
    });
  } catch (err) {
    console.error('❌ Error in PATCH /api/admin/alerts/:id:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตสถานะ', error: err.message });
  }
});

module.exports = router;