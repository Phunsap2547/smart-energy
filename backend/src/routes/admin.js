
//backend/src/routes/admin.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('../supabase');
const authenticateAdmin = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 นาที
  max: 10,                  // ผิดได้ 10 ครั้งต่อ IP
  message: { message: 'พยายามเข้าสู่ระบบมากเกินไป กรุณาลองใหม่ใน 15 นาที' },
});

// POST /api/admin/login
router.post('/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'กรุณากรอก username และ password' });
  }

  try {
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('username', username)
      .maybeSingle();

    if (error) throw error;
    if (!admin) {
      return res.status(401).json({ message: 'username หรือ password ไม่ถูกต้อง' });
    }

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
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ', error: err.message });
  }
});

// GET /api/admin/me
router.get('/me', authenticateAdmin, (req, res) => {
  res.json({ admin: req.admin });
});

// POST /api/admin/register
router.post('/register', authenticateAdmin, async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'กรุณากรอก username และ password' });
  }

  try {
    const { data: existing, error: checkErr } = await supabase
      .from('admins')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (checkErr) throw checkErr;
    if (existing) {
      return res.status(409).json({ message: 'username นี้ถูกใช้งานแล้ว' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const { data: newAdmin, error: insertErr } = await supabase
      .from('admins')
      .insert([{ username, password_hash }])
      .select('id, username')
      .single();

    if (insertErr) throw insertErr;

    res.status(201).json({ message: 'สร้าง admin สำเร็จ', admin: newAdmin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ', error: err.message });
  }
});

module.exports = router;