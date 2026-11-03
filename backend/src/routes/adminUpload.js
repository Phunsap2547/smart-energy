
//adminUpload.js
// module.exports = router;
const express = require('express');
const multer = require('multer');
const path = require('path');
const supabase = require('../supabase');
const authenticateAdmin = require('../middleware/auth');

const router = express.Router();
router.use(authenticateAdmin);

const storage = multer.memoryStorage();
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return cb(new Error('รองรับเฉพาะไฟล์รูปภาพ (jpg, png, webp, gif)'));
    }
    cb(null, true);
  },
});

router.post('/', (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'อัปโหลดรูปไม่สำเร็จ' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'กรุณาแนบไฟล์รูปภาพ' });
    }

    try {
      const ext = path.extname(req.file.originalname);
      const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      const bucketName = 'building-images';

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filename, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false,
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filename);

      res.status(201).json({ url: urlData.publicUrl });
    } catch (uploadErr) {
      console.error('Supabase Storage Error:', uploadErr);
      res.status(500).json({ 
        message: 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์', 
        error: uploadErr.message 
      });
    }
  });
});

module.exports = router;