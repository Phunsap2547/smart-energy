const express = require('express');
const pool = require('../scripts/db');
const authenticateAdmin = require('../middleware/auth');

const router = express.Router();
router.use(authenticateAdmin);

// PATCH /api/admin/alerts/:id  body: { status: "acknowledged" | "resolved" }
router.patch('/:id', async (req, res) => {
  const { status } = req.body;
  const allowedStatus = ['open', 'acknowledged', 'resolved'];

  if (!status || !allowedStatus.includes(status)) {
    return res.status(400).json({ message: `status ต้องเป็นหนึ่งใน: ${allowedStatus.join(', ')}` });
  }

  try {
    const result = await pool.query(
      'UPDATE anomalies SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'ไม่พบ alert นี้' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

module.exports = router;
