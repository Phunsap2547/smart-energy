const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authenticateAdmin = require('../middleware/auth');

const router = express.Router();
router.use(authenticateAdmin);

// เก็บไฟล์ไว้ที่ /uploads (สร้างโฟลเดอร์อัตโนมัติถ้ายังไม่มี)
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${ext}`);
  },
});

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // จำกัด 5MB
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return cb(new Error('รองรับเฉพาะไฟล์รูปภาพ (jpg, png, webp, gif)'));
    }
    cb(null, true);
  },
});

// POST /api/admin/upload — รับไฟล์รูปเดียว field name "file"
router.post('/', (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'อัปโหลดรูปไม่สำเร็จ' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'กรุณาแนบไฟล์รูปภาพ' });
    }

    // ปรับ base URL ตาม env จริง (เช่น domain ของ backend ตอน deploy)
    const baseUrl = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;
    const url = `${baseUrl}/uploads/${req.file.filename}`;

    res.status(201).json({ url });
  });
});

module.exports = router;