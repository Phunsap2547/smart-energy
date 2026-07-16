const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ดึงตัวแปร MONGO_URI จากที่ตั้งไว้ใน docker-compose
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/iot_db';

// เชื่อมต่อฐานข้อมูล MongoDB
mongoose.connect(mongoUri)
  .then(() => console.log('🍃 MongoDB Connected Successfully!'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// สร้าง Route ทดสอบดึงข้อมูลพลังงาน (IoT Mockup)
app.get('/api/energy', (req, res) => {
  res.json({
    status: "success",
    message: "Smart Energy Backend is Running!",
    data: {
      voltage: 220, // แรงดันไฟฟ้า (โวลต์)
      current: 4.5,  // กระแสไฟฟ้า (แอมป์)
      power: 990     // พลังงานที่ใช้ (วัตต์)
    }
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});