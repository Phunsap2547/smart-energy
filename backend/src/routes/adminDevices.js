const express = require('express');
const pool = require('../scripts/db');
const authenticateAdmin = require('../middleware/auth');

const router = express.Router();
router.use(authenticateAdmin);

// POST /api/admin/devices
router.post('/', async (req, res) => {
  const { building_id, name, install_point } = req.body;

  if (!building_id || !name) {
    return res.status(400).json({ message: 'กรุณาระบุ building_id และชื่ออุปกรณ์' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO devices (building_id, name, install_point) VALUES ($1, $2, $3) RETURNING *',
      [building_id, name, install_point || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// PUT /api/admin/devices/:id
router.put('/:id', async (req, res) => {
  const { name, install_point } = req.body;

  try {
    const result = await pool.query(
      'UPDATE devices SET name = COALESCE($1, name), install_point = COALESCE($2, install_point) WHERE id = $3 RETURNING *',
      [name, install_point, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'ไม่พบอุปกรณ์นี้' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// DELETE /api/admin/devices/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM devices WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'ไม่พบอุปกรณ์นี้' });
    }
    res.json({ message: 'ลบอุปกรณ์สำเร็จ' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

module.exports = router;
