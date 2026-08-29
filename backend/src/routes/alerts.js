const express = require('express');
const pool = require('../scripts/db');

const router = express.Router();

// GET /api/alerts?device_id=1&type=overload&status=open&from=&to=&limit=50&page=1
router.get('/', async (req, res) => {
  const { device_id, type, status, from, to, limit = 50, page = 1 } = req.query;

  try {
    const conditions = [];
    const values = [];
    let idx = 1;

    if (device_id) {
      conditions.push(`device_id = $${idx++}`);
      values.push(device_id);
    }
    if (type) {
      conditions.push(`type = $${idx++}`);
      values.push(type);
    }
    if (status) {
      conditions.push(`status = $${idx++}`);
      values.push(status);
    }
    if (from) {
      conditions.push(`detected_at >= $${idx++}`);
      values.push(from);
    }
    if (to) {
      conditions.push(`detected_at <= $${idx++}`);
      values.push(to);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const safeLimit = Math.min(parseInt(limit, 10) || 50, 500);
    const offset = (Math.max(parseInt(page, 10) || 1, 1) - 1) * safeLimit;

    values.push(safeLimit, offset);

    const result = await pool.query(
      `SELECT * FROM anomalies ${where}
       ORDER BY detected_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      values
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

module.exports = router;
