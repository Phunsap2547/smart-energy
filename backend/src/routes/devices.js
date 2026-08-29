const express = require('express');
const pool = require('../scripts/db');

const router = express.Router();

// GET /api/devices?building_id=1&search=xxx
router.get('/', async (req, res) => {
  const { building_id, search } = req.query;

  try {
    const conditions = [];
    const values = [];
    let idx = 1;

    if (building_id) {
      conditions.push(`building_id = $${idx++}`);
      values.push(building_id);
    }
    if (search) {
      conditions.push(`(name ILIKE $${idx} OR install_point ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await pool.query(
      `SELECT * FROM devices ${where} ORDER BY name ASC`,
      values
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// GET /api/devices/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM devices WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'ไม่พบอุปกรณ์นี้' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

module.exports = router;
