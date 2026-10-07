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


// //alerts.js
// const express = require('express');
// const supabase = require('../supabase');

// const router = express.Router();

// /**
//  * GET /api/alerts
//  * ดึงรายการ Alert/Anomaly สำหรับหน้า Public หรือ Dashboard ทั่วไป
//  */
// router.get('/', async (req, res) => {
//   try {
//     const { device_id, type, status, limit = 50 } = req.query;

//     let query = supabase
//       .from('anomalies')
//       .select(`
//         id,
//         device_id,
//         type,
//         severity,
//         description,
//         status,
//         created_at,
//         devices ( name )
//       `)
//       .order('created_at', { ascending: false })
//       .limit(parseInt(limit, 10));

//     if (device_id) query = query.eq('device_id', device_id);
//     if (type) query = query.eq('type', type);
//     if (status) query = query.eq('status', status);

//     const { data, error } = await query;

//     if (error) throw error;

//     return res.json({
//       success: true,
//       data: data || [],
//     });
//   } catch (error) {
//     console.error('Error fetching alerts:', error);
//     return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
//   }
// });

// module.exports = router;


// // alerts.js
// const express = require('express');
// const supabase = require('../supabase');

// const router = express.Router();

// /**
//  * GET /api/alerts
//  * ดึงรายการ Alert/Anomaly สำหรับหน้า Public หรือ Dashboard ทั่วไป
//  *
//  * Query:
//  *  - device_id   : device เดียว
//  *  - device_ids  : หลาย device คั่นด้วย comma เช่น 1,2,3 (ใช้กับหน้าอาคาร)
//  *  - type
//  *  - status      : ค่าเดียว หรือหลายค่าคั่นด้วย comma เช่น open,investigating
//  *  - limit       : default 50 (สูงสุด 200)
//  */
// router.get('/', async (req, res) => {
//   try {
//     const { device_id, device_ids, type, status, limit = 50 } = req.query;
//     const safeLimit = Math.min(parseInt(limit, 10) || 50, 200);

//     let query = supabase
//       .from('anomalies')
//       .select(`
//         id,
//         device_id,
//         type,
//         severity,
//         description,
//         status,
//         created_at,
//         devices ( name )
//       `)
//       .order('created_at', { ascending: false })
//       .limit(safeLimit);

//     const splitList = (v) =>
//       String(v).split(',').map((s) => s.trim()).filter(Boolean);

//     if (device_ids) {
//       const ids = splitList(device_ids);
//       if (ids.length) query = query.in('device_id', ids);
//     } else if (device_id) {
//       query = query.eq('device_id', device_id);
//     }

//     if (type) query = query.eq('type', type);

//     if (status) {
//       const statuses = splitList(status);
//       query = statuses.length > 1 ? query.in('status', statuses) : query.eq('status', statuses[0]);
//     }

//     const { data, error } = await query;

//     if (error) throw error;

//     return res.json({
//       success: true,
//       data: data || [],
//     });
//   } catch (error) {
//     console.error('Error fetching alerts:', error);
//     return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
//   }
// });

// module.exports = router;


// alerts.js
const express = require('express');
const supabase = require('../supabase');

const router = express.Router();

/**
 * GET /api/alerts
 * ดึงรายการ Alert/Anomaly สำหรับหน้า Public หรือ Dashboard ทั่วไป
 *
 * Query:
 *  - building_id : กรองเฉพาะอาคารนั้น (ใช้กับหน้ารายละเอียดอาคาร)  <-- ใหม่
 *  - device_id   : device เดียว
 *  - device_ids  : หลาย device คั่นด้วย comma เช่น 1,2,3
 *  - type
 *  - status      : ค่าเดียว หรือหลายค่าคั่นด้วย comma เช่น open,investigating
 *  - limit       : default 50 (สูงสุด 200)
 */
router.get('/', async (req, res) => {
  try {
    const { building_id, device_id, device_ids, type, status, limit = 50 } = req.query;
    const safeLimit = Math.min(parseInt(limit, 10) || 50, 200);

    // ใช้ !inner เมื่อกรองตามอาคาร เพื่อให้เหลือเฉพาะ anomaly ของ device ในอาคารนั้น
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
        ${deviceRelation} ( id, name, building_id )
      `)
      .order('created_at', { ascending: false })
      .limit(safeLimit);

    const splitList = (v) =>
      String(v).split(',').map((s) => s.trim()).filter(Boolean);

    if (building_id) query = query.eq('devices.building_id', building_id);

    if (device_ids) {
      const ids = splitList(device_ids);
      if (ids.length) query = query.in('device_id', ids);
    } else if (device_id) {
      query = query.eq('device_id', device_id);
    }

    if (type) query = query.eq('type', type);

    if (status) {
      const statuses = splitList(status);
      query = statuses.length > 1 ? query.in('status', statuses) : query.eq('status', statuses[0]);
    }

    const { data, error } = await query;

    if (error) throw error;

    return res.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

module.exports = router;