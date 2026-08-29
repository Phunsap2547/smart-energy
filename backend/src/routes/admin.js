const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../scripts/db');
const authenticateAdmin = require('../middleware/auth');

const router = express.Router();

// POST /api/admin/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'กรุณากรอก username และ password' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM admins WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'username หรือ password ไม่ถูกต้อง' });
    }

    const admin = result.rows[0];
    const isMatch = await bcrypt.compare(password, admin.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: 'username หรือ password ไม่ถูกต้อง' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    res.json({ message: 'login สำเร็จ', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// GET /api/admin/me -> ตัวอย่าง route ที่ต้อง login (มี token ถูกต้อง) เท่านั้นถึงเข้าได้
router.get('/me', authenticateAdmin, (req, res) => {
  res.json({ admin: req.admin });
});

// ตัวอย่างการป้องกัน route อื่นๆ ของ admin ในอนาคต ก็ใส่ authenticateAdmin
// เป็น middleware ตัวที่สองแบบนี้ได้เลย เช่น:
// router.post('/products', authenticateAdmin, createProductHandler);

module.exports = router;

// POST /api/admin/register -> สร้าง admin ใหม่
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'กรุณากรอก username และ password' });
  }

  try {
    // เช็คว่ามี username นี้อยู่แล้วหรือยัง
    const existing = await pool.query(
      'SELECT id FROM admins WHERE username = $1',
      [username]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'username นี้ถูกใช้งานแล้ว' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO admins (username, password_hash) VALUES ($1, $2) RETURNING id, username',
      [username, password_hash]
    );

    res.status(201).json({ message: 'สร้าง admin สำเร็จ', admin: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});
